import { apiService } from './api';
import { ENDPOINTS } from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Tournament Service
 * Handles tournament CRUD operations
 * Integrated with procric-user-service API
 */

const STORAGE_KEYS = {
  TOURNAMENTS: '@tournaments',
  LIVE_TOURNAMENTS: '@live_tournaments',
};

export const tournamentService = {
  /**
   * Get all tournaments
   * @param {boolean} forceRefresh - Force API call, skip cache
   * @returns {Promise<Array>} - List of tournaments
   */
  async getTournaments(forceRefresh = false) {
    try {
      console.log('📋 Fetching tournaments');
      
      const cacheKey = STORAGE_KEYS.TOURNAMENTS;
      
      // Try cache first unless forced
      if (!forceRefresh) {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
          const tournaments = JSON.parse(cached);
          console.log('✅ Returning cached tournaments:', tournaments.length);
          // Refresh in background
          this.refreshTournamentsBackground();
          return tournaments;
        }
      }

      const endpoint = ENDPOINTS.TOURNAMENT.LIST;
      console.log('🌐 API Request:', endpoint);
      
      const response = await apiService.get(endpoint);
      
      console.log('📦 API Response:', {
        hasData: !!response.data,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
        count: Array.isArray(response.data) ? response.data.length : 0,
      });
      
      // API returns: { timeStamp, status, data: [...tournaments] }
      const tournaments = response.data || [];
      
      // Cache results
      await AsyncStorage.setItem(cacheKey, JSON.stringify(tournaments));
      
      console.log('✅ Tournaments fetched:', tournaments.length);
      return tournaments;
    } catch (error) {
      console.error('❌ Tournament fetch error:', {
        message: error.message,
        status: error.status,
        fullError: error,
      });
      
      // Try to return cached data on error
      const cacheKey = STORAGE_KEYS.TOURNAMENTS;
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        console.warn('⚠️ Using cached tournaments due to error');
        return JSON.parse(cached);
      }
      
      // If tournament endpoint doesn't exist (404), return a default tournament
      // This allows the app to work with live matches without requiring tournaments
      if (error.status === 404) {
        console.warn('⚠️ Tournament endpoint not found (404), creating default tournament');
        const defaultTournament = [{
          id: 'default',
          name: 'Live Matches',
          description: 'All live cricket matches',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
        }];
        
        // Cache the default tournament
        await AsyncStorage.setItem(cacheKey, JSON.stringify(defaultTournament));
        
        return defaultTournament;
      }
      
      // Provide helpful error message for other errors
      let errorMessage = error.message || 'Failed to fetch tournaments';
      
      if (error.status === 403) {
        errorMessage = 'Access denied. You may not have permission to view tournaments.';
      }
      
      throw new Error(errorMessage);
    }
  },

  /**
   * Get live and upcoming tournaments
   * @param {boolean} forceRefresh - Force API call, skip cache
   * @returns {Promise<Array>} - List of live tournaments
   */
  async getLiveTournaments(forceRefresh = false) {
    try {
      const cacheKey = STORAGE_KEYS.LIVE_TOURNAMENTS;
      
      // Try cache first unless forced
      if (!forceRefresh) {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
          const tournaments = JSON.parse(cached);
          // Refresh in background
          this.refreshLiveTournamentsBackground();
          return tournaments;
        }
      }

      const response = await apiService.get(ENDPOINTS.TOURNAMENT.LIVE_TOURNAMENTS);
      
      const tournaments = response.data || [];
      
      // Cache results
      await AsyncStorage.setItem(cacheKey, JSON.stringify(tournaments));
      
      return tournaments;
    } catch (error) {
      const cacheKey = STORAGE_KEYS.LIVE_TOURNAMENTS;
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        console.warn('Using cached live tournaments due to error:', error.message);
        return JSON.parse(cached);
      }
      throw error;
    }
  },

  /**
   * Create new tournament
   * @param {Object} tournamentData - Tournament data
   * @returns {Promise<Object>} - Created tournament
   */
  async createTournament(tournamentData) {
    try {
      const response = await apiService.post(
        ENDPOINTS.TOURNAMENT.CREATE,
        tournamentData
      );
      
      // Clear cache to force refresh
      await this.clearCache();
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update tournament
   * @param {number} tourId - Tournament ID
   * @param {Object} tournamentData - Tournament data
   * @returns {Promise<Object>} - Updated tournament
   */
  async updateTournament(tourId, tournamentData) {
    try {
      const response = await apiService.put(
        ENDPOINTS.TOURNAMENT.UPDATE(tourId),
        tournamentData
      );
      
      // Clear cache to force refresh
      await this.clearCache();
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete tournament
   * @param {number} tourId - Tournament ID
   * @returns {Promise<Object>} - Deleted tournament
   */
  async deleteTournament(tourId) {
    try {
      const response = await apiService.delete(
        ENDPOINTS.TOURNAMENT.DELETE(tourId)
      );
      
      // Clear cache to force refresh
      await this.clearCache();
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Background refresh for tournaments
   * @private
   */
  async refreshTournamentsBackground() {
    try {
      const response = await apiService.get(ENDPOINTS.TOURNAMENT.LIST);
      const tournaments = response.data || [];
      const cacheKey = STORAGE_KEYS.TOURNAMENTS;
      await AsyncStorage.setItem(cacheKey, JSON.stringify(tournaments));
    } catch (error) {
      console.warn('Background tournament refresh failed:', error.message);
    }
  },

  /**
   * Background refresh for live tournaments
   * @private
   */
  async refreshLiveTournamentsBackground() {
    try {
      const response = await apiService.get(ENDPOINTS.TOURNAMENT.LIVE_TOURNAMENTS);
      const tournaments = response.data || [];
      const cacheKey = STORAGE_KEYS.LIVE_TOURNAMENTS;
      await AsyncStorage.setItem(cacheKey, JSON.stringify(tournaments));
    } catch (error) {
      console.warn('Background live tournament refresh failed:', error.message);
    }
  },

  /**
   * Clear tournament cache
   */
  async clearCache() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.TOURNAMENTS);
      await AsyncStorage.removeItem(STORAGE_KEYS.LIVE_TOURNAMENTS);
    } catch (error) {
      console.error('Error clearing tournament cache:', error);
    }
  },

  /**
   * Clear all tournament caches
   */
  async clearAllCaches() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const tournamentKeys = keys.filter(
        (key) =>
          key.startsWith(STORAGE_KEYS.TOURNAMENTS) ||
          key.startsWith(STORAGE_KEYS.LIVE_TOURNAMENTS)
      );
      if (tournamentKeys.length > 0) {
        await AsyncStorage.multiRemove(tournamentKeys);
      }
    } catch (error) {
      console.error('Error clearing all tournament caches:', error);
    }
  },
};

export default tournamentService;
