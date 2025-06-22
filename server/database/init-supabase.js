const { Pool } = require('pg');
const dbConfig = require('./config');

async function initSupabaseDatabase() {
  let pool;
  
  try {
    console.log('Verbinden met Supabase database...');
    
    // Create connection pool
    pool = new Pool(dbConfig.postgres);
    
    // Test connection
    const client = await pool.connect();
    console.log('Supabase database verbinding succesvol!');
    
    // Create orders table
    const createOrdersTable = `
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        supplier VARCHAR(255) NOT NULL,
        order_number VARCHAR(255),
        webshop VARCHAR(255),
        description TEXT,
        total_amount_excl_vat DECIMAL(10,2),
        total_vat DECIMAL(10,2),
        shipping_costs DECIMAL(10,2),
        is_return BOOLEAN DEFAULT FALSE,
        quote_requested BOOLEAN DEFAULT FALSE,
        date_quote_requested DATE,
        quote_received BOOLEAN DEFAULT FALSE,
        date_quote_received DATE,
        date_order_placed DATE,
        date_payment_completed DATE,
        date_invoice_received DATE,
        date_shipped DATE,
        date_received DATE,
        date_quality_control DATE,
        date_booked_accounting DATE,
        date_import_invoice_received DATE,
        date_is_returned DATE,
        date_refunded DATE,
        date_credit_invoice_received DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Create users table
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Execute table creation
    await client.query(createOrdersTable);
    console.log('Orders tabel aangemaakt of al bestaand');
    
    await client.query(createUsersTable);
    console.log('Users tabel aangemaakt of al bestaand');
    
    // Check if admin user exists
    const adminCheck = await client.query('SELECT * FROM users WHERE username = $1', ['admin']);
    
    if (adminCheck.rows.length === 0) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      
      await client.query('INSERT INTO users (username, password) VALUES ($1, $2)', 
        ['admin', hashedPassword]);
      console.log('Admin gebruiker aangemaakt (username: admin, password: admin123)');
    } else {
      console.log('Admin gebruiker bestaat al');
    }
    
    client.release();
    return pool;
    
  } catch (error) {
    console.error('Fout bij initialiseren Supabase database:', error);
    throw error;
  }
}

module.exports = { initSupabaseDatabase }; 