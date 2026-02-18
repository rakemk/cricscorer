// API Configuration - Based on UrlService.js
export const API_CONFIG = {
  BASE_URL: 'https://api.cricscore.com', // Replace with actual API URL
  API_VERSION: 'v2',
  TIMEOUT: 30000,
};

// Endpoints matching UrlService.js
export const ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/v2/auth/scorer',
    REFRESH: '/v2/auth/refresh',
  },

  // Tournament & Fixtures
  TOURNAMENT: {
    LIST: '/v2/scorer/tournament/list',
    FIXTURE_LIST: (tournamentId) => `/v2/scorer/tournament/${tournamentId}/fixture/list`,
    WICKET_LIST: (tournamentId) => `/v2/scorer/tournament/${tournamentId}/wicket/list`,
  },

  // Match Operations
  MATCH: {
    GET: (matchId) => `/v2/scorer/match/${matchId}`,
    PREINFO: (matchId) => `/v2/scorer/match/${matchId}/preinfo`,
    TOUR_SQUAD: (matchId) => `/v2/scorer/match/${matchId}/toursquad`,
    TEAM_SQUAD: (matchId, teamId) => `/v2/scorer/match/${matchId}/team/${teamId}/squad`,
    SETTING: (matchId) => `/v2/scorer/match/${matchId}/setting`,
    INNINGS: (matchId) => `/v2/scorer/match/${matchId}/innings`,
    BALL_DATA: (matchId) => `/v2/scorer/match/${matchId}/balldata`,
    BALL_DATA_INNINGS: (matchId, innings) => `/v2/scorer/match/${matchId}/balldata/${innings}`,
    DELETE: (matchId) => `/v2/scorer/match/${matchId}`,
  },

  // Live Scoring
  SCORING: {
    LIVE_SCORE: (matchId) => `/v2/scorer/match/${matchId}/livescore`,
    LIVE_INFO: (matchId) => `/v2/scorer/match/${matchId}/liveinfo`,
    UNDO_TICK: (matchId, transId) => `/v2/scorer/match/${matchId}/undotick/${transId}`,
    BULK_UNDO: (matchId) => `/v2/scorer/match/${matchId}/bulk/undotick`,
    BULK_TICK: (matchId) => `/v2/scorer/match/${matchId}/bulk/tick`,
    RESET_TICKS: (matchId) => `/v2/scorer/match/${matchId}/reset/ticks`,
  },

  // Post Match
  POST_MATCH: {
    POST_INFO: (matchId) => `/v2/scorer/match/${matchId}/postinfo`,
    FAIR_PLAY: (matchId) => `/v2/scorer/match/${matchId}/fairplay`,
    POM_SUGGESTION: (matchId) => `/v2/scorer/match/${matchId}/pom/sugestion`,
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
  SELECTED_TOURNAMENT: 'selected_tournament',
  SELECTED_FIXTURE: 'selected_fixture',
  MATCH_SETTINGS: 'match_settings',
  BALL_TICKS: 'ball_ticks',
  WICKET_TYPES: 'wicket_types',
};
