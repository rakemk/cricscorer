import { apiService } from './api';
import { ENDPOINTS } from '../constants';

/**
 * Live Match Service
 * Handles fetching live matches and their scores
 */

const liveMatchService = {
  /**
   * Get all live matches with details
   * @returns {Promise<Array>} List of live matches
   */
  async getLiveMatches() {
    try {
      console.log('🔵 Fetching live matches from:', ENDPOINTS.LIVE_MATCHES.LIST);
      const response = await apiService.get(ENDPOINTS.LIVE_MATCHES.LIST);
      console.log('🔵 Raw API response structure:', {
        hasData: !!response.data,
        isArray: Array.isArray(response.data),
        dataLength: response.data?.length,
        responseKeys: Object.keys(response),
      });
      
      // Log first match in detail
      if (response.data && response.data.length > 0) {
        console.log('🔵 First match from API:', JSON.stringify(response.data[0], null, 2));
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch live matches:', error.message);
      throw error;
    }
  },

  /**
   * Get match score details
   * @param {string|number} matchId - Match ID
   * @returns {Promise<Object>} Match score data
   */
  async getMatchScore(matchId) {
    try {
      const response = await apiService.get(ENDPOINTS.MATCH.SCORE(matchId));
      return response.data || response;
    } catch (error) {
      console.error(`Failed to fetch match score for ${matchId}:`, error.message);
      throw error;
    }
  },
};

export default liveMatchService;
