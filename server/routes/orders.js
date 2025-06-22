const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../database/init');
const path = require('path');
const { authenticateToken } = require('../middleware/auth');
const { Parser } = require('json2csv');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');

const router = express.Router();

// Define all valid columns for orders table
const allColumns = [
  'id', 'order_number', 'supplier', 'webshop', 'description', 'is_return',
  'date_quote_requested', 'date_quote_received', 'date_order_placed', 'date_payment_completed',
  'date_invoice_received', 'date_shipped', 'date_received', 'date_quality_control',
  'date_booked_accounting', 'date_import_invoice_received', 'date_is_returned', 'date_refunded',
  'date_credit_invoice_received', 'date_return_processed_admin', 'invoice_number',
  'total_amount_excl_vat', 'total_vat', 'total_import_duties',
  'total_clearance_costs', 'vat_clearance_costs', 'shipping_costs', 'total_price',
  'created_by', 'created_at', 'updated_at'
];

const upload = multer({ dest: 'uploads/' });

function determineStatus(order) {
    if (order.invoice_paid) return { text: 'Factuur betaald', color: '#4CAF50' };
    if (order.invoice_received) return { text: 'Factuur ontvangen', color: '#2196F3' };
    if (order.order_delivered) return { text: 'Bestelling geleverd', color: '#8BC34A' };
    if (order.order_shipped) return { text: 'Bestelling verzonden', color: '#FFC107' };
    if (order.order_confirmed) return { text: 'Bestelling bevestigd', color: '#FF9800' };
    if (order.order_placed) return { text: 'Bestelling geplaatst', color: '#FF5722' };
    if (order.quote_received) return { text: 'Offerte ontvangen', color: '#CDDC39' };
    if (order.quote_requested) return { text: 'Offerte aangevraagd', color: '#9E9E9E' };
    return { text: 'Concept', color: '#607D8B' };
}

function getLatestStatusDate(order) {
    if (order.date_invoice_paid) return order.date_invoice_paid;
    if (order.date_invoice_received) return order.date_invoice_received;
    if (order.date_order_delivered) return order.date_order_delivered;
    if (order.date_order_shipped) return order.date_order_shipped;
    if (order.date_order_confirmed) return order.date_order_confirmed;
    if (order.date_order_placed) return order.date_order_placed;
    if (order.date_quote_received) return order.date_quote_received;
    if (order.date_quote_requested) return order.date_quote_requested;
    return order.created_at;
}

function convertEmptyStringToNull(obj) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = value === '' ? null : value;
  }
  return result;
}

router.get('/', authenticateToken, (req, res) => {
  const { search, status, supplier, sortBy = 'created_at', sortOrder = 'DESC' } = req.query;
  
  let sql = 'SELECT * FROM orders WHERE 1=1';
  const params = [];
  
  if (search) {
    sql += ' AND (supplier LIKE ? OR order_number LIKE ? OR description LIKE ? OR webshop LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }
  
  if (status) {
    switch (status) {
      case 'nieuw':
        sql += ' AND quote_requested = 0';
        break;
      case 'offerte_aangevraagd':
        sql += ' AND quote_requested = 1 AND quote_received = 0';
        break;
      case 'offerte_ontvangen':
        sql += ' AND quote_received = 1 AND order_placed = 0';
        break;
      case 'bestelling_geplaatst':
        sql += ' AND order_placed = 1 AND order_received = 0';
        break;
      case 'bestelling_ontvangen':
        sql += ' AND order_received = 1 AND invoice_received = 0';
        break;
      case 'factuur_ontvangen':
        sql += ' AND invoice_received = 1 AND invoice_paid = 0';
        break;
      case 'factuur_betaald':
        sql += ' AND invoice_paid = 1';
        break;
    }
  }
  
  if (supplier) {
    sql += ' AND supplier LIKE ?';
    params.push(`%${supplier}%`);
  }
  
  sql += ` ORDER BY ${sortBy} ${sortOrder}`;
  
  db.all(sql, params, (err, results) => {
    if (err) {
      console.error('Database fout:', err);
      return res.status(500).json({ error: 'Database fout' });
    }
    
    const orders = results.map(order => ({
      ...order,
      status: determineStatus(order),
      latest_date: getLatestStatusDate(order)
    }));
    
    res.json(orders);
  });
});

// Get single order by ID
router.get('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM orders WHERE id = ?', [id], (err, order) => {
    if (err) {
      console.error('Database fout:', err);
      return res.status(500).json({ error: 'Database fout' });
    }
    
    if (!order) {
      return res.status(404).json({ error: 'Bestelling niet gevonden' });
    }
    
    order.status = determineStatus(order);
    order.latest_date = getLatestStatusDate(order);
    
    res.json(order);
  });
});

// Export orders to CSV
router.get('/export/csv', authenticateToken, (req, res) => {
  db.all('SELECT * FROM orders ORDER BY created_at DESC', (err, results) => {
    if (err) {
      console.error('Database fout:', err);
      return res.status(500).json({ error: 'Database fout' });
    }
    
    const orders = results.map(order => ({
      ...order,
      status: determineStatus(order),
      latest_date: getLatestStatusDate(order)
    }));
    
    const fields = [
      'id', 'supplier', 'order_number', 'webshop', 'description', 
      'total_amount_excl_vat', 'total_vat', 'shipping_costs', 'status',
      'latest_date', 'notes', 'created_at'
    ];
    
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(orders);
    
    res.header('Content-Type', 'text/csv');
    res.attachment('orders.csv');
    res.send(csv);
  });
});

