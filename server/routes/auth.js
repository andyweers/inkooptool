const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { db } = require('../database/init');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Login
router.post('/login', [
  body('username').notEmpty().withMessage('Gebruikersnaam is vereist'),
  body('password').notEmpty().withMessage('Wachtwoord is vereist')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      console.error('Database fout:', err);
      return res.status(500).json({ error: 'Database fout' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Ongeldige inloggegevens' });
    }

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error('Wachtwoord vergelijking fout:', err);
        return res.status(500).json({ error: 'Authenticatie fout' });
      }

      if (!isMatch) {
        return res.status(401).json({ error: 'Ongeldige inloggegevens' });
      }

      // Check if 2FA is enabled
      if (user.two_factor_enabled) {
        return res.status(200).json({ 
          requires2FA: true, 
          userId: user.id,
          message: '2FA code vereist' 
        });
      }

      const token = jwt.sign(
        { 
          id: user.id, 
          username: user.username, 
          role: user.role 
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    });
  });
});

// Change password
router.post('/change-password', authenticateToken, [
  body('currentPassword').notEmpty().withMessage('Huidig wachtwoord is vereist'),
  body('newPassword').isLength({ min: 8 }).withMessage('Nieuw wachtwoord moet minimaal 8 karakters zijn')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  db.get('SELECT password FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      console.error('Database fout:', err);
      return res.status(500).json({ error: 'Database fout' });
    }

    if (!user) {
      return res.status(404).json({ error: 'Gebruiker niet gevonden' });
    }

    bcrypt.compare(currentPassword, user.password, (err, isMatch) => {
      if (err) {
        console.error('Wachtwoord vergelijking fout:', err);
        return res.status(500).json({ error: 'Authenticatie fout' });
      }

      if (!isMatch) {
        return res.status(401).json({ error: 'Huidig wachtwoord is incorrect' });
      }

      bcrypt.hash(newPassword, 12, (err, hashedPassword) => {
        if (err) {
          console.error('Wachtwoord hashing fout:', err);
          return res.status(500).json({ error: 'Wachtwoord update mislukt' });
        }

        db.run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId], function(err) {
          if (err) {
            console.error('Database fout:', err);
            return res.status(500).json({ error: 'Wachtwoord update mislukt' });
          }

          res.json({ message: 'Wachtwoord succesvol gewijzigd' });
        });
      });
    });
  });
});

// Register route (admin only)
router.post('/register', (req, res) => {
  const { username, password, role = 'user' } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Gebruikersnaam en wachtwoord zijn verplicht' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Wachtwoord moet minimaal 6 karakters lang zijn' });
  }

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error('Wachtwoord hashing fout:', err);
      return res.status(500).json({ error: 'Registratie fout' });
    }

    db.run(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username, hashedPassword, role],
      function(err) {
        if (err) {
          if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(400).json({ error: 'Gebruikersnaam bestaat al' });
          }
          console.error('Database fout:', err);
          return res.status(500).json({ error: 'Database fout' });
        }

        res.status(201).json({
          message: 'Gebruiker succesvol aangemaakt',
          user: {
            id: this.lastID,
            username,
            role
          }
        });
      }
    );
  });
});

// Get current user
router.get('/me', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Geen token opgegeven' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Ongeldige token' });
    }

    db.get('SELECT id, username, role FROM users WHERE id = ?', [decoded.id], (err, user) => {
      if (err) {
        console.error('Database fout:', err);
        return res.status(500).json({ error: 'Database fout' });
      }

      if (!user) {
        return res.status(404).json({ error: 'Gebruiker niet gevonden' });
      }

      res.json({ user });
    });
  });
});

module.exports = router;