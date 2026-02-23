import { Platform } from 'react-native';

// API Configuration - Based on UrlService.js
// ==========================================
// ⚠️ IMPORTANT: You need a backend API server running
// ==========================================

// API Server URLs for different environments
const API_URLS = {
  // Production API - Real cric-scorer-ui API (Swagger on port 8088)
  production: 'http://139.59.17.31:8088/api',
  
  // Local development server
  // For Android Emulator, use 10.0.2.2 to access host machine's localhost
  // For iOS Simulator, use localhost
  // For physical device, use your computer's IP address (e.g., 192.168.1.10)
  development: Platform.select({
    android: 'http://10.0.2.2:8081/api', // Android Emulator -> Host localhost:8081
    ios: 'http://localhost:8081/api',    // iOS Simulator -> localhost:8081
    default: 'http://localhost:8081/api',
  }),
  
  // Mock/Test Mode (no backend needed - for testing UI only)
  mock: 'http://mock-api', // Will use mock data
};

// Current environment - Change this to switch between environments
// Options: 'production', 'development', 'mock'
// ✅ USING PRODUCTION API - Real cric-scorer-ui API server
const CURRENT_ENV = 'production';

export const API_CONFIG = {
  BASE_URL: API_URLS[CURRENT_ENV],
  API_VERSION: 'v1',
  TIMEOUT: 30000,
  DEBUG: true, // Set to false in production
  CURRENT_ENV,
  USE_MOCK: CURRENT_ENV === 'mock', // Enable mock mode
};

// Endpoints matching cric-scorer-ui API
export const ENDPOINTS = {
  // Authentication
  AUTH: {
    // Identity verification
    VERIFY_IDENTITY: (identity) => `/v1/auth/identity/${identity}/verify`,
    
    // Registration & Password
    REGISTER: '/v1/auth/register',
    SET_PASSCODE: (identity, otp) => `/v1/auth/set/passcode/${identity}/${otp}`,
    
    // Login
    LOGIN: '/v1/auth/login',
    LOGIN_OTP: (uuid) => `/v1/auth/login/${uuid}/otp`,
    VERIFY_LOGIN_OTP: (uuid, otp) => `/v1/auth/login/${uuid}/verify/${otp}`,
    
    // Forgot Password
    FORGOT_PASSWORD: (identity) => `/v1/auth/forgot/${identity}/generate`,
    
    // Token refresh
    REFRESH: '/v1/auth/refresh',
  },

  // Tournament & Fixtures
  TOURNAMENT: {
    // Tournament endpoints (based on cric-scorer-ui using /v1 instead of /v2)
    LIST: '/v1/scorer/tournament/list',
    LIVE_TOURNAMENTS: '/v1/scorer/tournaments/live',
    CREATE: '/v1/scorer/tournament',
    UPDATE: (tourId) => `/v1/scorer/tournament/${tourId}`,
    DELETE: (tourId) => `/v1/scorer/tournament/${tourId}`,
    
    // Legacy endpoints (if needed)
    FIXTURE_LIST: (tournamentId) => `/v1/scorer/tournament/${tournamentId}/fixture/list`,
    WICKET_LIST: (tournamentId) => `/v1/scorer/tournament/${tournamentId}/wicket/list`,
  },

  // Live Matches
  LIVE_MATCHES: {
    // Get all live matches with details
    LIST: '/v1/scorer/live-matches/details',
  },

  // Match Operations
  MATCH: {
    GET: (matchId) => `/v1/scorer/match/${matchId}`,
    PREINFO: (matchId) => `/v1/scorer/match/${matchId}/preinfo`,
    TOUR_SQUAD: (matchId) => `/v1/scorer/match/${matchId}/toursquad`,
    TEAM_SQUAD: (matchId, teamId) => `/v1/scorer/match/${matchId}/team/${teamId}/squad`,
    SETTING: (matchId) => `/v1/scorer/match/${matchId}/setting`,
    INNINGS: (matchId) => `/v1/scorer/match/${matchId}/innings`,
    BALL_DATA: (matchId) => `/v1/scorer/match/${matchId}/balldata`,
    BALL_DATA_INNINGS: (matchId, innings) => `/v1/scorer/match/${matchId}/balldata/${innings}`,
    DELETE: (matchId) => `/v1/scorer/match/${matchId}`,
    // Match Score - Comprehensive live score data for viewing  
    SCORE: (matchId) => `/v1/scorer/match/${matchId}/score`,
  },

  // Live Scoring
  SCORING: {
    LIVE_SCORE: (matchId) => `/v1/scorer/match/${matchId}/livescore`,
    LIVE_INFO: (matchId) => `/v1/scorer/match/${matchId}/liveinfo`,
    UNDO_TICK: (matchId, transId) => `/v1/scorer/match/${matchId}/undotick/${transId}`,
    BULK_UNDO: (matchId) => `/v1/scorer/match/${matchId}/bulk/undotick`,
    BULK_TICK: (matchId) => `/v1/scorer/match/${matchId}/bulk/tick`,
    RESET_TICKS: (matchId) => `/v1/scorer/match/${matchId}/reset/ticks`,
  },

  // Post Match
  POST_MATCH: {
    POST_INFO: (matchId) => `/v1/scorer/match/${matchId}/postinfo`,
    FAIR_PLAY: (matchId) => `/v1/scorer/match/${matchId}/fairplay`,
    POM_SUGGESTION: (matchId) => `/v1/scorer/match/${matchId}/pom/sugestion`,
  },
};

