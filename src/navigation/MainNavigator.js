import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { COLORS } from '../constants';

// Main Screens
import FixturesScreen from '../screens/FixturesScreen';
import MatchSetupScreen from '../screens/MatchSetupScreen';
import TeamSelectionScreen from '../screens/TeamSelectionScreen';
import TossScreen from '../screens/TossScreen';
import ScoreboardScreen from '../screens/ScoreboardScreen';

const Stack = createNativeStackNavigator();

const MainNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Fixtures"
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="Fixtures"
        component={FixturesScreen}
        options={{ title: 'Fixtures' }}
      />
      <Stack.Screen
        name="MatchSetup"
        component={MatchSetupScreen}
        options={{ title: 'Match Setup' }}
      />
      <Stack.Screen
        name="TeamSelection"
        component={TeamSelectionScreen}
        options={({ route }) => ({
          title: route.params?.teamName || 'Team Selection',
        })}
      />
      <Stack.Screen
        name="Toss"
        component={TossScreen}
        options={{ title: 'Toss' }}
      />
      <Stack.Screen
        name="Scoreboard"
        component={ScoreboardScreen}
        options={{
          title: 'Scoreboard',
          headerShown: false, // Full screen scoreboard
        }}
      />
    </Stack.Navigator>
  );
};

export default MainNavigator;
