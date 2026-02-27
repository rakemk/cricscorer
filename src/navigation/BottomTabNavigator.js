import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { COLORS } from '../constants';

// Import Screens
import FixturesScreen from '../screens/FixturesScreen';
import MatchSetupScreen from '../screens/MatchSetupScreen';
import TeamSelectionScreen from '../screens/TeamSelectionScreen';
import TossScreen from '../screens/TossScreen';
import ScoreboardScreen from '../screens/ScoreboardScreen';
import TournamentScreen from '../screens/TournamentScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Home Stack Navigator (contains Fixtures and related screens)
const HomeStack = () => (
  <Stack.Navigator
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
      name="HomeMain"
      component={FixturesScreen}
      options={{ title: 'Home', headerShown: false }}
    />
  </Stack.Navigator>
);

// Match Stack Navigator (contains match flow screens)
const MatchStack = () => (
  <Stack.Navigator
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
      name="MatchList"
      component={FixturesScreen}
      options={{ title: 'Matches' }}
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
      options={{ title: 'Scoreboard' }}
    />
  </Stack.Navigator>
);

// Bottom Tab Navigator
const BottomTabNavigator = () => {
  const { user } = useSelector((state) => state.auth);
  const userName = user?.name || user?.firstName || 'Profile';

  return (
    <Tab.Navigator
      initialRouteName="Match"
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Match"
        component={MatchStack}
        options={{
          tabBarLabel: 'Match',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cricket" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Tournament"
        component={TournamentScreen}
        options={{
          tabBarLabel: 'Tournament',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="trophy" size={size} color={color} />
          ),
          headerShown: true,
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: COLORS.white,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Tab.Screen
        name="Login"
        component={ProfileScreen}
        options={{
          tabBarLabel: userName,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
          headerShown: true,
          headerTitle: userName,
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: COLORS.white,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
