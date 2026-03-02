import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { matchService } from '../../services';
import { DEFAULT_MATCH_SETTINGS } from '../../constants';

// Async thunks
export const fetchMatch = createAsyncThunk(
  'match/fetchMatch',
  async (matchId, { rejectWithValue }) => {
    try {
      const response = await matchService.getMatch(matchId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch match');
    }
  }
);

export const fetchMatchScore = createAsyncThunk(
  'match/fetchMatchScore',
  async (matchId, { rejectWithValue }) => {
    try {
      const response = await matchService.getMatchScore(matchId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch match score');
    }
  }
);

export const fetchMatchSettings = createAsyncThunk(
  'match/fetchSettings',
  async (matchId, { rejectWithValue }) => {
    try {
      const response = await matchService.getMatchSettings(matchId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch settings');
    }
  }
);

export const updateMatchSettings = createAsyncThunk(
  'match/updateSettings',
  async ({ matchId, settings }, { rejectWithValue }) => {
    try {
      const response = await matchService.updateMatchSettings(matchId, settings);
      return settings;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update settings');
    }
  }
);

export const fetchTourSquad = createAsyncThunk(
  'match/fetchTourSquad',
  async (matchId, { rejectWithValue, getState }) => {
    try {
      const response = await matchService.getTourSquad(matchId);
      // API returns data keyed by team ID, e.g. { "89": [...], "94": [...] }
      // Map to team1/team2 using match data
      const match = getState().match.match;
      const teamId1 = match?.team_id1 ?? match?.team1_id;
      const teamId2 = match?.team_id2 ?? match?.team2_id;

      const normalizePlayer = (p) => ({
        ...p,
        id: p.player_id || p.id,
        name: p.player_name || p.name,
      });

      const keys = Object.keys(response || {});
      let team1Players = [];
      let team2Players = [];

      if (teamId1 && response[String(teamId1)]) {
        team1Players = response[String(teamId1)].map(normalizePlayer);
      }
      if (teamId2 && response[String(teamId2)]) {
        team2Players = response[String(teamId2)].map(normalizePlayer);
      }

      // Fallback: if match data missing, assign first two keys
      if (!team1Players.length && !team2Players.length && keys.length >= 2) {
        team1Players = (response[keys[0]] || []).map(normalizePlayer);
        team2Players = (response[keys[1]] || []).map(normalizePlayer);
      }

      return { team1: team1Players, team2: team2Players };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch squad');
    }
  }
);

export const saveTeamSquad = createAsyncThunk(
  'match/saveTeamSquad',
  async ({ matchId, teamId, squadData }, { rejectWithValue }) => {
    try {
      const response = await matchService.saveTeamSquad(matchId, teamId, squadData);
      return { teamId, squadData };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to save squad');
    }
  }
);

export const saveToss = createAsyncThunk(
  'match/saveToss',
  async ({ matchId, tossData }, { rejectWithValue }) => {
    try {
      const response = await matchService.savePreInfo(matchId, tossData);
      return tossData;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to save toss');
    }
  }
);

const initialState = {
  match: null,
  matchSummary: null, // Comprehensive match summary from SCORE endpoint
  settings: DEFAULT_MATCH_SETTINGS,
  tourSquad: {
    team1: [],
    team2: [],
  },
  selectedSquad: {
    team1: [],
    team2: [],
  },
  toss: {
    winner: null,
    elected: null, // 'bat' or 'bowl'
    completed: false,
  },
  captain: {
    team1: null,
    team2: null,
  },
  wicketKeeper: {
    team1: null,
    team2: null,
  },
  loading: false,
  error: null,
  setupStep: 'settings', // 'settings', 'squad1', 'squad2', 'toss', 'start'
};

const matchSlice = createSlice({
  name: 'match',
  initialState,
  reducers: {
    setMatch: (state, action) => {
      state.match = action.payload;
    },
    setSettings: (state, action) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    setSelectedSquad: (state, action) => {
      const { team, players } = action.payload;
      state.selectedSquad[team] = players;
    },
    addPlayerToSquad: (state, action) => {
      const { team, player } = action.payload;
      const pid = player.id || player.player_id;
      if (!state.selectedSquad[team].find(p => (p.id || p.player_id) === pid)) {
        state.selectedSquad[team].push(player);
      }
    },
    removePlayerFromSquad: (state, action) => {
      const { team, playerId } = action.payload;
      state.selectedSquad[team] = state.selectedSquad[team].filter(
        p => (p.id || p.player_id) !== playerId
      );
    },
    setCaptain: (state, action) => {
      const { team, playerId } = action.payload;
      state.captain[team] = playerId;
    },
    setWicketKeeper: (state, action) => {
      const { team, playerId } = action.payload;
      state.wicketKeeper[team] = playerId;
    },
    setToss: (state, action) => {
      state.toss = { ...state.toss, ...action.payload };
    },
    setSetupStep: (state, action) => {
      state.setupStep = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetMatch: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Fetch Match
      .addCase(fetchMatch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMatch.fulfilled, (state, action) => {
        state.loading = false;
        state.match = action.payload;
      })
      .addCase(fetchMatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Match Score (comprehensive view data)
      .addCase(fetchMatchScore.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMatchScore.fulfilled, (state, action) => {
        state.loading = false;
        state.match = action.payload;
        console.log('✅ fetchMatchScore fulfilled - storing in Redux:', {
          hasPayload: !!action.payload,
          payloadKeys: action.payload ? Object.keys(action.payload) : [],
          hasSummary: !!action.payload?.summary,
          hasInning1: !!action.payload?.inning1,
          hasInning2: !!action.payload?.inning2,
        });
        // Store summary data separately if needed
        if (action.payload.summary) {
          state.matchSummary = action.payload.summary;
          console.log('✅ matchSummary set:', action.payload.summary.teamName1, 'vs', action.payload.summary.teamName2);
        }
      })
      .addCase(fetchMatchScore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Settings
      .addCase(fetchMatchSettings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMatchSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = { ...DEFAULT_MATCH_SETTINGS, ...action.payload };
      })
      .addCase(fetchMatchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Settings
      .addCase(updateMatchSettings.fulfilled, (state, action) => {
        state.settings = { ...state.settings, ...action.payload };
      })
      // Fetch Tour Squad
      .addCase(fetchTourSquad.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTourSquad.fulfilled, (state, action) => {
        state.loading = false;
        state.tourSquad = {
          team1: action.payload.team1 || [],
          team2: action.payload.team2 || [],
        };
      })
      .addCase(fetchTourSquad.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Save Team Squad
      .addCase(saveTeamSquad.fulfilled, (state, action) => {
        const { teamId, squadData } = action.payload;
        const id1 = state.match?.team_id1 ?? state.match?.team1_id;
        const teamKey = id1 == teamId ? 'team1' : 'team2';
        state.selectedSquad[teamKey] = squadData.players || [];
      })
      // Save Toss
      .addCase(saveToss.fulfilled, (state, action) => {
        state.toss = {
          winner: action.payload.toss_winner,
          elected: action.payload.toss_elected,
          completed: true,
        };
      });
  },
});

// Selectors
export const selectIsSquadComplete = (state) => {
  const { selectedSquad, settings } = state.match;
  const requiredPlayers = settings.player_count || 11;
  return (
    selectedSquad.team1.length === requiredPlayers &&
    selectedSquad.team2.length === requiredPlayers
  );
};

export const selectIsTossComplete = (state) => state.match.toss.completed;

export const selectBattingTeam = (state) => {
  const { toss, match } = state.match;
  if (!toss.completed || !match) return null;
  
  const id1 = match.team_id1 ?? match.team1_id;
  const id2 = match.team_id2 ?? match.team2_id;
  if (toss.elected === 'bat') {
    return toss.winner;
  }
  // If elected to bowl, other team bats
  return toss.winner === id1 ? id2 : id1;
};

export const {
  setMatch,
  setSettings,
  setSelectedSquad,
  addPlayerToSquad,
  removePlayerFromSquad,
  setCaptain,
  setWicketKeeper,
  setToss,
  setSetupStep,
  clearError,
  resetMatch,
} = matchSlice.actions;

export default matchSlice.reducer;
