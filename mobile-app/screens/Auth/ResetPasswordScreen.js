import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import InputField from '../../components/InputField';
import { COLORS } from '../../utils/theme';
import { validatePassword } from '../../utils/validation';
import { verifyResetOtp, resetPassword, forgotPassword } from '../../services/authService';

export default function ResetPasswordScreen({ navigation, route }) {
  const { email, maskedEmail } = route.params;

  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleVerify = async () => {
    if (!otp || otp.trim().length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit code sent to your email');
      return;
    }
    setVerifying(true);
    try {
      await verifyResetOtp(email, otp.trim());
      setOtpVerified(true);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Invalid or expired code');
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await forgotPassword(email);
      Alert.alert('Sent', 'A new code has been sent to your email');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  const handleReset = async () => {
    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      Alert.alert('Error', validation.message);
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setSaving(true);
    try {
      await resetPassword(email, otp.trim(), newPassword);
      Alert.alert('Success', 'Your password has been reset. Please log in.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to reset password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <LinearGradient
        colors={['#ffffff', '#fff5eb', '#ffffff']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
      />

      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#1a1a1a" />
        </TouchableOpacity>

        <View style={styles.heroSection}>
          <View style={styles.iconBadge}>
            <Ionicons name={otpVerified ? 'lock-open-outline' : 'shield-checkmark-outline'} size={36} color="#1E3A8A" />
          </View>
          <Text style={styles.title}>{otpVerified ? 'Set New Password' : 'Enter Reset Code'}</Text>
          <Text style={styles.subtitle}>
            {otpVerified
              ? 'Choose a new password for your account.'
              : `We sent a 6-digit OTP to ${maskedEmail || email}`}
          </Text>
        </View>

        <View style={styles.glassCard}>
          {!otpVerified ? (
            <>
              <Text style={styles.fieldLabel}>6-DIGIT CODE</Text>
              <View style={styles.inputRow}>
                <Ionicons name="keypad-outline" size={18} color={COLORS.primary} style={styles.inputIcon} />
                <InputField
                  placeholder="       000000"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>

              <TouchableOpacity onPress={handleVerify} disabled={verifying} activeOpacity={0.85} style={styles.submitBtnWrapper}>
                <LinearGradient colors={['#1E3A8A', '#D4AF37']} style={styles.submitBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  {verifying ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                      <Text style={styles.submitBtnText}>Verify Code</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleResend} disabled={resending} style={styles.resendBtn}>
                <Text style={styles.resendText}>{resending ? 'Resending…' : "Didn't get a code? Resend"}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.fieldLabel}>NEW PASSWORD</Text>
              <View style={styles.inputRow}>
                <Ionicons name="lock-closed-outline" size={18} color={COLORS.primary} style={styles.inputIcon} />
                <InputField
                  placeholder="       ••••••••"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                />
              </View>

              <Text style={[styles.fieldLabel, { marginTop: 16 }]}>CONFIRM PASSWORD</Text>
              <View style={styles.inputRow}>
                <Ionicons name="lock-closed-outline" size={18} color={COLORS.primary} style={styles.inputIcon} />
                <InputField
                  placeholder="       ••••••••"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity onPress={handleReset} disabled={saving} activeOpacity={0.85} style={styles.submitBtnWrapper}>
                <LinearGradient colors={['#1E3A8A', '#D4AF37']} style={styles.submitBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  {saving ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                      <Text style={styles.submitBtnText}>Reset Password</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  scrollContainer: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 48 },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(30, 58, 138, 0.08)',
    borderWidth: 1, borderColor: 'rgba(30, 58, 138, 0.2)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  heroSection: { alignItems: 'center', marginBottom: 28 },
  iconBadge: {
    width: 76, height: 76, borderRadius: 24,
    backgroundColor: 'rgba(30, 58, 138, 0.1)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  title: { fontSize: 24, fontWeight: '800', color: '#1a1a1a', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#4a4a4a', textAlign: 'center', lineHeight: 20, paddingHorizontal: 12 },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: 24,
    borderWidth: 1, borderColor: 'rgba(30, 58, 138, 0.25)', padding: 24,
    shadowColor: '#1E3A8A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8,
  },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: '#1E3A8A', letterSpacing: 0.8, marginBottom: 6 },
  inputRow: { position: 'relative', flexDirection: 'row', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: 14, zIndex: 10 },
  submitBtnWrapper: { marginTop: 20, borderRadius: 14, overflow: 'hidden' },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 14 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  resendBtn: { marginTop: 16, alignItems: 'center' },
  resendText: { color: '#1E3A8A', fontSize: 13, fontWeight: '600' },
});