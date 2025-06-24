const db = require('../db');

const Item = {
  findAllByCompany: (company_name, callback) => {
    db.query(`
      SELECT i.*, ml.status AS status, d.system_status AS system_status
      FROM items i
      LEFT JOIN maintenance_logs ml ON ml.id = (
        SELECT id FROM maintenance_logs
        WHERE item_id = i.id
        ORDER BY maintenance_date DESC, created_at DESC
        LIMIT 1
      )
      LEFT JOIN diagnostics d ON d.id = (
        SELECT id FROM diagnostics
        WHERE item_id = i.id
        ORDER BY diagnostics_date DESC, created_at DESC
        LIMIT 1
      )
      WHERE i.company_name = ?
    `, [company_name], (err, results) => {
      if (err) return callback(err);
      callback(null, results);
    });
  },
  findById: (id, callback) => {
    db.query(`
      SELECT i.*, ml.status AS status, d.system_status AS system_status
      FROM items i
      LEFT JOIN maintenance_logs ml ON ml.id = (
        SELECT id FROM maintenance_logs
        WHERE item_id = i.id
        ORDER BY maintenance_date DESC, created_at DESC
        LIMIT 1
      )
      LEFT JOIN diagnostics d ON d.id = (
        SELECT id FROM diagnostics
        WHERE item_id = i.id
        ORDER BY diagnostics_date DESC, created_at DESC
        LIMIT 1
      )
      WHERE i.id = ?
    `, [id], (err, results) => {
      if (err) return callback(err);
      callback(null, results[0]);
    });
  },
  create: (item, callback) => {
    db.query('INSERT INTO items SET ?', item, (err, results) => {
      if (err) return callback(err);
      callback(null, results.insertId);
    });
  },
  update: (id, item, callback) => {
    db.query('UPDATE items SET ? WHERE id = ?', [item, id], (err, results) => {
      if (err) return callback(err);
      callback(null, results);
    });
  },
  delete: (id, callback) => {
    db.query('DELETE FROM items WHERE id = ?', [id], (err, results) => {
      if (err) return callback(err);
      callback(null, results);
    });
  },
  findByQRCode: (code, callback) => {
    db.query('SELECT * FROM items WHERE property_no = ?', [code], (err, results) => {
      if (err) return callback(err);
      callback(null, results[0]);
    });
  },
  findUpcomingMaintenance: (company_name, callback) => {
    db.query(
      `SELECT * FROM items WHERE company_name = ? AND (next_maintenance_date IS NOT NULL AND next_maintenance_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY))`,
      [company_name],
      (err, results) => {
        if (err) return callback(err);
        callback(null, results);
      }
    );
  },
};

module.exports = Item; 