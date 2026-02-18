import { apiService } from './api';
import { ENDPOINTS } from '../constants';

/**
 * Fixture Service
 * Handles tournament and fixture list operations
 * Replaces fixtureService.js
 */

export const fixtureService = {
  /**
   * Get list of all tournaments
   * @returns {Promise<Array>} - List of tournaments
   */
  async getTournamentList() {
    try {
      const response = await apiService.get(ENDPOINTS.TOURNAMENT.LIST);
      return response.data || response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get fixtures for a specific tournament
   * @param {string|number} tournamentId - Tournament ID
   * @returns {Promise<Array>} - List of fixtures
   */
  async getFixtureList(tournamentId) {
    try {
      const response = await apiService.get(
        ENDPOINTS.TOURNAMENT.FIXTURE_LIST(tournamentId)
      );
      return response.data || response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get wicket types for a tournament
   * @param {string|number} tournamentId - Tournament ID
   * @returns {Promise<Array>} - List of wicket types
   */
  async getWicketTypes(tournamentId) {
    try {
      const response = await apiService.get(
        ENDPOINTS.TOURNAMENT.WICKET_LIST(tournamentId)
      );
      return response.data || response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Filter fixtures by status
   * @param {Array} fixtures - List of fixtures
   * @param {string} status - Status to filter by ('live', 'completed', 'upcoming')
   * @returns {Array} - Filtered fixtures
   */
  filterByStatus(fixtures, status) {
    if (!fixtures || !Array.isArray(fixtures)) return [];

    switch (status) {
      case 'live':
        return fixtures.filter(
          (f) =>
            f.match_status === 'LIVE' ||
            f.match_status === 'INNINGS_BREAK' ||
            f.match_status === 'DRINK_BREAK'
        );
      case 'completed':
        return fixtures.filter(
          (f) =>
            f.match_status === 'COMPLETED' ||
            f.match_status === 'END_OF_MATCH' ||
            f.match_status === 'ABANDONED'
        );
      case 'upcoming':
        return fixtures.filter(
          (f) =>
            f.match_status === 'FIXTURE' ||
            f.match_status === 'YET_TO_START'
        );
      default:
        return fixtures;
    }
  },

  /**
   * Format fixture for display
   * @param {Object} fixture - Raw fixture object
   * @returns {Object} - Formatted fixture
   */
  formatFixture(fixture) {
    return {
      id: fixture.id || fixture.match_id,
      team1: {
        id: fixture.team1_id,
        name: fixture.team1_name,
        shortName: fixture.team1_short_name,
        logo: fixture.team1_logo,
      },
      team2: {
        id: fixture.team2_id,
        name: fixture.team2_name,
        shortName: fixture.team2_short_name,
        logo: fixture.team2_logo,
      },
      matchDate: fixture.match_date,
      matchTime: fixture.match_time,
      venue: fixture.ground_name || fixture.venue,
      status: fixture.match_status,
      matchNumber: fixture.match_no,
      matchType: fixture.match_type,
      tournamentId: fixture.tournament_id,
      tournamentName: fixture.tournament_name,
    };
  },
};

export default fixtureService;
