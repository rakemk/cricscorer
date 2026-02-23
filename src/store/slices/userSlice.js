import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userService } from '../../services';

// ==========================================
// Async Thunks
// ==========================================

export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (forceRefresh = false, { rejectWithValue }) => {
    try {
      const response = await userService.getUserProfile(forceRefresh);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch user profile');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await userService.updateUserProfile(profileData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update user profile');
    }
  }
);

export const fetchCricketProfile = createAsyncThunk(
  'user/fetchCricketProfile',
  async (forceRefresh = false, { rejectWithValue }) => {
    try {
      const response = await userService.getCricketProfile(forceRefresh);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch cricket profile');
    }
  }
);

export const updateCricketProfile = createAsyncThunk(
  'user/updateCricketProfile',
  async (cricProfileData, { rejectWithValue }) => {
    try {
      const response = await userService.updateCricketProfile(cricProfileData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update cricket profile');
    }
  }
);

export const fetchUserStats = createAsyncThunk(
  'user/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getUserStats();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch user stats');
    }
  }
);

export const fetchTournamentStats = createAsyncThunk(
  'user/fetchTournamentStats',
  async (tourId, { rejectWithValue }) => {
    try {
      const response = await userService.getTournamentStats(tourId);
      return { tourId, stats: response };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch tournament stats');
    }
  }
);

export const fetchPlayerStats = createAsyncThunk(
  'user/fetchPlayerStats',
  async ({ tourId, playerId }, { rejectWithValue }) => {
    try {
      const response = await userService.getPlayerStats(tourId, playerId);
      return { tourId, playerId, stats: response };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch player stats');
    }
  }
);

export const fetchReceivedInvitations = createAsyncThunk(
  'user/fetchReceivedInvitations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getReceivedInvitations();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch invitations');
    }
  }
);

export const respondToInvitation = createAsyncThunk(
  'user/respondToInvitation',
  async ({ tourId, inviteId, status }, { rejectWithValue }) => {
    try {
      const response = await userService.respondToInvitation(tourId, inviteId, status);
      return { inviteId, status, response };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to respond to invitation');
    }
  }
);

export const fetchInviteDetails = createAsyncThunk(
  'user/fetchInviteDetails',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getInviteDetails();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch invite details');
    }
  }
);

export const capturePayment = createAsyncThunk(
  'user/capturePayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await userService.capturePayment(paymentData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to capture payment');
    }
  }
);

// ==========================================
// Initial State
// ==========================================

const initialState = {
  profile: null,
  cricketProfile: null,
  stats: null,
  tournamentStats: {},
  playerStats: {},
  invitations: [],
  inviteDetails: null,
  paymentResult: null,
  loading: {
    profile: false,
    cricketProfile: false,
    stats: false,
    invitations: false,
    payment: false,
  },
  error: null,
};

