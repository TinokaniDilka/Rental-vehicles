import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  StatusBar,
  Modal,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import CustomButton from '../components/CustomButton';

const SETTINGS_ITEMS = [
  { icon: 'person-outline', label: 'Edit Profile', route: 'EditProfile' },
  { icon: 'notifications-outline', label: 'Notifications', route: 'Notifications' },
  { icon: 'help-circle-outline', label: 'Help & Support', route: 'Support' },
];


export default function ProfileScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  
const [editModalVisible, setEditModalVisible] = useState(false);
const [editName, setEditName] = useState(user?.name || '');
const [editPhone, setEditPhone] = useState(user?.phone || '');
const [editNic, setEditNic] = useState(user?.nicNumber || '');
const [editDl, setEditDl] = useState(user?.drivingLicenseNumber || '');
const [editPassword, setEditPassword] = useState('');

const handleSaveProfile = async () => {
  try {
    const updatedUser = {
      name: editName,
      phone: editPhone,
      nicNumber: editNic,
      drivingLicenseNumber: editDl,
      ...(editPassword ? { password: editPassword } : {}),
    };

    console.log('Updated Data:', updatedUser);

    Alert.alert('Success', 'Profile updated successfully');

    setEditPassword('');
    setEditModalVisible(false);
  } catch (error) {
    Alert.alert('Error', 'Failed to update profile');
  }
};

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

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).getFullYear()
    : '2024';

  return (
    <LinearGradient colors={['#0f172a', '#1e1b4b']} style={styles.gradientBg}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Page Title */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Profile</Text>
          <TouchableOpacity style={styles.settingsIconBtn} activeOpacity={0.75}>
            <Ionicons name="settings-outline" size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <LinearGradient
            colors={['#6366f1', '#4f46e5']}
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
            <Ionicons name="shield-checkmark" size={12} color="#818cf8" />
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
              <Ionicons name="mail-outline" size={16} color="#6366f1" />
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
              <Ionicons name="shield-checkmark-outline" size={16} color="#6366f1" />
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
onPress={() => {
  if (item.label === 'Edit Profile') {
    setEditName(user?.name || '');
    setEditPhone(user?.phone || '');
    setEditPassword('');
    setEditModalVisible(true);
  } else {
    navigation?.navigate(item.route);
  }
}}               activeOpacity={0.7}
              >
                <View style={styles.settingsIconWrap}>
                  <Ionicons name={item.icon} size={18} color="#6366f1" />
                </View>
                <Text style={styles.settingsLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={16} color="#475569" />
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
        <Modal
  visible={editModalVisible}
  transparent
  animationType="slide"
  onRequestClose={() => setEditModalVisible(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContainer}>
      <Text style={styles.modalTitle}>Edit Profile</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        placeholderTextColor="#94a3b8"
        value={editName}
        onChangeText={setEditName}
      />

      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        placeholderTextColor="#94a3b8"
        keyboardType="phone-pad"
        value={editPhone}
        onChangeText={setEditPhone}
      />

      <TextInput
        style={styles.input}
        placeholder="NIC Number"
        placeholderTextColor="#94a3b8"
        value={editNic}
        onChangeText={setEditNic}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Driving License"
        placeholderTextColor="#94a3b8"
        value={editDl}
        onChangeText={setEditDl}
      />

      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 15 }}>
        <TouchableOpacity style={styles.photoBtn}>
           <Ionicons name="camera-outline" size={20} color="#fff" />
           <Text style={styles.photoBtnText}>ID Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.photoBtn}>
           <Ionicons name="camera-outline" size={20} color="#fff" />
           <Text style={styles.photoBtnText}>License</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="New Password"
        placeholderTextColor="#94a3b8"
        secureTextEntry
        value={editPassword}
        onChangeText={setEditPassword}
      />

      <View style={styles.modalButtons}>
        <TouchableOpacity
  style={styles.cancelBtn}
  onPress={() => {
    Alert.alert('Cancel');
    setEditModalVisible(false);
  }}
>
  <Text style={styles.cancelText}>Cancel</Text>
</TouchableOpacity>
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSaveProfile}
        >
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>
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
    color: '#f8fafc',
    letterSpacing: 0.2,
  },
  settingsIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(30,41,59,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.2)',
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
    shadowColor: '#6366f1',
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
    borderColor: '#0f172a',
    top: 66,
    right: '37%',
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#f8fafc',
    marginTop: 14,
    letterSpacing: 0.2,
  },
  userEmail: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(99,102,241,0.15)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.3)',
  },
  roleBadgeText: {
    color: '#818cf8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginLeft: 4,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(30,41,59,0.85)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.2)',
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  statCardMiddle: {
    borderColor: 'rgba(99,102,241,0.35)',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#6366f1',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statActiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginBottom: 6,
  },
  statActiveText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#10b981',
    marginTop: 2,
  },

  // Section Label
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
    marginLeft: 2,
  },

  // Glass Card
  glassCard: {
    backgroundColor: 'rgba(30,41,59,0.85)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.25)',
    padding: 18,
    marginBottom: 24,
    shadowColor: '#6366f1',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  rowDivider: {
    height: 1,
    backgroundColor: 'rgba(99,102,241,0.1)',
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
    backgroundColor: 'rgba(99,102,241,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  infoTextWrap: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: '#f8fafc',
    fontWeight: '600',
  },

  modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.7)',
  justifyContent: 'center',
  alignItems: 'center',
},

modalContainer: {
  width: '90%',
  backgroundColor: '#1e293b',
  borderRadius: 20,
  padding: 20,
  borderWidth: 1,
  borderColor: 'rgba(99,102,241,0.3)',
},

modalTitle: {
  color: '#fff',
  fontSize: 22,
  fontWeight: '700',
  textAlign: 'center',
  marginBottom: 20,
},

input: {
  height: 50,
  borderRadius: 12,
  backgroundColor: 'rgba(255,255,255,0.05)',
  borderWidth: 1,
  borderColor: 'rgba(99,102,241,0.3)',
  color: '#fff',
  paddingHorizontal: 15,
  marginBottom: 15,
},

modalButtons: {
  flexDirection: 'row',
  marginTop: 10,
},

cancelBtn: {
  flex: 1,
  backgroundColor: '#334155',
  padding: 14,
  borderRadius: 12,
  alignItems: 'center',
  marginRight: 8,
},

saveBtn: {
  flex: 1,
  backgroundColor: '#6366f1',
  padding: 14,
  borderRadius: 12,
  alignItems: 'center',
  marginLeft: 8,
},

cancelText: {
  color: '#fff',
  fontWeight: '600',
},

saveText: {
  color: '#fff',
  fontWeight: '700',
},
photoBtn: {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(255,255,255,0.05)',
  borderWidth: 1,
  borderColor: 'rgba(99,102,241,0.3)',
  borderRadius: 12,
  padding: 10,
  gap: 5
},
photoBtnText: {
  color: '#fff',
  fontSize: 12,
  fontWeight: '600'
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
    backgroundColor: 'rgba(99,102,241,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  settingsLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#f8fafc',
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