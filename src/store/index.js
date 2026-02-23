import { configureStore } from '@reduxjs/toolkit';
import {
  authReducer,
  fixtureReducer,
  matchReducer,
  scoringReducer,
  uiReducer,
  userReducer,
} from './slices';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    fixture: fixtureReducer,
    match: matchReducer,
    scoring: scoringReducer,
    ui: uiReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore certain action types or paths that may contain non-serializable data
        ignoredActions: ['scoring/recordBallLocally'],
        ignoredPaths: ['scoring.ballTicks'],
      },
    }),
  devTools: __DEV__, // Enable Redux DevTools in development
});

// Export types for TypeScript (if migrating later)
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;

export default store;
