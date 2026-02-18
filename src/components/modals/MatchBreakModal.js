import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants';

const breakTypes = [
  { key: 'drinks', label: 'Drinks Break', icon: '🥤' },
  { key: 'lunch', label: 'Lunch Break', icon: '🍽️' },
  { key: 'tea', label: 'Tea Break', icon: '☕' },
  { key: 'dinner', label: 'Dinner Break', icon: '🍛' },
  { key: 'rain', label: 'Rain Delay', icon: '🌧️' },
  { key: 'bad_light', label: 'Bad Light', icon: '💡' },
  { key: 'injury', label: 'Injury Break', icon: '🩹' },
  { key: 'strategic', label: 'Strategic Timeout', icon: '⏱️' },
  { key: 'other', label: 'Other', icon: '⏸️' },
];

const MatchBreakModal = ({
  visible,
  onClose,
  onConfirm,
  currentBreak = null,
}) => {
  const [selectedBreak, setSelectedBreak] = useState(currentBreak);

  const handleConfirm = () => {
    if (!selectedBreak) return;
    onConfirm(selectedBreak);
    setSelectedBreak(null);
  };

  const handleClose = () => {
    setSelectedBreak(null);
    onClose();
  };

  const handleResume = () => {
    onConfirm(null); // null indicates resume
    setSelectedBreak(null);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Match Break</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            {currentBreak ? (
              <View style={styles.currentBreakContainer}>
                <Text style={styles.currentBreakLabel}>Current Break:</Text>
                <View style={styles.currentBreakCard}>
                  <Text style={styles.currentBreakIcon}>
                    {breakTypes.find((b) => b.key === currentBreak)?.icon || '⏸️'}
                  </Text>
                  <Text style={styles.currentBreakText}>
                    {breakTypes.find((b) => b.key === currentBreak)?.label || currentBreak}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.resumeButton}
                  onPress={handleResume}
                >
                  <Text style={styles.resumeButtonText}>Resume Match</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.breakGrid}>
                {breakTypes.map((breakType) => (
                  <TouchableOpacity
                    key={breakType.key}
                    style={[
                      styles.breakCard,
                      selectedBreak === breakType.key && styles.breakCardSelected,
                    ]}
                    onPress={() => setSelectedBreak(breakType.key)}
                  >
                    <Text style={styles.breakIcon}>{breakType.icon}</Text>
                    <Text
                      style={[
                        styles.breakLabel,
                        selectedBreak === breakType.key && styles.breakLabelSelected,
                      ]}
                    >
                      {breakType.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {!currentBreak && (
            <View style={styles.footer}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  !selectedBreak && styles.confirmButtonDisabled,
                ]}
                onPress={handleConfirm}
                disabled={!selectedBreak}
              >
                <Text style={styles.confirmButtonText}>Start Break</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  closeText: {
    fontSize: FONTS.sizes.xl,
    color: COLORS.textSecondary,
  },
  body: {
    padding: SPACING.md,
  },
  currentBreakContainer: {
    alignItems: 'center',
    padding: SPACING.lg,
  },
  currentBreakLabel: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  currentBreakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '20',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
  },
  currentBreakIcon: {
    fontSize: 32,
    marginRight: SPACING.sm,
  },
  currentBreakText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.warning,
  },
  resumeButton: {
    backgroundColor: COLORS.success,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.md,
  },
  resumeButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.white,
  },
  breakGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  breakCard: {
    width: '48%',
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    alignItems: 'center',
  },
  breakCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  breakIcon: {
    fontSize: 28,
    marginBottom: SPACING.xs,
  },
  breakLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    color: COLORS.text,
    textAlign: 'center',
  },
  breakLabelSelected: {
    color: COLORS.primary,
  },
  footer: {
    flexDirection: 'row',
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.sm,
  },
  cancelButton: {
    flex: 1,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    fontWeight: FONTS.weights.medium,
  },
  confirmButton: {
    flex: 2,
    padding: SPACING.md,
    backgroundColor: COLORS.warning,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  confirmButtonText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.white,
    fontWeight: FONTS.weights.semibold,
  },
});

export default MatchBreakModal;