// Import orders from CSV
router.post('/import/csv', authenticateToken, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Geen bestand geüpload' });
  }
  
  const orders = [];
  
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => {
      orders.push(convertEmptyStringToNull({
        supplier: data.supplier,
        order_number: data.order_number,
        webshop: data.webshop,
        description: data.description,
        total_amount_excl_vat: data.total_amount_excl_vat,
        total_vat: data.total_vat,
        shipping_costs: data.shipping_costs,
        is_return: data.is_return === 'true' ? 1 : 0,
        notes: data.notes
      }));
    })
    .on('end', () => {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      
      if (orders.length === 0) {
        return res.status(400).json({ error: 'Geen geldige data gevonden in CSV' });
      }
      
      // Insert orders in batches
      let inserted = 0;
      let errors = [];
      
      const insertBatch = (batch) => {
        if (batch.length === 0) {
          return res.json({ 
            message: `${inserted} bestellingen geïmporteerd`,
            errors: errors.length > 0 ? errors : undefined
          });
        }
        
        const order = batch.shift();
        const columns = Object.keys(order);
        const placeholders = columns.map(() => '?').join(',');
        const values = columns.map(k => order[k]);
        
        const sql = `INSERT INTO orders (${columns.join(',')}) VALUES (${placeholders})`;
        
        db.run(sql, values, function(err) {
          if (err) {
            errors.push(`Rij ${inserted + 1}: ${err.message}`);
          } else {
            inserted++;
          }
          
          insertBatch(batch);
        });
      };
      
      insertBatch([...orders]);
    })
    .on('error', (error) => {
      fs.unlinkSync(req.file.path);
      console.error('CSV parsing fout:', error);
      res.status(500).json({ error: 'Fout bij het verwerken van CSV bestand' });
    });
});

const orderValidationRules = [
  body('supplier').notEmpty().withMessage('Leverancier is verplicht'),
  body('total_amount_excl_vat').optional({ checkFalsy: true }).isDecimal().withMessage('Ongeldig bedrag'),
  body('total_vat').optional({ checkFalsy: true }).isDecimal().withMessage('Ongeldig BTW-bedrag'),
  body('shipping_costs').optional({ checkFalsy: true }).isDecimal().withMessage('Ongeldige verzendkosten'),
];

// Create a new order
router.post('/', authenticateToken, orderValidationRules, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { body } = req;
  if (!body.supplier) {
    return res.status(400).json({ error: 'Leverancier is verplicht' });
  }

  const orderData = convertEmptyStringToNull({
    ...body,
    is_return: body.is_return ? 1 : 0,
    quote_requested: body.quote_requested ? 1 : 0,
    quote_received: body.quote_received ? 1 : 0,
    order_placed: body.order_placed ? 1 : 0,
    order_received: body.order_received ? 1 : 0,
    invoice_received: body.invoice_received ? 1 : 0,
    invoice_paid: body.invoice_paid ? 1 : 0
  });

  const columns = Object.keys(orderData);
  const placeholders = columns.map(() => '?').join(',');
  const values = columns.map(k => orderData[k]);

  const sql = `INSERT INTO orders (${columns.join(',')}) VALUES (${placeholders})`;

  db.run(sql, values, function(err) {
    if (err) {
      console.error('Database fout:', err);
      return res.status(500).json({ error: 'Fout bij het aanmaken van de bestelling' });
    }
    
    res.status(201).json({ 
      id: this.lastID, 
      message: 'Bestelling succesvol aangemaakt' 
    });
  });
});

// Update an existing order
router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { body } = req;

  const orderData = convertEmptyStringToNull({
    ...body,
    is_return: body.is_return ? 1 : 0,
    quote_requested: body.quote_requested ? 1 : 0,
    quote_received: body.quote_received ? 1 : 0,
    order_placed: body.order_placed ? 1 : 0,
    order_received: body.order_received ? 1 : 0,
    invoice_received: body.invoice_received ? 1 : 0,
    invoice_paid: body.invoice_paid ? 1 : 0,
    updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
  });
  
  const columns = Object.keys(orderData).filter(k => k !== 'id');
  const setClauses = columns.map(k => `${k} = ?`).join(', ');
  const values = columns.map(k => orderData[k]);

  if (columns.length === 0) {
    return res.status(400).json({ error: 'Geen geldige velden om te updaten' });
  }

  const sql = `UPDATE orders SET ${setClauses} WHERE id = ?`;
  values.push(id);

  db.run(sql, values, function(err) {
    if (err) {
      console.error('Database fout:', err);
      return res.status(500).json({ error: 'Fout bij het updaten van de bestelling' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Bestelling niet gevonden' });
    }
    
    res.json({ message: 'Bestelling succesvol bijgewerkt' });
  });
});

// Delete an order
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM orders WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Database fout:', err);
      return res.status(500).json({ error: 'Fout bij het verwijderen van de bestelling' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Bestelling niet gevonden' });
    }
    
    res.json({ message: 'Bestelling succesvol verwijderd' });
  });
});

module.exports = router;