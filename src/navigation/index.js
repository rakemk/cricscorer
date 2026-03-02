export { default as RootNavigator } from './RootNavigator';
export { default as AuthNavigator } from './AuthNavigator';
export { default as MainNavigator } from './MainNavigator';
export { default as BottomTabNavigator } from './BottomTabNavigator';

// Screen names for navigation
export const SCREENS = {
  // Auth
  LOGIN: 'Login',
  
  // Tournament flow
  TOURNAMENT_LIST: 'TournamentList',
  FIXTURES_LIST: 'FixturesList',
  
  // Match flow
  MATCH_SETUP: 'MatchSetup',
  TEAM_SELECTION: 'TeamSelection',
  TOSS: 'Toss',
  SCOREBOARD: 'Scoreboard',
  
  // Legacy
  FIXTURES: 'Fixtures',
};
