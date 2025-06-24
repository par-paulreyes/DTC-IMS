const os = require('os');

function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      // Skip internal (i.e. 127.0.0.1) and non-ipv4 addresses
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  
  return null;
}

const ip = getLocalIPAddress();
if (ip) {
  console.log('Your server IP address is:', ip);
  console.log('Use this IP address in your frontend configuration:');
  console.log(`NEXT_PUBLIC_API_URL=http://${ip}:5000`);
  console.log('');
  console.log('Or update the API_BASE_URL in frontend/src/config/api.ts to:');
  console.log(`export const API_BASE_URL = 'http://${ip}:5000';`);
} else {
  console.log('Could not determine IP address. Make sure you are connected to a network.');
} 