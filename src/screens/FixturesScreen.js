import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchTournaments,
  fetchFixtures,
  setSelectedTournament,
  setSelectedFixture,
  setFilterStatus,
  selectFilteredFixtures,
} from '../store/slices/fixtureSlice';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS, MATCH_STATUS } from '../constants';
import { SCREENS } from '../navigation';
import { logout } from '../store/slices/authSlice';
import { liveMatchService } from '../services';

const FixturesScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const {
    tournaments,
    selectedTournament,
    loading,
    error,
    filterStatus,
  } = useSelector((state) => state.fixture);
  const filteredFixtures = useSelector(selectFilteredFixtures);
  const { user } = useSelector((state) => state.auth);

  const [refreshing, setRefreshing] = useState(false);
  const [showTournamentPicker, setShowTournamentPicker] = useState(false);
  const [liveMatches, setLiveMatches] = useState([]);
  const [loadingLive, setLoadingLive] = useState(false);

  // Debug: Track state changes
  useEffect(() => {
    console.log('📊 State Update:');
    console.log('   Tournaments:', tournaments.length);
    console.log('   Selected Tournament:', selectedTournament?.name || selectedTournament?.tourName || 'None');
    console.log('   Fixtures:', filteredFixtures.length);
    console.log('   Live Matches:', liveMatches.length);
    console.log('   Filter Status:', filterStatus);
    console.log('   Loading:', loading);
    console.log('   Error:', error || 'None');
  }, [tournaments, selectedTournament, filteredFixtures, liveMatches, filterStatus, loading, error]);

  // Merge live matches with fixtures based on current filter
  const getMergedFixtures = () => {
    // Log all live matches for debugging
    if (liveMatches.length > 0) {
      console.log('🟢 Total live matches to transform:', liveMatches.length);
    }
    
    // Transform live matches to fixture format
    const transformedLiveMatches = liveMatches.map(match => {
      // Log raw match data
      console.log('🟡 Raw match object:', {
        matchId: match.matchId,
        matchStatus: match.matchStatus,
        status: match.status,
        match_status: match.match_status,
        allKeys: Object.keys(match),
        fullMatch: JSON.stringify(match),
      });
      
      // Extract status from various possible field names
      const status = match.matchStatus || match.status || match.match_status || 'COMPLETED';
      
      console.log('🎯 Match status mapping:', {
        matchId: match.matchId,
        originalStatus: match.matchStatus,
        mappedStatus: status,
        teamName1: match.teamName1,
        teamName2: match.teamName2,
      });
      
      return {
        id: match.matchId,
        matchId: match.matchId,
        team1_name: match.teamName1,
        team2_name: match.teamName2,
        team1_score: match.teamScore1,
        team2_score: match.teamScore2,
        team1_over: match.teamOver1,
        team2_over: match.teamOver2,
        match_status: status,
        match_summary: match.matchSummary,
        toss_details: match.tossDetails,
        isLiveMatch: true, // Flag to identify live matches
      };
    });

    // Merge based on filter
    if (filterStatus === 'all') {
      // Show all matches (from API + fixtures) regardless of status
      return [...transformedLiveMatches, ...filteredFixtures];
    } else if (filterStatus === 'live') {
      // Only show matches with LIVE or INNINGS_BREAK status
      const liveOnly = transformedLiveMatches.filter(m => {
        const statusUpper = (m.match_status || '').toString().toUpperCase();
        return statusUpper === 'LIVE' || statusUpper === 'INNINGS_BREAK';
      });
      console.log('🔴 Live filter applied. Total:', transformedLiveMatches.length, '→ Live only:', liveOnly.length);
      return liveOnly;
    } else if (filterStatus === 'completed') {
      // Show completed matches from API + completed fixtures
      const completedLive = transformedLiveMatches.filter(m => {
        const statusUpper = (m.match_status || '').toString().toUpperCase();
        return statusUpper === 'COMPLETED' || statusUpper === 'END_OF_MATCH';
      });
      console.log('🟢 Completed filter applied. Total:', transformedLiveMatches.length, '→ Completed:', completedLive.length);
      return [...completedLive, ...filteredFixtures];
    } else if (filterStatus === 'upcoming') {
      // Show upcoming matches from API + upcoming fixtures
      const upcomingLive = transformedLiveMatches.filter(m => {
        const statusUpper = (m.match_status || '').toString().toUpperCase();
        return statusUpper === 'UPCOMING' || statusUpper === 'YET_TO_START' || statusUpper === 'FIXTURE';
      });
      console.log('🟡 Upcoming filter applied. Total:', transformedLiveMatches.length, '→ Upcoming:', upcomingLive.length);
      return [...upcomingLive, ...filteredFixtures];
    } else {
      // Default: show only fixtures
      return filteredFixtures;
    }
  };

  const displayFixtures = getMergedFixtures();
  
  // Log final display count
  console.log('🎬 RENDERING FixturesScreen:');
  console.log('   Display Fixtures Count:', displayFixtures.length);
  console.log('   Filter Status:', filterStatus);
  console.log('   Loading:', loading);
  console.log('   Loading Live:', loadingLive);

  // Set up header with logout button
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={handleLogout}
          style={{ paddingRight: 15 }}
        >
          <Text style={{ color: COLORS.white, fontSize: 16, fontWeight: '600' }}>
            Logout
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    console.log('🚀 FixturesScreen mounted - initializing data');
    console.log('   User:', user?.username || 'Not logged in');
    
    // Load all tournaments
    console.log('📋 Dispatching fetchTournaments...');
    dispatch(fetchTournaments());
    
    // Fetch live matches on mount
    console.log('🏏 Loading live matches...');
    loadLiveMatches();
  }, [dispatch]);

  // Auto-select first tournament if none selected
  useEffect(() => {
    console.log('🔄 Tournaments changed:', tournaments.length, 'tournaments');
    if (!selectedTournament && tournaments.length > 0) {
      console.log('🎯 Auto-selecting first tournament:', tournaments[0].name || tournaments[0].tourName);
      dispatch(setSelectedTournament(tournaments[0]));
    } else if (!selectedTournament && tournaments.length === 0) {
      console.warn('⚠️ No tournaments available to select');
    }
  }, [tournaments, selectedTournament, dispatch]);

  useEffect(() => {
    if (selectedTournament) {
      console.log('🎪 Selected tournament changed:', selectedTournament.name || selectedTournament.tourName);
      console.log('   Fetching fixtures for tournament ID:', selectedTournament.id);
      dispatch(fetchFixtures(selectedTournament.id));
    } else {
      console.log('⚠️ No tournament selected yet');
    }
  }, [selectedTournament, dispatch]);

  // Load live matches
  const loadLiveMatches = async () => {
    try {
      console.log('🏏 loadLiveMatches: Starting...');
      setLoadingLive(true);
      const matches = await liveMatchService.getLiveMatches();
      console.log('✅ Live matches received:', matches.length);
      if (matches.length > 0) {
        console.log('📄 First match sample:', JSON.stringify(matches[0], null, 2));
      } else {
        console.warn('⚠️ No live matches returned from API');
      }
      setLiveMatches(matches);
    } catch (err) {
      console.error('❌ Failed to load live matches:', err.message);
      console.error('   Error details:', err);
    } finally {
      setLoadingLive(false);
      console.log('🏏 loadLiveMatches: Complete');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    
    // Refresh tournaments and matches
    await Promise.all([
      dispatch(fetchTournaments()),
      selectedTournament ? dispatch(fetchFixtures(selectedTournament.id)) : Promise.resolve(),
      loadLiveMatches(),
    ]);
    
    setRefreshing(false);
  };

  const handleTournamentSelect = (tournament) => {
    dispatch(setSelectedTournament(tournament));
    setShowTournamentPicker(false);
  };

  const handleFixturePress = (fixture) => {
    dispatch(setSelectedFixture(fixture));
    
    const statusUpper = (fixture.match_status || '').toString().toUpperCase();
    
    console.log('🎯 Match tapped:', {
      matchId: fixture.id || fixture.matchId,
      status: fixture.match_status,
      statusUpper,
      isLiveMatch: fixture.isLiveMatch,
    });
    
    // Navigate based on match status
    // LIVE or INNINGS_BREAK or COMPLETED → Scoreboard (view live or completed match)
    // UPCOMING → Match Setup (configure and start the match)
    if (
      statusUpper === 'LIVE' ||
      statusUpper === 'INNINGS_BREAK' ||
      statusUpper === 'COMPLETED' ||
      statusUpper === 'END_OF_MATCH' ||
      fixture.match_status === MATCH_STATUS.LIVE ||
      fixture.match_status === MATCH_STATUS.INNINGS_BREAK ||
      fixture.match_status === MATCH_STATUS.COMPLETED ||
      fixture.match_status === MATCH_STATUS.END_OF_MATCH
    ) {
      console.log('→ Navigating to SCOREBOARD');
      navigation.navigate(SCREENS.SCOREBOARD, { matchId: fixture.id || fixture.matchId });
    } else {
      console.log('→ Navigating to MATCH_SETUP');
      navigation.navigate(SCREENS.MATCH_SETUP, { matchId: fixture.id || fixture.matchId });
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            dispatch(logout());
          },
        },
      ],
      { cancelable: true }
    );
  };

  const getStatusColor = (status) => {
    if (!status) return COLORS.upcoming;
    
    // Handle both MATCH_STATUS constants and API string values
    const statusUpper = status.toUpperCase ? status.toUpperCase() : String(status).toUpperCase();
    
    switch (statusUpper) {
      case 'LIVE':
      case 'INNINGS_BREAK':
      case MATCH_STATUS.LIVE:
      case MATCH_STATUS.INNINGS_BREAK:
        return COLORS.live;
      case 'COMPLETED':
      case 'END_OF_MATCH':
      case MATCH_STATUS.COMPLETED:
      case MATCH_STATUS.END_OF_MATCH:
        return COLORS.completed;
      default:
        return COLORS.upcoming;
    }
  };

  const getStatusText = (status) => {
    if (!status) return 'UPCOMING';
    
    // Handle both MATCH_STATUS constants and API string values
    const statusUpper = status.toUpperCase ? status.toUpperCase() : String(status).toUpperCase();
    
    switch (statusUpper) {
      case 'LIVE':
      case MATCH_STATUS.LIVE:
        return 'LIVE';
      case 'INNINGS_BREAK':
      case MATCH_STATUS.INNINGS_BREAK:
        return 'INNINGS BREAK';
      case 'COMPLETED':
      case 'END_OF_MATCH':
      case MATCH_STATUS.COMPLETED:
      case MATCH_STATUS.END_OF_MATCH:
        return 'COMPLETED';
      case 'FIXTURE':
      case 'YET_TO_START':
      case 'UPCOMING':
      case MATCH_STATUS.FIXTURE:
      case MATCH_STATUS.YET_TO_START:
        return 'UPCOMING';
      default:
        return status.toString().replace(/_/g, ' ');
    }
  };

  const renderFixtureCard = ({ item }) => {
    const isLive = item.isLiveMatch || 
                   item.match_status === 'LIVE' || 
                   item.match_status === MATCH_STATUS.LIVE;
    
    return (
      <TouchableOpacity
        style={[
          styles.fixtureCard,
          isLive && styles.fixtureCardLive, // Highlight live matches
        ]}
        onPress={() => handleFixturePress(item)}
      >
        {/* Status Badge */}
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.match_status) },
          ]}
        >
          <Text style={styles.statusText}>{getStatusText(item.match_status)}</Text>
        </View>

        {/* Match Summary for live matches */}
        {item.match_summary && (
          <Text style={styles.matchSummaryText} numberOfLines={1}>
            {item.match_summary}
          </Text>
        )}

        {/* Teams */}
        <View style={styles.teamsContainer}>
          <View style={styles.teamRow}>
            <View style={styles.teamLogo}>
              <Text style={styles.teamInitial}>
                {item.team1_short_name?.[0] || item.team1_name?.[0] || 'T1'}
              </Text>
            </View>
            <Text style={styles.teamName} numberOfLines={1}>
              {item.team1_name || 'Team 1'}
            </Text>
            {item.team1_score && (
              <View style={styles.scoreWithOvers}>
                <Text style={styles.teamScore}>{item.team1_score}</Text>
                {item.team1_over && (
                  <Text style={styles.teamOvers}> {item.team1_over}</Text>
                )}
              </View>
            )}
          </View>

          <Text style={styles.vsText}>vs</Text>

          <View style={styles.teamRow}>
            <View style={styles.teamLogo}>
              <Text style={styles.teamInitial}>
                {item.team2_short_name?.[0] || item.team2_name?.[0] || 'T2'}
              </Text>
            </View>
            <Text style={styles.teamName} numberOfLines={1}>
              {item.team2_name || 'Team 2'}
            </Text>
            {item.team2_score && (
              <View style={styles.scoreWithOvers}>
                <Text style={styles.teamScore}>{item.team2_score}</Text>
                {item.team2_over && (
                  <Text style={styles.teamOvers}> {item.team2_over}</Text>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Match Info */}
        <View style={styles.matchInfo}>
          <Text style={styles.matchInfoText}>
            {item.match_date || ''} {item.match_date && '•'} {item.ground_name || item.venue || (item.toss_details ? '' : 'TBD')}
          </Text>
          {item.match_no && (
            <Text style={styles.matchNumber}>Match #{item.match_no}</Text>
          )}
          {item.toss_details && (
            <Text style={styles.tossDetailsText} numberOfLines={1}>
              {item.toss_details}
            </Text>
          )}
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            isLive && styles.actionButtonLive,
          ]}
          onPress={() => handleFixturePress(item)}
        >
          <Text style={styles.actionButtonText}>
            {isLive || item.match_status === MATCH_STATUS.INNINGS_BREAK
              ? 'VIEW'
              : 'START'}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderFilterTabs = () => (
    <View style={styles.filterTabs}>
      {['all', 'live', 'upcoming', 'completed'].map((status) => (
        <TouchableOpacity
          key={status}
          style={[
            styles.filterTab,
            filterStatus === status && styles.filterTabActive,
          ]}
          onPress={() => dispatch(setFilterStatus(status))}
        >
          <Text
            style={[
              styles.filterTabText,
              filterStatus === status && styles.filterTabTextActive,
            ]}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderTournamentSelector = () => (
    <TouchableOpacity
      style={styles.tournamentSelector}
      onPress={() => setShowTournamentPicker(!showTournamentPicker)}
    >
      <Text style={styles.tournamentSelectorText}>
        {selectedTournament?.name || 'Select Tournament'}
      </Text>
      <Text style={styles.dropdownIcon}>▼</Text>
    </TouchableOpacity>
  );

  const renderTournamentPicker = () => {
    if (!showTournamentPicker) return null;

    return (
      <View style={styles.tournamentPicker}>
        {tournaments.map((tournament) => (
          <TouchableOpacity
            key={tournament.id}
            style={[
              styles.tournamentOption,
              selectedTournament?.id === tournament.id &&
                styles.tournamentOptionSelected,
            ]}
            onPress={() => handleTournamentSelect(tournament)}
          >
            <Text
              style={[
                styles.tournamentOptionText,
                selectedTournament?.id === tournament.id &&
                  styles.tournamentOptionTextSelected,
              ]}
            >
              {tournament.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (loading && !refreshing && filteredFixtures.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading fixtures...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tournament Selector */}
      {renderTournamentSelector()}
      {renderTournamentPicker()}

      {/* Filter Tabs */}
      {renderFilterTabs()}

      {/* Unified Fixtures List (includes live matches) */}
      <FlatList
        data={displayFixtures}
        renderItem={renderFixtureCard}
        keyExtractor={(item) => `${item.id || item.matchId}-${item.isLiveMatch ? 'live' : 'fixture'}`}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {loadingLive ? (
              <>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.emptyText}>Loading matches...</Text>
              </>
            ) : (
              <Text style={styles.emptyText}>
                {selectedTournament
                  ? `No ${filterStatus === 'all' ? '' : filterStatus} matches found`
                  : 'Please select a tournament'}
              </Text>
            )}
          </View>
        }
      />
    </View>
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
  loadingText: {
    marginTop: SPACING.md,
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.md,
  },
  tournamentSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.sm,
  },
  tournamentSelectorText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    fontWeight: '600',
  },
  dropdownIcon: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  tournamentPicker: {
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.md,
    maxHeight: 200,
  },
  tournamentOption: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tournamentOptionSelected: {
    backgroundColor: COLORS.primary + '20',
  },
  tournamentOptionText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
  },
  tournamentOptionTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  filterTabs: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  filterTab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.sm,
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
  },
  filterTabText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: COLORS.white,
  },
  tournamentFilterButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tournamentFilterLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  tournamentFilterValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  tournamentFilterValue: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    fontWeight: '600',
    marginRight: SPACING.xs,
    maxWidth: '80%',
  },
  tournamentFilterPicker: {
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.md,
    maxHeight: 300,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tournamentFilterOption: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tournamentFilterOptionSelected: {
    backgroundColor: COLORS.primary + '15',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  tournamentFilterOptionText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  tournamentFilterOptionTextSelected: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  tournamentFilterOptionSubText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  tournamentFilterOptionStatus: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textLight,
    marginTop: 2,
    fontStyle: 'italic',
  },
  selectedTournamentBadge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '15',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  selectedTournamentText: {
    flex: 1,
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  clearFilterButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  clearFilterText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.white,
    fontWeight: '600',
  },
  orgFilterBadge: {
    backgroundColor: COLORS.primary + '15',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  orgFilterText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.primary,
    fontWeight: '500',
  },
  listContent: {
    padding: SPACING.md,
  },
  fixtureCard: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  fixtureCardLive: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.live,
    backgroundColor: COLORS.live + '08', // Light tint for live matches
  },
  matchSummaryText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  scoreWithOvers: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  teamOvers: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  tossDetailsText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
    fontStyle: 'italic',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.md,
  },
  statusText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.xs,
    fontWeight: 'bold',
  },
  teamsContainer: {
    marginBottom: SPACING.md,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  teamLogo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  teamInitial: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  teamName: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  teamScore: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  vsText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingVertical: SPACING.xs,
  },
  matchInfo: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  matchInfoText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  matchNumber: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  actionButtonLive: {
    backgroundColor: COLORS.live,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  // Live Matches Styles
  liveMatchesSection: {
    marginBottom: SPACING.lg,
  },
  liveMatchesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  liveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.live,
    marginRight: SPACING.sm,
  },
  liveMatchesTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  liveMatchesCount: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  liveMatchCard: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.live,
    ...SHADOWS.md,
  },
  liveTeamRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  liveTeamName: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
    marginRight: SPACING.md,
  },
  liveScoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  liveScore: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginRight: SPACING.xs,
  },
  liveOvers: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  liveMatchSummary: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  liveBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.live + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  liveBadgeText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '700',
    color: COLORS.live,
  },
  loadingLiveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  loadingLiveText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
});

export default FixturesScreen;
