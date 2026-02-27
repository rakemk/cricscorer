export { default as RootNavigator } from './RootNavigator';
export { default as AuthNavigator } from './AuthNavigator';
export { default as MainNavigator } from './MainNavigator';
export { default as BottomTabNavigator } from './BottomTabNavigator';

// Screen names for navigation
export const SCREENS = {
  // Auth
  LOGIN: 'Login',
  
  // Main
  FIXTURES: 'Fixtures',
  MATCH_SETUP: 'MatchSetup',
  TEAM_SELECTION: 'TeamSelection',
  TOSS: 'Toss',
  SCOREBOARD: 'Scoreboard',
};
