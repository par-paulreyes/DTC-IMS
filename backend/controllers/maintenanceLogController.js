const MaintenanceLog = require('../models/maintenanceLogModel');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');

exports.getAllLogs = (req, res) => {
  const company_name = req.user.company_name;
  MaintenanceLog.findAllByCompany(company_name, (err, logs) => {
    if (err) return res.status(500).json({ message: 'Error fetching logs', error: err });
    res.json(logs);
  });
};

exports.getLogsByItem = (req, res) => {
  console.log('Getting maintenance logs for item:', req.params.item_id);
  
  MaintenanceLog.findAllByItem(req.params.item_id, (err, logs) => {
    if (err) {
      console.error('Error fetching maintenance logs:', err);
      return res.status(500).json({ message: 'Error fetching logs', error: err.message });
    }
    console.log('Successfully fetched maintenance logs:', logs.length);
    res.json(logs);
  });
};

exports.createLog = (req, res) => {
  const username = req.user.username;
  const log = { ...req.body, maintained_by: username };
  MaintenanceLog.create(log, (err, logId) => {
    if (err) return res.status(500).json({ message: 'Error creating log', error: err });
    res.status(201).json({ message: 'Log created', logId });
  });
};

exports.updateLog = (req, res) => {
  const username = req.user.username;
  const company_name = req.user.company_name;
  const logId = req.params.id;
  
  // First check if the log belongs to the user's company
  MaintenanceLog.findById(logId, (err, log) => {
    if (err) return res.status(500).json({ message: 'Error finding log', error: err });
    if (!log) return res.status(404).json({ message: 'Log not found' });
    if (log.company_name !== company_name) {
      return res.status(403).json({ message: 'Access denied: Log does not belong to your company' });
    }
    
    // Proceed with update
    const logData = { ...req.body, maintained_by: username };
    MaintenanceLog.update(logId, logData, (updateErr, result) => {
      if (updateErr) return res.status(500).json({ message: 'Error updating log', error: updateErr });
      res.json({ message: 'Log updated' });
    });
  });
};

exports.deleteLog = (req, res) => {
  MaintenanceLog.delete(req.params.id, (err, result) => {
    if (err) return res.status(500).json({ message: 'Error deleting log', error: err });
    res.json({ message: 'Log deleted' });
  });
};

exports.exportLogs = (req, res) => {
  const company_name = req.user.company_name;
  const format = req.query.format || 'csv';
  MaintenanceLog.findAllByCompany(company_name, (err, logs) => {
    if (err) return res.status(500).json({ message: 'Error exporting logs', error: err });
    if (format === 'pdf') {
      try {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=maintenance_logs.pdf');
        const doc = new PDFDocument();
        doc.pipe(res);
        doc.fontSize(18).text('Maintenance Logs', { align: 'center' });
        doc.moveDown();
        logs.forEach((log, idx) => {
          doc.fontSize(12).text(`Log #${idx + 1}`);
          doc.text(`Item: ${log.qr_code || 'N/A'} (${log.article_type || 'N/A'})`);
          doc.text(`Task: ${log.task_performed}`);
          doc.text(`Date: ${log.maintenance_date}`);
          doc.text(`Maintained By: ${log.maintained_by}`);
          doc.text(`Created At: ${log.created_at}`);
          doc.moveDown();
        });
        doc.end();
      } catch (err) {
        return res.status(500).json({ message: 'Error generating PDF', error: err });
      }
    } else {
      try {
        const fields = [
          'id', 'item_id', 'qr_code', 'article_type',
          'task_performed', 'maintenance_date', 'maintained_by', 'created_at'
        ];
        const parser = new Parser({ fields });
        const csv = parser.parse(logs);
        res.header('Content-Type', 'text/csv');
        res.attachment('maintenance_logs.csv');
        return res.send(csv);
      } catch (err) {
        return res.status(500).json({ message: 'Error generating CSV', error: err });
      }
    }
  });
}; 