import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fixtureService } from '../../services';

// Async thunks
export const fetchTournaments = createAsyncThunk(
  'fixture/fetchTournaments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fixtureService.getTournamentList();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch tournaments');
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
