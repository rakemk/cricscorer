import { apiService } from './api';
import { ENDPOINTS } from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Fixture Service
 * Handles tournament and fixture list operations
 * Matches cric-scorer-ui fixtureService.js with caching support
 */

const STORAGE_KEYS = {
  TOURNAMENTS: '@tournaments',
  SELECTED_TOURNAMENT: '@selected_tournament',
  FIXTURES: '@fixtures_',
};

export const fixtureService = {
  /**
   * Get list of all tournaments with caching
   * Matches: getTournamentListAPI()
   * @param {boolean} forceRefresh - Force API call, skip cache
   * @returns {Promise<Array>} - List of tournaments
   */
  async getTournamentList(forceRefresh = false) {
    try {
      // Try cache first unless forced
      if (!forceRefresh) {
        const cached = await AsyncStorage.getItem(STORAGE_KEYS.TOURNAMENTS);
        if (cached) {
          const tournaments = JSON.parse(cached);
          // Refresh in background
          this.refreshTournamentsBackground();
          return tournaments;
        }
      }

      const response = await apiService.get(ENDPOINTS.TOURNAMENT.LIST);
      const tournaments = response.data || response;
      
      // Cache results
      await AsyncStorage.setItem(
        STORAGE_KEYS.TOURNAMENTS,
        JSON.stringify(tournaments)
      );
      
      return tournaments;
    } catch (error) {
      console.warn('❌ Tournament fetch error:', error);
      
      // Try to return cached data on error
      const cached = await AsyncStorage.getItem(STORAGE_KEYS.TOURNAMENTS);
      if (cached) {
        console.warn('✅ Using cached tournaments');
        return JSON.parse(cached);
      }
      
      // If tournament endpoint doesn't exist (404), return a default tournament
      // This allows the app to work with live matches without requiring tournaments
      if (error.status === 404) {
        console.warn('⚠️ Tournament endpoint not found, using default tournament');
        const defaultTournament = [{
          id: 'default',
          name: 'Live Matches',
          description: 'All live cricket matches',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
        }];
        
        // Cache the default tournament
        await AsyncStorage.setItem(
          STORAGE_KEYS.TOURNAMENTS,
          JSON.stringify(defaultTournament)
        );
        
        return defaultTournament;
      }
      
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
      const tournaments = response.data || response;
      await AsyncStorage.setItem(
        STORAGE_KEYS.TOURNAMENTS,
        JSON.stringify(tournaments)
      );
    } catch (error) {
      console.warn('Background tournament refresh failed:', error.message);
    }
  },

  /**
   * Get fixtures for a specific tournament with caching
   * Matches: getFixtureListAPI(tournament)
   * @param {string|number} tournamentId - Tournament ID
   * @param {boolean} forceRefresh - Force API call, skip cache
   * @returns {Promise<Array>} - List of fixtures
   */
  async getFixtureList(tournamentId, forceRefresh = false) {
    try {
      // If using default tournament (no real tournament endpoint), return empty fixtures
      // Live matches will be displayed instead
      if (tournamentId === 'default') {
        console.log('ℹ️ Using default tournament, skipping fixture fetch');
        return [];
      }
      
      const cacheKey = STORAGE_KEYS.FIXTURES + tournamentId;
      
      // Try cache first unless forced
      if (!forceRefresh) {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
          const fixtures = JSON.parse(cached);
          // Refresh in background
          this.refreshFixturesBackground(tournamentId);
          return fixtures;
        }
      }

      const response = await apiService.get(
        ENDPOINTS.TOURNAMENT.FIXTURE_LIST(tournamentId)
      );
      const fixtures = response.data || response;
      
      // Cache results
      await AsyncStorage.setItem(cacheKey, JSON.stringify(fixtures));
      
      return fixtures;
    } catch (error) {
      // Try to return cached data on error
      const cacheKey = STORAGE_KEYS.FIXTURES + tournamentId;
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        console.warn('Using cached fixtures due to error:', error.message);
        return JSON.parse(cached);
      }
      throw error;
    }
  },

  /**
   * Background refresh for fixtures
   * @private
   */
  async refreshFixturesBackground(tournamentId) {
    try {
      // Skip if using default tournament
      if (tournamentId === 'default') return;
      
      const response = await apiService.get(
        ENDPOINTS.TOURNAMENT.FIXTURE_LIST(tournamentId)
      );
      const fixtures = response.data || response;
      const cacheKey = STORAGE_KEYS.FIXTURES + tournamentId;
      await AsyncStorage.setItem(cacheKey, JSON.stringify(fixtures));
    } catch (error) {
      console.warn('Background fixture refresh failed:', error.message);
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
   * Set/Store selected tournament
   * Matches: setSelectedTournament(tournament)
   * @param {Object} tournament - Tournament object
   */
  async setSelectedTournament(tournament) {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.SELECTED_TOURNAMENT,
        JSON.stringify(tournament)
      );
    } catch (error) {
      console.error('Error saving selected tournament:', error);
    }
  },

  /**
   * Get selected tournament
   * Matches: getSelectedTournament()
   * @returns {Promise<Object|null>} - Selected tournament or null
   */
  async getSelectedTournament() {
    try {
      const cached = await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_TOURNAMENT);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error getting selected tournament:', error);
      return null;
    }
  },

  /**
   * Clear all cached fixture data
   * Matches: clearStorage()
   */
  async clearStorage() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.TOURNAMENTS);
      await AsyncStorage.removeItem(STORAGE_KEYS.SELECTED_TOURNAMENT);
      
      // Clear all fixture caches (by pattern)
      const keys = await AsyncStorage.getAllKeys();
      const fixtureCacheKeys = keys.filter(key => 
        key.startsWith(STORAGE_KEYS.FIXTURES)
      );
      if (fixtureCacheKeys.length > 0) {
        await AsyncStorage.multiRemove(fixtureCacheKeys);
      }
    } catch (error) {
      console.error('Error clearing fixture storage:', error);
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
