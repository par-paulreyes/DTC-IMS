const db = require('./db');
const bcrypt = require('bcryptjs');

db.query('SELECT username, password FROM users WHERE username = "admin"', (err, results) => {
  if (err) {
    console.error('Error:', err);
  } else {
    const user = results[0];
    console.log('Admin user found:', user.username);
    console.log('Password hash:', user.password);
    
    // Test if admin123 matches the hash
    const isMatch = bcrypt.compareSync('admin123', user.password);
    console.log('Password "admin123" matches:', isMatch);
    
    // Test other common passwords
    const testPasswords = ['admin', 'password', '123456', 'admin123'];
    testPasswords.forEach(pwd => {
      const matches = bcrypt.compareSync(pwd, user.password);
      console.log(`Password "${pwd}" matches:`, matches);
    });
  }
  process.exit();
}); 