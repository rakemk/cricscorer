import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../constants';
import { scoringService } from '../services';

/**
 * Bowler Panel Component
 * Displays current bowler statistics
 */
const BowlerPanel = ({ bowler, bowlerStats, onChangeBowler }) => {
  if (!bowler) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Bowler</Text>
          <TouchableOpacity style={styles.changeButton} onPress={onChangeBowler}>
            <Text style={styles.changeButtonText}>Select</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No bowler selected</Text>
        </View>
      </View>
    );
  }

  const stats = bowlerStats || {
    overs: 0,
    balls: 0,
    maidens: 0,
    runs: 0,
    wickets: 0,
  };

  const overs = `${stats.overs}.${stats.balls}`;
  const economy = scoringService.calculateEconomy(stats.runs, parseFloat(overs));

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bowler</Text>
        <TouchableOpacity style={styles.changeButton} onPress={onChangeBowler}>
          <Text style={styles.changeButtonText}>Change</Text>
        </TouchableOpacity>
      </View>

      {/* Bowler Row */}
      <View style={styles.bowlerRow}>
        {/* Name */}
        <View style={styles.nameContainer}>
          <Text style={styles.bowlerName} numberOfLines={1}>
            {bowler.name || bowler.player_name}
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{overs}</Text>
            <Text style={styles.statLabel}>O</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.maidens}</Text>
            <Text style={styles.statLabel}>M</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.runs}</Text>
            <Text style={styles.statLabel}>R</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.wickets}</Text>
            <Text style={styles.statLabel}>W</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{economy}</Text>
            <Text style={styles.statLabel}>ECO</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    margin: SPACING.sm,
    marginTop: 0,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  changeButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  changeButtonText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  bowlerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
  },
  nameContainer: {
    flex: 1,
  },
  bowlerName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  statsContainer: {
    flexDirection: 'row',
  },
  statItem: {
    alignItems: 'center',
    marginLeft: SPACING.md,
    minWidth: 30,
  },
  statValue: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
  },
});

export default BowlerPanel;
