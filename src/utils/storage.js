import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';

/**
 * Storage utility - Replacement for AngularJS Storage factory
 * Wraps AsyncStorage with convenience methods
 */

// Generic storage operations
export const storage = {
  /**
   * Set a value in storage
   * @param {string} key - Storage key
   * @param {any} value - Value to store (will be JSON stringified if object)
   */
  async set(key, value) {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      await AsyncStorage.setItem(key, stringValue);
    } catch (error) {
      console.error('Storage set error:', error);
      throw error;
    }
  },

  /**
   * Get a value from storage
   * @param {string} key - Storage key
   * @param {boolean} parse - Whether to parse as JSON (default: true)
   * @returns {Promise<any>}
   */
  async get(key, parse = true) {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value === null) return null;
      return parse ? JSON.parse(value) : value;
    } catch (error) {
      // If JSON parse fails, return raw value
      if (parse) {
        const value = await AsyncStorage.getItem(key);
        return value;
      }
      console.error('Storage get error:', error);
      return null;
    }
  },

  /**
   * Remove a value from storage
   * @param {string} key - Storage key
   */
  async remove(key) {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Storage remove error:', error);
      throw error;
    }
  },

  /**
   * Clear all storage
   */
  async clear() {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Storage clear error:', error);
      throw error;
    }
  },

  /**
   * Get all keys
   * @returns {Promise<string[]>}
   */
  async getAllKeys() {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Storage getAllKeys error:', error);
      return [];
    }
  },

  /**
   * Multi-get values
   * @param {string[]} keys - Array of keys
   * @returns {Promise<Object>}
   */
  async multiGet(keys) {
    try {
      const pairs = await AsyncStorage.multiGet(keys);
      const result = {};
      pairs.forEach(([key, value]) => {
        try {
          result[key] = value ? JSON.parse(value) : null;
        } catch {
          result[key] = value;
        }
      });
      return result;
    } catch (error) {
      console.error('Storage multiGet error:', error);
      return {};
    }
  },

  /**
   * Multi-set values
   * @param {Object} keyValuePairs - Object with key-value pairs
   */
  async multiSet(keyValuePairs) {
    try {
      const pairs = Object.entries(keyValuePairs).map(([key, value]) => [
        key,
        typeof value === 'string' ? value : JSON.stringify(value),
      ]);
      await AsyncStorage.multiSet(pairs);
    } catch (error) {
      console.error('Storage multiSet error:', error);
      throw error;
    }
  },
};

// Session-specific storage helpers
export const sessionStorage = {
  async getTokens() {
    return storage.multiGet([
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.TOKEN_TYPE,
    ]);
  },

  async setTokens(accessToken, refreshToken, tokenType = 'Bearer') {
    await storage.multiSet({
      [STORAGE_KEYS.ACCESS_TOKEN]: accessToken,
      [STORAGE_KEYS.REFRESH_TOKEN]: refreshToken,
      [STORAGE_KEYS.TOKEN_TYPE]: tokenType,
    });
  },

  async clearTokens() {
    await Promise.all([
      storage.remove(STORAGE_KEYS.ACCESS_TOKEN),
      storage.remove(STORAGE_KEYS.REFRESH_TOKEN),
      storage.remove(STORAGE_KEYS.TOKEN_TYPE),
      storage.remove(STORAGE_KEYS.USER_DATA),
    ]);
  },

  async getAccessToken() {
    return storage.get(STORAGE_KEYS.ACCESS_TOKEN, false);
  },
};

// Match-specific storage helpers
export const matchStorage = {
  async saveMatchSettings(settings) {
    await storage.set(STORAGE_KEYS.MATCH_SETTINGS, settings);
  },

  async getMatchSettings() {
    return storage.get(STORAGE_KEYS.MATCH_SETTINGS);
  },

  async saveBallTicks(innings, ticks) {
    await storage.set(`${STORAGE_KEYS.BALL_TICKS}_${innings}`, ticks);
  },

  async getBallTicks(innings) {
    return storage.get(`${STORAGE_KEYS.BALL_TICKS}_${innings}`) || [];
  },

  async clearMatchData() {
    const keys = await storage.getAllKeys();
    const matchKeys = keys.filter(
      (key) =>
        key.startsWith(STORAGE_KEYS.BALL_TICKS) ||
        key === STORAGE_KEYS.MATCH_SETTINGS
    );
    await Promise.all(matchKeys.map((key) => storage.remove(key)));
  },
};

export default storage;
