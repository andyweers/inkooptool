const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '../data/orders.db');

const db = new sqlite3.Database(dbPath);

const alterStatements = [
  `ALTER TABLE orders ADD COLUMN invoice_number TEXT;`,
  `ALTER TABLE orders ADD COLUMN date_quote_requested DATE;`,
  `ALTER TABLE orders ADD COLUMN date_invoice_received DATE;`,
  `ALTER TABLE orders ADD COLUMN date_order_placed DATE;`,
  `ALTER TABLE orders ADD COLUMN date_payment_completed DATE;`,
  `ALTER TABLE orders ADD COLUMN date_shipped DATE;`,
  `ALTER TABLE orders ADD COLUMN date_received DATE;`,
  `ALTER TABLE orders ADD COLUMN total_amount_excl_vat DECIMAL(10,2);`,
  `ALTER TABLE orders ADD COLUMN total_vat DECIMAL(10,2);`,
  `ALTER TABLE orders ADD COLUMN total_import_duties DECIMAL(10,2);`,
  `ALTER TABLE orders ADD COLUMN total_clearance_costs DECIMAL(10,2);`,
  `ALTER TABLE orders ADD COLUMN vat_clearance_costs DECIMAL(10,2);`,
  `ALTER TABLE orders ADD COLUMN shipping_costs DECIMAL(10,2);`,
  `ALTER TABLE orders ADD COLUMN total_price DECIMAL(10,2);`,
  `ALTER TABLE orders ADD COLUMN created_by INTEGER;`,
  `ALTER TABLE orders ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP;`,
  `ALTER TABLE orders ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP;`,
  `ALTER TABLE orders ADD COLUMN date_credit_invoice_received DATE;`,
  `ALTER TABLE orders ADD COLUMN date_return_processed_admin DATE;`,
  `ALTER TABLE orders ADD COLUMN date_import_invoice_received DATE;`,
  `ALTER TABLE orders ADD COLUMN date_is_returned DATE;`,
  `ALTER TABLE orders ADD COLUMN date_refunded DATE;`,
  `ALTER TABLE orders ADD COLUMN date_quality_control DATE;`,
  `ALTER TABLE orders ADD COLUMN date_booked_accounting DATE;`,
  `ALTER TABLE orders ADD COLUMN date_quote_received DATE;`,
  `ALTER TABLE orders ADD COLUMN webshop TEXT;`,
  `ALTER TABLE orders ADD COLUMN is_return BOOLEAN DEFAULT 0;`
];

function runMigrations() {
  db.serialize(() => {
    alterStatements.forEach(stmt => {
      db.run(stmt, err => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('Fout bij migratie:', err.message);
        }
      });
    });
    console.log('Database migratie voltooid!');
    db.close();
  });
}

runMigrations();
