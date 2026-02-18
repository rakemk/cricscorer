import { apiService } from './api';
import { ENDPOINTS } from '../constants';
import { sessionStorage } from '../utils/storage';

/**
 * Authentication Service
 * Handles login, logout, and token management
 * Replaces loginCtrl.js authentication logic
 */

export const authService = {
  /**
   * Login with email/phone and password
   * Matches cric-scorer-ui login implementation
   * @param {string} username - Email or phone number
   * @param {string} password - User password
   * @returns {Promise<Object>} - User data and tokens
   */
  async login(username, password) {
    try {
      const response = await apiService.post(ENDPOINTS.AUTH.LOGIN, {
        username,
        password,
      });

      // API returns structure: { data: { token: {...}, user: {...} } }
      // Similar to cric-scorer-ui: response.data.data
      const sessionData = response.data || response;
      
      // Extract token information
      // In cric-scorer-ui format: sessionData.token = { token_type, access_token, refresh_token }
      if (sessionData.token) {
        await sessionStorage.setTokens(
          sessionData.token.access_token,
          sessionData.token.refresh_token,
          sessionData.token.token_type || 'Bearer'
        );
      }
      // Fallback for direct token format
      else if (sessionData.access_token) {
        await sessionStorage.setTokens(
          sessionData.access_token,
          sessionData.refresh_token,
          sessionData.token_type || 'Bearer'
        );
      }
      
      // Store complete session data (similar to Storage.setLocal("session", apiResponse.data))
      await sessionStorage.setSessionData(sessionData);

      return sessionData;
    } catch (error) {
      // Pass through the detailed error message from api.js
      throw error;
    }
  },

  /**
   * Logout - Clear all stored tokens
   */
  async logout() {
    await sessionStorage.clearTokens();
  },

  /**
   * Check if user is authenticated
   * @returns {Promise<boolean>}
   */
  async isAuthenticated() {
    const token = await sessionStorage.getAccessToken();
    return !!token;
  },

  /**
   * Get stored tokens
   * @returns {Promise<Object>}
   */
  async getTokens() {
    return sessionStorage.getTokens();
  },

  /**
   * Refresh access token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} - New tokens
   */
  async refreshToken(refreshToken) {
    try {
      const response = await apiService.post(ENDPOINTS.AUTH.REFRESH, {
        refresh_token: refreshToken,
      });

      // Handle nested response structure
      const sessionData = response.data || response;

      if (sessionData.access_token) {
        await sessionStorage.setTokens(
          sessionData.access_token,
          sessionData.refresh_token,
          sessionData.token_type
        );
        await sessionStorage.setSessionData(sessionData);
      }

      return sessionData;
    } catch (error) {
      await sessionStorage.clearTokens();
      throw error;
    }
  },
};

export default authService;
