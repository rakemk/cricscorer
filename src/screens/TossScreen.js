import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { saveToss, setToss } from '../store/slices/matchSlice';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../constants';

const TossScreen = ({ navigation, route }) => {
  const { matchId } = route.params || {};
  const dispatch = useDispatch();
  const { match, loading } = useSelector((state) => state.match);

  const [selectedWinner, setSelectedWinner] = useState(null);
  const [selectedElection, setSelectedElection] = useState(null);
  const [step, setStep] = useState(1); // 1: Select winner, 2: Select election

  const team1 = {
    id: match?.team1_id,
    name: match?.team1_name || 'Team 1',
    shortName: match?.team1_short_name || 'T1',
  };

  const team2 = {
    id: match?.team2_id,
    name: match?.team2_name || 'Team 2',
    shortName: match?.team2_short_name || 'T2',
  };

  const handleWinnerSelect = (team) => {
    setSelectedWinner(team);
    setStep(2);
  };

  const handleElectionSelect = (election) => {
    setSelectedElection(election);
  };

  const handleConfirm = async () => {
    if (!selectedWinner || !selectedElection) return;

    const tossData = {
      toss_winner: selectedWinner.id,
      toss_elected: selectedElection,
    };

    // Update local state immediately
    dispatch(
      setToss({
        winner: selectedWinner.id,
        elected: selectedElection,
        completed: true,
      })
    );

    // Save to API
    if (matchId) {
      await dispatch(saveToss({ matchId, tossData }));
    }

    navigation.goBack();
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setSelectedElection(null);
    } else {
      navigation.goBack();
    }
  };

  const getWinningTeamName = () => {
    if (!selectedWinner) return '';
    return selectedWinner.name;
  };

  const getBattingTeam = () => {
    if (!selectedWinner || !selectedElection) return '';
    if (selectedElection === 'bat') {
      return selectedWinner.name;
    }
    return selectedWinner.id === team1.id ? team2.name : team1.name;
  };

  const getBowlingTeam = () => {
    if (!selectedWinner || !selectedElection) return '';
    if (selectedElection === 'bowl') {
      return selectedWinner.name;
    }
    return selectedWinner.id === team1.id ? team2.name : team1.name;
  };

  const renderWinnerSelection = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Who won the toss?</Text>
      <Text style={styles.stepSubtitle}>Select the toss winner</Text>

      <View style={styles.teamsContainer}>
        <TouchableOpacity
          style={[
            styles.teamOption,
            selectedWinner?.id === team1.id && styles.teamOptionSelected,
          ]}
          onPress={() => handleWinnerSelect(team1)}
        >
          <View style={styles.teamLogo}>
            <Text style={styles.teamInitial}>{team1.shortName[0]}</Text>
          </View>
          <Text
            style={[
              styles.teamName,
              selectedWinner?.id === team1.id && styles.teamNameSelected,
            ]}
          >
            {team1.name}
          </Text>
        </TouchableOpacity>

        <View style={styles.vsContainer}>
          <Text style={styles.vsText}>VS</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.teamOption,
            selectedWinner?.id === team2.id && styles.teamOptionSelected,
          ]}
          onPress={() => handleWinnerSelect(team2)}
        >
          <View style={styles.teamLogo}>
            <Text style={styles.teamInitial}>{team2.shortName[0]}</Text>
          </View>
          <Text
            style={[
              styles.teamName,
              selectedWinner?.id === team2.id && styles.teamNameSelected,
            ]}
          >
            {team2.name}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderElectionSelection = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{getWinningTeamName()} chose to...</Text>
      <Text style={styles.stepSubtitle}>Select their election</Text>

      <View style={styles.electionContainer}>
        <TouchableOpacity
          style={[
            styles.electionOption,
            selectedElection === 'bat' && styles.electionOptionSelected,
          ]}
          onPress={() => handleElectionSelect('bat')}
        >
          <Text style={styles.electionIcon}>🏏</Text>
          <Text
            style={[
              styles.electionText,
              selectedElection === 'bat' && styles.electionTextSelected,
            ]}
          >
            Bat First
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.electionOption,
            selectedElection === 'bowl' && styles.electionOptionSelected,
          ]}
          onPress={() => handleElectionSelect('bowl')}
        >
          <Text style={styles.electionIcon}>⚾</Text>
          <Text
            style={[
              styles.electionText,
              selectedElection === 'bowl' && styles.electionTextSelected,
            ]}
          >
            Bowl First
          </Text>
        </TouchableOpacity>
      </View>

      {selectedElection && (
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Match Order</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Batting First:</Text>
            <Text style={styles.summaryValue}>{getBattingTeam()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Bowling First:</Text>
            <Text style={styles.summaryValue}>{getBowlingTeam()}</Text>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View
          style={[styles.progressDot, step >= 1 && styles.progressDotActive]}
        />
        <View style={styles.progressLine} />
        <View
          style={[styles.progressDot, step >= 2 && styles.progressDotActive]}
        />
      </View>

      {/* Content */}
      {step === 1 ? renderWinnerSelection() : renderElectionSelection()}

      {/* Action Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>
            {step === 1 ? 'Cancel' : 'Back'}
          </Text>
        </TouchableOpacity>

        {step === 2 && (
          <TouchableOpacity
            style={[
              styles.confirmButton,
              !selectedElection && styles.confirmButtonDisabled,
            ]}
            onPress={handleConfirm}
            disabled={!selectedElection || loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.confirmButtonText}>Confirm Toss</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.border,
  },
  progressDotActive: {
    backgroundColor: COLORS.primary,
  },
  progressLine: {
    width: 60,
    height: 2,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.sm,
  },
  stepContainer: {
    flex: 1,
    padding: SPACING.xl,
  },
  stepTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  stepSubtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xxl,
  },
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  teamOption: {
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    width: '40%',
    ...SHADOWS.md,
  },
  teamOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  teamLogo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  teamInitial: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  teamName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  teamNameSelected: {
    color: COLORS.primary,
  },
  vsContainer: {
    padding: SPACING.sm,
  },
  vsText: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
  },
  electionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  electionOption: {
    alignItems: 'center',
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    width: '45%',
    ...SHADOWS.md,
  },
  electionOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  electionIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  electionText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  electionTextSelected: {
    color: COLORS.primary,
  },
  summaryContainer: {
    backgroundColor: COLORS.card,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.xxl,
    ...SHADOWS.sm,
  },
  summaryTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  summaryLabel: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  footer: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: COLORS.card,
    ...SHADOWS.lg,
  },
  backButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
  },
  backButtonText: {
    color: COLORS.text,
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 2,
    backgroundColor: COLORS.success,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: COLORS.textLight,
  },
  confirmButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
  },
});

export default TossScreen;
