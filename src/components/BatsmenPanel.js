import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../constants';
import { scoringService } from '../services';

/**
 * Batsmen Panel Component
 * Displays current batsmen statistics
 */
const BatsmenPanel = ({
  striker,
  nonStriker,
  strikerStats,
  nonStrikerStats,
  onSwapBatsmen,
}) => {
  const renderBatsmanRow = (batsman, stats, isStriker) => {
    if (!batsman) {
      return (
        <View style={styles.batsmanRow}>
          <Text style={styles.emptyText}>Select batsman</Text>
        </View>
      );
    }

    const strikeRate = scoringService.calculateStrikeRate(
      stats?.runs || 0,
      stats?.balls || 0
    );

    return (
      <View style={[styles.batsmanRow, isStriker && styles.strikerRow]}>
        {/* Striker Indicator */}
        <View style={styles.indicatorContainer}>
          {isStriker && <View style={styles.strikerIndicator} />}
        </View>

        {/* Name */}
        <View style={styles.nameContainer}>
          <Text style={styles.batsmanName} numberOfLines={1}>
            {batsman.name || batsman.player_name}
          </Text>
          {batsman.isCaptain && <Text style={styles.badge}>C</Text>}
          {batsman.isWicketKeeper && <Text style={styles.badge}>WK</Text>}
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats?.runs || 0}</Text>
            <Text style={styles.statLabel}>R</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats?.balls || 0}</Text>
            <Text style={styles.statLabel}>B</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats?.fours || 0}</Text>
            <Text style={styles.statLabel}>4s</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats?.sixes || 0}</Text>
            <Text style={styles.statLabel}>6s</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{strikeRate}</Text>
            <Text style={styles.statLabel}>SR</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Batsmen</Text>
        <TouchableOpacity style={styles.swapButton} onPress={onSwapBatsmen}>
          <Text style={styles.swapButtonText}>⇄ Swap</Text>
        </TouchableOpacity>
      </View>

      {/* Striker */}
      {renderBatsmanRow(striker, strikerStats, true)}

      {/* Divider */}
      <View style={styles.divider} />

      {/* Non-Striker */}
      {renderBatsmanRow(nonStriker, nonStrikerStats, false)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    margin: SPACING.sm,
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
  swapButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  swapButtonText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  batsmanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    minHeight: 50,
  },
  strikerRow: {
    backgroundColor: COLORS.primary + '10',
  },
  indicatorContainer: {
    width: 20,
    alignItems: 'center',
  },
  strikerIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  nameContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  batsmanName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
    marginRight: SPACING.xs,
  },
  badge: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginLeft: SPACING.xs,
  },
  emptyText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
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
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.sm,
  },
});

export default BatsmenPanel;
