const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

exports.getProfile = (req, res) => {
  User.findById(req.user.id, (err, user) => {
    if (err) return res.status(500).json({ message: 'Error fetching profile', error: err });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { password, ...userData } = user;
    res.json(userData);
  });
};

exports.updateProfile = (req, res) => {
  try {
    const updateData = { ...req.body };
    delete updateData.id;
    delete updateData.username;
    delete updateData.role;
    delete updateData.company_name;
    delete updateData.created_at;
    delete updateData.updated_at;
    if (updateData.password) {
      updateData.password = bcrypt.hashSync(updateData.password, 10);
    }
    delete updateData.confirmPassword;
    if (req.body.profile_picture) {
      updateData.profile_picture = req.body.profile_picture;
    }
    // Debug logging
    console.log('Updating user:', req.user.id, updateData);
    User.update(req.user.id, updateData, (err, result) => {
      if (err) {
        console.log('Update error:', err); // Debug log for SQL error
        return res.status(500).json({ message: 'Error updating profile', error: err.message });
      }
      console.log('Update result:', result); // Debug log for SQL result
      res.json({ message: 'Profile updated successfully' });
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}; 