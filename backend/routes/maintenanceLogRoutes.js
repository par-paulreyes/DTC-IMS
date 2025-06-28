const express = require('express');
const router = express.Router();
const maintenanceLogController = require('../controllers/maintenanceLogController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.get('/', verifyToken, maintenanceLogController.getAllLogs);
router.get('/item/:item_id', verifyToken, maintenanceLogController.getLogsByItem);
router.post('/', verifyToken, maintenanceLogController.createLog);
router.put('/:id', verifyToken, maintenanceLogController.updateLog);
router.delete('/:id', verifyToken, isAdmin, maintenanceLogController.deleteLog);
router.get('/export', verifyToken, isAdmin, maintenanceLogController.exportLogs);

module.exports = router; 