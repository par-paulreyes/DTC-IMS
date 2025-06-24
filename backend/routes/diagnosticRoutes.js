const express = require('express');
const router = express.Router();
const diagnosticController = require('../controllers/diagnosticController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Get all diagnostics for company
router.get('/', verifyToken, diagnosticController.getAllDiagnostics);

// Get diagnostics by item
router.get('/item/:id', verifyToken, diagnosticController.getDiagnosticsByItem);

// Get specific diagnostic
router.get('/:id', verifyToken, diagnosticController.getDiagnosticById);

// Create new diagnostic
router.post('/', verifyToken, diagnosticController.createDiagnostic);

// Update diagnostic
router.put('/:id', verifyToken, diagnosticController.updateDiagnostic);

// Delete diagnostic (admin only)
router.delete('/:id', verifyToken, isAdmin, diagnosticController.deleteDiagnostic);

module.exports = router; 