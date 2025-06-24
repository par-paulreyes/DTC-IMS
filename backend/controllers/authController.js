const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.register = (req, res) => {
  const { username, full_name, email, password, company_name, role } = req.body;
  if (!username || !full_name || !email || !password || !company_name) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  User.findByUsername(username, (err, user) => {
    if (user) return res.status(400).json({ message: 'Username already exists' });
    User.findByEmail(email, (err, userByEmail) => {
      if (userByEmail) return res.status(400).json({ message: 'Email already exists' });
      const hashedPassword = bcrypt.hashSync(password, 10);
      const newUser = { username, full_name, email, password: hashedPassword, company_name, role: role || 'user' };
      User.create(newUser, (err, userId) => {
        if (err) return res.status(500).json({ message: 'Error creating user', error: err });
        res.status(201).json({ message: 'User registered', userId });
      });
    });
  });
};

exports.login = (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  User.findByUsername(username, (err, user) => {
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ 
      id: user.id, 
      username: user.username,
      full_name: user.full_name,
      role: user.role, 
      company_name: user.company_name 
    }, process.env.JWT_SECRET || 'your_jwt_secret_key_here_change_this_in_production', { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, username: user.username, full_name: user.full_name, email: user.email, role: user.role, company_name: user.company_name } });
  });
}; 