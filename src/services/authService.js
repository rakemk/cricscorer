import { apiService } from './api';
import { ENDPOINTS } from '../constants';
import { sessionStorage } from '../utils/storage';

/**
 * Authentication Service
 * Handles all authentication operations
 * Integrated with procric-user-service API
 */

export const authService = {
  /**
   * Verify if identity (phone/email) exists
   * @param {string} identity - Phone number or email
   * @returns {Promise<Object>} - {validIdentity: boolean, uuid: string}
   */
  async verifyIdentity(identity) {
    try {
      const response = await apiService.post(ENDPOINTS.AUTH.VERIFY_IDENTITY(identity));
      return response.data; // {validIdentity, uuid}
    } catch (error) {
      throw error;
    }
  },

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} - Registered user data
   */
  async register(userData) {
    try {
      const response = await apiService.post(ENDPOINTS.AUTH.REGISTER, userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Set passcode after OTP verification
   * @param {string} identity - Phone/email
   * @param {string} otp - OTP code
   * @param {Object} userData - User data with password
   * @returns {Promise<boolean>}
   */
  async setPasscode(identity, otp, userData) {
    try {
      const response = await apiService.post(
        ENDPOINTS.AUTH.SET_PASSCODE(identity, otp),
        userData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Login with UUID and password
   * @param {string} uuid - User UUID (from identity verification)
   * @param {string} password - User password
   * @returns {Promise<Object>} - User data and token
   */
  async login(uuid, password) {
    try {
      const response = await apiService.post(ENDPOINTS.AUTH.LOGIN, {
        uuid,
        password,
      });

      // API returns: { timeStamp, status, data: { tokenType, token, user } }
      const result = response.data || response;
      
      if (result.token && result.tokenType) {
        // Store token
        await sessionStorage.setTokens(
          result.token,
          null, // No refresh token in this response
          result.tokenType
        );
        
        // Store complete session data
        await sessionStorage.setSessionData(result);
      }

      return result;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Request OTP for login
   * @param {string} uuid - User UUID
   * @returns {Promise<Object>} - User data
   */
  async requestLoginOTP(uuid) {
    try {
      const response = await apiService.post(ENDPOINTS.AUTH.LOGIN_OTP(uuid));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Verify login OTP
   * @param {string} uuid - User UUID
   * @param {string} otp - OTP code
   * @returns {Promise<Object>} - User data and token
   */
  async verifyLoginOTP(uuid, otp) {
    try {
      const response = await apiService.post(
        ENDPOINTS.AUTH.VERIFY_LOGIN_OTP(uuid, otp)
      );

      const result = response.data || response;
      
      if (result.token && result.tokenType) {
        await sessionStorage.setTokens(
          result.token,
          null,
          result.tokenType
        );
        await sessionStorage.setSessionData(result);
      }

      return result;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Generate forgot password OTP
   * @param {string} identity - Phone/email
   * @returns {Promise<boolean>}
   */
  async forgotPassword(identity) {
    try {
      const response = await apiService.post(
        ENDPOINTS.AUTH.FORGOT_PASSWORD(identity)
      );
      return response.data;
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
