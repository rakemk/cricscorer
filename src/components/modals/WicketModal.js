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
import { WICKET_TYPES } from '../../constants/config';

const WicketModal = ({
  visible,
  onClose,
  onConfirm,
  striker,
  nonStriker,
  currentBowler,
  fieldingTeam = [],
  runs = 0,
}) => {
  const [selectedWicketType, setSelectedWicketType] = useState(null);
  const [batsmanOut, setBatsmanOut] = useState('striker');
  const [fielder, setFielder] = useState(null);

  // Wicket types that need a fielder
  const needsFielder = ['Caught', 'Stumped', 'Run Out'];
  
  // Wicket types where non-striker can be out
  const canBeNonStriker = ['Run Out'];

  const handleConfirm = () => {
    if (!selectedWicketType) return;

    const wicketData = {
      wicketType: selectedWicketType,
      batsmanOut: batsmanOut === 'striker' ? striker : nonStriker,
      fielder: needsFielder.includes(selectedWicketType) ? fielder : null,
      bowler: currentBowler,
      runs,
    };

    onConfirm(wicketData);
    resetState();
  };

  const resetState = () => {
    setSelectedWicketType(null);
    setBatsmanOut('striker');
    setFielder(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const wicketTypes = [
    { key: 'Bowled', label: 'Bowled' },
    { key: 'Caught', label: 'Caught' },
    { key: 'LBW', label: 'LBW' },
    { key: 'Stumped', label: 'Stumped' },
    { key: 'Run Out', label: 'Run Out' },
    { key: 'Hit Wicket', label: 'Hit Wicket' },
    { key: 'Caught & Bowled', label: 'Caught & Bowled' },
    { key: 'Retired Hurt', label: 'Retired Hurt' },
    { key: 'Retired Out', label: 'Retired Out' },
    { key: 'Obstructing Field', label: 'Obstructing Field' },
    { key: 'Timed Out', label: 'Timed Out' },
    { key: 'Hit Ball Twice', label: 'Hit Ball Twice' },
  ];

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
            <Text style={styles.title}>Wicket</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body}>
            {/* Runs on this ball */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Runs on this ball: {runs}</Text>
            </View>

            {/* Wicket Type Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Wicket Type</Text>
              <View style={styles.optionsGrid}>
                {wicketTypes.map((type) => (
                  <TouchableOpacity
                    key={type.key}
                    style={[
                      styles.optionButton,
                      selectedWicketType === type.key && styles.optionButtonSelected,
                    ]}
                    onPress={() => setSelectedWicketType(type.key)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selectedWicketType === type.key && styles.optionTextSelected,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Batsman Out Selection (only for run out) */}
            {selectedWicketType && canBeNonStriker.includes(selectedWicketType) && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Who is Out?</Text>
                <View style={styles.batsmanOptions}>
                  <TouchableOpacity
                    style={[
                      styles.batsmanButton,
                      batsmanOut === 'striker' && styles.batsmanButtonSelected,
                    ]}
                    onPress={() => setBatsmanOut('striker')}
                  >
                    <Text
                      style={[
                        styles.batsmanText,
                        batsmanOut === 'striker' && styles.batsmanTextSelected,
                      ]}
                    >
                      {striker?.playerName || 'Striker'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.batsmanButton,
                      batsmanOut === 'nonStriker' && styles.batsmanButtonSelected,
                    ]}
                    onPress={() => setBatsmanOut('nonStriker')}
                  >
                    <Text
                      style={[
                        styles.batsmanText,
                        batsmanOut === 'nonStriker' && styles.batsmanTextSelected,
                      ]}
                    >
                      {nonStriker?.playerName || 'Non-Striker'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Fielder Selection */}
            {selectedWicketType && needsFielder.includes(selectedWicketType) && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Fielder</Text>
                <View style={styles.fielderList}>
                  {fieldingTeam.map((player) => (
                    <TouchableOpacity
                      key={player.playerId}
                      style={[
                        styles.fielderButton,
                        fielder?.playerId === player.playerId && styles.fielderButtonSelected,
                      ]}
                      onPress={() => setFielder(player)}
                    >
                      <Text
                        style={[
                          styles.fielderText,
                          fielder?.playerId === player.playerId && styles.fielderTextSelected,
                        ]}
                      >
                        {player.playerName}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.confirmButton,
                !selectedWicketType && styles.confirmButtonDisabled,
              ]}
              onPress={handleConfirm}
              disabled={!selectedWicketType}
            >
              <Text style={styles.confirmButtonText}>Confirm Wicket</Text>
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
    maxHeight: '90%',
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
    color: COLORS.danger,
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
    maxHeight: 500,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  optionButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  optionButtonSelected: {
    backgroundColor: COLORS.danger,
    borderColor: COLORS.danger,
  },
  optionText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
  },
  optionTextSelected: {
    color: COLORS.white,
    fontWeight: FONTS.weights.semibold,
  },
  batsmanOptions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  batsmanButton: {
    flex: 1,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  batsmanButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  batsmanText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
  },
  batsmanTextSelected: {
    color: COLORS.white,
    fontWeight: FONTS.weights.semibold,
  },
  fielderList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  fielderButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  fielderButtonSelected: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  fielderText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
  },
  fielderTextSelected: {
    color: COLORS.white,
    fontWeight: FONTS.weights.semibold,
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
    backgroundColor: COLORS.danger,
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

export default WicketModal;
