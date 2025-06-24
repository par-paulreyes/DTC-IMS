const db = require('./db');

console.log('Testing database connection...');

// Test basic connection
db.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
  
  console.log('Database connection successful!');
  
  // Test a simple query
  connection.query('SELECT 1 as test', (err, results) => {
    if (err) {
      console.error('Query test failed:', err);
    } else {
      console.log('Query test successful:', results);
    }
    
    // Test items table
    connection.query('SHOW TABLES', (err, results) => {
      if (err) {
        console.error('Show tables failed:', err);
      } else {
        console.log('Available tables:', results);
      }
      
      // Test items table structure
      connection.query('DESCRIBE items', (err, results) => {
        if (err) {
          console.error('Describe items failed:', err);
        } else {
          console.log('Items table structure:', results);
        }
        
        connection.release();
        process.exit(0);
      });
    });
  });
}); 