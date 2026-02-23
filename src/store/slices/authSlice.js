import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services';
import { sessionStorage } from '../../utils/storage';

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      // Step 1: Verify identity and get UUID
      const identityResult = await authService.verifyIdentity(username);
      
      if (!identityResult.validIdentity) {
        return rejectWithValue('Invalid phone number or email');
      }

      // Step 2: Login with UUID and password
      const response = await authService.login(identityResult.uuid, password);
      return response;
    } catch (error) {
      // Handle both Error objects and error response objects
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
        state.session = action.payload; // Store complete session data
        state.user = action.payload.user || null;
        
        // Handle new API token structure
        // Response format: { tokenType, token, user }
        state.tokens = {
          accessToken: action.payload.token,
          refreshToken: null,
          tokenType: action.payload.tokenType || 'Bearer',
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
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.isCheckingAuth = false;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
