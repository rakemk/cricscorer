import { apiService } from './api';
import { ENDPOINTS, BALL_TYPES, WICKET_TYPES } from '../constants';
import { matchStorage } from '../utils/storage';

/**
 * Scoring Service
 * Handles live scoring operations - ball ticks, undo, stats
 * Replaces scoreDataService.js and BallTickDataService.js
 */

export const scoringService = {
  /**
   * Get innings data
   * @param {string|number} matchId - Match ID
   * @returns {Promise<Object>} - Innings data
   */
  async getInningsData(matchId) {
    try {
      const response = await apiService.get(ENDPOINTS.MATCH.INNINGS(matchId));
      return response.data || response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get all ball data for match
   * @param {string|number} matchId - Match ID
   * @returns {Promise<Array>} - Ball tick data
   */
  async getBallData(matchId) {
    try {
      const response = await apiService.get(ENDPOINTS.MATCH.BALL_DATA(matchId));
      return response.data || response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get ball data for specific innings
   * @param {string|number} matchId - Match ID
   * @param {number} innings - Innings number (0 or 1)
   * @returns {Promise<Array>} - Ball tick data for innings
   */
  async getInningsBallData(matchId, innings) {
    try {
      const response = await apiService.get(
        ENDPOINTS.MATCH.BALL_DATA_INNINGS(matchId, innings)
      );
      const data = response.data || response;
      
      // Cache locally for offline support
      await matchStorage.saveBallTicks(innings, data);
      
      return data;
    } catch (error) {
      // Return cached data on error
      const cached = await matchStorage.getBallTicks(innings);
      if (cached.length > 0) {
        return cached;
      }
      throw error;
    }
  },

  /**
   * Submit live score (ball tick)
   * @param {string|number} matchId - Match ID
   * @param {Object} tickData - Ball tick data
   * @returns {Promise<Object>} - Response with tick_id
   */
  async submitBallTick(matchId, tickData) {
    try {
      const response = await apiService.post(
        ENDPOINTS.SCORING.LIVE_SCORE(matchId),
        tickData
      );
      return response.data || response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Submit live info update (status change, break, etc.)
   * @param {string|number} matchId - Match ID
   * @param {Object} infoData - Info update data
   * @returns {Promise<Object>} - Response
   */
  async submitLiveInfo(matchId, infoData) {
    try {
      const response = await apiService.post(
        ENDPOINTS.SCORING.LIVE_INFO(matchId),
        infoData
      );
      return response.data || response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Undo last ball tick
   * @param {string|number} matchId - Match ID
   * @param {string|number} transId - Transaction ID to undo
   * @returns {Promise<Object>} - Response
   */
  async undoBallTick(matchId, transId) {
    try {
      const response = await apiService.delete(
        ENDPOINTS.SCORING.UNDO_TICK(matchId, transId)
      );
      return response.data || response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Bulk undo ball ticks
   * @param {string|number} matchId - Match ID
   * @param {Array} transIds - Array of transaction IDs
   * @returns {Promise<Object>} - Response
   */
  async bulkUndoTicks(matchId, transIds) {
    try {
      const response = await apiService.delete(
        ENDPOINTS.SCORING.BULK_UNDO(matchId),
        { data: { trans_ids: transIds } }
      );
      return response.data || response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Bulk submit ball ticks (for offline sync)
   * @param {string|number} matchId - Match ID
   * @param {Array} ticks - Array of ball tick objects
   * @returns {Promise<Object>} - Response
   */
  async bulkSubmitTicks(matchId, ticks) {
    try {
      const response = await apiService.post(
        ENDPOINTS.SCORING.BULK_TICK(matchId),
        { ticks }
      );
      return response.data || response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Reset all ticks for match
   * @param {string|number} matchId - Match ID
   * @returns {Promise<Object>} - Response
   */
  async resetAllTicks(matchId) {
    try {
      const response = await apiService.delete(
        ENDPOINTS.SCORING.RESET_TICKS(matchId)
      );
      await matchStorage.clearMatchData();
      return response.data || response;
    } catch (error) {
      throw error;
    }
  },

  // ================================
  // Ball Tick Creation Helpers
  // (Based on BallTickDataService.js)
  // ================================

  /**
   * Create a ball tick object
   * @param {Object} params - Ball parameters
   * @returns {Object} - Formatted ball tick
   */
  createBallTick({
    innings,
    over,
    ball,
    batsmanId,
    nonStrikerId,
    bowlerId,
    runs = 0,
    ballType = BALL_TYPES.NORMAL,
    isWicket = false,
    wicketType = null,
    fielderId = null,
    outBatsmanId = null,
    teamRuns = 0,
    teamWickets = 0,
    commentary = '',
  }) {
    const isExtra = ballType !== BALL_TYPES.NORMAL;
    const isLegal = !this.isNonLegalBall(ballType);
    
    return {
      inning: innings,
      over: over,
      ball_no: ball,
      batsman_id: batsmanId,
      batsman_id2: nonStrikerId,
      bowler_id: bowlerId,
      batsman_score: this.getBatsmanRuns(runs, ballType),
      bowler_given: this.getBowlerRuns(runs, ballType),
      extra_runs: this.getExtraRuns(runs, ballType),
      total_runs: runs,
      team_runs: teamRuns,
      ball_type: ballType,
      wicket_id: isWicket ? wicketType : 0,
      wicket_type: isWicket ? WICKET_TYPES[wicketType]?.name : null,
      wicket_desc: '',
      out_bat_id: outBatsmanId,
      out_fielder_id: fielderId,
      fielder_id: fielderId,
      for_wicket: teamWickets,
      run_over: isLegal,
      maiden: false, // Will be calculated at end of over
      partnership_order: 0,
      commentry: commentary || this.generateCommentary(runs, ballType, isWicket, wicketType),
      short_commentry: this.generateShortCommentary(runs, ballType),
      end_over: false,
      timestamp: Date.now(),
    };
  },

  /**
   * Check if ball type is non-legal (wide, no-ball)
   * @param {number} ballType - Ball type constant
   * @returns {boolean}
   */
  isNonLegalBall(ballType) {
    return [
      BALL_TYPES.WIDE,
      BALL_TYPES.NO_BALL,
      BALL_TYPES.WIDE_BYE,
      BALL_TYPES.NO_BALL_BYE,
      BALL_TYPES.NO_BALL_LEG_BYE,
    ].includes(ballType);
  },

  /**
   * Get runs credited to batsman
   * @param {number} runs - Total runs
   * @param {number} ballType - Ball type
   * @returns {number}
   */
  getBatsmanRuns(runs, ballType) {
    // Batsman gets runs only for normal deliveries or no-balls hit by bat
    if (
      ballType === BALL_TYPES.NORMAL ||
      ballType === BALL_TYPES.NO_BALL
    ) {
      return runs;
    }
    return 0;
  },

  /**
   * Get runs charged to bowler
   * @param {number} runs - Total runs
   * @param {number} ballType - Ball type
   * @returns {number}
   */
  getBowlerRuns(runs, ballType) {
    // Bowler charged for everything except byes and leg byes
    if (
      ballType === BALL_TYPES.BYE ||
      ballType === BALL_TYPES.LEG_BYE
    ) {
      return 0;
    }
    return runs;
  },

  /**
   * Get extra runs
   * @param {number} runs - Total runs
   * @param {number} ballType - Ball type
   * @returns {number}
   */
  getExtraRuns(runs, ballType) {
    if (ballType === BALL_TYPES.NORMAL) {
      return 0;
    }
    return runs;
  },

  /**
   * Generate ball commentary
   * @param {number} runs - Runs scored
   * @param {number} ballType - Ball type
   * @param {boolean} isWicket - Is wicket
   * @param {number} wicketType - Wicket type ID
   * @returns {string}
   */
  generateCommentary(runs, ballType, isWicket, wicketType) {
    if (isWicket) {
      return `OUT! ${WICKET_TYPES[wicketType]?.name || 'Wicket'}`;
    }

    const ballTypeNames = {
      [BALL_TYPES.WIDE]: 'Wide',
      [BALL_TYPES.NO_BALL]: 'No Ball',
      [BALL_TYPES.BYE]: 'Bye',
      [BALL_TYPES.LEG_BYE]: 'Leg Bye',
    };

    if (ballType !== BALL_TYPES.NORMAL) {
      return `${runs} ${ballTypeNames[ballType] || 'runs'}`;
    }

    if (runs === 0) return 'Dot ball';
    if (runs === 4) return 'FOUR!';
    if (runs === 6) return 'SIX!';
    return `${runs} run${runs > 1 ? 's' : ''}`;
  },

  /**
   * Generate short commentary for ball display
   * @param {number} runs - Runs scored
   * @param {number} ballType - Ball type
   * @returns {string}
   */
  generateShortCommentary(runs, ballType) {
    const extras = {
      [BALL_TYPES.WIDE]: 'Wd',
      [BALL_TYPES.NO_BALL]: 'Nb',
      [BALL_TYPES.BYE]: 'B',
      [BALL_TYPES.LEG_BYE]: 'Lb',
    };

    if (extras[ballType]) {
      return runs > 1 ? `${runs}${extras[ballType]}` : extras[ballType];
    }

    return runs.toString();
  },

  // ================================
  // Statistics Calculations
  // (Based on scoreBoardCtrl.js)
  // ================================

  /**
   * Calculate current run rate
   * @param {number} runs - Total runs
   * @param {number} overs - Overs bowled (decimal format)
   * @returns {string} - Run rate to 2 decimal places
   */
  calculateCRR(runs, overs) {
    if (overs <= 0) return '0.00';
    // Convert overs to balls, then to proper overs
    const overParts = overs.toString().split('.');
    const completedOvers = parseInt(overParts[0]) || 0;
    const balls = parseInt(overParts[1]) || 0;
    const totalOvers = completedOvers + balls / 6;
    
    if (totalOvers <= 0) return '0.00';
    return (runs / totalOvers).toFixed(2);
  },

  /**
   * Calculate required run rate
   * @param {number} target - Target score
   * @param {number} currentRuns - Current runs
   * @param {number} currentOvers - Current overs
   * @param {number} totalOvers - Total overs in innings
   * @returns {string} - Required run rate
   */
  calculateRRR(target, currentRuns, currentOvers, totalOvers) {
    const runsNeeded = target - currentRuns;
    if (runsNeeded <= 0) return '0.00';

    const overParts = currentOvers.toString().split('.');
    const completedOvers = parseInt(overParts[0]) || 0;
    const balls = parseInt(overParts[1]) || 0;
    const oversUsed = completedOvers + balls / 6;
    const oversRemaining = totalOvers - oversUsed;

    if (oversRemaining <= 0) return 'N/A';
    return (runsNeeded / oversRemaining).toFixed(2);
  },

  /**
   * Calculate strike rate
   * @param {number} runs - Runs scored
   * @param {number} balls - Balls faced
   * @returns {string} - Strike rate
   */
  calculateStrikeRate(runs, balls) {
    if (balls <= 0) return '0.00';
    return ((runs / balls) * 100).toFixed(2);
  },

  /**
   * Calculate economy rate
   * @param {number} runs - Runs conceded
   * @param {number} overs - Overs bowled (decimal)
   * @returns {string} - Economy rate
   */
  calculateEconomy(runs, overs) {
    if (overs <= 0) return '0.00';
    const overParts = overs.toString().split('.');
    const completedOvers = parseInt(overParts[0]) || 0;
    const balls = parseInt(overParts[1]) || 0;
    const totalOvers = completedOvers + balls / 6;

    if (totalOvers <= 0) return '0.00';
    return (runs / totalOvers).toFixed(2);
  },

  /**
   * Format overs display (e.g., 5.3 overs)
   * @param {number} balls - Total balls bowled
   * @returns {string} - Formatted overs
   */
  formatOvers(balls) {
    const overs = Math.floor(balls / 6);
    const remainingBalls = balls % 6;
    return `${overs}.${remainingBalls}`;
  },

  /**
   * Check if over is maiden
   * @param {Array} overBalls - Array of ball ticks for the over
   * @returns {boolean}
   */
  isMaidenOver(overBalls) {
    return overBalls.every(
      (ball) =>
        ball.total_runs === 0 ||
        (ball.ball_type === BALL_TYPES.BYE && ball.total_runs === 0) ||
        (ball.ball_type === BALL_TYPES.LEG_BYE && ball.total_runs === 0)
    );
  },
};

export default scoringService;
