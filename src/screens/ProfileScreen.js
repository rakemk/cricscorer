import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { logout } from '../store/slices/authSlice';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants';

const ProfileScreen = () => {
  const dispatch = useDispatch();
  const { user, session } = useSelector((state) => state.auth);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => dispatch(logout()),
      },
    ]);
  };

  // Extract display fields from user object
  const displayName =
    user?.name || user?.firstName
      ? `${user.firstName || ''}${user.lastName ? ' ' + user.lastName : ''}`
      : user?.username || 'User';
  const email = user?.email || user?.emailId || null;
  const phone = user?.phone || user?.mobile || user?.phoneNumber || null;
  const role = user?.role || user?.userRole || null;
  const orgName = user?.orgName || user?.organizationName || session?.orgName || null;
  const uuid = user?.uuid || session?.uuid || null;

  const InfoRow = ({ icon, label, value }) => {
    if (!value) return null;
    return (
      <View style={styles.infoRow}>
        <Ionicons name={icon} size={20} color={COLORS.primary} style={styles.infoIcon} />
        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>{label}</Text>
          <Text style={styles.infoValue}>{value}</Text>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Avatar Section */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {displayName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.displayName}>{displayName}</Text>
        {role && <Text style={styles.roleText}>{role}</Text>}
      </View>

      {/* User Details Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account Details</Text>
        <InfoRow icon="mail-outline" label="Email" value={email} />
        <InfoRow icon="call-outline" label="Phone" value={phone} />
        <InfoRow icon="business-outline" label="Organization" value={orgName} />
        <InfoRow icon="finger-print-outline" label="UUID" value={uuid} />
        {!email && !phone && !orgName && !uuid && (
          <Text style={styles.noDataText}>No additional details available</Text>
        )}
      </View>

      {/* Session Info Card */}
      {session && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Session Info</Text>
          <InfoRow
            icon="shield-checkmark-outline"
            label="Token Type"
            value={session?.tokenType || 'Bearer'}
          />
          <InfoRow
            icon="checkmark-circle-outline"
            label="Status"
            value="Authenticated"
          />
        </View>
      )}

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={COLORS.white} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.white,
  },
  displayName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
  },
  roleText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoIcon: {
    marginRight: SPACING.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: 15,
    color: COLORS.text,
    marginTop: 2,
  },
  noDataText: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    paddingVertical: SPACING.md,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.danger,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.md,
    ...SHADOWS.sm,
  },
  logoutText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
});

export default ProfileScreen;
