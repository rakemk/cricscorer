import React, { useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import {
  ScoreHeader,
  BatsmenPanel,
  BowlerPanel,
  BallCommentary,
  RunButtons,
  ActionButtons,
} from '../components';
import {
  fetchInningsData,
  fetchBallData,
  submitBallTick,
  undoLastBall,
  recordBallLocally,
  swapBatsmen,
  endOver,
  setActiveModal,
  addRuns,
  addWicket,
  addBall,
  selectCurrentScore,
  selectStrikerStats,
  selectNonStrikerStats,
  selectCurrentBowlerStats,
} from '../store/slices/scoringSlice';
import { fetchMatch } from '../store/slices/matchSlice';
import { scoringService } from '../services';
import { COLORS, SPACING, BALL_TYPES } from '../constants';

const ScoreboardScreen = ({ navigation, route }) => {
  const { matchId } = route.params || {};
  const dispatch = useDispatch();

  // Match state
  const { match, settings, selectedSquad, toss } = useSelector(
    (state) => state.match
  );

  // Scoring state
  const {
    currentInnings,
    teamRuns,
    teamWickets,
    teamOvers,
    striker,
    nonStriker,
    currentBowler,
    currentOverBalls,
    ballTicks,
    target,
    loading,
  } = useSelector((state) => state.scoring);

  // Derived stats
  const strikerStats = useSelector(selectStrikerStats);
  const nonStrikerStats = useSelector(selectNonStrikerStats);
  const bowlerStats = useSelector(selectCurrentBowlerStats);

  // Determine batting/bowling teams based on toss
  const battingTeamId =
    currentInnings === 0
      ? toss.elected === 'bat'
        ? toss.winner
        : toss.winner === match?.team1_id
        ? match?.team2_id
        : match?.team1_id
      : toss.elected === 'bat'
      ? toss.winner === match?.team1_id
        ? match?.team2_id
        : match?.team1_id
      : toss.winner;

  const battingTeam =
    battingTeamId === match?.team1_id
      ? { id: match?.team1_id, name: match?.team1_name }
      : { id: match?.team2_id, name: match?.team2_name };

  const bowlingTeam =
    battingTeamId === match?.team1_id
      ? { id: match?.team2_id, name: match?.team2_name }
      : { id: match?.team1_id, name: match?.team1_name };

  useEffect(() => {
    if (matchId) {
      dispatch(fetchMatch(matchId));
      dispatch(fetchInningsData(matchId));
      dispatch(fetchBallData({ matchId, innings: currentInnings }));
    }
  }, [matchId, dispatch, currentInnings]);

  // Handle scoring a ball
  const handleScore = useCallback(
    async ({ runs, ballType }) => {
      if (!striker || !currentBowler) {
        Alert.alert(
          'Select Players',
          'Please select the striker and bowler first.'
        );
        return;
      }

      const isLegal = !scoringService.isNonLegalBall(ballType);

      // Create ball tick
      const ballTick = scoringService.createBallTick({
        innings: currentInnings,
        over: Math.floor(teamOvers[currentInnings] / 6),
        ball: (teamOvers[currentInnings] % 6) + 1,
        batsmanId: striker.id,
        nonStrikerId: nonStriker?.id,
        bowlerId: currentBowler.id,
        runs,
        ballType,
        teamRuns: teamRuns[currentInnings] + runs,
        teamWickets: teamWickets[currentInnings],
      });

      // Update local state immediately
      dispatch(recordBallLocally(ballTick));
      dispatch(addRuns({ runs, innings: currentInnings }));
      dispatch(addBall({ isLegal, innings: currentInnings }));

      // Check for end of over
      const ballsInOver = currentOverBalls.length + 1;
      if (isLegal && ballsInOver >= 6) {
        handleEndOver();
      }

      // Submit to API
      if (matchId) {
        dispatch(submitBallTick({ matchId, tickData: ballTick }));
      }
    },
    [
      dispatch,
      matchId,
      currentInnings,
      striker,
      nonStriker,
      currentBowler,
      teamRuns,
      teamOvers,
      teamWickets,
      currentOverBalls,
    ]
  );

  // Handle wicket
  const handleWicket = useCallback(() => {
    if (!striker) {
      Alert.alert('Error', 'No striker selected');
      return;
    }
    dispatch(setActiveModal('wicket'));
  }, [dispatch, striker]);

  // Handle undo
  const handleUndo = useCallback(() => {
    const currentBalls = ballTicks[currentInnings];
    if (currentBalls.length === 0) {
      Alert.alert('Cannot Undo', 'No balls to undo');
      return;
    }

    const lastBall = currentBalls[currentBalls.length - 1];
    if (lastBall.trans_id && matchId) {
      Alert.alert('Undo Last Ball', 'Are you sure you want to undo the last ball?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Undo',
          style: 'destructive',
          onPress: () => {
            dispatch(undoLastBall({ matchId, transId: lastBall.trans_id }));
          },
        },
      ]);
    }
  }, [dispatch, matchId, ballTicks, currentInnings]);

  // Handle end of over
  const handleEndOver = useCallback(() => {
    dispatch(endOver());
    dispatch(setActiveModal('changeBowler'));
  }, [dispatch]);

  // Handle swap batsmen
  const handleSwapBatsmen = useCallback(() => {
    dispatch(swapBatsmen());
  }, [dispatch]);

  // Handle change bowler
  const handleChangeBowler = useCallback(() => {
    dispatch(setActiveModal('changeBowler'));
  }, [dispatch]);

  // Handle end innings
  const handleEndInnings = useCallback(() => {
    Alert.alert(
      'End Innings',
      'Are you sure you want to end the current innings?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Innings',
          onPress: () => {
            dispatch(setActiveModal('endInnings'));
          },
        },
      ]
    );
  }, [dispatch]);

  // Handle pause
  const handlePause = useCallback(() => {
    dispatch(setActiveModal('pause'));
  }, [dispatch]);

  // Handle end match
  const handleEndMatch = useCallback(() => {
    Alert.alert('End Match', 'Are you sure you want to end this match?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'End Match',
        style: 'destructive',
        onPress: () => {
          dispatch(setActiveModal('endMatch'));
        },
      },
    ]);
  }, [dispatch]);

  const canUndo = ballTicks[currentInnings]?.length > 0;
  const legalBallsInOver = currentOverBalls.filter(
    (b) => !scoringService.isNonLegalBall(b.ball_type)
  ).length;
  const canEndOver = legalBallsInOver >= 6;

  if (loading && !match) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Score Header */}
        <ScoreHeader
          battingTeam={battingTeam}
          bowlingTeam={bowlingTeam}
          runs={teamRuns[currentInnings]}
          wickets={teamWickets[currentInnings]}
          overs={teamOvers[currentInnings]}
          target={target}
          currentInnings={currentInnings}
          totalOvers={settings?.ttl_over || 20}
        />

        {/* Batsmen Panel */}
        <BatsmenPanel
          striker={striker}
          nonStriker={nonStriker}
          strikerStats={strikerStats}
          nonStrikerStats={nonStrikerStats}
          onSwapBatsmen={handleSwapBatsmen}
        />

        {/* Bowler Panel */}
        <BowlerPanel
          bowler={currentBowler}
          bowlerStats={bowlerStats}
          onChangeBowler={handleChangeBowler}
        />

        {/* Ball Commentary */}
        <BallCommentary balls={currentOverBalls} maxBalls={6} />

        {/* Run Buttons */}
        <RunButtons onScore={handleScore} disabled={loading} />

        {/* Action Buttons */}
        <ActionButtons
          onWicket={handleWicket}
          onUndo={handleUndo}
          onEndOver={handleEndOver}
          onEndInnings={handleEndInnings}
          onEndMatch={handleEndMatch}
          onPause={handlePause}
          canUndo={canUndo}
          canEndOver={canEndOver}
          disabled={loading}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
});

export default ScoreboardScreen;
