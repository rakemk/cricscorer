import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchMatch,
  fetchMatchSettings,
  fetchTourSquad,
  updateMatchSettings,
  setSettings,
  resetMatch,
  saveToss,
  setToss,
} from '../store/slices/matchSlice';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS, WICKET_TYPES } from '../constants';
import { SCREENS } from '../navigation';

// ─── All wicket type options ───
const ALL_WICKET_TYPES = Object.values(WICKET_TYPES);

const TABS = ['Setup', 'Squad', 'Toss'];

const MatchSetupScreen = ({ navigation, route }) => {
  const { matchId } = route.params || {};
  const dispatch = useDispatch();
  const { match, settings, loading, selectedSquad, toss } = useSelector(
    (state) => state.match
  );

  const [activeTab, setActiveTab] = useState(0);

  // ─── Toss local state ───
  const [tossWinner, setTossWinner] = useState(null); // team id
  const [tossElection, setTossElection] = useState(null); // 'bat' | 'bowl'

  // Derived team info
  const team1Id = match?.team_id1 ?? match?.team1_id;
  const team2Id = match?.team_id2 ?? match?.team2_id;
  const team1Name = match?.team_name1 || match?.team1_name || 'Team 1';
  const team2Name = match?.team_name2 || match?.team2_name || 'Team 2';

  useEffect(() => {
    if (matchId) {
      dispatch(fetchMatch(matchId));
      dispatch(fetchMatchSettings(matchId));
      dispatch(fetchTourSquad(matchId));
    }
  }, [matchId, dispatch]);

  // ─── Settings helpers ───
  const handleSettingChange = (key, value) => {
    dispatch(setSettings({ [key]: value }));
  };

  const handleSaveSettings = () => {
    if (matchId) {
      dispatch(updateMatchSettings({ matchId, settings }));
    }
  };

  // Parse selected wicket types from CSV string → Set of ids
  const getSelectedWicketIds = useCallback(() => {
    const csv = settings.select_wicket_type || '';
    if (!csv) return new Set();
    return new Set(csv.split(',').map((s) => parseInt(s.trim())).filter(Boolean));
  }, [settings.select_wicket_type]);

  const toggleWicketType = (id) => {
    const selected = getSelectedWicketIds();
    if (selected.has(id)) {
      selected.delete(id);
    } else {
      selected.add(id);
    }
    const csv = Array.from(selected).sort((a, b) => a - b).join(',');
    handleSettingChange('select_wicket_type', csv);
  };

  // ─── Navigation helpers ───
  const handleTeamSelection = (team) => {
    const teamName = team === 1
      ? (match?.team_name1 || match?.team1_name)
      : (match?.team_name2 || match?.team2_name);
    const teamId = team === 1
      ? (match?.team_id1 ?? match?.team1_id)
      : (match?.team_id2 ?? match?.team2_id);
    navigation.navigate(SCREENS.TEAM_SELECTION, {
      matchId,
      team: `team${team}`,
      teamId,
      teamName,
    });
  };

  const handleConfirmToss = async () => {
    if (!tossWinner || !tossElection) return;
    const tossData = {
      toss_winner: tossWinner,
      toss_elected: tossElection,
    };
    dispatch(setToss({ winner: tossWinner, elected: tossElection, completed: true }));
    if (matchId) {
      await dispatch(saveToss({ matchId, tossData }));
    }
  };

  const handleResetToss = () => {
    setTossWinner(null);
    setTossElection(null);
    dispatch(setToss({ winner: null, elected: null, completed: false }));
  };

  const handleStartMatch = () => {
    navigation.navigate(SCREENS.SCOREBOARD, { matchId });
  };

  const handleResetMatch = () => {
    Alert.alert('Reset Match', 'Are you sure you want to reset all settings?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => dispatch(resetMatch()) },
    ]);
  };

  const handleDeleteMatch = () => {
    Alert.alert('Delete Match', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => navigation.goBack() },
    ]);
  };

  // ─── Counter Row Component ───
  const CounterRow = ({ label, settingKey, value, min = 0 }) => (
    <View style={styles.counterRow}>
      <Text style={styles.counterLabel}>{label}</Text>
      <View style={styles.counterControls}>
        <TouchableOpacity
          style={styles.counterBtn}
          onPress={() => handleSettingChange(settingKey, Math.max(min, value - 1))}
        >
          <Text style={styles.counterBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.counterValue}>{value}</Text>
        <TouchableOpacity
          style={[styles.counterBtn, styles.counterBtnPlus]}
          onPress={() => handleSettingChange(settingKey, value + 1)}
        >
          <Text style={[styles.counterBtnText, styles.counterBtnPlusText]}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ══════════════════════════════════
  // ─── TOP ACTION BUTTONS ───
  // ══════════════════════════════════
  const renderActionButtons = () => (
    <View style={styles.actionRow}>
      <TouchableOpacity
        style={[styles.actionBtn, styles.actionBtnStart]}
        onPress={handleStartMatch}
      >
        <Text style={[styles.actionBtnText, styles.actionBtnStartText]}>Start</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionBtn} onPress={handleStartMatch}>
        <Text style={styles.actionBtnText}>Resume</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionBtn} onPress={handleStartMatch}>
        <Text style={styles.actionBtnText}>View</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionBtn, styles.actionBtnReset]}
        onPress={handleResetMatch}
      >
        <Text style={styles.actionBtnResetText}>Reset</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionBtn, styles.actionBtnDelete]}
        onPress={handleDeleteMatch}
      >
        <Text style={styles.actionBtnDeleteText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  // ══════════════════════════════════
  // ─── TABS ───
  // ══════════════════════════════════
  const renderTabs = () => (
    <View style={styles.tabRow}>
      {TABS.map((tab, index) => (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, activeTab === index && styles.tabActive]}
          onPress={() => setActiveTab(index)}
        >
          <Text style={[styles.tabText, activeTab === index && styles.tabTextActive]}>
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // ══════════════════════════════════
  // ─── SETUP TAB ───
  // ══════════════════════════════════
  const renderSetupTab = () => {
    const selectedIds = getSelectedWicketIds();

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        {/* Counter settings */}
        <CounterRow
          label="Max-over Per Bowler"
          settingKey="bowler_max_over"
          value={settings.bowler_max_over || 4}
          min={1}
        />
        <CounterRow
          label="Overs"
          settingKey="ttl_over"
          value={settings.ttl_over || 20}
          min={1}
        />
        <CounterRow
          label="Playing Squad"
          settingKey="player_count"
          value={settings.player_count || 11}
          min={2}
        />
        <CounterRow
          label="Team-Wickets"
          settingKey="team_wickets"
          value={settings.team_wickets || 10}
          min={1}
        />
        <CounterRow
          label="No-ball Run"
          settingKey="no_ball_run"
          value={settings.no_ball_run || 1}
          min={0}
        />
        <CounterRow
          label="Wide Run"
          settingKey="wide_ball_run"
          value={settings.wide_ball_run || 1}
          min={0}
        />
        <CounterRow
          label="Penlty Run"
          settingKey="penlty_run"
          value={settings.penlty_run || 5}
          min={0}
        />

        {/* Wicket Types */}
        <Text style={styles.sectionTitle}>Wicket Types</Text>
        <View style={styles.wicketChipsWrap}>
          {ALL_WICKET_TYPES.map((wt) => {
            const isSelected = selectedIds.has(wt.id);
            return (
              <TouchableOpacity
                key={wt.id}
                style={[styles.wicketChip, isSelected && styles.wicketChipSelected]}
                onPress={() => toggleWicketType(wt.id)}
                activeOpacity={0.7}
              >
                {isSelected && <Text style={styles.wicketChipCheck}>✓ </Text>}
                {!isSelected && <Text style={styles.wicketChipPlus}>+ </Text>}
                <Text
                  style={[
                    styles.wicketChipText,
                    isSelected && styles.wicketChipTextSelected,
                  ]}
                >
                  {wt.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Save */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveSettings}>
          <Text style={styles.saveBtnText}>Save Settings</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    );
  };

  // ══════════════════════════════════
  // ─── SQUAD TAB ───
  // ══════════════════════════════════
  const renderSquadTab = () => (
    <View style={styles.tabContent}>
      {/* Team 1 */}
      <TouchableOpacity style={styles.teamCard} onPress={() => handleTeamSelection(1)}>
        <View style={styles.teamCardRow}>
          <Text style={styles.teamCardName}>
            {team1Name}
          </Text>
          <View
            style={[
              styles.squadBadge,
              selectedSquad.team1?.length === settings.player_count && styles.squadBadgeDone,
            ]}
          >
            <Text style={styles.squadBadgeText}>
              {selectedSquad.team1?.length || 0}/{settings.player_count || 11}
            </Text>
          </View>
        </View>
        <Text style={styles.teamCardSub}>
          {selectedSquad.team1?.length === settings.player_count
            ? 'Squad selected ✓'
            : 'Tap to select squad →'}
        </Text>
      </TouchableOpacity>

      {/* Team 2 */}
      <TouchableOpacity style={styles.teamCard} onPress={() => handleTeamSelection(2)}>
        <View style={styles.teamCardRow}>
          <Text style={styles.teamCardName}>
            {team2Name}
          </Text>
          <View
            style={[
              styles.squadBadge,
              selectedSquad.team2?.length === settings.player_count && styles.squadBadgeDone,
            ]}
          >
            <Text style={styles.squadBadgeText}>
              {selectedSquad.team2?.length || 0}/{settings.player_count || 11}
            </Text>
          </View>
        </View>
        <Text style={styles.teamCardSub}>
          {selectedSquad.team2?.length === settings.player_count
            ? 'Squad selected ✓'
            : 'Tap to select squad →'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // ══════════════════════════════════
  // ─── TOSS TAB (INLINE) ───
  // ══════════════════════════════════
  const getTossWinnerName = () => (tossWinner === team1Id ? team1Name : team2Name);

  const getBattingFirst = () => {
    if (!tossWinner || !tossElection) return '';
    if (tossElection === 'bat') return tossWinner === team1Id ? team1Name : team2Name;
    return tossWinner === team1Id ? team2Name : team1Name;
  };

  const getBowlingFirst = () => {
    if (!tossWinner || !tossElection) return '';
    if (tossElection === 'bowl') return tossWinner === team1Id ? team1Name : team2Name;
    return tossWinner === team1Id ? team2Name : team1Name;
  };

  const renderTossTab = () => {
    // Already completed – show summary
    if (toss.completed) {
      const winnerName = toss.winner === team1Id ? team1Name : team2Name;
      return (
        <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
          <View style={styles.tossCompletedCard}>
            <Text style={styles.tossCompletedIcon}>🏏</Text>
            <Text style={styles.tossCompletedTitle}>Toss Complete</Text>
            <Text style={styles.tossCompletedResult}>
              {winnerName} won the toss
            </Text>
            <Text style={styles.tossCompletedElection}>
              Elected to {toss.elected === 'bat' ? 'Bat' : 'Bowl'} first
            </Text>
            <TouchableOpacity style={styles.tossResetBtn} onPress={handleResetToss}>
              <Text style={styles.tossResetBtnText}>Redo Toss</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      );
    }

    // Step 1 & 2 inline
    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        {/* Step 1 – Who won the toss? */}
        <Text style={styles.tossStepTitle}>Who won the toss?</Text>
        <View style={styles.tossTeamsRow}>
          <TouchableOpacity
            style={[styles.tossTeamBtn, tossWinner === team1Id && styles.tossTeamBtnSelected]}
            onPress={() => { setTossWinner(team1Id); setTossElection(null); }}
          >
            <View style={[styles.tossTeamCircle, tossWinner === team1Id && styles.tossTeamCircleSelected]}>
              <Text style={[styles.tossTeamInitial, tossWinner === team1Id && styles.tossTeamInitialSelected]}>
                {team1Name.charAt(0)}
              </Text>
            </View>
            <Text style={[styles.tossTeamName, tossWinner === team1Id && styles.tossTeamNameSelected]}>
              {team1Name}
            </Text>
          </TouchableOpacity>

          <Text style={styles.tossVsText}>VS</Text>

          <TouchableOpacity
            style={[styles.tossTeamBtn, tossWinner === team2Id && styles.tossTeamBtnSelected]}
            onPress={() => { setTossWinner(team2Id); setTossElection(null); }}
          >
            <View style={[styles.tossTeamCircle, tossWinner === team2Id && styles.tossTeamCircleSelected]}>
              <Text style={[styles.tossTeamInitial, tossWinner === team2Id && styles.tossTeamInitialSelected]}>
                {team2Name.charAt(0)}
              </Text>
            </View>
            <Text style={[styles.tossTeamName, tossWinner === team2Id && styles.tossTeamNameSelected]}>
              {team2Name}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Step 2 – Elected to */}
        {tossWinner && (
          <>
            <Text style={styles.tossStepTitle}>{getTossWinnerName()} chose to...</Text>
            <View style={styles.tossElectionRow}>
              <TouchableOpacity
                style={[styles.tossElectBtn, tossElection === 'bat' && styles.tossElectBtnSelected]}
                onPress={() => setTossElection('bat')}
              >
                <Text style={styles.tossElectIcon}>🏏</Text>
                <Text style={[styles.tossElectText, tossElection === 'bat' && styles.tossElectTextSelected]}>
                  Bat First
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tossElectBtn, tossElection === 'bowl' && styles.tossElectBtnSelected]}
                onPress={() => setTossElection('bowl')}
              >
                <Text style={styles.tossElectIcon}>⚾</Text>
                <Text style={[styles.tossElectText, tossElection === 'bowl' && styles.tossElectTextSelected]}>
                  Bowl First
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Summary + Confirm */}
        {tossWinner && tossElection && (
          <View style={styles.tossSummaryCard}>
            <Text style={styles.tossSummaryTitle}>Match Order</Text>
            <View style={styles.tossSummaryRow}>
              <Text style={styles.tossSummaryLabel}>Batting First:</Text>
              <Text style={styles.tossSummaryValue}>{getBattingFirst()}</Text>
            </View>
            <View style={styles.tossSummaryRow}>
              <Text style={styles.tossSummaryLabel}>Bowling First:</Text>
              <Text style={styles.tossSummaryValue}>{getBowlingFirst()}</Text>
            </View>
            <TouchableOpacity
              style={styles.tossConfirmBtn}
              onPress={handleConfirmToss}
            >
              <Text style={styles.tossConfirmBtnText}>Confirm Toss</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    );
  };

  // ─── Tab router ───
  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return renderSetupTab();
      case 1:
        return renderSquadTab();
      case 2:
        return renderTossTab();
      default:
        return null;
    }
  };

  // ─── Loading ───
  if (loading && !match) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Action buttons row */}
      {renderActionButtons()}
      {/* Tab bar */}
      {renderTabs()}
      {/* Tab content */}
      {renderTabContent()}
    </View>
  );
};

// ═══════════════════════════════════════
// ─── STYLES ───
// ═══════════════════════════════════════
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ─── Action buttons ───
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  actionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 6,
    backgroundColor: '#fff',
  },
  actionBtnText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
  },
  actionBtnStart: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  actionBtnStartText: {
    color: '#fff',
    fontWeight: '700',
  },
  actionBtnReset: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  actionBtnResetText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  actionBtnDelete: {
    backgroundColor: '#dc3545',
    borderColor: '#dc3545',
  },
  actionBtnDeleteText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },

  // ─── Tabs ───
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  tabActive: {
    borderBottomWidth: 3,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },

  // ─── Tab content ───
  tabContent: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 8,
  },

  // ─── Counter rows ───
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  counterLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#bbb',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  counterBtnPlus: {
    borderColor: COLORS.primary,
  },
  counterBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#bbb',
    lineHeight: 20,
  },
  counterBtnPlusText: {
    color: COLORS.primary,
  },
  counterValue: {
    width: 36,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
  },

  // ─── Wicket Types ───
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginTop: 20,
    marginBottom: 12,
  },
  wicketChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  wicketChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    marginBottom: 4,
  },
  wicketChipSelected: {
    backgroundColor: '#3b5998',
    borderColor: '#3b5998',
  },
  wicketChipCheck: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  wicketChipPlus: {
    color: '#999',
    fontSize: 13,
    fontWeight: '700',
  },
  wicketChipText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
  },
  wicketChipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },

  // ─── Save ───
  saveBtn: {
    backgroundColor: '#28a745',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },

  // ─── Squad Tab ───
  teamCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    ...SHADOWS.sm,
  },
  teamCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  teamCardName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  squadBadge: {
    backgroundColor: '#ffc107',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  squadBadgeDone: {
    backgroundColor: '#28a745',
  },
  squadBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  teamCardSub: {
    fontSize: 13,
    color: '#888',
  },

  // ─── Toss Tab (inline) ───
  tossStepTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  tossTeamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  tossTeamBtn: {
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    width: '40%',
    ...SHADOWS.sm,
  },
  tossTeamBtnSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  tossTeamCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  tossTeamCircleSelected: {
    backgroundColor: COLORS.primary + '25',
  },
  tossTeamInitial: {
    fontSize: 22,
    fontWeight: '700',
    color: '#999',
  },
  tossTeamInitialSelected: {
    color: COLORS.primary,
  },
  tossTeamName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  tossTeamNameSelected: {
    color: COLORS.primary,
  },
  tossVsText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#aaa',
  },
  tossElectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  tossElectBtn: {
    alignItems: 'center',
    padding: 18,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    width: '44%',
    ...SHADOWS.sm,
  },
  tossElectBtnSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  tossElectIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  tossElectText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  tossElectTextSelected: {
    color: COLORS.primary,
  },
  tossSummaryCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  tossSummaryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  tossSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  tossSummaryLabel: {
    fontSize: 14,
    color: '#888',
  },
  tossSummaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  tossConfirmBtn: {
    backgroundColor: '#28a745',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 14,
  },
  tossConfirmBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  tossCompletedCard: {
    backgroundColor: '#fff',
    padding: 28,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginTop: 12,
    ...SHADOWS.sm,
  },
  tossCompletedIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  tossCompletedTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#28a745',
    marginBottom: 8,
  },
  tossCompletedResult: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  tossCompletedElection: {
    fontSize: 15,
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: 4,
  },
  tossResetBtn: {
    marginTop: 18,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  tossResetBtnText: {
    color: '#dc3545',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default MatchSetupScreen;
