const Diagnostic = require('../models/diagnosticModel');

exports.getAllDiagnostics = (req, res) => {
  const company_name = req.user.company_name;
  Diagnostic.findAllByCompany(company_name, (err, diagnostics) => {
    if (err) return res.status(500).json({ message: 'Error fetching diagnostics', error: err });
    res.json(diagnostics);
  });
};

exports.getDiagnosticById = (req, res) => {
  Diagnostic.findById(req.params.id, (err, diagnostic) => {
    if (err) return res.status(500).json({ message: 'Error fetching diagnostic', error: err });
    if (!diagnostic) return res.status(404).json({ message: 'Diagnostic not found' });
    res.json(diagnostic);
  });
};

exports.getDiagnosticsByItem = (req, res) => {
  const itemId = req.params.id;
  console.log('Getting diagnostics for item:', itemId);
  
  Diagnostic.findAllByItem(itemId, (err, diagnostics) => {
    if (err) {
      console.error('Error fetching diagnostics:', err);
      return res.status(500).json({ message: 'Error fetching diagnostics', error: err.message });
    }
    console.log('Successfully fetched diagnostics:', diagnostics.length);
    res.json(diagnostics);
  });
};

exports.createDiagnostic = (req, res) => {
  const diagnostic = { ...req.body };
  Diagnostic.create(diagnostic, (err, diagnosticId) => {
    if (err) return res.status(500).json({ message: 'Error creating diagnostic', error: err });
    res.status(201).json({ message: 'Diagnostic created', diagnosticId });
  });
};

exports.updateDiagnostic = (req, res) => {
  const company_name = req.user.company_name;
  const diagnosticId = req.params.id;
  
  // First check if the diagnostic belongs to the user's company
  Diagnostic.findById(diagnosticId, (err, diagnostic) => {
    if (err) return res.status(500).json({ message: 'Error finding diagnostic', error: err });
    if (!diagnostic) return res.status(404).json({ message: 'Diagnostic not found' });
    if (diagnostic.company_name !== company_name) {
      return res.status(403).json({ message: 'Access denied: Diagnostic does not belong to your company' });
    }
    
    // Proceed with update
    const updateData = { ...req.body };
    Diagnostic.update(diagnosticId, updateData, (updateErr, result) => {
      if (updateErr) return res.status(500).json({ message: 'Error updating diagnostic', error: updateErr });
      res.json({ message: 'Diagnostic updated' });
    });
  });
};

exports.deleteDiagnostic = (req, res) => {
  Diagnostic.delete(req.params.id, (err, result) => {
    if (err) return res.status(500).json({ message: 'Error deleting diagnostic', error: err });
    res.json({ message: 'Diagnostic deleted' });
  });
}; 