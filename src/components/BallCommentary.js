import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS, SPACING, FONTS, BORDER_RADIUS } from '../constants';
import { BALL_TYPES } from '../constants';

/**
 * Ball Commentary Component
 * Displays the last N balls of the current over
 */
const BallCommentary = ({ balls = [], maxBalls = 6 }) => {
  // Get the last `maxBalls` from the array
  const recentBalls = balls.slice(-maxBalls);

  const getBallStyle = (ball) => {
    // Wicket
    if (ball.wicket_id) {
      return styles.ballWicket;
    }

    // Six
    if (ball.batsman_score === 6 || ball.total_runs === 6) {
      return styles.ballSix;
    }

    // Four
    if (ball.batsman_score === 4 || ball.total_runs === 4) {
      return styles.ballFour;
    }

    // Extra (Wide, No Ball)
    if (ball.ball_type !== BALL_TYPES.NORMAL && ball.ball_type !== undefined) {
      return styles.ballExtra;
    }

    // Dot ball
    if (ball.total_runs === 0) {
      return styles.ballDot;
    }

    // Normal runs
    return styles.ballRuns;
  };

  const getBallText = (ball) => {
    if (ball.wicket_id) {
      return 'W';
    }

    const extras = {
      [BALL_TYPES.WIDE]: 'Wd',
      [BALL_TYPES.NO_BALL]: 'Nb',
      [BALL_TYPES.BYE]: 'B',
      [BALL_TYPES.LEG_BYE]: 'Lb',
    };

    if (extras[ball.ball_type]) {
      const runs = ball.total_runs || 1;
      return runs > 1 ? `${runs}${extras[ball.ball_type]}` : extras[ball.ball_type];
    }

    return ball.total_runs?.toString() || '0';
  };

  const renderBall = (ball, index) => (
    <View key={index} style={[styles.ball, getBallStyle(ball)]}>
      <Text style={styles.ballText}>{getBallText(ball)}</Text>
    </View>
  );

  const renderEmptyBall = (index) => (
    <View key={`empty-${index}`} style={[styles.ball, styles.ballEmpty]}>
      <Text style={styles.ballTextEmpty}>-</Text>
    </View>
  );

  // Fill remaining slots with empty balls
  const emptySlots = maxBalls - recentBalls.length;
  const emptyBalls = Array(emptySlots > 0 ? emptySlots : 0).fill(null);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>This Over</Text>
        <Text style={styles.overRuns}>
          {recentBalls.reduce((sum, b) => sum + (b.total_runs || 0), 0)} runs
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.ballsContainer}
      >
        {emptyBalls.map((_, index) => renderEmptyBall(index))}
        {recentBalls.map((ball, index) => renderBall(ball, index))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    margin: SPACING.sm,
    marginTop: 0,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  overRuns: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  ballsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: SPACING.sm,
  },
  ball: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: SPACING.xs,
  },
  ballText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  ballTextEmpty: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textLight,
  },
  ballEmpty: {
    backgroundColor: COLORS.border,
  },
  ballDot: {
    backgroundColor: COLORS.dots,
  },
  ballRuns: {
    backgroundColor: COLORS.runs,
  },
  ballFour: {
    backgroundColor: COLORS.info,
  },
  ballSix: {
    backgroundColor: COLORS.primary,
  },
  ballExtra: {
    backgroundColor: COLORS.extras,
  },
  ballWicket: {
    backgroundColor: COLORS.wicket,
  },
});

export default BallCommentary;
