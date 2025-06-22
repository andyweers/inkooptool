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
        order_placed INTEGER DEFAULT 0,
        date_order_placed TEXT,
        payment_completed INTEGER DEFAULT 0,
        date_payment_completed TEXT,
        invoice_received INTEGER DEFAULT 0,
        date_invoice_received TEXT,
        shipped INTEGER DEFAULT 0,
        date_shipped TEXT,
        received INTEGER DEFAULT 0,
        date_received TEXT,
        quality_control INTEGER DEFAULT 0,
        date_quality_control TEXT,
        booked_accounting INTEGER DEFAULT 0,
        date_booked_accounting TEXT,
        import_invoice_received INTEGER DEFAULT 0,
        date_import_invoice_received TEXT,
        is_returned INTEGER DEFAULT 0,
        date_is_returned TEXT,
        refunded INTEGER DEFAULT 0,
        date_refunded TEXT,
        credit_invoice_received INTEGER DEFAULT 0,
        date_credit_invoice_received TEXT,
        notes TEXT,
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
      db.run(createTableQuery, (err) => {
        if (err) {
          console.error('Fout bij aanmaken orders tabel:', err);
          reject(err);
          return;
        }
        console.log('Orders tabel aangemaakt/gecontroleerd');
      });

      db.run(createUsersTableQuery, (err) => {
        if (err) {
          console.error('Fout bij aanmaken users tabel:', err);
          reject(err);
          return;
        }
        console.log('Users tabel aangemaakt/gecontroleerd');

        // Check if admin user exists, if not create one
        db.get('SELECT * FROM users WHERE username = ?', ['admin'], (err, user) => {
          if (err) {
            console.error('Fout bij controleren admin gebruiker:', err);
            reject(err);
            return;
          }

          if (!user) {
            const bcrypt = require('bcryptjs');
            const hashedPassword = bcrypt.hashSync('admin123', 10);
            
            db.run('INSERT INTO users (username, password) VALUES (?, ?)', 
              ['admin', hashedPassword], (err) => {
                if (err) {
                  console.error('Fout bij aanmaken admin gebruiker:', err);
                  reject(err);
                  return;
                }
                console.log('Admin gebruiker aangemaakt (username: admin, password: admin123)');
                resolve();
              });
          } else {
            console.log('Admin gebruiker bestaat al');
            resolve();
          }
        });
      });
    });
  });
}

module.exports = { db, initDatabase };
