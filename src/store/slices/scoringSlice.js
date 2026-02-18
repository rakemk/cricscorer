import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { scoringService } from '../../services';
import { BALL_TYPES } from '../../constants';

// Async thunks
export const fetchInningsData = createAsyncThunk(
  'scoring/fetchInningsData',
  async (matchId, { rejectWithValue }) => {
    try {
      const response = await scoringService.getInningsData(matchId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch innings data');
    }
  }
);

export const fetchBallData = createAsyncThunk(
  'scoring/fetchBallData',
  async ({ matchId, innings }, { rejectWithValue }) => {
    try {
      const response = await scoringService.getInningsBallData(matchId, innings);
      return { innings, ballData: response };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch ball data');
    }
  }
);

export const submitBallTick = createAsyncThunk(
  'scoring/submitBallTick',
  async ({ matchId, tickData }, { rejectWithValue, getState }) => {
    try {
      const response = await scoringService.submitBallTick(matchId, tickData);
      return { ...tickData, tick_id: response.tick_id, trans_id: response.trans_id };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to submit ball');
    }
  }
);

export const undoLastBall = createAsyncThunk(
  'scoring/undoLastBall',
  async ({ matchId, transId }, { rejectWithValue }) => {
    try {
      await scoringService.undoBallTick(matchId, transId);
      return transId;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to undo ball');
    }
  }
);

export const endInnings = createAsyncThunk(
  'scoring/endInnings',
  async ({ matchId, inningsData }, { rejectWithValue }) => {
    try {
      await scoringService.submitLiveInfo(matchId, {
        type: 'END_INNINGS',
        ...inningsData,
      });
      return inningsData;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to end innings');
    }
  }
);

const initialState = {
  // Current innings info
  currentInnings: 0, // 0 or 1
  
  // Team scoring state
  teamRuns: [0, 0],
  teamWickets: [0, 0],
  teamOvers: [0, 0], // In balls
  
  // Current batsmen
  striker: null,
  nonStriker: null,
  
  // Current bowler
  currentBowler: null,
  previousBowler: null,
  
  // Ball data per innings
  ballTicks: [[], []], // [innings0Balls, innings1Balls]
  
  // Current over balls (for display)
  currentOverBalls: [],
  
  // Batsmen statistics [innings][batsmanId]
  batsmenStats: [{}, {}],
  
  // Bowler statistics [innings][bowlerId]
  bowlerStats: [{}, {}],
  
  // Partnerships [innings]
  partnerships: [[], []],
  
  // Fall of wickets [innings]
  fallOfWickets: [[], []],
  
  // Match target (for 2nd innings)
  target: null,
  
  // Match result
  result: null,
  matchEnded: false,
  
  // UI state
  loading: false,
  error: null,
  
  // Pending actions (for offline support)
  pendingTicks: [],
  
  // Active modals
  activeModal: null, // 'wicket', 'changeBowler', 'nextBatsman', 'endInnings', etc.
  
  // Selected wicket info (when recording wicket)
  pendingWicket: null,
};

const scoringSlice = createSlice({
  name: 'scoring',
  initialState,
  reducers: {
    // Set current batsmen
    setStriker: (state, action) => {
      state.striker = action.payload;
    },
    setNonStriker: (state, action) => {
      state.nonStriker = action.payload;
    },
    swapBatsmen: (state) => {
      const temp = state.striker;
      state.striker = state.nonStriker;
      state.nonStriker = temp;
    },
    
    // Set bowler
    setCurrentBowler: (state, action) => {
      state.previousBowler = state.currentBowler;
      state.currentBowler = action.payload;
    },
    
    // Update team score
    addRuns: (state, action) => {
      const { runs, innings = state.currentInnings } = action.payload;
      state.teamRuns[innings] += runs;
    },
    
    addWicket: (state, action) => {
      const { innings = state.currentInnings } = action.payload;
      state.teamWickets[innings] += 1;
    },
    
    addBall: (state, action) => {
      const { isLegal, innings = state.currentInnings } = action.payload;
      if (isLegal) {
        state.teamOvers[innings] += 1;
      }
    },
    
    // Record a ball locally (before API call)
    recordBallLocally: (state, action) => {
      const ball = action.payload;
      const innings = ball.inning || state.currentInnings;
      
      state.ballTicks[innings].push(ball);
      state.currentOverBalls.push(ball);
      
      // Update batsman stats
      if (ball.batsman_id) {
        if (!state.batsmenStats[innings][ball.batsman_id]) {
          state.batsmenStats[innings][ball.batsman_id] = {
            runs: 0,
            balls: 0,
            fours: 0,
            sixes: 0,
          };
        }
        const stats = state.batsmenStats[innings][ball.batsman_id];
        stats.runs += ball.batsman_score || 0;
        if (ball.run_over) stats.balls += 1;
        if (ball.batsman_score === 4) stats.fours += 1;
        if (ball.batsman_score === 6) stats.sixes += 1;
      }
      
      // Update bowler stats
      if (ball.bowler_id) {
        if (!state.bowlerStats[innings][ball.bowler_id]) {
          state.bowlerStats[innings][ball.bowler_id] = {
            overs: 0,
            balls: 0,
            maidens: 0,
            runs: 0,
            wickets: 0,
          };
        }
        const stats = state.bowlerStats[innings][ball.bowler_id];
        stats.runs += ball.bowler_given || 0;
        if (ball.run_over) {
          stats.balls += 1;
          if (stats.balls === 6) {
            stats.overs += 1;
            stats.balls = 0;
          }
        }
        if (ball.wicket_id && ball.wicket_id !== 5) { // Not run out
          stats.wickets += 1;
        }
      }
      
      // Swap batsmen on odd runs
      if ((ball.total_runs || 0) % 2 === 1) {
        const temp = state.striker;
        state.striker = state.nonStriker;
        state.nonStriker = temp;
      }
    },
    
    // End current over
    endOver: (state) => {
      state.currentOverBalls = [];
      // Swap batsmen at end of over
      const temp = state.striker;
      state.striker = state.nonStriker;
      state.nonStriker = temp;
    },
    
    // Switch to next innings
    switchInnings: (state) => {
      state.currentInnings = 1;
      state.target = state.teamRuns[0] + 1;
      state.striker = null;
      state.nonStriker = null;
      state.currentBowler = null;
      state.previousBowler = null;
      state.currentOverBalls = [];
    },
    
    // Modal management
    setActiveModal: (state, action) => {
      state.activeModal = action.payload;
    },
    closeModal: (state) => {
      state.activeModal = null;
      state.pendingWicket = null;
    },
    
    // Pending wicket
    setPendingWicket: (state, action) => {
      state.pendingWicket = action.payload;
    },
    
    // Add to pending ticks (offline)
    addPendingTick: (state, action) => {
      state.pendingTicks.push(action.payload);
    },
    clearPendingTicks: (state) => {
      state.pendingTicks = [];
    },
    
    // Set match result
    setResult: (state, action) => {
      state.result = action.payload;
      state.matchEnded = true;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // Reset scoring state
    resetScoring: () => initialState,
    
    // Load existing data
    loadInningsData: (state, action) => {
      const { innings, ballData, teamData } = action.payload;
      state.ballTicks[innings] = ballData || [];
      if (teamData) {
        state.teamRuns[innings] = teamData.runs || 0;
        state.teamWickets[innings] = teamData.wickets || 0;
        state.teamOvers[innings] = teamData.overs || 0;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Innings Data
      .addCase(fetchInningsData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchInningsData.fulfilled, (state, action) => {
        state.loading = false;
        // Process innings data and populate state
        const data = action.payload;
        if (data.innings) {
          data.innings.forEach((inn, idx) => {
            state.teamRuns[idx] = inn.runs || 0;
            state.teamWickets[idx] = inn.wickets || 0;
            state.teamOvers[idx] = inn.balls || 0;
          });
        }
        if (data.current_innings !== undefined) {
          state.currentInnings = data.current_innings;
        }
      })
      .addCase(fetchInningsData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Ball Data
      .addCase(fetchBallData.fulfilled, (state, action) => {
        const { innings, ballData } = action.payload;
        state.ballTicks[innings] = ballData || [];
      })
      // Submit Ball Tick
      .addCase(submitBallTick.pending, (state) => {
        state.loading = true;
      })
      .addCase(submitBallTick.fulfilled, (state, action) => {
        state.loading = false;
        // Update the latest ball with server response
        const ball = action.payload;
        const innings = ball.inning || state.currentInnings;
        const lastIndex = state.ballTicks[innings].length - 1;
        if (lastIndex >= 0) {
          state.ballTicks[innings][lastIndex] = {
            ...state.ballTicks[innings][lastIndex],
            tick_id: ball.tick_id,
            trans_id: ball.trans_id,
          };
        }
      })
      .addCase(submitBallTick.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Undo Last Ball
      .addCase(undoLastBall.fulfilled, (state, action) => {
        const transId = action.payload;
        const innings = state.currentInnings;
        
        // Find and remove the ball
        const ballIndex = state.ballTicks[innings].findIndex(
          b => b.trans_id === transId
        );
        
        if (ballIndex !== -1) {
          const ball = state.ballTicks[innings][ballIndex];
          
          // Revert team stats
          state.teamRuns[innings] -= ball.total_runs || 0;
          if (ball.wicket_id) {
            state.teamWickets[innings] -= 1;
          }
          if (ball.run_over) {
            state.teamOvers[innings] -= 1;
          }
          
          // Revert batsman stats
          if (ball.batsman_id && state.batsmenStats[innings][ball.batsman_id]) {
            const stats = state.batsmenStats[innings][ball.batsman_id];
            stats.runs -= ball.batsman_score || 0;
            if (ball.run_over) stats.balls -= 1;
            if (ball.batsman_score === 4) stats.fours -= 1;
            if (ball.batsman_score === 6) stats.sixes -= 1;
          }
          
          // Revert bowler stats
          if (ball.bowler_id && state.bowlerStats[innings][ball.bowler_id]) {
            const stats = state.bowlerStats[innings][ball.bowler_id];
            stats.runs -= ball.bowler_given || 0;
            if (ball.wicket_id && ball.wicket_id !== 5) {
              stats.wickets -= 1;
            }
          }
          
          // Remove from arrays
          state.ballTicks[innings].splice(ballIndex, 1);
          state.currentOverBalls = state.currentOverBalls.filter(
            b => b.trans_id !== transId
          );
          
          // Revert batsmen swap if odd runs
          if ((ball.total_runs || 0) % 2 === 1) {
            const temp = state.striker;
            state.striker = state.nonStriker;
            state.nonStriker = temp;
          }
        }
      })
      // End Innings
      .addCase(endInnings.fulfilled, (state) => {
        state.currentInnings = 1;
        state.target = state.teamRuns[0] + 1;
        state.currentOverBalls = [];
      });
  },
});

// Selectors
export const selectCurrentScore = (state) => {
  const { teamRuns, teamWickets, teamOvers, currentInnings } = state.scoring;
  return {
    runs: teamRuns[currentInnings],
    wickets: teamWickets[currentInnings],
    overs: scoringService.formatOvers(teamOvers[currentInnings]),
  };
};

export const selectCRR = (state) => {
  const { teamRuns, teamOvers, currentInnings } = state.scoring;
  return scoringService.calculateCRR(teamRuns[currentInnings], teamOvers[currentInnings]);
};

export const selectRRR = (state) => {
  const { teamRuns, teamOvers, currentInnings, target } = state.scoring;
  const totalOvers = state.match?.settings?.ttl_over || 20;
  if (currentInnings === 0 || !target) return null;
  return scoringService.calculateRRR(
    target,
    teamRuns[currentInnings],
    teamOvers[currentInnings],
    totalOvers
  );
};

export const selectStrikerStats = (state) => {
  const { striker, batsmenStats, currentInnings } = state.scoring;
  if (!striker) return null;
  return batsmenStats[currentInnings][striker.id] || { runs: 0, balls: 0, fours: 0, sixes: 0 };
};

export const selectNonStrikerStats = (state) => {
  const { nonStriker, batsmenStats, currentInnings } = state.scoring;
  if (!nonStriker) return null;
  return batsmenStats[currentInnings][nonStriker.id] || { runs: 0, balls: 0, fours: 0, sixes: 0 };
};

export const selectCurrentBowlerStats = (state) => {
  const { currentBowler, bowlerStats, currentInnings } = state.scoring;
  if (!currentBowler) return null;
  return bowlerStats[currentInnings][currentBowler.id] || {
    overs: 0,
    balls: 0,
    maidens: 0,
    runs: 0,
    wickets: 0,
  };
};

export const {
  setStriker,
  setNonStriker,
  swapBatsmen,
  setCurrentBowler,
  addRuns,
  addWicket,
  addBall,
  recordBallLocally,
  endOver,
  switchInnings,
  setActiveModal,
  closeModal,
  setPendingWicket,
  addPendingTick,
  clearPendingTicks,
  setResult,
  clearError,
  resetScoring,
  loadInningsData,
} = scoringSlice.actions;

export default scoringSlice.reducer;
