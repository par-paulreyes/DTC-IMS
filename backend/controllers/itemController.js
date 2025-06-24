const Item = require('../models/itemModel');
const MaintenanceLog = require('../models/maintenanceLogModel');
const Diagnostic = require('../models/diagnosticModel');

exports.getAllItems = (req, res) => {
  console.log('Getting all items for company:', req.user.company_name);
  
  const company_name = req.user.company_name;
  Item.findAllByCompany(company_name, (err, items) => {
    if (err) {
      console.error('Error fetching items:', err);
      return res.status(500).json({ message: 'Error fetching items', error: err.message });
    }
    console.log('Successfully fetched items:', items.length);
    res.json(items);
  });
};

exports.getItemById = (req, res) => {
  Item.findById(req.params.id, (err, item) => {
    if (err) return res.status(500).json({ message: 'Error fetching item', error: err });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  });
};

exports.createItem = async (req, res) => {
  try {
    console.log('Creating item with data:', req.body);
    console.log('User:', req.user);
    
    const company_name = req.user.company_name;
    
    // Filter out maintenance-related fields that don't belong in items table
    const { maintenance_date, maintained_by, maintenance_tasks, diagnostic, ...itemData } = req.body;
    
    console.log('Extracted maintenance fields:', { maintenance_date, maintained_by, maintenance_tasks, diagnostic });
    console.log('Filtered item data:', itemData);
    
    let item = { ...itemData, company_name };
    
    console.log('Final item data to insert:', item);
    
    // Handle image upload
  if (req.file) {
    item.image_url = `/uploads/${req.file.filename}`;
      console.log('Image uploaded:', req.file.filename);
    }

    // Create the item first using Promise
    const itemId = await new Promise((resolve, reject) => {
      Item.create(item, (err, id) => {
        if (err) {
          console.error('Error creating item in database:', err);
          reject(err);
        } else {
          console.log('Item created successfully with ID:', id);
          resolve(id);
        }
      });
    });
    
    let maintenanceLogsCreated = 0;
    let diagnosticCreated = false;
    
    // Create maintenance logs if provided
    if (maintenance_tasks && maintenance_date) {
      try {
        const maintenanceTasks = JSON.parse(maintenance_tasks);
        const maintainedBy = maintained_by || req.user.full_name || req.user.username;
        
        console.log('Creating maintenance logs for tasks:', maintenanceTasks);
        
        // Create all maintenance logs using Promise.all
        const maintenancePromises = maintenanceTasks.map((task, index) => {
          return new Promise((resolve, reject) => {
            const maintenanceLog = {
              item_id: itemId,
              maintenance_date: maintenance_date,
              task_performed: task.task,
              user_name: req.user.username || req.user.full_name || 'System User',
              maintained_by: maintainedBy,
              notes: task.notes || '',
              status: task.completed ? 'completed' : 'pending'
            };
            
            console.log(`Creating maintenance log ${index + 1}:`, maintenanceLog);
            
            MaintenanceLog.create(maintenanceLog, (err, logId) => {
              if (err) {
                console.error('Error creating maintenance log:', err);
                reject(err);
              } else {
                console.log('Maintenance log created with ID:', logId);
                resolve(logId);
              }
            });
          });
        });
        
        // Wait for all maintenance logs to be created
        const maintenanceResults = await Promise.all(maintenancePromises);
        maintenanceLogsCreated = maintenanceResults.length;
        console.log(`Successfully created ${maintenanceLogsCreated} maintenance logs`);
        
      } catch (parseErr) {
        console.error('Error parsing or creating maintenance tasks:', parseErr);
        throw new Error('Failed to create maintenance logs: ' + parseErr.message);
      }
    }

    // Create diagnostic record if provided
    if (diagnostic) {
      try {
        const diagnosticData = JSON.parse(diagnostic);
        const diagnosticRecord = {
          item_id: itemId,
          diagnostics_date: new Date().toISOString().split('T')[0],
          system_status: diagnosticData.system_status,
          findings: diagnosticData.findings || '',
          recommendations: diagnosticData.recommendations || ''
        };
        
        console.log('Creating diagnostic record:', diagnosticRecord);
        
        const diagnosticId = await new Promise((resolve, reject) => {
          Diagnostic.create(diagnosticRecord, (err, id) => {
            if (err) {
              console.error('Error creating diagnostic:', err);
              reject(err);
            } else {
              console.log('Diagnostic created with ID:', id);
              resolve(id);
            }
          });
        });
        
        diagnosticCreated = true;
        console.log('Successfully created diagnostic record');
        
      } catch (parseErr) {
        console.error('Error parsing or creating diagnostic data:', parseErr);
        throw new Error('Failed to create diagnostic record: ' + parseErr.message);
      }
    }

    // Send success response
    const response = {
      message: 'Item created successfully',
      id: itemId,
      maintenance_logs_created: maintenanceLogsCreated,
      diagnostic_created: diagnosticCreated
    };
    
    console.log('Final response:', response);
    res.status(201).json(response);
    
  } catch (error) {
    console.error('Error in createItem:', error);
    res.status(500).json({ 
      message: 'Error creating item', 
      error: error.message 
    });
  }
};

exports.updateItem = (req, res) => {
  let updateData = { ...req.body };
  if (req.file) {
    updateData.image_url = `/uploads/${req.file.filename}`;
  }
  Item.update(req.params.id, updateData, (err, result) => {
    if (err) return res.status(500).json({ message: 'Error updating item', error: err });
    res.json({ message: 'Item updated' });
  });
};

exports.deleteItem = (req, res) => {
  Item.delete(req.params.id, (err, result) => {
    if (err) return res.status(500).json({ message: 'Error deleting item', error: err });
    res.json({ message: 'Item deleted' });
  });
};

exports.getItemByQRCode = (req, res) => {
  const code = req.params.code;
  Item.findByQRCode(code, (err, item) => {
    if (err) return res.status(500).json({ message: 'Error fetching item by QR code', error: err });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  });
};

exports.getUpcomingMaintenance = (req, res) => {
  const company_name = req.user.company_name;
  Item.findUpcomingMaintenance(company_name, (err, items) => {
    if (err) return res.status(500).json({ message: 'Error fetching upcoming maintenance items', error: err });
    res.json(items);
  });
}; 