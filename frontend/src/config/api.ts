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
  // Use env variable if set (best for SSR)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  // Only use window if on client (not needed for IP, but kept for future logic)
  if (typeof window !== 'undefined') {
    // You could add logic here if you want to dynamically detect IP
  }
  // Always use your computer's own IP for SSR and client
  return 'https://192.168.102.75:5000';
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