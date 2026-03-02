import React, { useEffect, useCallback, useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  StatusBar,
  Text,
  TouchableOpacity,
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
  const { matchId, fixtureData } = route.params || {};
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
    // Skip API call if fixture data is already passed from the list screen
    if (fixtureData) {
      console.log('🏏 Using fixture data from route params, skipping API call');
      return;
    }
    if (matchId) {
      console.log('🏏 Loading match score for matchId:', matchId);
      // Use the comprehensive score endpoint instead of separate calls
      dispatch(fetchMatchScore(matchId));
    }
  }, [matchId, fixtureData, dispatch]);

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

  // Use fixtureData from route params or matchSummary from Redux
  const displaySummary = matchSummary || fixtureData;

  if (loading && !match && !displaySummary) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // View Mode - Display match score data (from route params or API)
  if (displaySummary) {
    return (
      <MatchViewMode
        match={match}
        matchSummary={displaySummary}
      />
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

// ============================================================
// MatchViewMode - Tabbed view for live/completed match display
// ============================================================
const VIEW_TABS = ['Info', 'Live', 'Scoreboard', 'Commentary', 'Team', 'Recent'];

const MatchViewMode = ({ match, matchSummary }) => {
  const [activeTab, setActiveTab] = useState('Live');

  const innings1 = match?.inning1 || match?.innings1 || match?.teamInning1 || match?.firstInning || match?.data?.inning1;
  const innings2 = match?.inning2 || match?.innings2 || match?.teamInning2 || match?.secondInning || match?.data?.inning2;

  // Determine which innings is currently active (2nd if it exists, else 1st)
  const isSecondInnings = !!(innings2?.batsman && innings2.batsman.length > 0);
  const currentInnings = isSecondInnings ? innings2 : innings1;
  const currentBattingTeam = isSecondInnings ? matchSummary.teamName2 : matchSummary.teamName1;
  const currentBowlingTeam = isSecondInnings ? matchSummary.teamName1 : matchSummary.teamName2;

  // Current batsmen at crease (not out)
  const currentBatsmen = useMemo(() => {
    if (!currentInnings?.batsman) return [];
    return currentInnings.batsman.filter(b => !b.outDetail || b.outDetail === '' || b.outDetail === 'not out');
  }, [currentInnings]);

  // Current bowler (last bowler in the list)
  const currentBowler = useMemo(() => {
    if (!currentInnings?.bowler || currentInnings.bowler.length === 0) return null;
    return currentInnings.bowler[currentInnings.bowler.length - 1];
  }, [currentInnings]);

  // Calculate live stats
  const target = matchSummary.target || 0;
  const totalOvers = matchSummary.totalOvers || matchSummary.ttlOver || 20;

  // Parse current score and overs for second innings
  const parseScore = (scoreStr) => {
    if (!scoreStr) return { runs: 0, wickets: 0 };
    const parts = String(scoreStr).split('/');
    return { runs: parseInt(parts[0]) || 0, wickets: parseInt(parts[1]) || 0 };
  };
  const parseOvers = (overStr) => {
    if (!overStr) return 0;
    const cleaned = String(overStr).replace(/[()]/g, '').trim();
    // Handle format like "0.3/6" or "5/6" or just "5.3"
    const slashParts = cleaned.split('/');
    return parseFloat(slashParts[0]) || 0;
  };
  const parseTotalOversFromStr = (overStr) => {
    if (!overStr) return totalOvers;
    const cleaned = String(overStr).replace(/[()]/g, '').trim();
    const slashParts = cleaned.split('/');
    if (slashParts.length > 1) return parseInt(slashParts[1]) || totalOvers;
    return totalOvers;
  };

  const currentScore = isSecondInnings
    ? parseScore(matchSummary.teamScore2)
    : parseScore(matchSummary.teamScore1);
  const currentOversVal = isSecondInnings
    ? parseOvers(matchSummary.teamOver2)
    : parseOvers(matchSummary.teamOver1);
  const matchTotalOvers = isSecondInnings
    ? parseTotalOversFromStr(matchSummary.teamOver2)
    : parseTotalOversFromStr(matchSummary.teamOver1);

  const runsNeeded = target > 0 ? Math.max(0, target - currentScore.runs) : 0;
  const totalBalls = matchTotalOvers * 6;
  const ballsBowled = Math.floor(currentOversVal) * 6 + Math.round((currentOversVal % 1) * 10);
  const ballsRemain = Math.max(0, totalBalls - ballsBowled);
  const rrr = ballsRemain > 0 ? ((runsNeeded / ballsRemain) * 6).toFixed(2) : '0.00';
  const crr = isSecondInnings ? matchSummary.crr2 : matchSummary.crr1;

  // Recent balls from the current innings (last over data from ball ticks)
  const recentBalls = useMemo(() => {
    if (!currentInnings?.recentBalls && !currentInnings?.lastOver && !match?.recentBalls) return [];
    return currentInnings?.recentBalls || currentInnings?.lastOver || match?.recentBalls || [];
  }, [currentInnings, match]);

  const getBallColor = (ball) => {
    const label = String(ball.label || ball.run || ball.runs || ball).toUpperCase();
    if (label.includes('W') || label.includes('WKT')) return '#dc3545';
    if (label.includes('NB') || label.includes('WD')) return '#ffc107';
    if (label === '4') return '#17a2b8';
    if (label === '6') return '#28a745';
    if (label === '0') return '#6c757d';
    return COLORS.primary;
  };

  const getBallLabel = (ball) => {
    if (typeof ball === 'object') return String(ball.label || ball.run || ball.runs || '0');
    return String(ball);
  };

  // ---- Tab Content Renderers ----

  const renderInfoTab = () => (
    <View style={viewStyles.tabContent}>
      <View style={viewStyles.infoCard}>
        <Text style={viewStyles.infoCardTitle}>{matchSummary.teamName1} vs {matchSummary.teamName2}</Text>
        <View style={[viewStyles.statusBadge, { backgroundColor: matchSummary.matchStatus === 'LIVE' ? COLORS.live : COLORS.completed }]}>
          <Text style={viewStyles.statusBadgeText}>{matchSummary.matchStatus}</Text>
        </View>
        {matchSummary.matchSummary && (
          <Text style={viewStyles.infoSummary}>{matchSummary.matchSummary}</Text>
        )}
        {matchSummary.tossDetails && (
          <Text style={viewStyles.infoToss}>{matchSummary.tossDetails}</Text>
        )}
        {matchSummary.momName && (
          <View style={viewStyles.momBox}>
            <Text style={viewStyles.momLabel}>Man of the Match</Text>
            <Text style={viewStyles.momName}>{matchSummary.momName}</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderLiveTab = () => (
    <View style={viewStyles.tabContent}>
      {/* Score Header Card */}
      <View style={viewStyles.scoreHeaderCard}>
        <View style={viewStyles.scoreRow}>
          {/* Team 1 */}
          <View style={viewStyles.scoreTeam}>
            <View style={viewStyles.teamBadge}>
              <Text style={viewStyles.teamBadgeText}>{matchSummary.teamName1?.[0] || 'T'}</Text>
            </View>
            <Text style={viewStyles.scoreTeamName} numberOfLines={1}>{matchSummary.teamName1}</Text>
            <Text style={viewStyles.scoreTeamScore}>{matchSummary.teamScore1 || '-'}</Text>
            {matchSummary.teamOver1 ? (
              <Text style={viewStyles.scoreTeamOvers}>{matchSummary.teamOver1}</Text>
            ) : null}
          </View>

          {/* Team 2 */}
          <View style={viewStyles.scoreTeam}>
            <View style={[viewStyles.teamBadge, { backgroundColor: '#e74c3c' }]}>
              <Text style={viewStyles.teamBadgeText}>{matchSummary.teamName2?.[0] || 'T'}</Text>
            </View>
            <Text style={viewStyles.scoreTeamName} numberOfLines={1}>{matchSummary.teamName2}</Text>
            <Text style={viewStyles.scoreTeamScore}>{matchSummary.teamScore2 || '-'}</Text>
            {matchSummary.teamOver2 ? (
              <Text style={viewStyles.scoreTeamOvers}>{matchSummary.teamOver2}</Text>
            ) : null}
          </View>
        </View>
      </View>

      {/* Match Stats Bar */}
      <View style={viewStyles.statsCard}>
        <Text style={viewStyles.statsTeamName}>{currentBattingTeam}</Text>
        <View style={viewStyles.statsRow}>
          {isSecondInnings && target > 0 && (
            <View style={viewStyles.statItem}>
              <Text style={viewStyles.statLabel}>Runs Needs</Text>
              <Text style={viewStyles.statValue}>{runsNeeded}</Text>
            </View>
          )}
          <View style={viewStyles.statItem}>
            <Text style={viewStyles.statLabel}>Balls Remain</Text>
            <Text style={viewStyles.statValue}>{ballsRemain}</Text>
          </View>
          <View style={viewStyles.statItem}>
            <Text style={viewStyles.statLabel}>RRR</Text>
            <Text style={viewStyles.statValue}>{isSecondInnings && target > 0 ? rrr : (crr?.toFixed(2) || '0.00')}</Text>
          </View>
        </View>
      </View>

      {/* Current Batsmen Panel */}
      <View style={viewStyles.panelCard}>
        <View style={viewStyles.panelHeader}>
          <Text style={[viewStyles.panelHeaderText, { flex: 2 }]}>Batting</Text>
          <Text style={viewStyles.panelHeaderText}>R</Text>
          <Text style={viewStyles.panelHeaderText}>B</Text>
          <Text style={viewStyles.panelHeaderText}>4s</Text>
          <Text style={viewStyles.panelHeaderText}>6s</Text>
          <Text style={viewStyles.panelHeaderText}>SR</Text>
        </View>
        {currentBatsmen.length > 0 ? (
          currentBatsmen.slice(0, 2).map((bat, i) => (
            <View key={bat.batsmanId || i} style={viewStyles.panelRow}>
              <Text style={[viewStyles.panelPlayerName, { flex: 2 }]} numberOfLines={1}>{bat.batsmanName}</Text>
              <Text style={viewStyles.panelCell}>{bat.runs}</Text>
              <Text style={viewStyles.panelCell}>{bat.balls}</Text>
              <Text style={viewStyles.panelCell}>{bat.runs4}</Text>
              <Text style={viewStyles.panelCell}>{bat.runs6}</Text>
              <Text style={viewStyles.panelCell}>{bat.strikeRate?.toFixed(0) || 0}</Text>
            </View>
          ))
        ) : (
          <Text style={viewStyles.noDataText}>No batsmen at crease</Text>
        )}
      </View>

      {/* Current Bowler Panel */}
      {currentBowler && (
        <View style={viewStyles.panelCard}>
          <View style={viewStyles.panelHeader}>
            <Text style={[viewStyles.panelHeaderText, { flex: 2 }]}>Bowling</Text>
            <Text style={viewStyles.panelHeaderText}>O</Text>
            <Text style={viewStyles.panelHeaderText}>R</Text>
            <Text style={viewStyles.panelHeaderText}>W</Text>
            <Text style={viewStyles.panelHeaderText}>Econ</Text>
          </View>
          <View style={viewStyles.panelRow}>
            <Text style={[viewStyles.panelPlayerName, { flex: 2 }]} numberOfLines={1}>{currentBowler.bowlerName}</Text>
            <Text style={viewStyles.panelCell}>{currentBowler.overs}</Text>
            <Text style={viewStyles.panelCell}>{currentBowler.runs}</Text>
            <Text style={viewStyles.panelCell}>{currentBowler.wicket}</Text>
            <Text style={viewStyles.panelCell}>{currentBowler.econ?.toFixed(1)}</Text>
          </View>
        </View>
      )}

      {/* Recent Balls */}
      {recentBalls.length > 0 && (
        <View style={viewStyles.panelCard}>
          <Text style={viewStyles.recentLabel}>Recent</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={viewStyles.recentRow}>
              {recentBalls.map((ball, i) => {
                const label = getBallLabel(ball);
                return (
                  <View key={i} style={[viewStyles.recentBall, { backgroundColor: getBallColor(ball) }]}>
                    <Text style={viewStyles.recentBallText}>{label}</Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );

  const renderInningsTable = (innings, battingTeamName, bowlingTeamName) => {
    if (!innings) return <Text style={viewStyles.noDataText}>Innings data not available</Text>;
    return (
      <>
        {/* Batsmen */}
        {innings.batsman && innings.batsman.length > 0 && (
          <View style={viewStyles.panelCard}>
            <Text style={viewStyles.sectionTitle}>{battingTeamName} - Batting</Text>
            <View style={viewStyles.panelHeader}>
              <Text style={[viewStyles.panelHeaderText, { flex: 2 }]}>Batsman</Text>
              <Text style={viewStyles.panelHeaderText}>R</Text>
              <Text style={viewStyles.panelHeaderText}>B</Text>
              <Text style={viewStyles.panelHeaderText}>4s</Text>
              <Text style={viewStyles.panelHeaderText}>6s</Text>
              <Text style={viewStyles.panelHeaderText}>SR</Text>
            </View>
            {innings.batsman.map((bat, index) => (
              <View key={bat.batsmanId || index} style={viewStyles.panelRow}>
                <View style={{ flex: 2 }}>
                  <Text style={viewStyles.panelPlayerName}>{bat.batsmanName}</Text>
                  {bat.outDetail ? <Text style={viewStyles.outDetail}>{bat.outDetail}</Text> : null}
                </View>
                <Text style={viewStyles.panelCell}>{bat.runs}</Text>
                <Text style={viewStyles.panelCell}>{bat.balls}</Text>
                <Text style={viewStyles.panelCell}>{bat.runs4}</Text>
                <Text style={viewStyles.panelCell}>{bat.runs6}</Text>
                <Text style={viewStyles.panelCell}>{bat.strikeRate?.toFixed(0)}</Text>
              </View>
            ))}
            {innings.extras && (
              <Text style={viewStyles.extrasText}>Extras: {innings.extras}</Text>
            )}
          </View>
        )}
        {/* Bowlers */}
        {innings.bowler && innings.bowler.length > 0 && (
          <View style={viewStyles.panelCard}>
            <Text style={viewStyles.sectionTitle}>{bowlingTeamName} - Bowling</Text>
            <View style={viewStyles.panelHeader}>
              <Text style={[viewStyles.panelHeaderText, { flex: 2 }]}>Bowler</Text>
              <Text style={viewStyles.panelHeaderText}>O</Text>
              <Text style={viewStyles.panelHeaderText}>R</Text>
              <Text style={viewStyles.panelHeaderText}>W</Text>
              <Text style={viewStyles.panelHeaderText}>Econ</Text>
            </View>
            {innings.bowler.map((bowl, index) => (
              <View key={bowl.bowlerId || index} style={viewStyles.panelRow}>
                <Text style={[viewStyles.panelPlayerName, { flex: 2 }]}>{bowl.bowlerName}</Text>
                <Text style={viewStyles.panelCell}>{bowl.overs}</Text>
                <Text style={viewStyles.panelCell}>{bowl.runs}</Text>
                <Text style={viewStyles.panelCell}>{bowl.wicket}</Text>
                <Text style={viewStyles.panelCell}>{bowl.econ?.toFixed(1)}</Text>
              </View>
            ))}
          </View>
        )}
        {/* Fall of Wickets */}
        {innings.fow && innings.fow.length > 0 && (
          <View style={viewStyles.panelCard}>
            <Text style={viewStyles.sectionTitle}>Fall of Wickets</Text>
            <View style={viewStyles.fowWrap}>
              {innings.fow.map((f, i) => (
                <Text key={i} style={viewStyles.fowChip}>{f.fow}</Text>
              ))}
            </View>
          </View>
        )}
      </>
    );
  };

  const renderScoreboardTab = () => (
    <View style={viewStyles.tabContent}>
      {/* Team 1 Score Card */}
      <View style={viewStyles.teamScoreBlock}>
        <Text style={viewStyles.teamScoreBlockName}>{matchSummary.teamName1}</Text>
        <Text style={viewStyles.teamScoreBlockScore}>
          {matchSummary.teamScore1} {matchSummary.teamOver1}
        </Text>
      </View>
      {renderInningsTable(innings1, matchSummary.teamName1, matchSummary.teamName2)}

      {/* Team 2 Score Card */}
      {matchSummary.teamScore2 && (
        <>
          <View style={[viewStyles.teamScoreBlock, { marginTop: SPACING.md }]}>
            <Text style={viewStyles.teamScoreBlockName}>{matchSummary.teamName2}</Text>
            <Text style={viewStyles.teamScoreBlockScore}>
              {matchSummary.teamScore2} {matchSummary.teamOver2}
            </Text>
          </View>
          {renderInningsTable(innings2, matchSummary.teamName2, matchSummary.teamName1)}
        </>
      )}

      {matchSummary.target > 0 && (
        <View style={viewStyles.targetBox}>
          <Text style={viewStyles.targetBoxText}>Target: {matchSummary.target}</Text>
        </View>
      )}
    </View>
  );

  const renderCommentaryTab = () => (
    <View style={viewStyles.tabContent}>
      <View style={viewStyles.infoCard}>
        {matchSummary.matchSummary && (
          <Text style={viewStyles.infoSummary}>{matchSummary.matchSummary}</Text>
        )}
        <Text style={viewStyles.noDataText}>Ball-by-ball commentary coming soon</Text>
      </View>
    </View>
  );

  const renderTeamTab = () => {
    const renderTeamList = (innings, teamName) => {
      if (!innings?.batsman || innings.batsman.length === 0) {
        return <Text style={viewStyles.noDataText}>No player data for {teamName}</Text>;
      }
      return (
        <View style={viewStyles.panelCard}>
          <Text style={viewStyles.sectionTitle}>{teamName}</Text>
          {innings.batsman.map((bat, i) => (
            <View key={bat.batsmanId || i} style={viewStyles.teamPlayerRow}>
              <Text style={viewStyles.teamPlayerNumber}>{i + 1}</Text>
              <Text style={viewStyles.teamPlayerName}>{bat.batsmanName}</Text>
            </View>
          ))}
        </View>
      );
    };
    return (
      <View style={viewStyles.tabContent}>
        {renderTeamList(innings1, matchSummary.teamName1)}
        {renderTeamList(innings2, matchSummary.teamName2)}
      </View>
    );
  };

  const renderRecentTab = () => (
    <View style={viewStyles.tabContent}>
      {recentBalls.length > 0 ? (
        <View style={viewStyles.panelCard}>
          <Text style={viewStyles.sectionTitle}>Recent Deliveries</Text>
          <View style={viewStyles.recentGrid}>
            {recentBalls.map((ball, i) => {
              const label = getBallLabel(ball);
              return (
                <View key={i} style={[viewStyles.recentBallLarge, { backgroundColor: getBallColor(ball) }]}>
                  <Text style={viewStyles.recentBallLargeText}>{label}</Text>
                </View>
              );
            })}
          </View>
        </View>
      ) : (
        <Text style={viewStyles.noDataText}>No recent ball data available</Text>
      )}
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Info': return renderInfoTab();
      case 'Live': return renderLiveTab();
      case 'Scoreboard': return renderScoreboardTab();
      case 'Commentary': return renderCommentaryTab();
      case 'Team': return renderTeamTab();
      case 'Recent': return renderRecentTab();
      default: return renderLiveTab();
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Tab Bar */}
      <View style={viewStyles.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={viewStyles.tabBarScroll}>
          {VIEW_TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[viewStyles.tab, activeTab === tab && viewStyles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[viewStyles.tabText, activeTab === tab && viewStyles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tab Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {renderTabContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

// MatchViewMode styles
const viewStyles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabBarScroll: {
    paddingHorizontal: 4,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 2,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  tabContent: {
    padding: SPACING.md,
  },

  // Score Header Card
  scoreHeaderCard: {
    backgroundColor: '#f0f3f7',
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scoreTeam: {
    flex: 1,
    alignItems: 'center',
  },
  teamBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  teamBadgeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scoreTeamName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  scoreTeamScore: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  scoreTeamOvers: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Stats Card
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statsTeamName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
  },

  // Panel Card (batting / bowling tables)
  panelCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  panelHeader: {
    flexDirection: 'row',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 2,
  },
  panelHeaderText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  panelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  panelPlayerName: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  panelCell: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: '500',
  },
  outDetail: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  extrasText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    paddingBottom: SPACING.xs,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },

  // Recent Balls
  recentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  recentRow: {
    flexDirection: 'row',
    gap: 8,
  },
  recentBall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentBallText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  recentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: SPACING.sm,
  },
  recentBallLarge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentBallLargeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // FOW
  fowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: SPACING.xs,
  },
  fowChip: {
    fontSize: 12,
    color: COLORS.text,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  // Team Score Block
  teamScoreBlock: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  teamScoreBlockName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  teamScoreBlockScore: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },

  // Info Card
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: SPACING.md,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoSummary: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  infoToss: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  momBox: {
    marginTop: SPACING.md,
    backgroundColor: '#D4EDDA',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  momLabel: {
    fontSize: 12,
    color: '#155724',
  },
  momName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#155724',
  },
  targetBox: {
    backgroundColor: '#FFF3CD',
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  targetBoxText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#856404',
  },
  noDataText: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    paddingVertical: SPACING.md,
  },

  // Team tab
  teamPlayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  teamPlayerNumber: {
    width: 28,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  teamPlayerName: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
});

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
