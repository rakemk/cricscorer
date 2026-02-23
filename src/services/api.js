import axios from 'axios';
import { API_CONFIG } from '../constants';
import { sessionStorage } from '../utils/storage';
import { mockApiService } from './mockApi';

/**
 * Axios instance with authentication interceptor
 * Replaces AngularJS $http service
 */

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Debug logging
if (API_CONFIG.DEBUG) {
  console.log('');
  console.log('='.repeat(60));
  console.log('🚀 API SERVICE INITIALIZED');
  console.log('='.repeat(60));
  console.log('  Environment:', API_CONFIG.CURRENT_ENV);
  console.log('  Base URL:', API_CONFIG.BASE_URL);
  console.log('  Platform:', require('react-native').Platform.OS);
  console.log('  Mock Mode:', API_CONFIG.USE_MOCK ? 'ENABLED ✅' : 'DISABLED ❌');
  console.log('  Debug Mode:', API_CONFIG.DEBUG ? 'ENABLED ✅' : 'DISABLED ❌');
  console.log('='.repeat(60));
  console.log('');
  
  if (API_CONFIG.USE_MOCK) {
    console.log('🔶 MOCK API MODE ACTIVE');
    console.log('   Using fake data - no backend server needed');
    console.log('   Test credentials: username=333, password=1234');
    console.log('');
  }
}

// Request interceptor - Add auth token
api.interceptors.request.use(
  async (config) => {
    // Get full authorization token in format: "Bearer xyz" 
    // Similar to cric-scorer-ui: token_type + " " + access_token
    const authToken = await sessionStorage.getAuthorizationToken();
    if (authToken) {
      config.headers.Authorization = authToken;
    }
    
    // Debug logging
    if (API_CONFIG.DEBUG) {
      console.log('');
      console.log('📤 API REQUEST:');
      console.log('   Method:', config.method?.toUpperCase());
      console.log('   Endpoint:', config.url);
      console.log('   Full URL:', config.baseURL + config.url);
      console.log('   Has Auth:', !!authToken ? '✅' : '❌');
      if (config.data) {
        console.log('   Data:', JSON.stringify(config.data).substring(0, 100));
      }
      console.log('');
    }
    
    return config;
  },
  (error) => {
    if (API_CONFIG.DEBUG) {
      console.error('❌ REQUEST ERROR:', error.message);
    }
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => {
    // Debug logging for successful responses
    if (API_CONFIG.DEBUG) {
      console.log('');
      console.log('✅ API RESPONSE:');
      console.log('   URL:', response.config?.url);
      console.log('   Status:', response.status);
      console.log('   Data:', JSON.stringify(response.data).substring(0, 100) + '...');
      console.log('');
    }
    
    // Return data directly for convenience
    // API returns: { status: 200, data: { data: {...} } }
    // We return response.data so consumers can access response.data.data if needed
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt token refresh here if needed
        // const refreshToken = await sessionStorage.getRefreshToken();
        // const newTokens = await refreshAccessToken(refreshToken);
        // await sessionStorage.setTokens(newTokens);
        // return api(originalRequest);
      } catch (refreshError) {
        // Clear tokens and redirect to login
        await sessionStorage.clearTokens();
        // Navigation to login will be handled by the app
      }
    }

    // Format error response
    let errorMessage = 'An error occurred';
    
    if (error.response) {
      // Server responded with error
      errorMessage = error.response?.data?.message || 
                     error.response?.data?.error || 
                     `Server error: ${error.response.status}`;
    } else if (error.request) {
      // Request was made but no response
      const platform = require('react-native').Platform.OS;
      const baseURL = API_CONFIG.BASE_URL;
      
      errorMessage = `Cannot connect to API server at ${baseURL}\n\n`;
      errorMessage += '** TROUBLESHOOTING STEPS **\n\n';
      
      if (platform === 'android') {
        errorMessage += '📱 Android Emulator:\n';
        errorMessage += '  • Make sure your backend server is running on port 3000\n';
        errorMessage += '  • Use http://10.0.2.2:3000 to access localhost\n\n';
      } else if (platform === 'ios') {
        errorMessage += '📱 iOS Simulator:\n';
        errorMessage += '  • Make sure your backend server is running on port 3000\n';
        errorMessage += '  • Use http://localhost:3000\n\n';
      }
      
      errorMessage += '🔧 If using physical device:\n';
      errorMessage += '  1. Find your computer IP: run "ipconfig" (Windows) or "ifconfig" (Mac/Linux)\n';
      errorMessage += '  2. Update config.js: BASE_URL to http://YOUR_IP:3000\n';
      errorMessage += '  3. Ensure device and computer are on same WiFi\n\n';
      errorMessage += '✅ Checklist:\n';
      errorMessage += '  □ Backend API server is running\n';
      errorMessage += '  □ Server is accessible at the configured URL\n';
      errorMessage += '  □ Firewall is not blocking the connection\n';
      errorMessage += `  □ config.js BASE_URL is correct: ${baseURL}\n\n`;
      errorMessage += '💡 TIP: If you don\'t have a backend server, enable Mock Mode:\n';
      errorMessage += '   Edit src/constants/config.js\n';
      errorMessage += '   Change: const CURRENT_ENV = \'mock\';\n';
    } else {
      // Something else happened
      errorMessage = error.message || 'Request failed';
    }
    
    const errorResponse = {
      status: error.response?.status,
      message: errorMessage,
      data: error.response?.data,
      isNetworkError: !error.response,
    };
    
    // Debug logging
    if (API_CONFIG.DEBUG) {
      console.log('');
      console.log('❌ API ERROR:');
      console.log('   URL:', error.config?.url);
      console.log('   Method:', error.config?.method?.toUpperCase());
      console.log('   Status:', error.response?.status || 'No Response');
      console.log('   Message:', errorMessage);
      console.log('');
    }

    return Promise.reject(errorResponse);
  }
);

// HTTP methods with cleaner interface
// If mock mode is enabled, use mock API instead of real API
export const apiService = {
  get: (url, config = {}) => {
    if (API_CONFIG.USE_MOCK) {
      return mockApiService.get(url, config);
    }
    return api.get(url, config);
  },
  post: (url, data = {}, config = {}) => {
    if (API_CONFIG.USE_MOCK) {
      return mockApiService.post(url, data, config);
    }
    return api.post(url, data, config);
  },
  put: (url, data = {}, config = {}) => {
    if (API_CONFIG.USE_MOCK) {
      return mockApiService.put(url, data, config);
    }
    return api.put(url, data, config);
  },
  patch: (url, data = {}, config = {}) => {
    if (API_CONFIG.USE_MOCK) {
      return mockApiService.patch(url, data, config);
    }
    return api.patch(url, data, config);
  },
  delete: (url, config = {}) => {
    if (API_CONFIG.USE_MOCK) {
      return mockApiService.delete(url, config);
    }
    return api.delete(url, config);
  },
};

export default api;
