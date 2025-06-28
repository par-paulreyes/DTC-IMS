const db = require('../db');

const Diagnostic = {
  findAllByCompany: (company_name, callback) => {
    db.query(
      `SELECT d.*, i.property_no, i.article_type
       FROM diagnostics d
       JOIN items i ON d.item_id = i.id
       WHERE i.company_name = ?
       ORDER BY d.diagnostics_date DESC`,
      [company_name],
      (err, results) => {
        if (err) return callback(err);
        callback(null, results);
      }
    );
  },
  findAllByItem: (item_id, callback) => {
    db.query(
      `SELECT d.*, i.property_no, i.article_type, i.company_name
       FROM diagnostics d
       JOIN items i ON d.item_id = i.id
       WHERE d.item_id = ? 
       ORDER BY d.diagnostics_date DESC, d.created_at DESC`,
      [item_id],
      (err, results) => {
        if (err) return callback(err);
        callback(null, results);
      }
    );
  },
  findById: (id, callback) => {
    db.query(
      `SELECT d.*, i.company_name
       FROM diagnostics d
       JOIN items i ON d.item_id = i.id
       WHERE d.id = ?`,
      [id],
      (err, results) => {
        if (err) return callback(err);
        callback(null, results[0]);
      }
    );
  },
  create: (diagnostic, callback) => {
    db.query('INSERT INTO diagnostics SET ?', diagnostic, (err, results) => {
      if (err) return callback(err);
      callback(null, results.insertId);
    });
  },
  update: (id, diagnostic, callback) => {
    db.query('UPDATE diagnostics SET ? WHERE id = ?', [diagnostic, id], (err, results) => {
      if (err) return callback(err);
      callback(null, results);
    });
  },
  delete: (id, callback) => {
    db.query('DELETE FROM diagnostics WHERE id = ?', [id], (err, results) => {
      if (err) return callback(err);
      callback(null, results);
    });
  },
};

module.exports = Diagnostic; 