import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS, BALL_TYPES } from '../constants';

/**
 * Run Buttons Component
 * Displays run scoring buttons (0-6) and extras
 */
const RunButtons = ({ onScore, disabled = false }) => {
  const [selectedExtra, setSelectedExtra] = useState(null);

  const handleRunPress = (runs) => {
    onScore({
      runs,
      ballType: selectedExtra || BALL_TYPES.NORMAL,
    });
    setSelectedExtra(null);
  };

  const handleExtraToggle = (extraType) => {
    if (selectedExtra === extraType) {
      setSelectedExtra(null);
    } else {
      setSelectedExtra(extraType);
    }
  };

  const runButtons = [0, 1, 2, 3, 4, 6];

  const extras = [
    { type: BALL_TYPES.WIDE, label: 'Wide', short: 'Wd' },
    { type: BALL_TYPES.NO_BALL, label: 'No Ball', short: 'Nb' },
    { type: BALL_TYPES.BYE, label: 'Bye', short: 'B' },
    { type: BALL_TYPES.LEG_BYE, label: 'Leg Bye', short: 'Lb' },
  ];

  const getRunButtonStyle = (runs) => {
    if (runs === 4) return styles.runButtonFour;
    if (runs === 6) return styles.runButtonSix;
    if (runs === 0) return styles.runButtonDot;
    return styles.runButtonNormal;
  };

  return (
    <View style={styles.container}>
      {/* Extra Buttons */}
      <View style={styles.extrasContainer}>
        {extras.map((extra) => (
          <TouchableOpacity
            key={extra.type}
            style={[
              styles.extraButton,
              selectedExtra === extra.type && styles.extraButtonSelected,
            ]}
            onPress={() => handleExtraToggle(extra.type)}
            disabled={disabled}
          >
            <Text
              style={[
                styles.extraButtonText,
                selectedExtra === extra.type && styles.extraButtonTextSelected,
              ]}
            >
              {extra.short}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Selected Extra Indicator */}
      {selectedExtra && (
        <View style={styles.selectedExtraIndicator}>
          <Text style={styles.selectedExtraText}>
            + {extras.find((e) => e.type === selectedExtra)?.label}
          </Text>
        </View>
      )}

      {/* Run Buttons */}
      <View style={styles.runsContainer}>
        {runButtons.map((runs) => (
          <TouchableOpacity
            key={runs}
            style={[styles.runButton, getRunButtonStyle(runs)]}
            onPress={() => handleRunPress(runs)}
            disabled={disabled}
          >
            <Text style={styles.runButtonText}>{runs}</Text>
          </TouchableOpacity>
        ))}

        {/* 5+ Button for unusual scores */}
        <TouchableOpacity
          style={[styles.runButton, styles.runButtonOther]}
          onPress={() => handleRunPress(5)}
          disabled={disabled}
        >
          <Text style={styles.runButtonText}>5+</Text>
        </TouchableOpacity>
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
  extrasContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  extraButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  extraButtonSelected: {
    borderColor: COLORS.extras,
    backgroundColor: COLORS.extras + '20',
  },
  extraButtonText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  extraButtonTextSelected: {
    color: COLORS.extras,
  },
  selectedExtraIndicator: {
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  selectedExtraText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.extras,
    fontWeight: '600',
  },
  runsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  runButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    margin: SPACING.xs,
    ...SHADOWS.sm,
  },
  runButtonNormal: {
    backgroundColor: COLORS.runs,
  },
  runButtonDot: {
    backgroundColor: COLORS.dots,
  },
  runButtonFour: {
    backgroundColor: COLORS.info,
  },
  runButtonSix: {
    backgroundColor: COLORS.primary,
  },
  runButtonOther: {
    backgroundColor: COLORS.textSecondary,
  },
  runButtonText: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});

export default RunButtons;
