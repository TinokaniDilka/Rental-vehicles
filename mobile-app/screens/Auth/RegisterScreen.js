import React, { useState, useRef } from 'react';
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
import api from '../../services/api';
import InputField from '../../components/InputField';
import CustomButton from '../../components/CustomButton';
import { COLORS, SHADOWS, SIZES } from '../../utils/theme';

const { width } = Dimensions.get('window');
export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer'); // default
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Card entrance animation
  const cardSlide = useRef(new Animated.Value(40)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(cardSlide, {
        toValue: 0,
        useNativeDriver: true,
        tension: 55,
        friction: 8,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/api/auth/register', { name, email, password, role });
      Alert.alert('Success', 'Account created! Please login.');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Registration Failed', error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Dark gradient background */}
      <LinearGradient
        colors={['#1e1b4b', '#0f172a']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
      />

      {/* Decorative orb — top right */}
      <View style={styles.orbTopRight} />

      {/* Decorative orb — bottom left */}
      <View style={styles.orbBottomLeft} />

      {/* Accent glow behind logo */}
      <View style={styles.logoGlow} />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Brand / Logo Area ── */}
        <View style={styles.brandSection}>
          {/* Glowing logo badge */}
          <View style={styles.logoBadgeWrapper}>
            <LinearGradient
              colors={['rgba(99,102,241,0.35)', 'rgba(244,63,94,0.2)']}
              style={styles.logoBadge}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.logoEmoji}>🚗</Text>
            </LinearGradient>
          </View>

          {/* Brand name with gradient-style text via shadow trick */}
          <Text style={styles.brandName}>QuickRide</Text>
          <Text style={styles.brandSubtitle}>Create Account</Text>
        </View>

        {/* ── Glass Form Card ── */}
        <Animated.View
          style={[
            styles.glassCard,
            {
              opacity: cardOpacity,
              transform: [{ translateY: cardSlide }],
            },
          ]}
        >
          {/* Top gradient accent line */}
          <LinearGradient
            colors={['#f43f5e', '#6366f1', '#0ea5e9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.cardAccentLine}
          />

          <Text style={styles.cardHeading}>Join QuickRide ✨</Text>
          <Text style={styles.cardSubheading}>
            Fill in your details to get started
          </Text>

          {/* ── Full Name ── */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>FULL NAME</Text>
            <View style={styles.inputRow}>
              <Ionicons
                name="person-outline"
                size={18}
                color={COLORS.primary}
                style={styles.inputIcon}
              />
              <View style={styles.inputInner}>
                <InputField
                  placeholder="John Doe"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            </View>
          </View>

          {/* ── Email ── */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
            <View style={styles.inputRow}>
              <Ionicons
                name="mail-outline"
                size={18}
                color={COLORS.primary}
                style={styles.inputIcon}
              />
              <View style={styles.inputInner}>
                <InputField
                  placeholder="you@example.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>
          </View>

          {/* ── Password ── */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>PASSWORD</Text>
            <View style={styles.inputRow}>
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={COLORS.primary}
                style={styles.inputIcon}
              />
              <View style={styles.inputInner}>
                <InputField
                  placeholder="••••••••"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
              </View>
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={18}
                  color="#475569"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Password strength hint */}
          <Text style={styles.passwordHint}>
            <Ionicons name="shield-checkmark-outline" size={12} color="#475569" />{' '}
            Use at least 8 characters with a mix of letters and numbers
          </Text>

{/* ── Role Selection ── */}
<View style={{ marginBottom: 20 }}>
  <Text style={styles.fieldLabel}>SELECT ROLE</Text>

  <View style={{ flexDirection: 'row', gap: 10 }}>
    <TouchableOpacity
      onPress={() => setRole('customer')}
      style={{
        flex: 1,
        padding: 14,
        borderRadius: 12,
        backgroundColor: role === 'customer' ? '#6366f1' : '#1e293b',
        borderWidth: 1,
        borderColor: '#6366f1',
        alignItems: 'center',
      }}
    >
      <Text style={{ color: '#fff', fontWeight: '600' }}>
        Customer
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      onPress={() => setRole('staff')}
      style={{
        flex: 1,
        padding: 14,
        borderRadius: 12,
        backgroundColor: role === 'staff' ? '#6366f1' : '#1e293b',
        borderWidth: 1,
        borderColor: '#6366f1',
        alignItems: 'center',
      }}
    >
      <Text style={{ color: '#fff', fontWeight: '600' }}>
        Staff
      </Text>
    </TouchableOpacity>
  </View>
</View>

          {/* ── Register Button ── */}
          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
            style={styles.registerBtnWrapper}
          >
            <LinearGradient
              colors={loading ? ['#334155', '#334155'] : ['#6366f1', '#4f46e5']}
              style={styles.registerBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <Text style={styles.registerBtnText}>Creating Account…</Text>
              ) : (
                <>
                  <Ionicons
                    name="person-add-outline"
                    size={20}
                    color="#fff"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.registerBtnText}>Register</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* ── Divider ── */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* ── Sign In link ── */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            style={styles.signInRow}
          >
            <Text style={styles.signInPrompt}>Already have an account? </Text>
            <Text style={styles.signInLink}>Sign In</Text>
            <Ionicons name="arrow-forward" size={14} color={COLORS.primary} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </Animated.View>

        {/* ── Feature Pills ── */}
        <View style={styles.featurePills}>
          {[
            { icon: 'checkmark-circle-outline', label: 'Free to Join' },
            { icon: 'shield-outline', label: 'Secure' },
            { icon: 'flash-outline', label: 'Instant Access' },
          ].map((item) => (
            <View key={item.label} style={styles.pill}>
              <Ionicons name={item.icon} size={13} color={COLORS.primary} />
              <Text style={styles.pillText}>{item.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },

  /* ── Orbs ── */
  orbTopRight: {
    position: 'absolute',
    top: -70,
    right: -70,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(244,63,94,0.12)',
  },
  orbBottomLeft: {
    position: 'absolute',
    bottom: -50,
    left: -50,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(99,102,241,0.13)',
  },
  logoGlow: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(99,102,241,0.08)',
  },

  /* ── Scroll ── */
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 52,
    paddingBottom: 40,
  },

  /* ── Brand Section ── */
  brandSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoBadgeWrapper: {
    marginBottom: 14,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.55,
    shadowRadius: 22,
    elevation: 14,
  },
  logoBadge: {
    width: 82,
    height: 82,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.45)',
  },
  logoEmoji: {
    fontSize: 42,
  },
  brandName: {
    fontSize: 38,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: -0.8,
    marginBottom: 4,
    // "gradient text" effect simulated with a subtle text shadow
    textShadowColor: 'rgba(99,102,241,0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },
  brandSubtitle: {
    fontSize: 15,
    color: '#94a3b8',
    fontWeight: '500',
    letterSpacing: 0.3,
  },

  /* ── Glass Card ── */
  glassCard: {
    backgroundColor: 'rgba(30,41,59,0.85)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.25)',
    padding: 28,
    overflow: 'hidden',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
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
  cardHeading: {
    fontSize: 21,
    fontWeight: '700',
    color: '#f8fafc',
    marginTop: 8,
    marginBottom: 4,
  },
  cardSubheading: {
    fontSize: 14,
    color: '#94a3b8',
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
    color: '#6366f1',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 14,
    zIndex: 10,
  },
  inputInner: {
    flex: 1,
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    zIndex: 10,
    padding: 4,
  },

  /* Password hint */
  passwordHint: {
    fontSize: 11,
    color: '#475569',
    marginBottom: 20,
    marginTop: -8,
    lineHeight: 16,
  },

  /* ── Register button ── */
  registerBtnWrapper: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  registerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
  },
  registerBtnText: {
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
    backgroundColor: 'rgba(99,102,241,0.2)',
  },
  dividerText: {
    color: '#475569',
    fontSize: 13,
    marginHorizontal: 12,
    fontWeight: '500',
  },

  /* ── Sign In link ── */
  signInRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  signInPrompt: {
    fontSize: 14,
    color: '#94a3b8',
  },
  signInLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6366f1',
  },

  /* ── Feature Pills ── */
  featurePills: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginTop: 24,
    flexWrap: 'wrap',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(99,102,241,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pillText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
});