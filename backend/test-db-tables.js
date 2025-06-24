const db = require('./db');

console.log('Testing database tables and data insertion...');

// Test function to check table structure and insert sample data
async function testDatabaseTables() {
  try {
    // Test 1: Check if tables exist
    console.log('\n1. Checking if tables exist...');
    const tables = await new Promise((resolve, reject) => {
      db.query('SHOW TABLES', (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    console.log('Available tables:', tables.map(t => Object.values(t)[0]));

    // Test 2: Check items table structure
    console.log('\n2. Checking items table structure...');
    const itemsStructure = await new Promise((resolve, reject) => {
      db.query('DESCRIBE items', (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    console.log('Items table columns:', itemsStructure.map(col => col.Field));

    // Test 3: Check maintenance_logs table structure
    console.log('\n3. Checking maintenance_logs table structure...');
    const maintenanceStructure = await new Promise((resolve, reject) => {
      db.query('DESCRIBE maintenance_logs', (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    console.log('Maintenance_logs table columns:', maintenanceStructure.map(col => col.Field));

    // Test 4: Check diagnostics table structure
    console.log('\n4. Checking diagnostics table structure...');
    const diagnosticsStructure = await new Promise((resolve, reject) => {
      db.query('DESCRIBE diagnostics', (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    console.log('Diagnostics table columns:', diagnosticsStructure.map(col => col.Field));

    // Test 5: Insert a test item
    console.log('\n5. Testing item insertion...');
    const testItem = {
      property_no: 'TEST-ITEM-001',
      article_type: 'Test Computer',
      specifications: 'Test specifications',
      date_acquired: '2024-01-01',
      end_user: 'Test User',
      price: 1000.00,
      location: 'Test Location',
      supply_officer: 'Test Officer',
      company_name: 'DTC'
    };

    const itemId = await new Promise((resolve, reject) => {
      db.query('INSERT INTO items SET ?', testItem, (err, results) => {
        if (err) reject(err);
        else resolve(results.insertId);
      });
    });
    console.log('Test item created with ID:', itemId);

    // Test 6: Insert test maintenance log
    console.log('\n6. Testing maintenance log insertion...');
    const testMaintenanceLog = {
      item_id: itemId,
      maintenance_date: '2024-01-15',
      task_performed: 'Test maintenance task',
      user_name: 'testuser',
      maintained_by: 'Test Maintainer',
      notes: 'Test notes',
      status: 'completed'
    };

    const maintenanceId = await new Promise((resolve, reject) => {
      db.query('INSERT INTO maintenance_logs SET ?', testMaintenanceLog, (err, results) => {
        if (err) reject(err);
        else resolve(results.insertId);
      });
    });
    console.log('Test maintenance log created with ID:', maintenanceId);

    // Test 7: Insert test diagnostic
    console.log('\n7. Testing diagnostic insertion...');
    const testDiagnostic = {
      item_id: itemId,
      diagnostics_date: '2024-01-15',
      system_status: 'Good',
      findings: 'Test findings',
      recommendations: 'Test recommendations'
    };

    const diagnosticId = await new Promise((resolve, reject) => {
      db.query('INSERT INTO diagnostics SET ?', testDiagnostic, (err, results) => {
        if (err) reject(err);
        else resolve(results.insertId);
      });
    });
    console.log('Test diagnostic created with ID:', diagnosticId);

    // Test 8: Query the data back
    console.log('\n8. Testing data retrieval...');
    const retrievedItem = await new Promise((resolve, reject) => {
      db.query('SELECT * FROM items WHERE id = ?', [itemId], (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    });
    console.log('Retrieved item:', retrievedItem);

    const retrievedLogs = await new Promise((resolve, reject) => {
      db.query('SELECT * FROM maintenance_logs WHERE item_id = ?', [itemId], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    console.log('Retrieved maintenance logs:', retrievedLogs.length);

    const retrievedDiagnostics = await new Promise((resolve, reject) => {
      db.query('SELECT * FROM diagnostics WHERE item_id = ?', [itemId], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    console.log('Retrieved diagnostics:', retrievedDiagnostics.length);

    // Test 9: Clean up test data
    console.log('\n9. Cleaning up test data...');
    await new Promise((resolve, reject) => {
      db.query('DELETE FROM items WHERE id = ?', [itemId], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    console.log('Test data cleaned up successfully');

    console.log('\n✅ All database tests passed!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Database test failed:', error);
    process.exit(1);
  }
}

// Run the test
testDatabaseTables(); 