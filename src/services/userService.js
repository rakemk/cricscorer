import { apiService } from './api';
import { ENDPOINTS } from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * User Service
 * Handles user profile, cricket profile, stats, invitations, and payments
 */

const STORAGE_KEYS = {
  USER_PROFILE: '@user_profile',
  CRIC_PROFILE: '@cric_profile',
  USER_STATS: '@user_stats',
};

export const userService = {
  // ==========================================
  // Profile Management
  // ==========================================

  /**
   * Get user profile
   * GET /api/v1/user/profile
   */
  async getUserProfile(forceRefresh = false) {
    try {
      if (!forceRefresh) {
        const cached = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
        if (cached) {
          const profile = JSON.parse(cached);
          this.refreshProfileBackground();
          return profile;
        }
      }

      const response = await apiService.get(ENDPOINTS.USER.GET_PROFILE);
      const profile = response.data || response;

      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_PROFILE,
        JSON.stringify(profile)
      );

      return profile;
    } catch (error) {
      const cached = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (cached) {
        console.warn('Using cached profile due to error:', error.message);
        return JSON.parse(cached);
      }
      throw error;
    }
  },

  /**
   * Update user profile
   * PUT /api/v1/user/profile
   */
  async updateUserProfile(profileData) {
    try {
      const response = await apiService.put(
        ENDPOINTS.USER.UPDATE_PROFILE,
        profileData
      );
      const updatedProfile = response.data || response;

      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_PROFILE,
        JSON.stringify(updatedProfile)
      );

      return updatedProfile;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  async refreshProfileBackground() {
    try {
      const response = await apiService.get(ENDPOINTS.USER.GET_PROFILE);
      const profile = response.data || response;
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_PROFILE,
        JSON.stringify(profile)
      );
    } catch (error) {
      console.warn('Background profile refresh failed:', error.message);
    }
  },

  // ==========================================
  // Cricket Profile Management
  // ==========================================

  /**
   * Get cricket profile
   * GET /api/v1/user/cric-profile
   */
  async getCricketProfile(forceRefresh = false) {
    try {
      if (!forceRefresh) {
        const cached = await AsyncStorage.getItem(STORAGE_KEYS.CRIC_PROFILE);
        if (cached) {
          const profile = JSON.parse(cached);
          this.refreshCricketProfileBackground();
          return profile;
        }
      }

      const response = await apiService.get(ENDPOINTS.USER.GET_CRIC_PROFILE);
      const profile = response.data || response;

      await AsyncStorage.setItem(
        STORAGE_KEYS.CRIC_PROFILE,
        JSON.stringify(profile)
      );

      return profile;
    } catch (error) {
      const cached = await AsyncStorage.getItem(STORAGE_KEYS.CRIC_PROFILE);
      if (cached) {
        console.warn('Using cached cricket profile due to error:', error.message);
        return JSON.parse(cached);
      }
      throw error;
    }
  },

  /**
   * Update cricket profile
   * PUT /api/v1/user/cric-profile
   */
  async updateCricketProfile(cricProfileData) {
    try {
      const response = await apiService.put(
        ENDPOINTS.USER.UPDATE_CRIC_PROFILE,
        cricProfileData
      );
      const updatedProfile = response.data || response;

      await AsyncStorage.setItem(
        STORAGE_KEYS.CRIC_PROFILE,
        JSON.stringify(updatedProfile)
      );

      return updatedProfile;
    } catch (error) {
      console.error('Update cricket profile error:', error);
      throw error;
    }
  },

  async refreshCricketProfileBackground() {
    try {
      const response = await apiService.get(ENDPOINTS.USER.GET_CRIC_PROFILE);
      const profile = response.data || response;
      await AsyncStorage.setItem(
        STORAGE_KEYS.CRIC_PROFILE,
        JSON.stringify(profile)
      );
    } catch (error) {
      console.warn('Background cricket profile refresh failed:', error.message);
    }
  },

  // ==========================================
  // Stats Management
  // ==========================================

  /**
   * Get user overall stats
   * GET /api/v1/user/stats
   */
  async getUserStats() {
    try {
      const response = await apiService.get(ENDPOINTS.USER.GET_STATS);
      return response.data || response;
    } catch (error) {
      console.error('Get user stats error:', error);
      throw error;
    }
  },

  /**
   * Get user stats for a specific tournament
   * GET /api/v1/user/tour/{tourId}/stats
   */
  async getTournamentStats(tourId) {
    try {
      const response = await apiService.get(
        ENDPOINTS.USER.GET_TOUR_STATS(tourId)
      );
      return response.data || response;
    } catch (error) {
      console.error('Get tournament stats error:', error);
      throw error;
    }
  },

  /**
   * Get player stats for a specific tournament
   * GET /api/v1/user/tour/{tourId}/player/{playerId}/stats
   */
  async getPlayerStats(tourId, playerId) {
    try {
      const response = await apiService.get(
        ENDPOINTS.USER.GET_PLAYER_STATS(tourId, playerId)
      );
      return response.data || response;
    } catch (error) {
      console.error('Get player stats error:', error);
      throw error;
    }
  },

  // ==========================================
  // Invitations Management
  // ==========================================

  /**
   * Get invite details
   * GET /api/v1/user/invite-details
   */
  async getInviteDetails() {
    try {
      const response = await apiService.get(ENDPOINTS.USER.GET_INVITE_DETAILS);
      return response.data || response;
    } catch (error) {
      console.error('Get invite details error:', error);
      throw error;
    }
  },

  /**
   * Get received invitations
   * GET /api/v1/user/invitations/received
   */
  async getReceivedInvitations() {
    try {
      const response = await apiService.get(
        ENDPOINTS.USER.GET_RECEIVED_INVITATIONS
      );
      return response.data || response;
    } catch (error) {
      console.error('Get received invitations error:', error);
      throw error;
    }
  },

  /**
   * Accept or decline an invitation
   * PUT /api/v1/user/tour/{tid}/invite/{inviteId}/accept/{status}
   */
  async respondToInvitation(tourId, inviteId, status) {
    try {
      const response = await apiService.put(
        ENDPOINTS.USER.ACCEPT_INVITATION(tourId, inviteId, status)
      );
      return response.data || response;
    } catch (error) {
      console.error('Respond to invitation error:', error);
      throw error;
    }
  },

  // ==========================================
  // Payment Management
  // ==========================================

  /**
   * Capture payment (Razorpay integration)
   * POST /api/v1/user/payment/capture
   */
  async capturePayment(paymentData) {
    try {
      const response = await apiService.post(
        ENDPOINTS.USER.CAPTURE_PAYMENT,
        paymentData
      );
      return response.data || response;
    } catch (error) {
      console.error('Capture payment error:', error);
      throw error;
    }
  },

  // ==========================================
  // Cache Management
  // ==========================================

  async clearCache() {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_PROFILE,
        STORAGE_KEYS.CRIC_PROFILE,
        STORAGE_KEYS.USER_STATS,
      ]);
      console.log('✅ User cache cleared');
    } catch (error) {
      console.error('Clear user cache error:', error);
    }
  },

  async getCachedProfile() {
    try {
      const cached = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Get cached profile error:', error);
      return null;
    }
  },

  async getCachedCricketProfile() {
    try {
      const cached = await AsyncStorage.getItem(STORAGE_KEYS.CRIC_PROFILE);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Get cached cricket profile error:', error);
      return null;
    }
  },
};

export default userService;
