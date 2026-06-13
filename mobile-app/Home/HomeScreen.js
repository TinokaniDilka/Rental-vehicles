import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const QUICK_ACTIONS = [
  { icon: 'car-sport-outline', label: 'Rent a Car', gradient: ['#6366f1', '#4f46e5'], screen: 'Vehicles' },
  { icon: 'calendar-outline', label: 'My Bookings', gradient: ['#0ea5e9', '#0284c7'], screen: 'Bookings' },
  { icon: 'shield-checkmark-outline', label: 'Insurance', gradient: ['#10b981', '#059669'], screen: 'Vehicles' },
  { icon: 'location-outline', label: 'Near Me', gradient: ['#f59e0b', '#d97706'], screen: 'Vehicles' },
  { icon: 'star-outline', label: 'Top Rated', gradient: ['#ec4899', '#db2777'], screen: 'Vehicles' },
  { icon: 'person-outline', label: 'Profile', gradient: ['#8b5cf6', '#7c3aed'], screen: 'Profile' },
];

const STATS = [
  { icon: 'car-outline', label: 'Rent', screen: 'Vehicles', color: '#6366f1' },
  { icon: 'calendar-outline', label: 'Bookings', screen: 'Bookings', color: '#0ea5e9' },
  { icon: 'person-outline', label: 'Profile', screen: 'Profile', color: '#10b981' },
];

export default function HomeScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const firstName = user?.name?.split(' ')[0] || 'Guest';

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <LinearGradient
        colors={['#0f172a', '#1e1b4b', '#0f172a']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {firstName} 👋</Text>
            <Text style={styles.subGreeting}>Find your perfect ride</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={22} color="#a5b4fc" />
          </TouchableOpacity>
        </View>

        {/* ── Hero Banner ── */}
        <LinearGradient
          colors={['#4f46e5', '#6366f1', '#818cf8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroBanner}
        >
          <View style={styles.heroContent}>
            <View style={styles.heroTextBlock}>
              <Text style={styles.heroTitle}>QuickRide Rentals</Text>
              <Text style={styles.heroSub}>Fast. Easy. Affordable.</Text>
              <TouchableOpacity
                style={styles.heroButton}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('Vehicles')}
              >
                <Text style={styles.heroButtonText}>Browse Vehicles →</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.heroEmoji}>🚗</Text>
          </View>

          {/* Decorative circles */}
          <View style={styles.heroBubble1} />
          <View style={styles.heroBubble2} />
        </LinearGradient>

        {/* ── Stats Row ── */}
        <View style={styles.statsRow}>
          {STATS.map((stat) => (
            <TouchableOpacity
              key={stat.label}
              style={styles.statCard}
              activeOpacity={0.75}
              onPress={() => navigation.navigate(stat.screen)}
            >
              <View style={[styles.statIconCircle, { backgroundColor: stat.color + '22' }]}>
                <Ionicons name={stat.icon} size={22} color={stat.color} />
              </View>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Quick Actions ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.label}
                style={styles.actionCard}
                activeOpacity={0.75}
                onPress={() => navigation.navigate(action.screen)}
              >
                <LinearGradient
                  colors={action.gradient}
                  style={styles.actionIconCircle}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name={action.icon} size={22} color="#fff" />
                </LinearGradient>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Recent Activity ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="time-outline" size={32} color="#6366f1" />
            </View>
            <Text style={styles.emptyTitle}>No activity yet</Text>
            <Text style={styles.emptyText}>
              Start exploring vehicles to see your activity here
            </Text>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '700',
    color: '#f8fafc',
    letterSpacing: 0.3,
  },
  subGreeting: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 3,
  },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(99,102,241,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.4)',
  },

  /* Hero Banner */
  heroBanner: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
    minHeight: 160,
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroTextBlock: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
  heroSub: {
    fontSize: 14,
    color: '#c7d2fe',
    marginTop: 4,
    marginBottom: 16,
  },
  heroButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  heroButtonText: {
    color: '#4f46e5',
    fontWeight: '700',
    fontSize: 13,
  },
  heroEmoji: {
    fontSize: 52,
    marginLeft: 12,
  },
  heroBubble1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: -30,
    right: -30,
  },
  heroBubble2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: -20,
    left: 80,
  },

  /* Stats Row */
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(30,41,59,0.85)',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.25)',
  },
  statIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },

  /* Section */
  section: {
    marginTop: 28,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 16,
    letterSpacing: 0.2,
  },

  /* Quick Actions Grid */
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: (width - 40 - 24) / 3,
    backgroundColor: 'rgba(30,41,59,0.85)',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.2)',
  },
  actionIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 4,
  },

  /* Empty State */
  emptyState: {
    backgroundColor: 'rgba(30,41,59,0.85)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.2)',
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(99,102,241,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 20,
  },
});