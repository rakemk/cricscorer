import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Image,
  Linking,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { fetchTournamentsByOrg, fetchTournaments } from '../store/slices/fixtureSlice';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../constants';

const TournamentScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { tournaments, loading, error } = useSelector((state) => state.fixture);
  const { user } = useSelector((state) => state.auth);
  const [refreshing, setRefreshing] = useState(false);

  const loadTournaments = async () => {
    try {
      if (user?.orgId) {
        console.log('🏆 Loading tournaments for orgId:', user.orgId);
        await dispatch(fetchTournamentsByOrg(user.orgId)).unwrap();
        console.log('✅ Tournaments loaded successfully (org-specific)');
      } else {
        console.warn('⚠️ No orgId found, loading all tournaments');
        await dispatch(fetchTournaments()).unwrap();
        console.log('✅ Tournaments loaded successfully (all tournaments)');
      }
    } catch (err) {
      console.error('❌ Error loading tournaments:', err);
      // If org-specific fails, try loading all tournaments as fallback
      if (user?.orgId) {
        console.log('🔄 Retrying with all tournaments...');
        try {
          await dispatch(fetchTournaments()).unwrap();
          console.log('✅ Fallback successful - loaded all tournaments');
        } catch (fallbackErr) {
          console.error('❌ Fallback also failed:', fallbackErr);
        }
      }
    }
  };

  useEffect(() => {
    console.log('🎬 TournamentScreen mounted/updated');
    console.log('   User:', user?.username || 'Not logged in');
    console.log('   OrgId:', user?.orgId || 'No orgId');
    loadTournaments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.orgId]); // Reload when orgId changes

  // Log when tournaments state changes
  useEffect(() => {
    console.log('🔄 Tournaments state changed:');
    console.log('   Count:', tournaments?.length || 0);
    console.log('   Loading:', loading);
    console.log('   Error:', error);
    if (tournaments && tournaments.length > 0) {
      console.log('   Sample:', tournaments[0]);
    }
  }, [tournaments, loading, error]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTournaments();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).replace(',', '');
  };

  const handleWhatsAppPress = (tournament) => {
    const message = `Check out ${tournament.tourName || 'this tournament'}!`;
    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          console.log('WhatsApp is not installed');
        }
      })
      .catch((err) => console.error('Error opening WhatsApp:', err));
  };

  const handleTournamentPress = (tournament) => {
    console.log('📋 Tournament selected:', tournament.tourName);
    // TODO: Navigate to tournament details screen
  };

  const renderTournamentItem = ({ item }) => {
    const logoUri = item.logo || item.tourImage;
    const tournamentName = item.tourName || item.name || 'Unnamed Tournament';
    const startDate = item.tourStartAt || item.startDate;

    return (
      <TouchableOpacity
        style={styles.tournamentCard}
        onPress={() => handleTournamentPress(item)}
        activeOpacity={0.7}
      >
        {/* Tournament Logo */}
        <View style={styles.logoContainer}>
          {logoUri ? (
            <Image
              source={{ uri: logoUri }}
              style={styles.logo}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.logoPlaceholder}>
              <MaterialCommunityIcons
                name="cricket"
                size={32}
                color={COLORS.primary}
              />
            </View>
          )}
        </View>

        {/* Tournament Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.tournamentName} numberOfLines={2}>
            {tournamentName}
          </Text>
          <Text style={styles.tournamentDate}>
            {formatDate(startDate)}
          </Text>
        </View>

        {/* Action Icons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.whatsappButton}
            onPress={() => handleWhatsAppPress(item)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="logo-whatsapp" size={28} color="#25D366" />
          </TouchableOpacity>

          <Ionicons
            name="chevron-forward"
            size={24}
            color={COLORS.textSecondary}
            style={styles.chevronIcon}
          />
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    console.log('📭 Rendering empty state - Debug info:');
    console.log('   User:', user?.username || 'Not logged in');
    console.log('   orgId:', user?.orgId || 'No orgId');
    console.log('   Tournaments count:', tournaments?.length || 0);
    console.log('   Loading:', loading);
    console.log('   Error:', error);
    
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons
          name="trophy-outline"
          size={64}
          color={COLORS.textSecondary}
        />
        <Text style={styles.emptyText}>No tournaments available</Text>
        <Text style={styles.emptySubText}>
          {user?.orgId
            ? `Looking for tournaments in organization ${user.orgId}...`
            : 'Showing all available tournaments'}
        </Text>
        {error && (
          <Text style={[styles.emptySubText, { color: COLORS.danger, marginTop: SPACING.md }]}>
            Error: {error}
          </Text>
        )}
      </View>
    );
  };

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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tournaments</Text>
        <Text style={styles.headerSubtitle}>
          {tournaments.length} tournament{tournaments.length !== 1 ? 's' : ''} available
        </Text>
      </View>

      {/* Tournament List */}
      <FlatList
        data={tournaments}
        renderItem={renderTournamentItem}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
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

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}
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
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
  },
  header: {
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.sm,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
  },
  listContent: {
    paddingVertical: SPACING.sm,
    flexGrow: 1,
  },
  tournamentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.xs,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  logoContainer: {
    width: 60,
    height: 60,
    marginRight: SPACING.md,
  },
  logo: {
    width: '100%',
    height: '100%',
    borderRadius: BORDER_RADIUS.sm,
  },
  logoPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoContainer: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  tournamentName: {
    fontSize: FONTS.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  tournamentDate: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  whatsappButton: {
    marginRight: SPACING.sm,
  },
  chevronIcon: {
    marginLeft: SPACING.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: 100,
  },
  emptyText: {
    fontSize: FONTS.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptySubText: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
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
    fontSize: FONTS.sm,
    textAlign: 'center',
  },
});

export default TournamentScreen;
