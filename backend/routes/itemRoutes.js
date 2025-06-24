const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Specific routes first to avoid conflicts
router.get('/maintenance/upcoming', verifyToken, itemController.getUpcomingMaintenance);
router.get('/qr/:code', verifyToken, itemController.getItemByQRCode);

// General routes
router.get('/', verifyToken, itemController.getAllItems);
router.get('/:id', verifyToken, itemController.getItemById);
router.post('/', verifyToken, upload.single('image'), itemController.createItem);
router.put('/:id', verifyToken, upload.single('image'), itemController.updateItem);
router.delete('/:id', verifyToken, isAdmin, itemController.deleteItem);

module.exports = router; 