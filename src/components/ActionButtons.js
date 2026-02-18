import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../constants';

/**
 * Action Buttons Component
 * Displays action buttons: Wicket, Undo, End Over, etc.
 */
const ActionButtons = ({
  onWicket,
  onUndo,
  onEndOver,
  onEndInnings,
  onEndMatch,
  onPause,
  canUndo = false,
  canEndOver = false,
  disabled = false,
}) => {
  const actions = [
    {
      id: 'wicket',
      label: 'Wicket',
      icon: 'W',
      onPress: onWicket,
      style: styles.wicketButton,
      textStyle: styles.wicketButtonText,
    },
    {
      id: 'undo',
      label: 'Undo',
      icon: '↩',
      onPress: onUndo,
      disabled: !canUndo,
      style: canUndo ? styles.undoButton : styles.undoButtonDisabled,
      textStyle: canUndo ? styles.undoButtonText : styles.undoButtonTextDisabled,
    },
    {
      id: 'endOver',
      label: 'End Over',
      icon: '⏭',
      onPress: onEndOver,
      disabled: !canEndOver,
      style: canEndOver ? styles.endOverButton : styles.endOverButtonDisabled,
      textStyle: canEndOver ? styles.endOverButtonText : styles.endOverButtonTextDisabled,
    },
  ];

  const secondaryActions = [
    {
      id: 'endInnings',
      label: 'End Innings',
      onPress: onEndInnings,
    },
    {
      id: 'pause',
      label: 'Pause',
      onPress: onPause,
    },
    {
      id: 'endMatch',
      label: 'End Match',
      onPress: onEndMatch,
    },
  ];

  return (
    <View style={styles.container}>
      {/* Primary Actions */}
      <View style={styles.primaryActions}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={[styles.actionButton, action.style]}
            onPress={action.onPress}
            disabled={disabled || action.disabled}
          >
            <Text style={[styles.actionIcon, action.textStyle]}>
              {action.icon}
            </Text>
            <Text style={[styles.actionLabel, action.textStyle]}>
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Secondary Actions */}
      <View style={styles.secondaryActions}>
        {secondaryActions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.secondaryButton}
            onPress={action.onPress}
            disabled={disabled}
          >
            <Text style={styles.secondaryButtonText}>{action.label}</Text>
          </TouchableOpacity>
        ))}
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
    padding: SPACING.sm,
    ...SHADOWS.sm,
  },
  primaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
    marginHorizontal: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.sm,
  },
  actionIcon: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  actionLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
  },
  wicketButton: {
    backgroundColor: COLORS.wicket,
  },
  wicketButtonText: {
    color: COLORS.white,
  },
  undoButton: {
    backgroundColor: COLORS.warning,
  },
  undoButtonText: {
    color: COLORS.white,
  },
  undoButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  undoButtonTextDisabled: {
    color: COLORS.textLight,
  },
  endOverButton: {
    backgroundColor: COLORS.success,
  },
  endOverButtonText: {
    color: COLORS.white,
  },
  endOverButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  endOverButtonTextDisabled: {
    color: COLORS.textLight,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
  },
  secondaryButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  secondaryButtonText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
});

export default ActionButtons;