// ==========================================
// User Slice
// ==========================================

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
    clearUserProfile: (state) => {
      state.profile = null;
      state.cricketProfile = null;
    },
    clearUserStats: (state) => {
      state.stats = null;
      state.tournamentStats = {};
      state.playerStats = {};
    },
    clearInvitations: (state) => {
      state.invitations = [];
      state.inviteDetails = null;
    },
    clearPaymentResult: (state) => {
      state.paymentResult = null;
    },
    updateInvitationStatus: (state, action) => {
      const { inviteId, status } = action.payload;
      const invitation = state.invitations.find((inv) => inv.id === inviteId);
      if (invitation) {
        invitation.inviteStatus = status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch User Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading.profile = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading.profile = false;
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading.profile = false;
        state.error = action.payload;
      })
      
      // Update User Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading.profile = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading.profile = false;
        state.profile = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading.profile = false;
        state.error = action.payload;
      })
      
      // Fetch Cricket Profile
      .addCase(fetchCricketProfile.pending, (state) => {
        state.loading.cricketProfile = true;
        state.error = null;
      })
      .addCase(fetchCricketProfile.fulfilled, (state, action) => {
        state.loading.cricketProfile = false;
        state.cricketProfile = action.payload;
      })
      .addCase(fetchCricketProfile.rejected, (state, action) => {
        state.loading.cricketProfile = false;
        state.error = action.payload;
      })
      
      // Update Cricket Profile
      .addCase(updateCricketProfile.pending, (state) => {
        state.loading.cricketProfile = true;
        state.error = null;
      })
      .addCase(updateCricketProfile.fulfilled, (state, action) => {
        state.loading.cricketProfile = false;
        state.cricketProfile = action.payload;
      })
      .addCase(updateCricketProfile.rejected, (state, action) => {
        state.loading.cricketProfile = false;
        state.error = action.payload;
      })
      
      // Fetch User Stats
      .addCase(fetchUserStats.pending, (state) => {
        state.loading.stats = true;
        state.error = null;
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.loading.stats = false;
        state.stats = action.payload;
      })
      .addCase(fetchUserStats.rejected, (state, action) => {
        state.loading.stats = false;
        state.error = action.payload;
      })
      
      // Fetch Tournament Stats
      .addCase(fetchTournamentStats.pending, (state) => {
        state.loading.stats = true;
        state.error = null;
      })
      .addCase(fetchTournamentStats.fulfilled, (state, action) => {
        state.loading.stats = false;
        const { tourId, stats } = action.payload;
        state.tournamentStats[tourId] = stats;
      })
      .addCase(fetchTournamentStats.rejected, (state, action) => {
        state.loading.stats = false;
        state.error = action.payload;
      })
      
      // Fetch Player Stats
      .addCase(fetchPlayerStats.pending, (state) => {
        state.loading.stats = true;
        state.error = null;
      })
      .addCase(fetchPlayerStats.fulfilled, (state, action) => {
        state.loading.stats = false;
        const { tourId, playerId, stats } = action.payload;
        state.playerStats[`${tourId}_${playerId}`] = stats;
      })
      .addCase(fetchPlayerStats.rejected, (state, action) => {
        state.loading.stats = false;
        state.error = action.payload;
      })
      
      // Fetch Received Invitations
      .addCase(fetchReceivedInvitations.pending, (state) => {
        state.loading.invitations = true;
        state.error = null;
      })
      .addCase(fetchReceivedInvitations.fulfilled, (state, action) => {
        state.loading.invitations = false;
        state.invitations = action.payload;
      })
      .addCase(fetchReceivedInvitations.rejected, (state, action) => {
        state.loading.invitations = false;
        state.error = action.payload;
      })
      
      // Respond to Invitation
      .addCase(respondToInvitation.pending, (state) => {
        state.loading.invitations = true;
        state.error = null;
      })
      .addCase(respondToInvitation.fulfilled, (state, action) => {
        state.loading.invitations = false;
        const { inviteId, status } = action.payload;
        const invitation = state.invitations.find((inv) => inv.id === inviteId);
        if (invitation) {
          invitation.inviteStatus = status;
        }
      })
      .addCase(respondToInvitation.rejected, (state, action) => {
        state.loading.invitations = false;
        state.error = action.payload;
      })
      
      // Fetch Invite Details
      .addCase(fetchInviteDetails.pending, (state) => {
        state.loading.invitations = true;
        state.error = null;
      })
      .addCase(fetchInviteDetails.fulfilled, (state, action) => {
        state.loading.invitations = false;
        state.inviteDetails = action.payload;
      })
      .addCase(fetchInviteDetails.rejected, (state, action) => {
        state.loading.invitations = false;
        state.error = action.payload;
      })
      
      // Capture Payment
      .addCase(capturePayment.pending, (state) => {
        state.loading.payment = true;
        state.error = null;
      })
      .addCase(capturePayment.fulfilled, (state, action) => {
        state.loading.payment = false;
        state.paymentResult = action.payload;
      })
      .addCase(capturePayment.rejected, (state, action) => {
        state.loading.payment = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearUserError,
  clearUserProfile,
  clearUserStats,
  clearInvitations,
  clearPaymentResult,
  updateInvitationStatus,
} = userSlice.actions;

export default userSlice.reducer;
