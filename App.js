/**
 * CricScorer React Native App - Expo Version
 * Cricket Scoring Application
 */

import React from 'react';
import { StatusBar, LogBox } from 'react-native';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import store from './src/store';
import { RootNavigator } from './src/navigation';
import { COLORS } from './src/constants';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

const App = () => {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={COLORS.white}
        />
        <RootNavigator />
      </SafeAreaProvider>
    </Provider>
  );
};

export default App;
