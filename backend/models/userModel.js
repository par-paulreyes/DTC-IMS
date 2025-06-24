const db = require('../db');

const User = {
  findByUsername: (username, callback) => {
    db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
      if (err) return callback(err);
      callback(null, results[0]);
    });
  },
  findByEmail: (email, callback) => {
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
      if (err) return callback(err);
      callback(null, results[0]);
    });
  },
  create: (user, callback) => {
    db.query('INSERT INTO users SET ?', user, (err, results) => {
      if (err) return callback(err);
      callback(null, results.insertId);
    });
  },
  findById: (id, callback) => {
    db.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
      if (err) return callback(err);
      callback(null, results[0]);
    });
  },
  update: (id, user, callback) => {
    db.query('UPDATE users SET ? WHERE id = ?', [user, id], (err, results) => {
      if (err) return callback(err);
      callback(null, results);
    });
  },
};

module.exports = User; 