const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

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
  try {
    console.log('📝 Update Profile Request:', {
      userId: req.user.id,
      body: req.body,
      hasPassword: !!req.body.password
    });

    const updateData = { ...req.body };
    
    // Remove fields that shouldn't be updated
    delete updateData.id;
    delete updateData.username; // Username should not be changed
    delete updateData.role; // Role should not be changed
    delete updateData.company_name; // Company should not be changed
    
    // Hash password if provided
    if (updateData.password) {
      updateData.password = bcrypt.hashSync(updateData.password, 10);
    }
    
    // Remove confirmPassword from update data
    delete updateData.confirmPassword;
    
    console.log('🔧 Processed Update Data:', updateData);
    
    User.update(req.user.id, updateData, (err, result) => {
      if (err) {
        console.error('❌ Database Update Error:', err);
        return res.status(500).json({ message: 'Error updating profile', error: err.message });
      }
      console.log('✅ Profile Updated Successfully:', result);
      res.json({ message: 'Profile updated successfully' });
    });
  } catch (error) {
    console.error('❌ Update Profile Error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.uploadProfilePicture = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  const imageUrl = `/uploads/${req.file.filename}`;
  // First, get the previous profile picture
  User.findById(req.user.id, (err, user) => {
    if (err || !user) {
      return res.status(500).json({ message: 'Error finding user for profile picture update' });
    }
    const prevImage = user.profile_picture;
    // Update to new image
    User.update(req.user.id, { profile_picture: imageUrl }, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error saving profile picture' });
      }
      // Delete previous image if it exists and is different
      if (prevImage && prevImage !== imageUrl && prevImage.startsWith('/uploads/')) {
        const prevPath = path.join(__dirname, '..', prevImage);
        fs.unlink(prevPath, (err) => {
          if (err) {
            console.warn('Failed to delete previous profile picture:', prevPath, err.message);
          }
        });
      }
      res.json({ url: imageUrl });
    });
  });
}; 