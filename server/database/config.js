require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const path = require('path');

const dbConfig = {
  // SQLite configuratie voor lokale ontwikkeling
  database: path.join(__dirname, '../data/orders.db'),
  // MySQL configuratie voor productie (Vercel)
  mysql: {
    connectionLimit: 10,
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'order_tool',
    port: process.env.DB_PORT || 3306,
    timezone: 'Z',
    // Vercel serverless specific settings
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
  }
};

module.exports = dbConfig; 