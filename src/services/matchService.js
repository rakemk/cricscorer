import { apiService } from './api';
import { ENDPOINTS, DEFAULT_MATCH_SETTINGS } from '../constants';
import { matchStorage } from '../utils/storage';

/**
 * Match Service
 * Handles match setup, settings, squad, and toss operations
 * Replaces matchService.js
 */

export const matchService = {
  /**
   * Get match details
   * @param {string|number} matchId - Match ID
   * @returns {Promise<Object>} - Match data
   */
  async getMatch(matchId) {
    try {
      const response = await apiService.get(ENDPOINTS.MATCH.GET(matchId));
      return response.data || response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get comprehensive match score data (for viewing live/completed matches)
   * Includes summary, innings data, and full match details
   * @param {string|number} matchId - Match ID
   * @returns {Promise<Object>} - Match score data with summary and innings
   */
  async getMatchScore(matchId) {
    try {
      console.log('🔵 Fetching match score from:', ENDPOINTS.MATCH.SCORE(matchId));
      const response = await apiService.get(ENDPOINTS.MATCH.SCORE(matchId));
      console.log('🔵 Match score response:', {
        hasData: !!response.data,
        hasSummary: !!response.data?.summary,
        matchStatus: response.data?.summary?.matchStatus,
      });
      return response.data || response;
    } catch (error) {
      console.error('❌ Failed to fetch match score:', error);
      throw error;
    }
  },

  /**
   * Get match settings
   * @param {string|number} matchId - Match ID
   * @returns {Promise<Object>} - Match settings
   */
  async getMatchSettings(matchId) {
    try {
      const response = await apiService.get(ENDPOINTS.MATCH.SETTING(matchId));
      const settings = response.data || response;
      
      // Cache locally
      await matchStorage.saveMatchSettings(settings);
      
      return settings;
    } catch (error) {
      // Return cached or default settings on error
      const cached = await matchStorage.getMatchSettings();
      return cached || DEFAULT_MATCH_SETTINGS;
    }
  },

  /**
   * Update match settings
   * @param {string|number} matchId - Match ID
   * @param {Object} settings - Settings to update
   * @returns {Promise<Object>} - Updated settings
   */
  async updateMatchSettings(matchId, settings) {
    try {
      const response = await apiService.put(
        ENDPOINTS.MATCH.SETTING(matchId),
        settings
      );
      
      // Update cache
      await matchStorage.saveMatchSettings(settings);
      
      return response.data || response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get tournament squad for match
   * @param {string|number} matchId - Match ID
   * @returns {Promise<Object>} - Squad data for both teams
   */
  async getTourSquad(matchId) {
    try {
      const response = await apiService.get(ENDPOINTS.MATCH.TOUR_SQUAD(matchId));
      return response.data || response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Save team squad
   * @param {string|number} matchId - Match ID
   * @param {string|number} teamId - Team ID
   * @param {Object} squadData - Squad selection data
   * @returns {Promise<Object>} - Response
   */
  async saveTeamSquad(matchId, teamId, squadData) {
    try {
      const response = await apiService.post(
        ENDPOINTS.MATCH.TEAM_SQUAD(matchId, teamId),
        squadData
      );
      return response.data || response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Save pre-match info (toss)
   * @param {string|number} matchId - Match ID
   * @param {Object} preInfo - Pre-match information (toss winner, elected, etc.)
   * @returns {Promise<Object>} - Response
   */
  async savePreInfo(matchId, preInfo) {
    try {
      const response = await apiService.post(
        ENDPOINTS.MATCH.PREINFO(matchId),
        preInfo
      );
      return response.data || response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Save post-match info (man of match, result, etc.)
   * @param {string|number} matchId - Match ID
   * @param {Object} postInfo - Post-match information
   * @returns {Promise<Object>} - Response
   */
  async savePostInfo(matchId, postInfo) {
    try {
      const response = await apiService.post(
        ENDPOINTS.POST_MATCH.POST_INFO(matchId),
        postInfo
      );
      return response.data || response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get fair play data
   * @param {string|number} matchId - Match ID
   * @returns {Promise<Object>} - Fair play data
   */
  async getFairPlay(matchId) {
    try {
      const response = await apiService.get(
        ENDPOINTS.POST_MATCH.FAIR_PLAY(matchId)
      );
      return response.data || response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Save fair play data
   * @param {string|number} matchId - Match ID
   * @param {Object} fairPlayData - Fair play scores
   * @returns {Promise<Object>} - Response
   */
  async saveFairPlay(matchId, fairPlayData) {
    try {
      const response = await apiService.post(
        ENDPOINTS.POST_MATCH.FAIR_PLAY(matchId),
        fairPlayData
      );
      return response.data || response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get player of match suggestions
   * @param {string|number} matchId - Match ID
   * @returns {Promise<Array>} - List of suggested players
   */
  async getPOMSuggestions(matchId) {
    try {
      const response = await apiService.get(
        ENDPOINTS.POST_MATCH.POM_SUGGESTION(matchId)
      );
      return response.data || response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete/Reset match
   * @param {string|number} matchId - Match ID
   * @returns {Promise<Object>} - Response
   */
  async deleteMatch(matchId) {
    try {
      const response = await apiService.delete(ENDPOINTS.MATCH.DELETE(matchId));
      return response.data || response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Format player for display
   * @param {Object} player - Raw player object
   * @returns {Object} - Formatted player
   */
  formatPlayer(player) {
    return {
      id: player.player_id || player.id,
      name: player.player_name || player.name,
      role: player.playing_role || player.role,
      battingStyle: player.batting_style,
      bowlingStyle: player.bowling_style,
      isCaptain: player.is_captain || false,
      isWicketKeeper: player.is_wicket_keeper || player.is_wk || false,
      teamId: player.team_id,
      photo: player.photo_url || player.photo,
    };
  },
};

export default matchService;
