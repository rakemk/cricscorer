import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONTS, SHADOWS } from '../constants';
import { scoringService } from '../services';

/**
 * Score Header Component
 * Displays team scores, overs, and run rates
 */
const ScoreHeader = ({
  battingTeam,
  bowlingTeam,
  runs,
  wickets,
  overs,
  target,
  currentInnings,
  totalOvers,
}) => {
  const crr = scoringService.calculateCRR(runs, overs);
  const rrr =
    currentInnings === 1 && target
      ? scoringService.calculateRRR(target, runs, overs, totalOvers)
      : null;

  const runsNeeded = target ? target - runs : null;
  const ballsRemaining = target
    ? (totalOvers * 6) - (Math.floor(overs) * 6 + (overs % 1) * 10)
    : null;

  return (
    <View style={styles.container}>
      {/* Main Score */}
      <View style={styles.mainScoreContainer}>
        <View style={styles.teamInfo}>
          <Text style={styles.teamName}>{battingTeam?.name || 'Batting'}</Text>
          <Text style={styles.innings}>
            {currentInnings === 0 ? '1st Innings' : '2nd Innings'}
          </Text>
        </View>

        <View style={styles.scoreContainer}>
          <Text style={styles.score}>
            {runs}/{wickets}
          </Text>
          <Text style={styles.overs}>({scoringService.formatOvers(overs)} ov)</Text>
        </View>
      </View>

      {/* Run Rates */}
      <View style={styles.ratesContainer}>
        <View style={styles.rateItem}>
          <Text style={styles.rateLabel}>CRR</Text>
          <Text style={styles.rateValue}>{crr}</Text>
        </View>

        {rrr && (
          <View style={styles.rateItem}>
            <Text style={styles.rateLabel}>RRR</Text>
            <Text style={styles.rateValue}>{rrr}</Text>
          </View>
        )}

        {runsNeeded !== null && runsNeeded > 0 && (
          <View style={styles.targetInfo}>
            <Text style={styles.targetText}>
              Need {runsNeeded} runs from {ballsRemaining} balls
            </Text>
          </View>
        )}
      </View>

      {/* Bowling Team Info */}
      <View style={styles.bowlingInfo}>
        <Text style={styles.bowlingTeamText}>
          Bowling: {bowlingTeam?.name || 'Bowling'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    ...SHADOWS.md,
  },
  mainScoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  innings: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.white + 'CC',
    marginTop: SPACING.xs,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  score: {
    fontSize: FONTS.sizes.hero,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  overs: {
    fontSize: FONTS.sizes.md,
    color: COLORS.white + 'CC',
  },
  ratesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.white + '30',
  },
  rateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  rateLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.white + 'CC',
    marginRight: SPACING.xs,
  },
  rateValue: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  targetInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  targetText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.white,
    fontWeight: '500',
  },
  bowlingInfo: {
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.white + '30',
  },
  bowlingTeamText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.white + 'CC',
  },
});

export default ScoreHeader;
