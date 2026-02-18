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

      // Store tokens
      if (response.access_token) {
        await sessionStorage.setTokens(
          response.access_token,
          response.refresh_token,
          response.token_type || 'Bearer'
        );
      }

      return response;
    } catch (error) {
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

      if (response.access_token) {
        await sessionStorage.setTokens(
          response.access_token,
          response.refresh_token,
          response.token_type
        );
      }

      return response;
    } catch (error) {
      await sessionStorage.clearTokens();
      throw error;
    }
  },
};

export default authService;