// Match Statuses - from GlobalService.js
export const MATCH_STATUS = {
  FIXTURE: 'FIXTURE',
  YET_TO_START: 'YET_TO_START',
  LIVE: 'LIVE',
  INNINGS_BREAK: 'INNINGS_BREAK',
  TEA_BREAK: 'TEA_BREAK',
  LUNCH_BREAK: 'LUNCH_BREAK',
  DRINK_BREAK: 'DRINK_BREAK',
  STOPPED_DUE_TO_RAIN: 'STOPPED_DUE_TO_RAIN',
  DELAYED_DUE_TO_BAD_WEATHER: 'DELAYED_DUE_TO_BAD_WEATHER',
  COMPLETED: 'COMPLETED',
  END_OF_MATCH: 'END_OF_MATCH',
  ABANDONED: 'ABANDONED',
};

// Ball Types
export const BALL_TYPES = {
  NORMAL: 0,
  WIDE: 1,
  NO_BALL: 2,
  BYE: 3,
  LEG_BYE: 4,
  PENALTY: 5,
  WIDE_BYE: 6,
  NO_BALL_BYE: 7,
  NO_BALL_LEG_BYE: 8,
};

// Wicket Types - from metadata
export const WICKET_TYPES = {
  1: { id: 1, name: 'Bowled', short: 'b' },
  2: { id: 2, name: 'Caught', short: 'c' },
  3: { id: 3, name: 'LBW', short: 'lbw' },
  4: { id: 4, name: 'Stumped', short: 'st' },
  5: { id: 5, name: 'Run Out', short: 'run out' },
  6: { id: 6, name: 'Obstructing the Field', short: 'obs' },
  7: { id: 7, name: 'Hit Wicket', short: 'hit wkt' },
  8: { id: 8, name: 'Handled the Ball', short: 'handled' },
  9: { id: 9, name: 'Hit the Ball Twice', short: 'hit twice' },
  10: { id: 10, name: 'Timed Out', short: 'timed out' },
  11: { id: 11, name: 'Retired Out', short: 'retired out' },
  12: { id: 12, name: 'Retired Not Out', short: 'retired' },
  13: { id: 13, name: 'Retired Hurt', short: 'retired hurt' },
};

// Default Match Settings
export const DEFAULT_MATCH_SETTINGS = {
  ttl_over: 20,
  bowler_max_over: 4,
  player_count: 11,
  team_wickets: 10,
  no_ball_run: 1,
  wide_ball_run: 1,
  penlty_run: 5,
  ball_in_over: 6,
  select_wicket_type: '1,2,3,4,5,6,7,8,9,10,11,12,13',
};

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  TOKEN_TYPE: 'token_type',
  USER_DATA: 'user_data',
  SESSION: 'session', // Complete session data from API
  SELECTED_TOURNAMENT: 'selected_tournament',
  SELECTED_FIXTURE: 'selected_fixture',
  MATCH_SETTINGS: 'match_settings',
  BALL_TICKS: 'ball_ticks',
  WICKET_TYPES: 'wicket_types',
};
