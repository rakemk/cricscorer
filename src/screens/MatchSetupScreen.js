import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchMatch,
  fetchMatchSettings,
  fetchTourSquad,
  updateMatchSettings,
  setSettings,
} from '../store/slices/matchSlice';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS, WICKET_TYPES } from '../constants';
import { SCREENS } from '../navigation';

const TABS = ['Setup', 'Squad', 'Toss', 'Post Match', 'Fair Play'];

const MatchSetupScreen = ({ navigation, route }) => {
  const { matchId } = route.params || {};
  const dispatch = useDispatch();
  const { match, settings, loading, selectedSquad, toss } = useSelector(
    (state) => state.match
  );

  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (matchId) {
      dispatch(fetchMatch(matchId));
      dispatch(fetchMatchSettings(matchId));
      dispatch(fetchTourSquad(matchId));
    }
  }, [matchId, dispatch]);

  const handleSettingChange = (key, value) => {
    dispatch(setSettings({ [key]: value }));
  };

  const handleSaveSettings = () => {
    if (matchId) {
      dispatch(updateMatchSettings({ matchId, settings }));
    }
  };

  const handleTeamSelection = (team) => {
    const teamName = team === 1 ? match?.team1_name : match?.team2_name;
    const teamId = team === 1 ? match?.team1_id : match?.team2_id;
    
    navigation.navigate(SCREENS.TEAM_SELECTION, {
      matchId,
      team: `team${team}`,
      teamId,
      teamName,
    });
  };

  const handleToss = () => {
    navigation.navigate(SCREENS.TOSS, { matchId });
  };

  const handleStartMatch = () => {
    navigation.navigate(SCREENS.SCOREBOARD, { matchId });
  };

  const isSetupComplete = () => {
    const team1Complete = selectedSquad.team1?.length === settings.player_count;
    const team2Complete = selectedSquad.team2?.length === settings.player_count;
    return team1Complete && team2Complete && toss.completed;
  };

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {TABS.map((tab, index) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === index && styles.tabActive]}
            onPress={() => setActiveTab(index)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === index && styles.tabTextActive,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderSetupTab = () => (
    <ScrollView style={styles.tabContent}>
      {/* Total Overs */}
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Total Overs</Text>
        <View style={styles.numberInput}>
          <TouchableOpacity
            style={styles.numberButton}
            onPress={() =>
              handleSettingChange('ttl_over', Math.max(1, settings.ttl_over - 1))
            }
          >
            <Text style={styles.numberButtonText}>-</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.numberValue}
            value={String(settings.ttl_over || 20)}
            onChangeText={(text) =>
              handleSettingChange('ttl_over', parseInt(text) || 0)
            }
            keyboardType="numeric"
          />
          <TouchableOpacity
            style={styles.numberButton}
            onPress={() =>
              handleSettingChange('ttl_over', settings.ttl_over + 1)
            }
          >
            <Text style={styles.numberButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Max Overs per Bowler */}
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Max Overs per Bowler</Text>
        <View style={styles.numberInput}>
          <TouchableOpacity
            style={styles.numberButton}
            onPress={() =>
              handleSettingChange(
                'bowler_max_over',
                Math.max(1, settings.bowler_max_over - 1)
              )
            }
          >
            <Text style={styles.numberButtonText}>-</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.numberValue}
            value={String(settings.bowler_max_over || 4)}
            onChangeText={(text) =>
              handleSettingChange('bowler_max_over', parseInt(text) || 0)
            }
            keyboardType="numeric"
          />
          <TouchableOpacity
            style={styles.numberButton}
            onPress={() =>
              handleSettingChange('bowler_max_over', settings.bowler_max_over + 1)
            }
          >
            <Text style={styles.numberButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Players per Team */}
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Players per Team</Text>
        <View style={styles.numberInput}>
          <TouchableOpacity
            style={styles.numberButton}
            onPress={() =>
              handleSettingChange(
                'player_count',
                Math.max(2, settings.player_count - 1)
              )
            }
          >
            <Text style={styles.numberButtonText}>-</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.numberValue}
            value={String(settings.player_count || 11)}
            onChangeText={(text) =>
              handleSettingChange('player_count', parseInt(text) || 0)
            }
            keyboardType="numeric"
          />
          <TouchableOpacity
            style={styles.numberButton}
            onPress={() =>
              handleSettingChange('player_count', settings.player_count + 1)
            }
          >
            <Text style={styles.numberButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Team Wickets */}
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Team Wickets</Text>
        <View style={styles.numberInput}>
          <TouchableOpacity
            style={styles.numberButton}
            onPress={() =>
              handleSettingChange(
                'team_wickets',
                Math.max(1, settings.team_wickets - 1)
              )
            }
          >
            <Text style={styles.numberButtonText}>-</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.numberValue}
            value={String(settings.team_wickets || 10)}
            onChangeText={(text) =>
              handleSettingChange('team_wickets', parseInt(text) || 0)
            }
            keyboardType="numeric"
          />
          <TouchableOpacity
            style={styles.numberButton}
            onPress={() =>
              handleSettingChange('team_wickets', settings.team_wickets + 1)
            }
          >
            <Text style={styles.numberButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Wide Ball Runs */}
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Wide Ball Runs</Text>
        <View style={styles.numberInput}>
          <TouchableOpacity
            style={styles.numberButton}
            onPress={() =>
              handleSettingChange(
                'wide_ball_run',
                Math.max(1, settings.wide_ball_run - 1)
              )
            }
          >
            <Text style={styles.numberButtonText}>-</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.numberValue}
            value={String(settings.wide_ball_run || 1)}
            onChangeText={(text) =>
              handleSettingChange('wide_ball_run', parseInt(text) || 0)
            }
            keyboardType="numeric"
          />
          <TouchableOpacity
            style={styles.numberButton}
            onPress={() =>
              handleSettingChange('wide_ball_run', settings.wide_ball_run + 1)
            }
          >
            <Text style={styles.numberButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* No Ball Runs */}
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>No Ball Runs</Text>
        <View style={styles.numberInput}>
          <TouchableOpacity
            style={styles.numberButton}
            onPress={() =>
              handleSettingChange(
                'no_ball_run',
                Math.max(1, settings.no_ball_run - 1)
              )
            }
          >
            <Text style={styles.numberButtonText}>-</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.numberValue}
            value={String(settings.no_ball_run || 1)}
            onChangeText={(text) =>
              handleSettingChange('no_ball_run', parseInt(text) || 0)
            }
            keyboardType="numeric"
          />
          <TouchableOpacity
            style={styles.numberButton}
            onPress={() =>
              handleSettingChange('no_ball_run', settings.no_ball_run + 1)
            }
          >
            <Text style={styles.numberButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveSettings}>
        <Text style={styles.saveButtonText}>Save Settings</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderSquadTab = () => (
    <View style={styles.tabContent}>
      {/* Team 1 Selection */}
      <TouchableOpacity
        style={styles.teamCard}
        onPress={() => handleTeamSelection(1)}
      >
        <View style={styles.teamCardHeader}>
          <Text style={styles.teamCardTitle}>
            {match?.team1_name || 'Team 1'}
          </Text>
          <View
            style={[
              styles.squadStatus,
              selectedSquad.team1?.length === settings.player_count &&
                styles.squadStatusComplete,
            ]}
          >
            <Text style={styles.squadStatusText}>
              {selectedSquad.team1?.length || 0}/{settings.player_count || 11}
            </Text>
          </View>
        </View>
        <Text style={styles.teamCardSubtitle}>
          {selectedSquad.team1?.length === settings.player_count
            ? 'Squad selected'
            : 'Tap to select squad'}
        </Text>
      </TouchableOpacity>

      {/* Team 2 Selection */}
      <TouchableOpacity
        style={styles.teamCard}
        onPress={() => handleTeamSelection(2)}
      >
        <View style={styles.teamCardHeader}>
          <Text style={styles.teamCardTitle}>
            {match?.team2_name || 'Team 2'}
          </Text>
          <View
            style={[
              styles.squadStatus,
              selectedSquad.team2?.length === settings.player_count &&
                styles.squadStatusComplete,
            ]}
          >
            <Text style={styles.squadStatusText}>
              {selectedSquad.team2?.length || 0}/{settings.player_count || 11}
            </Text>
          </View>
        </View>
        <Text style={styles.teamCardSubtitle}>
          {selectedSquad.team2?.length === settings.player_count
            ? 'Squad selected'
            : 'Tap to select squad'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderTossTab = () => (
    <View style={styles.tabContent}>
      <TouchableOpacity style={styles.tossCard} onPress={handleToss}>
        <Text style={styles.tossTitle}>Toss</Text>
        {toss.completed ? (
          <View>
            <Text style={styles.tossResult}>
              {toss.winner === match?.team1_id
                ? match?.team1_name
                : match?.team2_name}{' '}
              won the toss
            </Text>
            <Text style={styles.tossElected}>
              Elected to {toss.elected === 'bat' ? 'Bat' : 'Bowl'} first
            </Text>
          </View>
        ) : (
          <Text style={styles.tossSubtitle}>Tap to conduct toss</Text>
        )}
        <View
          style={[
            styles.tossStatus,
            toss.completed && styles.tossStatusComplete,
          ]}
        >
          <Text style={styles.tossStatusText}>
            {toss.completed ? '✓ Complete' : 'Pending'}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderPostMatchTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>
          Post match features will be available after the match ends
        </Text>
      </View>
    </View>
  );

  const renderFairPlayTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>
          Fair play scoring will be available during/after the match
        </Text>
      </View>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return renderSetupTab();
      case 1:
        return renderSquadTab();
      case 2:
        return renderTossTab();
      case 3:
        return renderPostMatchTab();
      case 4:
        return renderFairPlayTab();
      default:
        return null;
    }
  };

  if (loading && !match) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Match Header */}
      <View style={styles.matchHeader}>
        <Text style={styles.matchTitle}>
          {match?.team1_name || 'Team 1'} vs {match?.team2_name || 'Team 2'}
        </Text>
        <Text style={styles.matchSubtitle}>
          {match?.match_date} • {match?.ground_name || 'Venue TBD'}
        </Text>
      </View>

      {/* Tabs */}
      {renderTabs()}

      {/* Tab Content */}
      {renderTabContent()}

      {/* Start Match Button */}
      {activeTab === 2 && isSetupComplete() && (
        <TouchableOpacity
          style={styles.startMatchButton}
          onPress={handleStartMatch}
        >
          <Text style={styles.startMatchButtonText}>Start Match</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchHeader: {
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
  },
  matchTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  matchSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.white + 'CC',
    marginTop: SPACING.xs,
  },
  tabsContainer: {
    backgroundColor: COLORS.card,
    ...SHADOWS.sm,
  },
  tab: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  tabActive: {
    borderBottomWidth: 3,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    padding: SPACING.md,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  settingLabel: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    flex: 1,
  },
  numberInput: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  numberButton: {
    width: 36,
    height: 36,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
  },
  numberValue: {
    width: 50,
    textAlign: 'center',
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  saveButton: {
    backgroundColor: COLORS.success,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
  },
  teamCard: {
    backgroundColor: COLORS.card,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  teamCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  teamCardTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  squadStatus: {
    backgroundColor: COLORS.warning,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  squadStatusComplete: {
    backgroundColor: COLORS.success,
  },
  squadStatusText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
  },
  teamCardSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  tossCard: {
    backgroundColor: COLORS.card,
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  tossTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  tossResult: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    textAlign: 'center',
  },
  tossElected: {
    fontSize: FONTS.sizes.md,
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  tossSubtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  tossStatus: {
    backgroundColor: COLORS.warning,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.md,
  },
  tossStatusComplete: {
    backgroundColor: COLORS.success,
  },
  tossStatusText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  startMatchButton: {
    backgroundColor: COLORS.success,
    margin: SPACING.md,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  startMatchButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
  },
});

export default MatchSetupScreen;
