const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const https = require('https');
const db = require('./db');
const authRoutes = require('./routes/authRoutes');
const companyRoutes = require('./routes/companyRoutes');
const itemRoutes = require('./routes/itemRoutes');
const maintenanceLogRoutes = require('./routes/maintenanceLogRoutes');
const diagnosticRoutes = require('./routes/diagnosticRoutes');
const userRoutes = require('./routes/userRoutes');

// Load environment variables
dotenv.config();

const app = express();

// Configure CORS to allow requests from any origin
app.use(cors({
  origin: '*', // Allow all origins for network access
  credentials: true
}));

app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Test database connection
db.getConnection((err, connection) => {
  if (err) {
    console.error('MySQL connection error:', err);
    process.exit(1);
  }
  console.log('Connected to MySQL database');
  connection.release();
});

app.get('/', (req, res) => {
  res.send('Inventory Management System API');
});

app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/logs', maintenanceLogRoutes);
app.use('/api/diagnostics', diagnosticRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0'; // Listen on all network interfaces

// HTTPS certificate and key
const certPath = process.env.CERT_PATH || path.join(__dirname, '192.168.100.188+2.pem');
const keyPath = process.env.KEY_PATH || path.join(__dirname, '192.168.100.188+2-key.pem');
const cert = fs.readFileSync(certPath);
const key = fs.readFileSync(keyPath);

https.createServer({ key, cert }, app).listen(PORT, HOST, () => {
  console.log(`HTTPS Server running on https://${HOST}:${PORT}`);
}); 