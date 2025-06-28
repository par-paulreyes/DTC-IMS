const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check if we're on Windows
const isWindows = process.platform === 'win32';

// Start the development server with HTTPS
const args = [
  'dev',
  '--turbopack',
  '--experimental-https',
  '--hostname', '0.0.0.0',
  '--port', '3000'
];

console.log('Starting Next.js development server with HTTPS support...');
console.log('This will enable camera access over the network.');
console.log('Access your app at: https://192.168.68.150:3000');

const child = spawn('npx', ['next', ...args], {
  stdio: 'inherit',
  shell: isWindows
});

child.on('error', (error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

child.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
  process.exit(code);
}); 