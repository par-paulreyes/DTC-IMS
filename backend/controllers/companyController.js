const Company = require('../models/companyModel');

exports.getAllCompanies = (req, res) => {
  Company.findAll((err, companies) => {
    if (err) return res.status(500).json({ message: 'Error fetching companies', error: err });
    res.json(companies);
  });
};

exports.createCompany = (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: 'Company name is required' });
  Company.create(name, (err, companyId) => {
    if (err) return res.status(500).json({ message: 'Error creating company', error: err });
    res.status(201).json({ message: 'Company created', companyId });
  });
}; 