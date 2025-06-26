// API Configuration
// Change this to your server's IP address when accessing over network
// For local development: 'http://localhost:5000'
// For network access: 'http://YOUR_SERVER_IP:5000' (replace YOUR_SERVER_IP with actual IP)

// Determine the protocol based on current location
const getProtocol = () => {
  if (typeof window !== 'undefined') {
    return window.location.protocol;
  }
  return 'http:';
};

const getBaseUrl = () => {
  const protocol = getProtocol();
  const serverIP = '192.168.100.188';
  const port = '5000';
  
  // Use HTTPS for camera access over network, HTTP for localhost
  if (protocol === 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return `https://${serverIP}:${port}`;
  }
  
  return `http://${serverIP}:${port}`;
};

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || getBaseUrl();

// Helper function to get full API URL
export const getApiUrl = (endpoint: string) => {
  return `${API_BASE_URL}/api${endpoint}`;
};

// Helper function to get image URL (without /api prefix)
export const getImageUrl = (imagePath: string) => {
  if (!imagePath) return '';
  // If the path already starts with http, return as is
  if (imagePath.startsWith('http')) return imagePath;
  // Otherwise, prepend the base URL
  return `${API_BASE_URL}${imagePath}`;
}; 