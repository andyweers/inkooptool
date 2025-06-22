const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbConfig = require('./config');

// SQLite database connection
const db = new sqlite3.Database(dbConfig.database);

function initDatabase() {
  return new Promise((resolve, reject) => {
    console.log('Database verbinding gemaakt');

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        supplier TEXT NOT NULL,
        order_number TEXT,
        webshop TEXT,
        description TEXT,
        total_amount_excl_vat REAL,
        total_vat REAL,
        shipping_costs REAL,
        is_return INTEGER DEFAULT 0,
        quote_requested INTEGER DEFAULT 0,
        date_quote_requested TEXT,
        quote_received INTEGER DEFAULT 0,
        date_quote_received TEXT,
        date_order_placed TEXT,
        date_payment_completed TEXT,
        date_invoice_received TEXT,
        date_shipped TEXT,
        date_received TEXT,
        date_quality_control TEXT,
        date_booked_accounting TEXT,
        date_import_invoice_received TEXT,
        date_is_returned TEXT,
        date_refunded TEXT,
        date_credit_invoice_received TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createUsersTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    db.serialize(() => {
      // Create orders table
      db.run(createTableQuery, (err) => {
        if (err) {
          console.error('Fout bij aanmaken orders tabel:', err);
          reject(err);
          return;
        }
        console.log('Orders tabel aangemaakt/gecontroleerd');

        // Create users table
        db.run(createUsersTableQuery, (err) => {
          if (err) {
            console.error('Fout bij aanmaken users tabel:', err);
            reject(err);
            return;
          }
          console.log('Users tabel aangemaakt/gecontroleerd');

          // Check if default user exists
          db.get('SELECT * FROM users WHERE username = ?', ['admin'], (err, user) => {
            if (err) {
              console.error('Fout bij controleren default user:', err);
              reject(err);
              return;
            }

            if (!user) {
              // Create default user
              const bcrypt = require('bcryptjs');
              const hashedPassword = bcrypt.hashSync('admin123', 10);
              
              db.run('INSERT INTO users (username, password) VALUES (?, ?)', 
                ['admin', hashedPassword], (err) => {
                if (err) {
                  console.error('Fout bij aanmaken default user:', err);
                  reject(err);
                  return;
                }
                console.log('Default user aangemaakt (admin/admin123)');
                resolve();
              });
            } else {
              console.log('Default user bestaat al');
              resolve();
            }
          });
        });
      });
    });
  });
}

module.exports = { db, initDatabase };
