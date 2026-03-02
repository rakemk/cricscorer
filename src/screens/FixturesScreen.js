import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  fetchFixturesV2,
  setSelectedFixture,
} from '../store/slices/fixtureSlice';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, API_CONFIG } from '../constants';
import { SCREENS } from '../navigation';

// Base URL for team logo images
const ASSET_BASE = API_CONFIG.ASSET_BASE_URL;

const TABS = {
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  RESULT: 'result',
};

const FixturesScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { fixtures, loading, error } = useSelector((state) => state.fixture);

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(TABS.IN_PROGRESS);

  // Get tournament data from route params
  const tournament = route?.params?.tournament;
  const tournamentId = route?.params?.tournamentId || tournament?.tour_id || tournament?.id;
  const tournamentName =
    route?.params?.tournamentName ||
    tournament?.tour_name ||
    tournament?.tourName ||
    tournament?.name ||
    'Fixtures';

  // Load fixtures when screen mounts or tournament changes
  useEffect(() => {
    if (tournamentId) {
      console.log('🏏 Loading fixtures for tournament:', tournamentId);
      dispatch(fetchFixturesV2(tournamentId));
    }
  }, [tournamentId, dispatch]);

  // Filter fixtures based on active tab
  const getFilteredFixtures = useCallback(() => {
    if (!fixtures || !Array.isArray(fixtures)) return [];

    return fixtures.filter((f) => {
      const status = (f.match_status || f.status || '')
        .toString()
        .toUpperCase();

      if (activeTab === TABS.IN_PROGRESS) {
        return (
          status === 'FIXTURE' ||
          status === 'YET_TO_START' ||
          status === 'LIVE' ||
          status === 'INNINGS_BREAK' ||
          status === 'DRINK_BREAK' ||
          status === 'TEA_BREAK' ||
          status === 'LUNCH_BREAK' ||
          status === 'STOPPED_DUE_TO_RAIN' ||
          status === 'DELAYED_DUE_TO_BAD_WEATHER'
        );
      }

      if (activeTab === TABS.COMPLETED) {
        return status === 'COMPLETED' || status === 'END_OF_MATCH';
      }

      if (activeTab === TABS.RESULT) {
        return (
          status === 'COMPLETED' ||
          status === 'END_OF_MATCH' ||
          status === 'ABANDONED'
        );
      }

      return false;
    });
  }, [fixtures, activeTab]);

  const displayFixtures = getFilteredFixtures();

  const onRefresh = async () => {
    setRefreshing(true);
    if (tournamentId) {
      await dispatch(fetchFixturesV2(tournamentId));
    }
    setRefreshing(false);
  };

  const handleFixturePress = (fixture) => {
    dispatch(setSelectedFixture(fixture));

    const statusUpper = (fixture.match_status || fixture.status || '')
      .toString()
      .toUpperCase();

    const matchId = fixture.match_id || fixture.id || fixture.matchId;

    console.log('🎯 Match tapped:', { matchId, status: statusUpper });

    if (
      statusUpper === 'LIVE' ||
      statusUpper === 'INNINGS_BREAK' ||
      statusUpper === 'COMPLETED' ||
      statusUpper === 'END_OF_MATCH'
    ) {
      navigation.navigate(SCREENS.SCOREBOARD, {
        matchId,
        fixtureData: {
          teamName1: fixture.team_name1 || fixture.team1_name,
          teamName2: fixture.team_name2 || fixture.team2_name,
          teamScore1: fixture.team1_score,
          teamScore2: fixture.team2_score,
          teamOver1: fixture.team1_over,
          teamOver2: fixture.team2_over,
          matchStatus: fixture.match_status || fixture.status,
          matchSummary: fixture.match_summary,
          matchId,
        },
      });
    } else {
      navigation.navigate(SCREENS.MATCH_SETUP, { matchId });
    }
  };

  // ─── Helpers ───

  const getStatusColor = (status) => {
    if (!status) return COLORS.upcoming || '#17a2b8';
    const s = status.toString().toUpperCase();
    if (s === 'LIVE' || s === 'INNINGS_BREAK') return COLORS.live || '#28a745';
    if (s === 'COMPLETED' || s === 'END_OF_MATCH')
      return COLORS.completed || '#6c757d';
    if (s === 'FIXTURE') return '#337ab7';
    if (s === 'YET_TO_START') return '#5bc0de';
    return '#17a2b8';
  };

  const getStatusText = (status) => {
    if (!status) return 'UPCOMING';
    return status.toString().toUpperCase().replace(/ /g, '_');
  };

  const getActionButtonText = (status) => {
    if (!status) return 'START';
    const s = status.toString().toUpperCase();
    if (s === 'LIVE' || s === 'INNINGS_BREAK') return 'VIEW LIVE';
    if (s === 'COMPLETED' || s === 'END_OF_MATCH') return 'VIEW RESULT';
    return 'START';
  };

  // ─── Match Card (matching the shared image UI) ───

  // Build full logo URL from relative path
  const getLogoUrl = (relativePath) => {
    if (!relativePath) return null;
    if (relativePath.startsWith('http')) return relativePath;
    return `${ASSET_BASE}${relativePath}`;
  };

  const renderFixtureCard = ({ item }) => {
    const matchStatus = item.match_status || item.status || '';
    const statusUpper = matchStatus.toString().toUpperCase();
    const isLive = statusUpper === 'LIVE' || statusUpper === 'INNINGS_BREAK';

    // Map V2 API fields: match_id, match_name, team_name1, team_name2, team_logo1, team_logo2
    const matchId = item.match_id || item.id || item.matchId;
    const matchName = item.match_name || '';
    const tourName = tournamentName || item.tournament_name || item.tourName || '';
    const matchDate = item.match_date || item.matchDate || '';
    const venue = item.ground_name || item.venue || item.groundName || '';
    const matchType = item.match_type || item.matchType || 'Group';
    const team1 = item.team_name1 || item.team1_name || item.teamName1 || 'Team 1';
    const team2 = item.team_name2 || item.team2_name || item.teamName2 || 'Team 2';
    const logo1 = getLogoUrl(item.team_logo1 || item.team1_logo);
    const logo2 = getLogoUrl(item.team_logo2 || item.team2_logo);

    // Header line: "4SPL 1 , Match #:686"
    const headerLine = `${tourName}${matchId ? `, Match #:${matchId}` : ''}`;
    // Venue line: "2025-12-28 03:00 PM, Pitch 1, Chikuwadi..."
    const venueLine = [matchDate, venue].filter(Boolean).join(', ');

    return (
      <View style={[styles.matchCard, isLive && styles.matchCardLive]}>
        {/* Row 1: Tournament + Match # | Status Badge */}
        <View style={styles.matchCardHeader}>
          <Text style={styles.matchTournamentText} numberOfLines={1}>
            {headerLine}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(matchStatus) },
            ]}
          >
            <Text style={styles.statusBadgeText}>
              {getStatusText(matchStatus)}
            </Text>
          </View>
        </View>

        {/* Row 2: Date & Venue (red/orange text) */}
        {venueLine ? (
          <Text style={styles.matchVenueText} numberOfLines={2}>
            {venueLine}
          </Text>
        ) : null}

        {/* Row 3: Match Type (centered) */}
        <Text style={styles.matchTypeText}>{matchType}</Text>

        {/* Row 4: Team logos + Team1 v/s Team2 */}
        <View style={styles.teamsRow}>
          {logo1 ? (
            <Image source={{ uri: logo1 }} style={styles.teamLogo} resizeMode="contain" />
          ) : null}
          <Text style={styles.teamNameText} numberOfLines={1}>
            {team1}
          </Text>
          <Text style={styles.vsText}>v/s</Text>
          <Text style={[styles.teamNameText, { textAlign: 'right' }]} numberOfLines={1}>
            {team2}
          </Text>
          {logo2 ? (
            <Image source={{ uri: logo2 }} style={styles.teamLogo} resizeMode="contain" />
          ) : null}
        </View>

        {/* Scores (visible for live/completed) */}
        {(item.team1_score || item.team2_score) && (
          <View style={styles.scoresRow}>
            <Text style={styles.scoreText}>
              {item.team1_score || '-'}
              {item.team1_over ? ` (${item.team1_over})` : ''}
            </Text>
            <Text style={styles.scoreSeparator}>-</Text>
            <Text style={styles.scoreText}>
              {item.team2_score || '-'}
              {item.team2_over ? ` (${item.team2_over})` : ''}
            </Text>
          </View>
        )}

        {/* Match Summary (completed) */}
        {item.match_summary && (
          <Text style={styles.matchSummaryText} numberOfLines={2}>
            {item.match_summary}
          </Text>
        )}

        {/* START / VIEW Button (centered) */}
        <TouchableOpacity
          style={[
            styles.startButton,
            isLive && styles.startButtonLive,
            (statusUpper === 'COMPLETED' || statusUpper === 'END_OF_MATCH') &&
              styles.startButtonCompleted,
          ]}
          onPress={() => handleFixturePress(item)}
          activeOpacity={0.7}
        >
          <Text style={styles.startButtonText}>
            {getActionButtonText(matchStatus)}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // ─── Tabs: In Progress | Completed | Result ───

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === TABS.IN_PROGRESS && styles.tabActive,
        ]}
        onPress={() => setActiveTab(TABS.IN_PROGRESS)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === TABS.IN_PROGRESS && styles.tabTextActive,
          ]}
        >
          In Progress
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === TABS.COMPLETED && styles.tabActive]}
        onPress={() => setActiveTab(TABS.COMPLETED)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === TABS.COMPLETED && styles.tabTextActive,
          ]}
        >
          Completed
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === TABS.RESULT && styles.tabActive]}
        onPress={() => setActiveTab(TABS.RESULT)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === TABS.RESULT && styles.tabTextActive,
          ]}
        >
          Result
        </Text>
      </TouchableOpacity>
    </View>
  );

  // ─── Loading ───

  if (loading && !refreshing && fixtures.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading matches...</Text>
      </View>
    );
  }

  // ─── Main Render ───

  return (
    <View style={styles.container}>
      {renderTabs()}

      <FlatList
        data={displayFixtures}
        renderItem={renderFixtureCard}
        keyExtractor={(item, index) =>
          `${item.id || item.matchId || item.match_id || index}`
        }
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name={
                activeTab === TABS.RESULT
                  ? 'trophy-outline'
                  : activeTab === TABS.COMPLETED
                  ? 'check-circle-outline'
                  : 'cricket'
              }
              size={48}
              color={COLORS.textSecondary}
            />
            <Text style={styles.emptyText}>
              {activeTab === TABS.IN_PROGRESS
                ? 'No matches in progress'
                : activeTab === TABS.COMPLETED
                ? 'No completed matches'
                : 'No results yet'}
            </Text>
            <Text style={styles.emptySubText}>Pull down to refresh</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

// ═══════════════════════════════════════════
// STYLES — matching the shared image design
// ═══════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  loadingText: {
    marginTop: SPACING.md,
    color: COLORS.textSecondary,
    fontSize: 14,
  },

  // ─── Tabs ───
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#e67e22',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: '#e67e22',
    fontWeight: '600',
  },

  // ─── List ───
  listContent: {
    padding: SPACING.md,
    flexGrow: 1,
  },

  // ─── Match Card ───
  matchCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  matchCardLive: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.live || '#28a745',
  },
  matchCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  matchTournamentText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    marginRight: SPACING.sm,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  matchVenueText: {
    fontSize: 12,
    color: '#d9534f',
    marginBottom: SPACING.sm,
    lineHeight: 18,
  },
  matchTypeText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  teamsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  teamLogo: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginHorizontal: 4,
  },
  teamNameText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
  },
  vsText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginHorizontal: SPACING.md,
    fontWeight: '400',
  },
  scoresRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  scoreText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  scoreSeparator: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginHorizontal: SPACING.sm,
  },
  matchSummaryText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  startButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: BORDER_RADIUS.md,
    alignSelf: 'center',
  },
  startButtonLive: {
    backgroundColor: COLORS.live || '#28a745',
  },
  startButtonCompleted: {
    backgroundColor: COLORS.completed || '#6c757d',
  },
  startButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },

  // ─── Empty ───
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    fontWeight: '500',
  },
  emptySubText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },

  // ─── Error ───
  errorBanner: {
    backgroundColor: COLORS.danger,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  errorText: {
    color: COLORS.white,
    fontSize: 12,
    textAlign: 'center',
  },
});

export default FixturesScreen;
