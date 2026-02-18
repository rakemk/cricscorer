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

const ChangeBowlerModal = ({
  visible,
  onClose,
  onConfirm,
  bowlers = [],
  currentBowler,
  previousBowler,
}) => {
  const [selectedBowler, setSelectedBowler] = useState(null);

  const handleConfirm = () => {
    if (!selectedBowler) return;
    onConfirm(selectedBowler);
    setSelectedBowler(null);
  };

  const handleClose = () => {
    setSelectedBowler(null);
    onClose();
  };

  // Filter out the previous bowler (can't bowl consecutive overs)
  const availableBowlers = bowlers.filter(
    (b) => b.playerId !== previousBowler?.playerId
  );

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
            <Text style={styles.title}>Select Bowler</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body}>
            {availableBowlers.length === 0 ? (
              <Text style={styles.emptyText}>No bowlers available</Text>
            ) : (
              availableBowlers.map((bowler) => {
                const isCurrentBowler = bowler.playerId === currentBowler?.playerId;
                const stats = bowler.bowlingStats || {};
                
                return (
                  <TouchableOpacity
                    key={bowler.playerId}
                    style={[
                      styles.bowlerCard,
                      selectedBowler?.playerId === bowler.playerId && styles.bowlerCardSelected,
                      isCurrentBowler && styles.bowlerCardCurrent,
                    ]}
                    onPress={() => setSelectedBowler(bowler)}
                  >
                    <View style={styles.bowlerInfo}>
                      <Text style={[
                        styles.bowlerName,
                        selectedBowler?.playerId === bowler.playerId && styles.bowlerNameSelected,
                      ]}>
                        {bowler.playerName}
                        {isCurrentBowler && ' (Current)'}
                      </Text>
                      <Text style={styles.bowlerType}>
                        {bowler.bowlingType || 'Unknown'}
                      </Text>
                    </View>
                    <View style={styles.bowlerStats}>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{stats.overs || 0}</Text>
                        <Text style={styles.statLabel}>O</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{stats.maidens || 0}</Text>
                        <Text style={styles.statLabel}>M</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{stats.runs || 0}</Text>
                        <Text style={styles.statLabel}>R</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{stats.wickets || 0}</Text>
                        <Text style={styles.statLabel}>W</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>
                          {stats.economy?.toFixed(1) || '0.0'}
                        </Text>
                        <Text style={styles.statLabel}>ECO</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.confirmButton,
                !selectedBowler && styles.confirmButtonDisabled,
              ]}
              onPress={handleConfirm}
              disabled={!selectedBowler}
            >
              <Text style={styles.confirmButtonText}>Select Bowler</Text>
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
  emptyText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.md,
    padding: SPACING.xl,
  },
  bowlerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.white,
  },
  bowlerCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  bowlerCardCurrent: {
    borderColor: COLORS.secondary,
  },
  bowlerInfo: {
    flex: 1,
  },
  bowlerName: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.text,
    marginBottom: 2,
  },
  bowlerNameSelected: {
    color: COLORS.primary,
  },
  bowlerType: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  bowlerStats: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  statItem: {
    alignItems: 'center',
    minWidth: 30,
  },
  statValue: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.text,
  },
  statLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
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

export default ChangeBowlerModal;
