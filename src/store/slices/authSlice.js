import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services';
import { sessionStorage } from '../../utils/storage';

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const response = await authService.login(username, password);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Login failed');
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
        return { isAuthenticated: true, tokens };
      }
      return { isAuthenticated: false, tokens: null };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  isAuthenticated: false,
  user: null,
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
        state.user = action.payload.user || action.payload;
        state.tokens = {
          accessToken: action.payload.access_token,
          refreshToken: action.payload.refresh_token,
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
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.isCheckingAuth = false;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
