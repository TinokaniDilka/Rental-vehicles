import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';

const SETTINGS_ITEMS = [
  { icon: 'person-outline', label: 'Edit Profile', route: 'EditProfile' },
  { icon: 'help-circle-outline', label: 'Help & Support', route: 'Support' },
];

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  const avatarLetter = user?.name ? user.name.charAt(0).toUpperCase() : '?';

  return (
    <LinearGradient colors={['#ffffff', '#fff5eb']} style={styles.gradientBg}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Page Title */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Profile</Text>
          <TouchableOpacity style={styles.settingsIconBtn} activeOpacity={0.75}>
            <Ionicons name="settings-outline" size={20} color="#888888" />
          </TouchableOpacity>
        </View>

        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <LinearGradient
            colors={['#FF8C42', '#E6732A']}
            style={styles.avatarCircle}
          >
            {user?.name ? (
              <Text style={styles.avatarLetter}>{avatarLetter}</Text>
            ) : (
              <Ionicons name="person" size={38} color="#fff" />
            )}
          </LinearGradient>

          {/* Online badge */}
          <View style={styles.onlineDot} />

          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'email@example.com'}</Text>

          {/* Role Badge */}
          <View style={styles.roleBadge}>
            <Ionicons name="shield-checkmark" size={12} color="#FFA366" />
            <Text style={styles.roleBadgeText}>
              {user?.role?.toUpperCase() || 'USER'}
            </Text>
          </View>

          {/* Verification Badge */}
          <View style={[styles.roleBadge, { backgroundColor: user?.verificationStatus === 'Verified' ? 'rgba(16,185,129,0.15)' : user?.verificationStatus === 'Pending Review' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)', borderColor: user?.verificationStatus === 'Verified' ? 'rgba(16,185,129,0.3)' : user?.verificationStatus === 'Pending Review' ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)', marginTop: 8 }]}>
            <Ionicons name={user?.verificationStatus === 'Verified' ? "checkmark-circle" : "alert-circle"} size={12} color={user?.verificationStatus === 'Verified' ? "#10b981" : user?.verificationStatus === 'Pending Review' ? "#f59e0b" : "#ef4444"} />
            <Text style={[styles.roleBadgeText, { color: user?.verificationStatus === 'Verified' ? "#10b981" : user?.verificationStatus === 'Pending Review' ? "#f59e0b" : "#ef4444" }]}>
              {user?.verificationStatus?.toUpperCase() || 'NOT VERIFIED'}
            </Text>
          </View>
        </View>

        {/* Info Card */}
        <Text style={styles.sectionLabel}>Account Info</Text>
        <View style={styles.glassCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIconWrap}>
              <Ionicons name="mail-outline" size={16} color="#FF8C42" />
            </View>
            <View style={styles.infoTextWrap}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue} numberOfLines={1}>
                {user?.email || '—'}
              </Text>
            </View>
          </View>

          <View style={styles.rowDivider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconWrap}>
              <Ionicons name="shield-checkmark-outline" size={16} color="#FF8C42" />
            </View>
            <View style={styles.infoTextWrap}>
              <Text style={styles.infoLabel}>Role</Text>
              <Text style={styles.infoValue}>{user?.role || 'User'}</Text>
            </View>
          </View>
        </View>

        {/* Settings Section */}
        <Text style={styles.sectionLabel}>Settings</Text>
        <View style={styles.glassCard}>
          {SETTINGS_ITEMS.map((item, index) => (
            <React.Fragment key={item.label}>
              <TouchableOpacity
                style={styles.settingsRow}
                onPress={() => navigation?.navigate(item.route)}
                activeOpacity={0.7}
              >
                <View style={styles.settingsIconWrap}>
                  <Ionicons name={item.icon} size={18} color="#FF8C42" />
                </View>
                <Text style={styles.settingsLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={16} color="#4a4a4a" />
              </TouchableOpacity>
              {index < SETTINGS_ITEMS.length - 1 && <View style={styles.rowDivider} />}
            </React.Fragment>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBg: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 24,
  },

  // Page Header
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: 0.2,
  },
  settingsIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255, 140, 66, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Avatar Section
  avatarSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF8C42',
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  avatarLetter: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
  },
  onlineDot: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10b981',
    borderWidth: 2.5,
    borderColor: '#ffffff',
    top: 66,
    right: '37%',
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a1a',
    marginTop: 14,
    letterSpacing: 0.2,
  },
  userEmail: {
    fontSize: 14,
    color: '#888888',
    marginTop: 4,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 140, 66, 0.15)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 140, 66, 0.25)',
  },
  roleBadgeText: {
    color: '#FFA366',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginLeft: 4,
  },

  // Section Label
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888888',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
    marginLeft: 2,
  },

  // Glass Card
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 140, 66, 0.25)',
    padding: 18,
    marginBottom: 24,
    shadowColor: '#FF8C42',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  rowDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 140, 66, 0.1)',
    marginVertical: 10,
  },

  // Info Rows
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 140, 66, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  infoTextWrap: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: '#888888',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: '#1a1a1a',
    fontWeight: '600',
  },

  // Settings Rows
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  settingsIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 140, 66, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  settingsLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },

  // Logout Button
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(239,68,68,0.4)',
    backgroundColor: 'rgba(239,68,68,0.08)',
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});