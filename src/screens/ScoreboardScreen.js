import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  StatusBar,
  Text,
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
import { fetchMatch, fetchMatchScore } from '../store/slices/matchSlice';
import { scoringService } from '../services';
import { COLORS, SPACING, BALL_TYPES } from '../constants';

const ScoreboardScreen = ({ navigation, route }) => {
  const { matchId } = route.params || {};
  const dispatch = useDispatch();

  // Match state
  const { match, matchSummary, settings, selectedSquad, toss } = useSelector(
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
      console.log('🏏 Loading match score for matchId:', matchId);
      // Use the comprehensive score endpoint instead of separate calls
      dispatch(fetchMatchScore(matchId));
      
      // Note: Commenting out individual API calls that don't exist
      // dispatch(fetchMatch(matchId));
      // dispatch(fetchInningsData(matchId));
      // dispatch(fetchBallData({ matchId, innings: currentInnings }));
    }
  }, [matchId, dispatch]);

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

  if (loading && !match && !matchSummary) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // View Mode - Display match score data from API
  if (matchSummary) {
    // Try different possible field names that the API might use
    let innings1 = match?.inning1 || match?.innings1 || match?.teamInning1 || match?.firstInning;
    let innings2 = match?.inning2 || match?.innings2 || match?.teamInning2 || match?.secondInning;
    
    console.log('📊 Full match object:', JSON.stringify(match, null, 2));
    console.log('📊 Match data structure:', {
      hasMatch: !!match,
      matchKeys: match ? Object.keys(match) : [],
      hasInning1: !!innings1,
      hasInning2: !!innings2,
      inning1Keys: innings1 ? Object.keys(innings1) : [],
      inning2Keys: innings2 ? Object.keys(innings2) : [],
      inning1BatsmanCount: innings1?.batsman?.length || 0,
      inning1BowlerCount: innings1?.bowler?.length || 0,
      inning2BatsmanCount: innings2?.batsman?.length || 0,
      inning2BowlerCount: innings2?.bowler?.length || 0,
    });
    console.log('📊 matchSummary:', matchSummary);
    
    // If no innings data found, check if match has data property with innings
    if (!innings1 && match?.data) {
      innings1 = match.data.inning1 || match.data.innings1;
      innings2 = match.data.inning2 || match.data.innings2;
      console.log('📊 Checking match.data for innings:', {
        hasDataInning1: !!innings1,
        hasDataInning2: !!innings2,
      });
    }
    
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Match Header */}
          <View style={styles.matchHeader}>
            <Text style={styles.matchTitle}>
              {matchSummary.teamName1} vs {matchSummary.teamName2}
            </Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: matchSummary.matchStatus === 'LIVE' ? COLORS.live : COLORS.completed }
            ]}>
              <Text style={styles.statusText}>{matchSummary.matchStatus}</Text>
            </View>
          </View>

          {/* Match Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryText}>{matchSummary.matchSummary}</Text>
            {matchSummary.tossDetails && (
              <Text style={styles.tossText}>{matchSummary.tossDetails}</Text>
            )}
          </View>

          {/* Debug Info - Remove after testing */}
          <View style={[styles.summaryCard, { backgroundColor: '#FFF3CD', padding: 12 }]}>
            <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#856404', marginBottom: 10 }}>
              🔍 DEBUG INFO
            </Text>
            <Text style={{ fontSize: 11, color: '#856404', marginBottom: 4 }}>
              Match exists: {match ? '✅ Yes' : '❌ No'}
            </Text>
            {match && (
              <>
                <Text style={{ fontSize: 11, color: '#856404', marginBottom: 4 }}>
                  Match keys: [{Object.keys(match).join(', ')}]
                </Text>
                <Text style={{ fontSize: 11, color: '#856404', marginBottom: 8 }}>
                  Total keys: {Object.keys(match).length}
                </Text>
              </>
            )}
            <Text style={{ fontSize: 11, color: '#856404', marginBottom: 4 }}>
              Has inning1: {innings1 ? '✅ Yes' : '❌ No'}
            </Text>
            <Text style={{ fontSize: 11, color: '#856404', marginBottom: 4 }}>
              Has inning2: {innings2 ? '✅ Yes' : '❌ No'}
            </Text>
            {innings1 ? (
              <>
                <Text style={{ fontSize: 11, color: '#856404', marginBottom: 4 }}>
                  Inning1 keys: [{Object.keys(innings1).join(', ')}]
                </Text>
                <Text style={{ fontSize: 11, color: '#856404', marginBottom: 4 }}>
                  Batsmen: {innings1.batsman?.length || 0} | Bowlers: {innings1.bowler?.length || 0}
                </Text>
              </>
            ) : (
              <Text style={{ fontSize: 11, color: '#D8000C', marginBottom: 4 }}>
                ⚠️ Inning1 data is missing or empty
              </Text>
            )}
            {innings2 && (
              <>
                <Text style={{ fontSize: 11, color: '#856404', marginBottom: 4 }}>
                  Inning2 keys: [{Object.keys(innings2).join(', ')}]
                </Text>
                <Text style={{ fontSize: 11, color: '#856404', marginBottom: 4 }}>
                  Batsmen: {innings2.batsman?.length || 0} | Bowlers: {innings2.bowler?.length || 0}
                </Text>
              </>
            )}
          </View>

          {/* Team 1 Score */}
          <View style={styles.teamScoreCard}>
            <View style={styles.teamHeader}>
              <Text style={styles.teamName}>{matchSummary.teamName1}</Text>
              <Text style={styles.teamScore}>
                {matchSummary.teamScore1} {matchSummary.teamOver1}
              </Text>
            </View>
            {matchSummary.crr1 > 0 && (
              <Text style={styles.runRateText}>Run Rate: {matchSummary.crr1.toFixed(2)}</Text>
            )}
            {matchSummary.teamExtraDet1 && (
              <Text style={styles.extrasText}>Extras: {matchSummary.teamExtraDet1}</Text>
            )}
          </View>

          {/* Innings 1 - Batsmen */}
          {innings1?.batsman && innings1.batsman.length > 0 ? (
            <View style={styles.inningsSection}>
              <Text style={styles.inningsSectionTitle}>
                {matchSummary.teamName1} - Batting
              </Text>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, { flex: 2 }]}>Batsman</Text>
                <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>R</Text>
                <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>B</Text>
                <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>4s</Text>
                <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>6s</Text>
                <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>SR</Text>
              </View>
              {innings1.batsman.map((bat, index) => (
                <View key={bat.batsmanId || index} style={styles.tableRow}>
                  <View style={{ flex: 2 }}>
                    <Text style={styles.playerName}>{bat.batsmanName}</Text>
                    {bat.outDetail && (
                      <Text style={styles.outDetail}>{bat.outDetail}</Text>
                    )}
                  </View>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{bat.runs}</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{bat.balls}</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{bat.runs4}</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{bat.runs6}</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{bat.strikeRate?.toFixed(0)}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={[styles.summaryCard, { backgroundColor: '#f8d7da', borderColor: '#f5c6cb' }]}>
              <Text style={{ fontSize: 12, color: '#721c24', textAlign: 'center' }}>
                ℹ️ No batting details available for {matchSummary.teamName1}
              </Text>
              <Text style={{ fontSize: 10, color: '#721c24', textAlign: 'center', marginTop: 4 }}>
                {!innings1 ? 'Innings data not found in API response' : 'No batsmen recorded yet'}
              </Text>
            </View>
          )}

          {/* Innings 1 - Bowlers */}
          {innings1?.bowler && innings1.bowler.length > 0 ? (
            <View style={styles.inningsSection}>
              <Text style={styles.inningsSectionTitle}>
                {matchSummary.teamName2} - Bowling
              </Text>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, { flex: 2 }]}>Bowler</Text>
                <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>O</Text>
                <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>R</Text>
                <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>W</Text>
                <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>Econ</Text>
              </View>
              {innings1.bowler.map((bowl, index) => (
                <View key={bowl.bowlerId || index} style={styles.tableRow}>
                  <Text style={[styles.playerName, { flex: 2 }]}>{bowl.bowlerName}</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{bowl.overs}</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{bowl.runs}</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{bowl.wicket}</Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{bowl.econ?.toFixed(1)}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={[styles.summaryCard, { backgroundColor: '#f8d7da', borderColor: '#f5c6cb' }]}>
              <Text style={{ fontSize: 12, color: '#721c24', textAlign: 'center' }}>
                ℹ️ No bowling details available for {matchSummary.teamName2}
              </Text>
              <Text style={{ fontSize: 10, color: '#721c24', textAlign: 'center', marginTop: 4 }}>
                {!innings1 ? 'Innings data not found in API response' : 'No bowlers recorded yet'}
              </Text>
            </View>
          )}

          {/* Innings 1 - Fall of Wickets */}
          {innings1?.fow && innings1.fow.length > 0 && (
            <View style={styles.inningsSection}>
              <Text style={styles.inningsSectionTitle}>Fall of Wickets</Text>
              <View style={styles.fowContainer}>
                {innings1.fow.map((f, index) => (
                  <Text key={index} style={styles.fowText}>
                    {f.fow}
                  </Text>
                ))}
              </View>
            </View>
          )}

          {/* Team 2 Score */}
          {matchSummary.teamScore2 && (
            <>
              <View style={styles.teamScoreCard}>
                <View style={styles.teamHeader}>
                  <Text style={styles.teamName}>{matchSummary.teamName2}</Text>
                  <Text style={styles.teamScore}>
                    {matchSummary.teamScore2} {matchSummary.teamOver2}
                  </Text>
                </View>
                {matchSummary.crr2 > 0 && (
                  <View style={styles.runRateRow}>
                    <Text style={styles.runRateText}>Run Rate: {matchSummary.crr2.toFixed(2)}</Text>
                    {matchSummary.target > 0 && matchSummary.matchStatus === 'LIVE' && (
                      <Text style={styles.requiredRrText}>
                        Required RR: {matchSummary.requiredRr.toFixed(2)}
                      </Text>
                    )}
                  </View>
                )}
                {matchSummary.teamExtraDet2 && (
                  <Text style={styles.extrasText}>Extras: {matchSummary.teamExtraDet2}</Text>
                )}
              </View>

              {/* Innings 2 - Batsmen */}
              {innings2?.batsman && innings2.batsman.length > 0 ? (
                <View style={styles.inningsSection}>
                  <Text style={styles.inningsSectionTitle}>
                    {matchSummary.teamName2} - Batting
                  </Text>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderText, { flex: 2 }]}>Batsman</Text>
                    <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>R</Text>
                    <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>B</Text>
                    <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>4s</Text>
                    <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>6s</Text>
                    <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>SR</Text>
                  </View>
                  {innings2.batsman.map((bat, index) => (
                    <View key={bat.batsmanId || index} style={styles.tableRow}>
                      <View style={{ flex: 2 }}>
                        <Text style={styles.playerName}>{bat.batsmanName}</Text>
                        {bat.outDetail && (
                          <Text style={styles.outDetail}>{bat.outDetail}</Text>
                        )}
                      </View>
                      <Text style={[styles.tableCell, { flex: 1 }]}>{bat.runs}</Text>
                      <Text style={[styles.tableCell, { flex: 1 }]}>{bat.balls}</Text>
                      <Text style={[styles.tableCell, { flex: 1 }]}>{bat.runs4}</Text>
                      <Text style={[styles.tableCell, { flex: 1 }]}>{bat.runs6}</Text>
                      <Text style={[styles.tableCell, { flex: 1 }]}>{bat.strikeRate?.toFixed(0)}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={[styles.summaryCard, { backgroundColor: '#f8d7da', borderColor: '#f5c6cb' }]}>
                  <Text style={{ fontSize: 12, color: '#721c24', textAlign: 'center' }}>
                    ℹ️ No batting details available for {matchSummary.teamName2}
                  </Text>
                  <Text style={{ fontSize: 10, color: '#721c24', textAlign: 'center', marginTop: 4 }}>
                    {!innings2 ? 'Innings data not found in API response' : 'No batsmen recorded yet'}
                  </Text>
                </View>
              )}

              {/* Innings 2 - Bowlers */}
              {innings2?.bowler && innings2.bowler.length > 0 ? (
                <View style={styles.inningsSection}>
                  <Text style={styles.inningsSectionTitle}>
                    {matchSummary.teamName1} - Bowling
                  </Text>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderText, { flex: 2 }]}>Bowler</Text>
                    <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>O</Text>
                    <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>R</Text>
                    <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>W</Text>
                    <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>Econ</Text>
                  </View>
                  {innings2.bowler.map((bowl, index) => (
                    <View key={bowl.bowlerId || index} style={styles.tableRow}>
                      <Text style={[styles.playerName, { flex: 2 }]}>{bowl.bowlerName}</Text>
                      <Text style={[styles.tableCell, { flex: 1 }]}>{bowl.overs}</Text>
                      <Text style={[styles.tableCell, { flex: 1 }]}>{bowl.runs}</Text>
                      <Text style={[styles.tableCell, { flex: 1 }]}>{bowl.wicket}</Text>
                      <Text style={[styles.tableCell, { flex: 1 }]}>{bowl.econ?.toFixed(1)}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={[styles.summaryCard, { backgroundColor: '#f8d7da', borderColor: '#f5c6cb' }]}>
                  <Text style={{ fontSize: 12, color: '#721c24', textAlign: 'center' }}>
                    ℹ️ No bowling details available for {matchSummary.teamName1}
                  </Text>
                  <Text style={{ fontSize: 10, color: '#721c24', textAlign: 'center', marginTop: 4 }}>
                    {!innings2 ? 'Innings data not found in API response' : 'No bowlers recorded yet'}
                  </Text>
                </View>
              )}

              {/* Innings 2 - Fall of Wickets */}
              {innings2?.fow && innings2.fow.length > 0 && (
                <View style={styles.inningsSection}>
                  <Text style={styles.inningsSectionTitle}>Fall of Wickets</Text>
                  <View style={styles.fowContainer}>
                    {innings2.fow.map((f, index) => (
                      <Text key={index} style={styles.fowText}>
                        {f.fow}
                      </Text>
                    ))}
                  </View>
                </View>
              )}
            </>
          )}

          {/* Target Info */}
          {matchSummary.target > 0 && (
            <View style={styles.targetCard}>
              <Text style={styles.targetText}>Target: {matchSummary.target}</Text>
            </View>
          )}

          {/* Man of the Match */}
          {matchSummary.momName && (
            <View style={styles.momCard}>
              <Text style={styles.momLabel}>Man of the Match</Text>
              <Text style={styles.momName}>{matchSummary.momName}</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Scoring Mode - Active scoring interface
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
  // View Mode Styles
  matchHeader: {
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  matchTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  summaryCard: {
    backgroundColor: '#FFF',
    margin: SPACING.md,
    padding: SPACING.lg,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  tossText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  teamScoreCard: {
    backgroundColor: '#FFF',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  teamScore: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  runRateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  runRateText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  requiredRrText: {
    fontSize: 14,
    color: COLORS.live,
    fontWeight: 'bold',
  },
  targetCard: {
    backgroundColor: '#FFF3CD',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  targetText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
  },
  momCard: {
    backgroundColor: '#D4EDDA',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  momLabel: {
    fontSize: 14,
    color: '#155724',
    marginBottom: SPACING.xs,
  },
  momName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#155724',
  },
  // Innings Display Styles
  inningsSection: {
    backgroundColor: '#FFF',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inningsSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderRadius: 6,
    marginBottom: SPACING.xs,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    alignItems: 'center',
  },
  playerName: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  outDetail: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  tableCell: {
    fontSize: 14,
    color: COLORS.text,
    textAlign: 'center',
  },
  extrasText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  fowContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  fowText: {
    fontSize: 13,
    color: COLORS.text,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 6,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
});

export default ScoreboardScreen;
