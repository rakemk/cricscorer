import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fixtureService, tournamentService } from '../../services';

// Async thunks
export const fetchTournaments = createAsyncThunk(
  'fixture/fetchTournaments',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔍 DEBUG - Fetching tournaments');
      
      const response = await tournamentService.getTournaments();
      return response;
    } catch (error) {
      console.error('❌ Tournament fetch error:', error);
      return rejectWithValue(error.message || 'Failed to fetch tournaments');
    }
  }
);

export const fetchTournamentsByOrg = createAsyncThunk(
  'fixture/fetchTournamentsByOrg',
  async (orgId, { rejectWithValue }) => {
    try {
      console.log('🔍 DEBUG - Fetching tournaments for orgId:', orgId);
      
      if (!orgId) {
        throw new Error('Organization ID is required');
      }
      
      const response = await tournamentService.getTournamentsByOrg(orgId);
      return response;
    } catch (error) {
      console.error('❌ Tournament fetch error for org:', error);
      return rejectWithValue(error.message || 'Failed to fetch tournaments by organization');
    }
  }
);

export const fetchLiveTournaments = createAsyncThunk(
  'fixture/fetchLiveTournaments',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔍 DEBUG - Fetching live tournaments');
      
      const response = await tournamentService.getLiveTournaments();
      return response;
    } catch (error) {
      console.error('❌ Live tournament fetch error:', error);
      return rejectWithValue(error.message || 'Failed to fetch live tournaments');
    }
  }
);

export const fetchFixtures = createAsyncThunk(
  'fixture/fetchFixtures',
  async (tournamentId, { rejectWithValue }) => {
    try {
      const response = await fixtureService.getFixtureList(tournamentId);
      return { tournamentId, fixtures: response };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch fixtures');
    }
  }
);

export const fetchWicketTypes = createAsyncThunk(
  'fixture/fetchWicketTypes',
  async (tournamentId, { rejectWithValue }) => {
    try {
      const response = await fixtureService.getWicketTypes(tournamentId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch wicket types');
    }
  }
);

const initialState = {
  tournaments: [],
  fixtures: [],
  selectedTournament: null,
  selectedFixture: null,
  wicketTypes: [],
  filterStatus: 'all', // 'all', 'live', 'completed', 'upcoming'
  loading: false,
  error: null,
};

const fixtureSlice = createSlice({
  name: 'fixture',
  initialState,
  reducers: {
    setSelectedTournament: (state, action) => {
      state.selectedTournament = action.payload;
    },
    setSelectedFixture: (state, action) => {
      state.selectedFixture = action.payload;
    },
    setFilterStatus: (state, action) => {
      state.filterStatus = action.payload;
    },
    clearFixtures: (state) => {
      state.fixtures = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Tournaments
      .addCase(fetchTournaments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTournaments.fulfilled, (state, action) => {
        state.loading = false;
        state.tournaments = action.payload || [];
      })
      .addCase(fetchTournaments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Tournaments By Organization
      .addCase(fetchTournamentsByOrg.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTournamentsByOrg.fulfilled, (state, action) => {
        state.loading = false;
        state.tournaments = action.payload || [];
      })
      .addCase(fetchTournamentsByOrg.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Fixtures
      .addCase(fetchFixtures.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFixtures.fulfilled, (state, action) => {
        state.loading = false;
        state.fixtures = action.payload.fixtures || [];
      })
      .addCase(fetchFixtures.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Live Tournaments
      .addCase(fetchLiveTournaments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLiveTournaments.fulfilled, (state, action) => {
        state.loading = false;
        state.tournaments = action.payload || [];
      })
      .addCase(fetchLiveTournaments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Wicket Types
      .addCase(fetchWicketTypes.fulfilled, (state, action) => {
        state.wicketTypes = action.payload || [];
      });
  },
});

// Selectors
export const selectFilteredFixtures = (state) => {
  const { fixtures, filterStatus } = state.fixture;
  if (filterStatus === 'all') return fixtures;
  return fixtureService.filterByStatus(fixtures, filterStatus);
};

export const {
  setSelectedTournament,
  setSelectedFixture,
  setFilterStatus,
  clearFixtures,
  clearError,
} = fixtureSlice.actions;

export default fixtureSlice.reducer;
