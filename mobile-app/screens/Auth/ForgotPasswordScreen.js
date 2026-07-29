import React, { useState, useEffect } from 'react';
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
import { validateEmail } from '../../utils/validation';
import api from '../../services/api';

export default function ForgotPasswordScreen({ navigation }) {
  const [contactType, setContactType] = useState('email'); // 'email' | 'phone'
  const [contactValue, setContactValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    const trimmed = contactValue.trim();

    if (contactType === 'email') {
      if (!validateEmail(trimmed)) {
        Alert.alert('Invalid Email', 'Please enter a valid email address.');
        return;
      }
    } else {
      if (trimmed.replace(/\D/g, '').length < 7) {
        Alert.alert('Invalid Phone', 'Please enter a valid phone number.');
        return;
      }
    }

    setLoading(true);
    try {
      const res = await api.post('/api/auth/forgot-password', { emailOrPhone: trimmed });
      const resolvedEmail = res.data.resolvedEmail || trimmed;
      const maskedEmail = res.data.maskedEmail || 'your registered email';
      navigation.navigate('ResetPassword', { email: resolvedEmail, maskedEmail });
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
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

        {/* Hero */}
        <View style={styles.heroSection}>
          <View style={styles.iconBadge}>
            <Ionicons name="key-outline" size={36} color="#1E3A8A" />
          </View>
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            Enter your {contactType === 'email' ? 'email address' : 'phone number'} and we'll send a 6-digit OTP to your registered email.
          </Text>
        </View>

        {/* Card */}
        <View style={styles.glassCard}>

          {/* Toggle: Email / Phone */}
          <View style={styles.toggleRow}>
            {['email', 'phone'].map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => { setContactType(type); setContactValue(''); }}
                style={[styles.toggleBtn, contactType === type && styles.toggleBtnActive]}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={type === 'email' ? 'mail-outline' : 'call-outline'}
                  size={15}
                  color={contactType === type ? '#fff' : '#1E3A8A'}
                  style={{ marginRight: 5 }}
                />
                <Text style={[styles.toggleBtnText, contactType === type && styles.toggleBtnTextActive]}>
                  {type === 'email' ? 'Email' : 'Phone'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Input */}
          <Text style={styles.fieldLabel}>
            {contactType === 'email' ? 'EMAIL ADDRESS' : 'PHONE NUMBER'}
          </Text>
          <View style={styles.inputRow}>
            <Ionicons
              name={contactType === 'email' ? 'mail-outline' : 'call-outline'}
              size={18}
              color={COLORS.primary}
              style={styles.inputIcon}
            />
            <InputField
              placeholder={contactType === 'email' ? '       you@example.com' : '       +94 77 123 4567'}
              value={contactValue}
              onChangeText={setContactValue}
              keyboardType={contactType === 'email' ? 'email-address' : 'phone-pad'}
              autoCapitalize="none"
            />
          </View>

          {/* Phone hint */}
          {contactType === 'phone' && (
            <View style={styles.hintBox}>
              <Ionicons name="information-circle-outline" size={15} color="#1E3A8A" />
              <Text style={styles.hintText}>
                The OTP will be sent to the email address registered with this phone number.
              </Text>
            </View>
          )}

          {/* Send Button */}
          <TouchableOpacity
            onPress={handleSendCode}
            disabled={loading}
            activeOpacity={0.85}
            style={styles.submitBtnWrapper}
          >
            <LinearGradient
              colors={['#1E3A8A', '#D4AF37']}
              style={styles.submitBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="send-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.submitBtnText}>Send OTP Code</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
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
  // Toggle
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 58, 138, 0.06)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    gap: 4,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 9,
  },
  toggleBtnActive: {
    backgroundColor: '#1E3A8A',
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  toggleBtnText: { fontSize: 14, fontWeight: '600', color: '#1E3A8A' },
  toggleBtnTextActive: { color: '#fff' },
  // Input
  fieldLabel: { fontSize: 11, fontWeight: '700', color: '#1E3A8A', letterSpacing: 0.8, marginBottom: 6 },
  inputRow: { position: 'relative', flexDirection: 'row', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: 14, zIndex: 10 },
  // Hint
  hintBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: 'rgba(30, 58, 138, 0.07)',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(30, 58, 138, 0.15)',
  },
  hintText: { flex: 1, fontSize: 12, color: '#1E3A8A', lineHeight: 17 },
  // Submit
  submitBtnWrapper: { marginTop: 20, borderRadius: 14, overflow: 'hidden' },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 14 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});