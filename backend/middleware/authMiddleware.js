const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });
  
  // Handle both "Bearer token" and direct token formats
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  
  // Debug: Log token info (remove in production)
  console.log('🔐 Token verification:', {
    hasToken: !!token,
    tokenLength: token ? token.length : 0,
    jwtSecret: process.env.JWT_SECRET ? 'Set' : 'Not set'
  });
  
  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here_change_this_in_production', (err, decoded) => {
    if (err) {
      console.error('❌ Token verification failed:', err.message);
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    // Debug: Log decoded user info (remove in production)
    console.log('✅ Token verified:', {
      userId: decoded.id,
      userRole: decoded.role,
      userCompany: decoded.company_name
    });
    
    req.user = decoded;
    next();
  });
};

exports.isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  next();
}; 