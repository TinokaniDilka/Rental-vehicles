import React, { useState, useContext, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import InputField from '../../components/InputField';
import CustomButton from '../../components/CustomButton';
import { COLORS, SHADOWS, SIZES } from '../../utils/theme';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useContext(AuthContext);

  // Subtle scale animation for the card on mount
  const cardScale = useRef(new Animated.Value(0.96)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(cardScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 60,
        friction: 8,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      Alert.alert('Success', 'Welcome back!');
      // console.log('Login success');
    } catch (error) {
      Alert.alert('Login Failed', error.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Light gradient background */}
      <LinearGradient
        colors={['#ffffff', '#fff5eb', '#ffffff']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
      />

      {/* Glowing orb — top left */}
      <View style={styles.orbTopLeft} />

      {/* Glowing orb — bottom right */}
      <View style={styles.orbBottomRight} />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Section ── */}
        <View style={styles.heroSection}>
          <View style={styles.logoWrapper}>
            <LinearGradient
              colors={['rgba(255, 140, 66, 0.3)', 'rgba(255, 107, 0, 0.15)']}
              style={styles.logoBadge}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.logoEmoji}>🚗</Text>
            </LinearGradient>
          </View>
          <Text style={styles.brandName}>QuickRide</Text>
          <Text style={styles.brandTagline}>Staff & Customer Portal</Text>
        </View>

        {/* ── Glass Card Form ── */}
        <Animated.View
          style={[
            styles.glassCard,
            { transform: [{ scale: cardScale }], opacity: cardOpacity },
          ]}
        >
          {/* Card top accent line */}
          <LinearGradient
            colors={['#1E3A8A', '#D4AF37']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.cardAccentLine}
          />

          <Text style={styles.cardTitle}>Welcome Back 👋</Text>
          <Text style={styles.cardSubtitle}>
            Sign in to manage bookings and rentals.
          </Text>

          {/* Email field */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
            <View style={styles.inputRow}>
              <Ionicons
                name="mail-outline"
                size={18}
                color={COLORS.primary}
                style={styles.inputIcon}
              />
              <InputField
                placeholder="       you@example.com"
                value={ email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Password field */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>PASSWORD</Text>
            <View style={styles.inputRow}>
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={COLORS.primary}
                style={styles.inputIcon}
              />
              <InputField
                placeholder="       ••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={18}
                  color="#4a4a4a"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign In button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
            style={styles.signInBtnWrapper}
          >
            <LinearGradient
              colors={loading ? ['#2563EB', '#2563EB'] : ['#1E3A8A', '#D4AF37']}
              style={styles.signInBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <Text style={styles.signInBtnText}>Signing In…</Text>
              ) : (
                <>
                  <Ionicons name="log-in-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.signInBtnText}>Sign In</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Create Account */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            style={styles.createAccountBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="person-add-outline" size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
            <Text style={styles.createAccountText}>Create New Account</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Footer */}
        <Text style={styles.footerText}>
          By signing in, you agree to our{' '}
          <Text style={styles.footerLink}>Terms of Service</Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  /* ── Orbs ── */
  orbTopLeft: {
    position: 'absolute',
    top: -80,
    left: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(255, 140, 66, 0.12)',
  },
  orbBottomRight: {
    position: 'absolute',
    bottom: -60,
    right: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(255, 107, 0, 0.1)',
  },

  /* ── Scroll ── */
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },

  /* ── Hero ── */
  heroSection: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logoWrapper: {
    marginBottom: 16,
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  logoBadge: {
    width: 88,
    height: 88,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(30, 58, 138, 0.3)',
  },
  logoEmoji: {
    fontSize: 46,
  },
  brandName: {
    fontSize: 40,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: -1,
    marginBottom: 4,
  },
  brandTagline: {
    fontSize: 15,
    color: '#4a4a4a',
    fontWeight: '500',
    letterSpacing: 0.3,
  },

  /* ── Glass Card ── */
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(30, 58, 138, 0.25)',
    padding: 28,
    overflow: 'hidden',
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  cardAccentLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 8,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#4a4a4a',
    marginBottom: 24,
    lineHeight: 20,
  },

  /* ── Fields ── */
  fieldWrapper: {
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E3A8A',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  inputRow: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 14,
    zIndex: 10,
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    zIndex: 10,
    padding: 4,
  },

  /* ── Sign In button ── */
  signInBtnWrapper: {
    marginTop: 8,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  signInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
  },
  signInBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  /* ── Divider ── */
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 140, 66, 0.2)',
  },
  dividerText: {
    color: '#4a4a4a',
    fontSize: 13,
    marginHorizontal: 12,
    fontWeight: '500',
  },

  /* ── Create Account ── */
  createAccountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(30, 58, 138, 0.35)',
    backgroundColor: 'rgba(30, 58, 138, 0.07)',
  },
  createAccountText: {
    color: '#1E3A8A',
    fontSize: 15,
    fontWeight: '600',
  },

  /* ── Footer ── */
  footerText: {
    textAlign: 'center',
    color: '#4a4a4a',
    fontSize: 12,
    marginTop: 28,
    lineHeight: 18,
  },
  footerLink: {
    color: '#1E3A8A',
    fontWeight: '600',
  },
});