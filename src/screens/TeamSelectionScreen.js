import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  addPlayerToSquad,
  removePlayerFromSquad,
  setCaptain,
  setWicketKeeper,
  saveTeamSquad,
} from '../store/slices/matchSlice';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../constants';

const TeamSelectionScreen = ({ navigation, route }) => {
  const { matchId, team, teamId, teamName } = route.params || {};
  const dispatch = useDispatch();
  const { tourSquad, selectedSquad, captain, wicketKeeper, settings, loading } =
    useSelector((state) => state.match);

  const teamKey = team || 'team1';
  const players = tourSquad[teamKey] || [];
  const selected = selectedSquad[teamKey] || [];
  const teamCaptain = captain[teamKey];
  const teamWK = wicketKeeper[teamKey];
  const maxPlayers = settings.player_count || 11;

  const isSelected = (playerId) => selected.some((p) => p.id === playerId);

  const handlePlayerToggle = (player) => {
    if (isSelected(player.id)) {
      dispatch(removePlayerFromSquad({ team: teamKey, playerId: player.id }));
      // Remove captain/WK if removed from squad
      if (teamCaptain === player.id) {
        dispatch(setCaptain({ team: teamKey, playerId: null }));
      }
      if (teamWK === player.id) {
        dispatch(setWicketKeeper({ team: teamKey, playerId: null }));
      }
    } else if (selected.length < maxPlayers) {
      dispatch(addPlayerToSquad({ team: teamKey, player }));
    }
  };

  const handleCaptainToggle = (playerId) => {
    if (!isSelected(playerId)) return;
    dispatch(
      setCaptain({
        team: teamKey,
        playerId: teamCaptain === playerId ? null : playerId,
      })
    );
  };

  const handleWKToggle = (playerId) => {
    if (!isSelected(playerId)) return;
    dispatch(
      setWicketKeeper({
        team: teamKey,
        playerId: teamWK === playerId ? null : playerId,
      })
    );
  };

  const handleSave = () => {
    const squadData = {
      players: selected,
      captain_id: teamCaptain,
      wk_id: teamWK,
    };
    dispatch(saveTeamSquad({ matchId, teamId, squadData }));
    navigation.goBack();
  };

  const renderPlayerCard = ({ item }) => {
    const playerSelected = isSelected(item.id);
    const isCaptain = teamCaptain === item.id;
    const isWK = teamWK === item.id;

    return (
      <TouchableOpacity
        style={[styles.playerCard, playerSelected && styles.playerCardSelected]}
        onPress={() => handlePlayerToggle(item)}
      >
        {/* Selection Indicator */}
        <View
          style={[
            styles.selectionIndicator,
            playerSelected && styles.selectionIndicatorSelected,
          ]}
        >
          {playerSelected && <Text style={styles.checkmark}>✓</Text>}
        </View>

        {/* Player Info */}
        <View style={styles.playerInfo}>
          <Text
            style={[
              styles.playerName,
              playerSelected && styles.playerNameSelected,
            ]}
          >
            {item.name || item.player_name}
          </Text>
          <Text style={styles.playerRole}>
            {item.role || item.playing_role || 'All-rounder'}
          </Text>
        </View>

        {/* Captain/WK Badges */}
        {playerSelected && (
          <View style={styles.badgesContainer}>
            <TouchableOpacity
              style={[styles.badge, isCaptain && styles.badgeActive]}
              onPress={() => handleCaptainToggle(item.id)}
            >
              <Text
                style={[
                  styles.badgeText,
                  isCaptain && styles.badgeTextActive,
                ]}
              >
                C
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.badge, isWK && styles.badgeActive]}
              onPress={() => handleWKToggle(item.id)}
            >
              <Text
                style={[styles.badgeText, isWK && styles.badgeTextActive]}
              >
                WK
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{teamName || 'Select Players'}</Text>
        <View style={styles.counterContainer}>
          <Text style={styles.counterText}>
            {selected.length}/{maxPlayers} selected
          </Text>
        </View>
      </View>

      {/* Players List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={players}
          renderItem={renderPlayerCard}
          keyExtractor={(item) => item.id?.toString() || item.player_id?.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No players available</Text>
            </View>
          }
        />
      )}

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            selected.length !== maxPlayers && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={selected.length !== maxPlayers}
        >
          <Text style={styles.saveButtonText}>
            {selected.length === maxPlayers
              ? 'Save Squad'
              : `Select ${maxPlayers - selected.length} more`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  counterContainer: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  counterText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: FONTS.sizes.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: SPACING.md,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  playerCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  selectionIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  selectionIndicatorSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkmark: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  playerNameSelected: {
    color: COLORS.primary,
  },
  playerRole: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  badgeText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
  },
  badgeTextActive: {
    color: COLORS.white,
  },
  emptyContainer: {
    paddingVertical: SPACING.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  footer: {
    padding: SPACING.md,
    backgroundColor: COLORS.card,
    ...SHADOWS.lg,
  },
  saveButton: {
    backgroundColor: COLORS.success,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.textLight,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
  },
});

export default TeamSelectionScreen;
