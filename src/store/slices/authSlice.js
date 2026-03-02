import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services';
import { sessionStorage } from '../../utils/storage';

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      // Single POST /v2/auth/scorer with { username, password }
      const result = await authService.login(username, password);
      return result; // { user, token }
    } catch (error) {
      const errorMessage = error.message || error.error || 'Invalid Email or Password';
      return rejectWithValue(errorMessage);
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await authService.logout();
  return null;
});

export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async (_, { rejectWithValue }) => {
    try {
      const isAuthenticated = await authService.isAuthenticated();
      if (isAuthenticated) {
        const tokens = await sessionStorage.getTokens();
        const sessionData = await sessionStorage.getSessionData();
        return {
          isAuthenticated: true,
          tokens,
          session: sessionData || null,
          user: sessionData?.user || null,
        };
      }
      return { isAuthenticated: false, tokens: null, session: null, user: null };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  isAuthenticated: false,
  user: null,
  session: null, // Complete session data from API
  tokens: null,
  loading: false,
  error: null,
  isCheckingAuth: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user || null;
        state.session = action.payload;
        
        // ProCric8 token structure: { token_type, access_token, refresh_token }
        const tokenInfo = action.payload.token || {};
        state.tokens = {
          accessToken: tokenInfo.access_token,
          refreshToken: tokenInfo.refresh_token || null,
          tokenType: tokenInfo.token_type || 'Bearer',
        };
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Login failed';
        state.isAuthenticated = false;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.session = null;
        state.tokens = null;
      })
      // Check auth status
      .addCase(checkAuthStatus.pending, (state) => {
        state.isCheckingAuth = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.isCheckingAuth = false;
        state.isAuthenticated = action.payload.isAuthenticated;
        state.tokens = action.payload.tokens;
        state.session = action.payload.session || null;
        state.user = action.payload.user || null;
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.isCheckingAuth = false;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
