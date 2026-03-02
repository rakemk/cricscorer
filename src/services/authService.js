import { apiService } from './api';
import { ENDPOINTS } from '../constants';
import { sessionStorage } from '../utils/storage';

/**
 * Authentication Service
 * ProCric8 API — single scorer login endpoint
 */

export const authService = {
  /**
   * Login with username (phone/email) and password
   * POST /v2/auth/scorer  { username, password }
   *
   * Response (after axios interceptor strips outer wrapper):
   * { status:200, message:"Sucess", data:{ user:{...}, token:{ token_type, expires_in, access_token, refresh_token } } }
   */
  async login(username, password) {
    try {
      console.log('🔑 Logging in via /v2/auth/scorer ...');
      const response = await apiService.post(ENDPOINTS.AUTH.SCORER_LOGIN, {
        username,
        password,
      });

      // response = { status, message, data: { user, token } }
      const data = response.data || response;
      const tokenInfo = data.token || {};
      const user = data.user || null;

      if (tokenInfo.access_token) {
        await sessionStorage.setTokens(
          tokenInfo.access_token,
          tokenInfo.refresh_token || null,
          tokenInfo.token_type || 'Bearer'
        );
        await sessionStorage.setSessionData(data);
        console.log('✅ Login successful — token stored');
      }

      return { user, token: tokenInfo };
    } catch (error) {
      console.error('❌ Login error:', error.message || error);
      throw error;
    }
  },

  /**
   * Logout — Clear all stored tokens
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
