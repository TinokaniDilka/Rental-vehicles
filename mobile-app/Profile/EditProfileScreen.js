import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../context/AuthContext';
import { updateProfile as updateProfileApi, uploadVerificationDocs } from '../services/authService';

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024; // 5MB

export default function EditProfileScreen({ navigation }) {
  const { user, refreshUser, updateUser } = useContext(AuthContext);
  const isStaff = user?.role === 'staff';

  // Shared
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

  // Staff-only
  const [email, setEmail] = useState(user?.email || '');

  // Customer-only — same fields as the old modal in ProfileScreen.js
  const [phone, setPhone] = useState(user?.phone || '');
  const [nic, setNic] = useState(user?.nicNumber || '');
  const [dl, setDl] = useState(user?.drivingLicenseNumber || '');
  const [password, setPassword] = useState('');
  const [idPhotoAsset, setIdPhotoAsset] = useState(null);
  const [licensePhotoAsset, setLicensePhotoAsset] = useState(null);

  const pickImage = async (setter) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library to upload documents.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsEditing: false,
    });

    if (result.canceled || !result.assets?.length) return;

    const asset = result.assets[0];

    if (asset.fileSize && asset.fileSize > MAX_UPLOAD_SIZE) {
      Alert.alert('File too large', 'Please choose an image under 5MB.');
      return;
    }

    const filename = asset.uri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    setter({ uri: asset.uri, name: filename, type });
  };

  const handleSaveStaff = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Error', 'Email cannot be empty');
      return;
    }
    setSaving(true);
    try {
      await updateProfileApi({ name: name.trim(), email: email.trim() });
      if (typeof refreshUser === 'function') {
        await refreshUser();
      }
      Alert.alert('Success', 'Profile updated ✅', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      console.error('Update profile error:', err.response?.data || err.message);
      Alert.alert('Error', err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCustomer = async () => {
    setSaving(true);
    try {
      const payload = {
        name,
        phone,
        nicNumber: nic,
        drivingLicenseNumber: dl,
        ...(password ? { password } : {}),
      };

      const res = await updateProfileApi(payload);
      let updatedUser = res.data.user || res.data;

      if (idPhotoAsset || licensePhotoAsset) {
        const docsRes = await uploadVerificationDocs({
          idPhoto: idPhotoAsset,
          licensePhoto: licensePhotoAsset,
        });
        updatedUser = docsRes.data.user;
      }

      // updateUser writes straight into AuthContext (same as the old modal
      // did) — used here instead of refreshUser() since we already have the
      // fresh user object back from the save call, no need for a second
      // round-trip to the server.
      if (typeof updateUser === 'function') {
        await updateUser(updatedUser);
      }

      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      console.error('Profile update error:', err);
      Alert.alert('Error', err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const avatarLetter = name ? name.charAt(0).toUpperCase() : (user?.name?.charAt(0).toUpperCase() || '?');

  return (
    <LinearGradient colors={['#ffffff', '#fff5eb']} style={styles.gradientBg}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={22} color="#1a1a1a" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Avatar Preview */}
          <View style={styles.avatarSection}>
            <LinearGradient colors={['#FF8C42', '#E6732A']} style={styles.avatarCircle}>
              <Text style={styles.avatarLetter}>{avatarLetter}</Text>
            </LinearGradient>
            <View style={styles.roleBadge}>
              <Ionicons name="shield-checkmark" size={12} color="#FFA366" />
              <Text style={styles.roleBadgeText}>{user?.role?.toUpperCase() || 'USER'}</Text>
            </View>
          </View>

          {isStaff ? (
            // ── Staff: simple name + email ──
            <View style={styles.glassCard}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Your full name"
                placeholderTextColor="#4a4a4a"
                autoCapitalize="words"
                returnKeyType="next"
                blurOnSubmit={false}
              />

              <Text style={[styles.inputLabel, { marginTop: 18 }]}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor="#4a4a4a"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
              />
            </View>
          ) : (
            // ── Customer: full profile — same fields as the old modal ──
            <View style={styles.glassCard}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Full Name"
                placeholderTextColor="#4a4a4a"
                autoCapitalize="words"
                returnKeyType="next"
                blurOnSubmit={false}
              />

              <Text style={[styles.inputLabel, { marginTop: 18 }]}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Phone Number"
                placeholderTextColor="#4a4a4a"
                keyboardType="phone-pad"
                returnKeyType="next"
                blurOnSubmit={false}
              />

              <Text style={[styles.inputLabel, { marginTop: 18 }]}>NIC Number</Text>
              <TextInput
                style={styles.input}
                value={nic}
                onChangeText={setNic}
                placeholder="NIC Number"
                placeholderTextColor="#4a4a4a"
                returnKeyType="next"
                blurOnSubmit={false}
              />

              <Text style={[styles.inputLabel, { marginTop: 18 }]}>Driving License</Text>
              <TextInput
                style={styles.input}
                value={dl}
                onChangeText={setDl}
                placeholder="Driving License"
                placeholderTextColor="#4a4a4a"
                returnKeyType="next"
                blurOnSubmit={false}
              />

              <Text style={[styles.inputLabel, { marginTop: 18 }]}>Verification Documents</Text>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                <TouchableOpacity style={styles.photoBtn} onPress={() => pickImage(setIdPhotoAsset)}>
                  {idPhotoAsset ? (
                    <Image source={{ uri: idPhotoAsset.uri }} style={{ width: 20, height: 20, borderRadius: 4, marginRight: 4 }} />
                  ) : (
                    <Ionicons name="camera-outline" size={20} color="#fff" />
                  )}
                  <Text style={styles.photoBtnText}>{idPhotoAsset ? 'ID Selected ✓' : 'ID Photo'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.photoBtn} onPress={() => pickImage(setLicensePhotoAsset)}>
                  {licensePhotoAsset ? (
                    <Image source={{ uri: licensePhotoAsset.uri }} style={{ width: 20, height: 20, borderRadius: 4, marginRight: 4 }} />
                  ) : (
                    <Ionicons name="camera-outline" size={20} color="#fff" />
                  )}
                  <Text style={styles.photoBtnText}>{licensePhotoAsset ? 'License Selected ✓' : 'License'}</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.hintText}>
                Max 5MB per photo. Uploading new documents resets your status to Pending Review.
              </Text>

              <Text style={[styles.inputLabel, { marginTop: 18 }]}>New Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Leave blank to keep current password"
                placeholderTextColor="#4a4a4a"
                secureTextEntry
                returnKeyType="done"
              />
            </View>
          )}

          {/* Save Button */}
          <TouchableOpacity
            style={styles.saveBtnWrapper}
            onPress={isStaff ? handleSaveStaff : handleSaveCustomer}
            disabled={saving}
            activeOpacity={0.85}
          >
            <LinearGradient colors={['#FF8C42', '#E6732A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.saveBtn}>
              {saving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()} disabled={saving} activeOpacity={0.75}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBg: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 24,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 140, 66, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 140, 66, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: 0.3,
  },
  headerSpacer: { width: 40 },

  avatarSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatarCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF8C42',
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    marginBottom: 12,
  },
  avatarLetter: {
    fontSize: 34,
    fontWeight: '800',
    color: '#fff',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 140, 66, 0.15)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
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

  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 140, 66, 0.25)',
    padding: 20,
    marginBottom: 24,
    shadowColor: '#FF8C42',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888888',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 245, 235, 0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 140, 66, 0.25)',
    paddingHorizontal: 16,
    paddingVertical: 13,
    color: '#1a1a1a',
    fontSize: 15,
    fontWeight: '500',
  },
  hintText: {
    color: '#888888',
    fontSize: 11,
    marginTop: 8,
  },
  photoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 245, 235, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 140, 66, 0.25)',
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  photoBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  saveBtnWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 14,
    shadowColor: '#FF8C42',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 140, 66, 0.25)',
  },
  cancelBtnText: {
    color: '#888888',
    fontSize: 16,
    fontWeight: '600',
  },
});