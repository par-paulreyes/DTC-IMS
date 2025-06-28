import axios from 'axios';

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
  return 'https://192.168.68.150:5000';
};

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || getBaseUrl();

// Create Axios instance with configuration for self-signed certificates
export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  // For development with self-signed certificates
  ...(typeof window !== 'undefined' && {
    // This will be handled by the browser's security settings
    // We'll need to accept the certificate manually in the browser
  })
});

// Add request interceptor to handle authentication
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle specific error cases
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('token');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

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