require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const { initDatabase } = require('./database/init');
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.vercel.app'] 
    : ['http://localhost:3000', 'http://192.168.1.181:3000'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('combined'));
}

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Interne server fout' });
});

const PORT = process.env.PORT || 3001;

// Initialize database and start server
async function startServer() {
  try {
    await initDatabase();
    console.log('Database geïnitialiseerd');
    
    app.listen(PORT, () => {
      console.log(`Server draait op poort ${PORT}`);
      console.log(`Omgeving: ${process.env.NODE_ENV || 'development'}`);
      if (process.env.NODE_ENV !== 'production') {
        console.log(`Beschikbaar op: http://localhost:${PORT}`);
      }
    });
  } catch (error) {
    console.error('Fout bij starten server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
