import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

import AuthNavigator from './AuthNavigator';
import BottomTabNavigator from './BottomTabNavigator';
import { checkAuthStatus } from '../store/slices/authSlice';
import { COLORS } from '../constants';

const RootNavigator = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, isCheckingAuth } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  // Show loading screen while checking auth status
  if (isCheckingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <BottomTabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});

export default RootNavigator;
