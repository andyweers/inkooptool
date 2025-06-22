#!/bin/bash

echo "🚀 Lion Gris Order Tool Setup Script"
echo "====================================="

# Maak alle benodigde mappen aan
echo "📁 Mappen aanmaken..."
mkdir -p server/uploads
mkdir -p server/data
mkdir -p client/public
mkdir -p client/src/pages

echo "✅ Mappen aangemaakt!"

# Maak package.json aan in de root
echo "📦 Root package.json aanmaken..."
cat > package.json << 'EOF'
{
  "name": "lion-gris-order-tool",
  "version": "1.0.0",
  "description": "Order management tool voor sieradenbedrijf",
  "main": "server/index.js",
  "scripts": {
    "dev": "concurrently \"npm run server:dev\" \"npm run client:dev\"",
    "server:dev": "nodemon server/index.js",
    "client:dev": "cd client && npm start",
    "build": "cd client && npm run build",
    "start": "node server/index.js",
    "install:all": "npm install && cd client && npm install"
  },
  "dependencies": {
    "express": "^4.18.2",
    "sqlite3": "^5.1.6",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5-lts.1",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "express-validator": "^7.0.1",
    "node-cron": "^3.0.3",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "concurrently": "^8.2.2"
  },
  "keywords": ["order-management", "jewelry", "business"],
  "author": "Lion Gris",
  "license": "MIT"
}
EOF

# Maak .env.example aan
echo "🔐 .env.example aanmaken..."
cat > .env.example << 'EOF'
NODE_ENV=development
PORT=3001
JWT_SECRET=verander-dit-naar-een-sterk-geheim
EOF

# Maak server/index.js aan
echo "��️  Server bestanden aanmaken..."
cat > server/index.js << 'EOF'
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');
const { initDatabase } = require('./database/init');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploaded documents
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Er is iets misgegaan',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Interne server fout'
  });
});

// Initialize database and start server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server draait op poort ${PORT}`);
    console.log(`Omgeving: ${process.env.NODE_ENV || 'development'}`);
  });
}).catch(err => {
  console.error('Database initialisatie mislukt:', err);
  process.exit(1);
});
EOF

# Maak server/database/init.js aan
cat > server/database/init.js << 'EOF'
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '../data/orders.db');

function initDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err);
        return;
      }
      
      console.log('Database verbinding gemaakt');
      
      // Create tables
      db.serialize(() => {
        // Users table
        db.run(`CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'user',
          two_factor_secret TEXT,
          two_factor_enabled BOOLEAN DEFAULT 0,
          passkey_credential TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Orders table
        db.run(`CREATE TABLE IF NOT EXISTS orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_number TEXT UNIQUE NOT NULL,
          supplier TEXT NOT NULL,
          supplier_url TEXT,
          description TEXT NOT NULL,
          quantity INTEGER NOT NULL,
          unit_price DECIMAL(10,2) NOT NULL,
          total_price DECIMAL(10,2) NOT NULL,
          currency TEXT DEFAULT 'EUR',
          order_date DATE NOT NULL,
          expected_delivery DATE,
          actual_delivery DATE,
          status TEXT DEFAULT 'ordered',
          notes TEXT,
          created_by INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (created_by) REFERENCES users (id)
        )`);

        // Invoices table
        db.run(`CREATE TABLE IF NOT EXISTS invoices (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER NOT NULL,
          invoice_number TEXT NOT NULL,
          invoice_type TEXT NOT NULL,
          amount DECIMAL(10,2) NOT NULL,
          currency TEXT DEFAULT 'EUR',
          invoice_date DATE NOT NULL,
          file_path TEXT,
          uploaded_by INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (order_id) REFERENCES orders (id),
          FOREIGN KEY (uploaded_by) REFERENCES users (id)
        )`);

        // Order status history
        db.run(`CREATE TABLE IF NOT EXISTS order_status_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER NOT NULL,
          status TEXT NOT NULL,
          notes TEXT,
          changed_by INTEGER NOT NULL,
          changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (order_id) REFERENCES orders (id),
          FOREIGN KEY (changed_by) REFERENCES users (id)
        )`);

        // Create indexes
        db.run('CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)');
        db.run('CREATE INDEX IF NOT EXISTS idx_orders_supplier ON orders(supplier)');
        db.run('CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date)');
        db.run('CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON invoices(order_id)');

        // Create default admin user if not exists
        db.get('SELECT id FROM users WHERE username = ?', ['admin'], (err, row) => {
          if (err) {
            console.error('Error checking admin user:', err);
          } else if (!row) {
            const defaultPassword = 'admin123'; // Change this immediately!
            bcrypt.hash(defaultPassword, 12).then(hash => {
              db.run(`INSERT INTO users (username, email, password_hash, role) 
                      VALUES (?, ?, ?, ?)`, 
                      ['admin', 'admin@lion-gris.com', hash, 'admin'], (err) => {
                if (err) {
                  console.error('Error creating admin user:', err);
                } else {
                  console.log('Default admin user created (username: admin, password: admin123)');
                  console.log('⚠️  VERANDER DIT WACHTWOORD DIRECT!');
                }
              });
            });
          }
        });

        resolve();
      });
    });
  });
}

module.exports = { initDatabase };
EOF

# Maak server/middleware/auth.js aan
cat > server/middleware/auth.js << 'EOF'
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../data/orders.db');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Toegangstoken vereist' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Ongeldige token' });
    }
    req.user = user;
    next();
  });
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authenticatie vereist' });
    }
    
    if (req.user.role !== role && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Onvoldoende rechten' });
    }
    
    next();
  };
}

module.exports = { authenticateToken, requireRole };
EOF

# Maak server/routes/auth.js aan
cat > server/routes/auth.js << 'EOF'
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const router = express.Router();
const dbPath = path.join(__dirname, '../data/orders.db');

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

  const db = new sqlite3.Database(dbPath);
  
  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) {
      db.close();
      return res.status(500).json({ error: 'Database fout' });
    }

    if (!user) {
      db.close();
      return res.status(401).json({ error: 'Ongeldige inloggegevens' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      db.close();
      return res.status(401).json({ error: 'Ongeldige inloggegevens' });
    }

    // Check if 2FA is enabled
    if (user.two_factor_enabled) {
      db.close();
      return res.status(200).json({ 
        requires2FA: true, 
        userId: user.id,
        message: '2FA code vereist' 
      });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    db.close();
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

// Verify 2FA
router.post('/verify-2fa', [
  body('userId').isInt().withMessage('Gebruiker ID is vereist'),
  body('code').isLength({ min: 6, max: 6 }).withMessage('2FA code moet 6 cijfers zijn')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { userId, code } = req.body;

  const db = new sqlite3.Database(dbPath);
  
  db.get('SELECT * FROM users WHERE id = ? AND two_factor_enabled = 1', [userId], (err, user) => {
    if (err) {
      db.close();
      return res.status(500).json({ error: 'Database fout' });
    }

    if (!user) {
      db.close();
      return res.status(401).json({ error: 'Gebruiker niet gevonden' });
    }

    // Here you would verify the 2FA code with a library like speakeasy
    // For now, we'll use a simple verification
    if (code === '123456') { // Replace with actual 2FA verification
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      db.close();
      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } else {
      db.close();
      res.status(401).json({ error: 'Ongeldige 2FA code' });
    }
  });
});

// Change password
router.post('/change-password', [
  body('currentPassword').notEmpty().withMessage('Huidig wachtwoord is vereist'),
  body('newPassword').isLength({ min: 8 }).withMessage('Nieuw wachtwoord moet minimaal 8 karakters zijn')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  const db = new sqlite3.Database(dbPath);
  
  db.get('SELECT password_hash FROM users WHERE id = ?', [userId], async (err, user) => {
    if (err) {
      db.close();
      return res.status(500).json({ error: 'Database fout' });
    }

    if (!user) {
      db.close();
      return res.status(404).json({ error: 'Gebruiker niet gevonden' });
    }

    const validPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!validPassword) {
      db.close();
      return res.status(401).json({ error: 'Huidig wachtwoord is incorrect' });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12);
    
    db.run('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', 
           [newPasswordHash, userId], (err) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'Wachtwoord update mislukt' });
      }

      db.close();
      res.json({ message: 'Wachtwoord succesvol gewijzigd' });
    });
  });
});

module.exports = router;
EOF

# Maak server/routes/orders.js aan
cat > server/routes/orders.js << 'EOF'
const express = require('express');
const { body, validationResult } = require('express-validator');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const dbPath = path.join(__dirname, '../data/orders.db');

// Get all orders
router.get('/', authenticateToken, (req, res) => {
  const db = new sqlite3.Database(dbPath);
  
  const query = `
    SELECT o.*, u.username as created_by_name
    FROM orders o
    LEFT JOIN users u ON o.created_by = u.id
    ORDER BY o.created_at DESC
  `;
  
  db.all(query, [], (err, orders) => {
    if (err) {
      db.close();
      return res.status(500).json({ error: 'Database fout' });
    }
    
    db.close();
    res.json(orders);
  });
});

// Get single order with invoices and status history
router.get('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const db = new sqlite3.Database(dbPath);
  
  db.get('SELECT * FROM orders WHERE id = ?', [id], (err, order) => {
    if (err) {
      db.close();
      return res.status(500).json({ error: 'Database fout' });
    }
    
    if (!order) {
      db.close();
      return res.status(404).json({ error: 'Bestelling niet gevonden' });
    }
    
    // Get invoices for this order
    db.all('SELECT * FROM invoices WHERE order_id = ?', [id], (err, invoices) => {
      if (err) {
        db.close();
        return res.status(500).json({ error: 'Database fout' });
      }
      
      // Get status history
      db.all('SELECT * FROM order_status_history WHERE order_id = ? ORDER BY changed_at DESC', [id], (err, history) => {
        if (err) {
          db.close();
          return res.status(500).json({ error: 'Database fout' });
        }
        
        db.close();
        res.json({
          ...order,
          invoices,
          status_history: history
        });
      });
    });
  });
});

mod
