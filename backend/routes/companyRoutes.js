const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.get('/', verifyToken, companyController.getAllCompanies);
router.post('/', verifyToken, isAdmin, companyController.createCompany);

module.exports = router; 