import axios from 'axios';
import { API_CONFIG } from '../constants';
import { sessionStorage } from '../utils/storage';

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

// Request interceptor - Add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await sessionStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => {
    // Return data directly for convenience
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
    const errorResponse = {
      status: error.response?.status,
      message: error.response?.data?.message || error.message || 'An error occurred',
      data: error.response?.data,
    };

    return Promise.reject(errorResponse);
  }
);

// HTTP methods with cleaner interface
export const apiService = {
  get: (url, config = {}) => api.get(url, config),
  post: (url, data = {}, config = {}) => api.post(url, data, config),
  put: (url, data = {}, config = {}) => api.put(url, data, config),
  patch: (url, data = {}, config = {}) => api.patch(url, data, config),
  delete: (url, config = {}) => api.delete(url, config),
};

export default api;
