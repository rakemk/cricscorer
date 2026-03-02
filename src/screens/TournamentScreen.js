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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { fetchTournaments, setSelectedTournament } from '../store/slices/fixtureSlice';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../constants';

const TournamentScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { tournaments, loading, error } = useSelector((state) => state.fixture);
  const [refreshing, setRefreshing] = useState(false);

  // Load all tournaments directly — no org filter
  const loadTournaments = async () => {
    try {
      await dispatch(fetchTournaments()).unwrap();
    } catch (err) {
      console.error('❌ Error loading tournaments:', err);
    }
  };

  useEffect(() => {
    loadTournaments();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTournaments();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return dateString;
    }
  };

  const handleTournamentPress = (tournament) => {
    const name = tournament.tour_name || tournament.tourName || tournament.name || 'Tournament';
    const id = tournament.tour_id || tournament.id;
    dispatch(setSelectedTournament(tournament));
    navigation.navigate('FixturesList', {
      tournament,
      tournamentId: id,
      tournamentName: name,
    });
  };

  const renderTournamentItem = ({ item }) => {
    const tournamentName = item.tour_name || item.tourName || item.name || 'Unnamed Tournament';
    const shortName = item.short_name || '';
    const organizer = item.organizer_name || '';
    const location = item.location || '';
    const startDate = item.start_date || item.tourStartAt || item.startDate;
    const endDate = item.end_date;
    const description = item.tour_desc || '';

    // Date range line
    const dateLine = [
      startDate ? formatDate(startDate) : '',
      endDate ? formatDate(endDate) : '',
    ].filter(Boolean).join(' - ');

    // Info line: location + organizer
    const infoLine = [location, organizer].filter(Boolean).join('  •  ');

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleTournamentPress(item)}
        activeOpacity={0.7}
      >
        {/* Row 1: Name + Short Name badge */}
        <View style={styles.cardHeader}>
          <Text style={styles.tournamentName} numberOfLines={2}>
            {tournamentName}
          </Text>
          {shortName ? (
            <View style={styles.shortNameBadge}>
              <Text style={styles.shortNameText}>{shortName}</Text>
            </View>
          ) : null}
        </View>

        {/* Row 2: Date range */}
        {dateLine ? (
          <Text style={styles.dateText}>{dateLine}</Text>
        ) : null}

        {/* Row 3: Location + Organizer */}
        {infoLine ? (
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={14} color="#999" style={{ marginRight: 4 }} />
            <Text style={styles.infoText} numberOfLines={1}>{infoLine}</Text>
          </View>
        ) : null}

        {/* Row 4: Description if available */}
        {description ? (
          <Text style={styles.descText} numberOfLines={1}>{description}</Text>
        ) : null}

        {/* View Matches button */}
        <View style={styles.viewMatchesRow}>
          <TouchableOpacity
            style={styles.viewMatchesBtn}
            onPress={() => handleTournamentPress(item)}
          >
            <Text style={styles.viewMatchesBtnText}>VIEW MATCHES</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="trophy-outline" size={64} color="#ccc" />
      <Text style={styles.emptyText}>No tournaments available</Text>
      <Text style={styles.emptySubText}>Pull down to refresh</Text>
      {error && (
        <Text style={[styles.emptySubText, { color: '#dc3545', marginTop: 12 }]}>
          {error}
        </Text>
      )}
    </View>
  );

  if (loading && !refreshing && tournaments.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading tournaments...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={tournaments}
        renderItem={renderTournamentItem}
        keyExtractor={(item) => (item.tour_id || item.id)?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
  },
  listContent: {
    paddingVertical: 8,
    flexGrow: 1,
  },
  // ─── Card ───
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 14,
    marginVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 14,
    ...SHADOWS.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  tournamentName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginRight: 8,
  },
  shortNameBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  shortNameText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  dateText: {
    fontSize: 12,
    color: '#c0392b',
    marginBottom: 4,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#777',
    flex: 1,
  },
  descText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  viewMatchesRow: {
    alignItems: 'center',
    marginTop: 8,
  },
  viewMatchesBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 28,
    paddingVertical: 8,
    borderRadius: 6,
  },
  viewMatchesBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  // ─── Empty ───
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
    textAlign: 'center',
  },
});

export default TournamentScreen;
