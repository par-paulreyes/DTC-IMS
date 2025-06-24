const db = require('../db');

const Company = {
  findAll: (callback) => {
    db.query('SELECT * FROM companies', (err, results) => {
      if (err) return callback(err);
      callback(null, results);
    });
  },
  create: (name, callback) => {
    db.query('INSERT INTO companies (name) VALUES (?)', [name], (err, results) => {
      if (err) return callback(err);
      callback(null, results.insertId);
    });
  },
};

module.exports = Company; 