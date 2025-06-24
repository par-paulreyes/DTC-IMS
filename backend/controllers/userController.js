const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

exports.getProfile = (req, res) => {
  User.findById(req.user.id, (err, user) => {
    if (err) return res.status(500).json({ message: 'Error fetching profile', error: err });
    if (!user) return res.status(404).json({ message: 'User not found' });
    // Do not return password
    const { password, ...userData } = user;
    res.json(userData);
  });
};

exports.updateProfile = (req, res) => {
  const updateData = { ...req.body };
  if (updateData.password) {
    updateData.password = bcrypt.hashSync(updateData.password, 10);
  }
  User.update(req.user.id, updateData, (err, result) => {
    if (err) return res.status(500).json({ message: 'Error updating profile', error: err });
    res.json({ message: 'Profile updated' });
  });
}; 