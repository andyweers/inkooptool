require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const path = require('path');

const dbConfig = {
  // SQLite configuratie voor lokale ontwikkeling
  database: path.join(__dirname, '../data/orders.db'),
  // PostgreSQL configuratie voor productie (Supabase)
  postgres: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'order_tool',
    port: process.env.DB_PORT || 5432,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    // Vercel serverless specific settings
    connectionTimeoutMillis: 60000,
    idleTimeoutMillis: 60000,
    max: 10
  }
};

module.exports = dbConfig; 