// API Configuration
// Change this to your server's IP address when accessing over network
// For local development: 'http://localhost:5000'
// For network access: 'http://YOUR_SERVER_IP:5000' (replace YOUR_SERVER_IP with actual IP)

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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