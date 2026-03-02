import React from 'react';
import { TouchableOpacity, Alert } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { COLORS } from '../constants';
import { logout } from '../store/slices/authSlice';

// Main Screens
import TournamentScreen from '../screens/TournamentScreen';
import FixturesScreen from '../screens/FixturesScreen';
import MatchSetupScreen from '../screens/MatchSetupScreen';
import TeamSelectionScreen from '../screens/TeamSelectionScreen';
import TossScreen from '../screens/TossScreen';
import ScoreboardScreen from '../screens/ScoreboardScreen';

const Stack = createNativeStackNavigator();

const MainNavigator = () => {
  const dispatch = useDispatch();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => dispatch(logout()) },
    ]);
  };

  return (
    <Stack.Navigator
      initialRouteName="TournamentList"
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen
        name="TournamentList"
        component={TournamentScreen}
        options={{
          title: 'Procri8',
          headerTitleAlign: 'left',
          headerRight: () => (
            <TouchableOpacity onPress={handleLogout} style={{ paddingHorizontal: 8 }}>
              <Ionicons name="log-out-outline" size={24} color={COLORS.white} />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="FixturesList"
        component={FixturesScreen}
        options={({ route }) => ({
          title: route.params?.tournamentName || 'Matches',
        })}
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
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default MainNavigator;
