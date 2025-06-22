const mysql = require('mysql2/promise');
const dbConfig = require('./config');

async function initMySQLDatabase() {
  let connection;
  
  try {
    console.log('Verbinden met MySQL database...');
    
    // Create connection pool
    const pool = mysql.createPool(dbConfig.mysql);
    
    // Test connection
    connection = await pool.getConnection();
    console.log('MySQL database verbinding succesvol!');
    
    // Create orders table
    const createOrdersTable = `
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
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
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    
    await connection.execute(createOrdersTable);
    console.log('Orders tabel aangemaakt/gecontroleerd');
    
    // Create users table
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await connection.execute(createUsersTable);
    console.log('Users tabel aangemaakt/gecontroleerd');
    
    // Check if default user exists
    const [users] = await connection.execute('SELECT * FROM users WHERE username = ?', ['admin']);
    
    if (users.length === 0) {
      // Create default user
      const bcrypt = require('bcryptjs');
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      
      await connection.execute('INSERT INTO users (username, password) VALUES (?, ?)', 
        ['admin', hashedPassword]);
      console.log('Default user aangemaakt (admin/admin123)');
    } else {
      console.log('Default user bestaat al');
    }
    
    connection.release();
    return pool;
    
  } catch (error) {
    console.error('Fout bij initialiseren MySQL database:', error);
    if (connection) {
      connection.release();
    }
    throw error;
  }
}

module.exports = { initMySQLDatabase }; 