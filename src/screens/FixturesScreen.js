import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
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

  const [refreshing, setRefreshing] = useState(false);
  const [showTournamentPicker, setShowTournamentPicker] = useState(false);

  useEffect(() => {
    dispatch(fetchTournaments());
  }, [dispatch]);

  useEffect(() => {
    if (selectedTournament) {
      dispatch(fetchFixtures(selectedTournament.id));
    }
  }, [selectedTournament, dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (selectedTournament) {
      await dispatch(fetchFixtures(selectedTournament.id));
    }
    setRefreshing(false);
  };

  const handleTournamentSelect = (tournament) => {
    dispatch(setSelectedTournament(tournament));
    setShowTournamentPicker(false);
  };

  const handleFixturePress = (fixture) => {
    dispatch(setSelectedFixture(fixture));
    
    // Navigate based on match status
    if (
      fixture.match_status === MATCH_STATUS.LIVE ||
      fixture.match_status === MATCH_STATUS.INNINGS_BREAK
    ) {
      navigation.navigate(SCREENS.SCOREBOARD, { matchId: fixture.id });
    } else {
      navigation.navigate(SCREENS.MATCH_SETUP, { matchId: fixture.id });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case MATCH_STATUS.LIVE:
      case MATCH_STATUS.INNINGS_BREAK:
        return COLORS.live;
      case MATCH_STATUS.COMPLETED:
      case MATCH_STATUS.END_OF_MATCH:
        return COLORS.completed;
      default:
        return COLORS.upcoming;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case MATCH_STATUS.LIVE:
        return 'LIVE';
      case MATCH_STATUS.INNINGS_BREAK:
        return 'INNINGS BREAK';
      case MATCH_STATUS.COMPLETED:
      case MATCH_STATUS.END_OF_MATCH:
        return 'COMPLETED';
      case MATCH_STATUS.FIXTURE:
      case MATCH_STATUS.YET_TO_START:
        return 'UPCOMING';
      default:
        return status.replace(/_/g, ' ');
    }
  };

  const renderFixtureCard = ({ item }) => (
    <TouchableOpacity
      style={styles.fixtureCard}
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
            <Text style={styles.teamScore}>{item.team1_score}</Text>
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
            <Text style={styles.teamScore}>{item.team2_score}</Text>
          )}
        </View>
      </View>

      {/* Match Info */}
      <View style={styles.matchInfo}>
        <Text style={styles.matchInfoText}>
          {item.match_date} • {item.ground_name || item.venue || 'TBD'}
        </Text>
        {item.match_no && (
          <Text style={styles.matchNumber}>Match #{item.match_no}</Text>
        )}
      </View>

      {/* Action Button */}
      <TouchableOpacity
        style={[
          styles.actionButton,
          item.match_status === MATCH_STATUS.LIVE && styles.actionButtonLive,
        ]}
        onPress={() => handleFixturePress(item)}
      >
        <Text style={styles.actionButtonText}>
          {item.match_status === MATCH_STATUS.LIVE ||
          item.match_status === MATCH_STATUS.INNINGS_BREAK
            ? 'VIEW'
            : 'START'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

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

      {/* Fixtures List */}
      <FlatList
        data={filteredFixtures}
        renderItem={renderFixtureCard}
        keyExtractor={(item) => item.id?.toString()}
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
            <Text style={styles.emptyText}>
              {selectedTournament
                ? 'No fixtures found'
                : 'Please select a tournament'}
            </Text>
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
});

export default FixturesScreen;
