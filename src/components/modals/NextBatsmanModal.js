import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants';

const NextBatsmanModal = ({
  visible,
  onClose,
  onConfirm,
  batsmen = [],
  currentBatsmen = [], // Array of current batsmen (striker and non-striker)
  dismissedBatsmen = [], // Array of batsmen already out
}) => {
  const [selectedBatsman, setSelectedBatsman] = useState(null);

  const handleConfirm = () => {
    if (!selectedBatsman) return;
    onConfirm(selectedBatsman);
    setSelectedBatsman(null);
  };

  const handleClose = () => {
    setSelectedBatsman(null);
    onClose();
  };

  // Filter out current batsmen and dismissed batsmen
  const availableBatsmen = batsmen.filter((b) => {
    const isCurrentBatsman = currentBatsmen.some(
      (cb) => cb?.playerId === b.playerId
    );
    const isDismissed = dismissedBatsmen.some(
      (db) => db?.playerId === b.playerId
    );
    return !isCurrentBatsman && !isDismissed;
  });

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
            <Text style={styles.title}>Select Next Batsman</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body}>
            {availableBatsmen.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No batsmen available</Text>
                <Text style={styles.emptySubtext}>All batsmen have batted</Text>
              </View>
            ) : (
              availableBatsmen.map((batsman, index) => (
                <TouchableOpacity
                  key={batsman.playerId}
                  style={[
                    styles.batsmanCard,
                    selectedBatsman?.playerId === batsman.playerId &&
                      styles.batsmanCardSelected,
                  ]}
                  onPress={() => setSelectedBatsman(batsman)}
                >
                  <View style={styles.orderBadge}>
                    <Text style={styles.orderText}>{index + 1}</Text>
                  </View>
                  <View style={styles.batsmanInfo}>
                    <Text
                      style={[
                        styles.batsmanName,
                        selectedBatsman?.playerId === batsman.playerId &&
                          styles.batsmanNameSelected,
                      ]}
                    >
                      {batsman.playerName}
                    </Text>
                    <View style={styles.badges}>
                      {batsman.isCaptain && (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>C</Text>
                        </View>
                      )}
                      {batsman.isWicketKeeper && (
                        <View style={[styles.badge, styles.wkBadge]}>
                          <Text style={styles.badgeText}>WK</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <View style={styles.battingOrder}>
                    <Text style={styles.battingOrderLabel}>Batting Order</Text>
                    <Text style={styles.battingOrderValue}>
                      {batsman.battingOrder || '-'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.confirmButton,
                !selectedBatsman && styles.confirmButtonDisabled,
              ]}
              onPress={handleConfirm}
              disabled={!selectedBatsman}
            >
              <Text style={styles.confirmButtonText}>Select Batsman</Text>
            </TouchableOpacity>
          </View>
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
    maxHeight: '80%',
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
    maxHeight: 400,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.md,
  },
  emptySubtext: {
    textAlign: 'center',
    color: COLORS.textLight,
    fontSize: FONTS.sizes.sm,
    marginTop: SPACING.xs,
  },
  batsmanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.white,
  },
  batsmanCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  orderBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.backgroundDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  orderText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.textSecondary,
  },
  batsmanInfo: {
    flex: 1,
  },
  batsmanName: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.text,
    marginBottom: 2,
  },
  batsmanNameSelected: {
    color: COLORS.primary,
  },
  badges: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  badge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xs,
  },
  wkBadge: {
    backgroundColor: COLORS.secondary,
  },
  badgeText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
    color: COLORS.white,
  },
  battingOrder: {
    alignItems: 'center',
  },
  battingOrderLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
  },
  battingOrderValue: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.text,
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
    backgroundColor: COLORS.primary,
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

export default NextBatsmanModal;
