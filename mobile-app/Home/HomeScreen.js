import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const firstName = user?.name?.split(' ')[0] || 'Dilka';

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      <LinearGradient
        colors={['#0f172a', '#1e1b4b', '#0f172a']}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.smallText}>Good morning 👋</Text>
            <Text style={styles.title}>Hello, {firstName}</Text>
          </View>

          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={20} color="#c7d2fe" />
          </TouchableOpacity>
        </View>

        {/* HERO CARD */}
        <LinearGradient
          colors={['#6366f1', '#4f46e5']}
          style={styles.hero}
        >
          <Text style={styles.available}>⚡ 200+ Vehicles Available</Text>

          <Text style={styles.heroTitle}>
            Find Your
          </Text>
          <Text style={styles.heroTitleBold}>
            Perfect Ride
          </Text>

          <Text style={styles.heroSub}>
            Premium vehicles at your fingertips
          </Text>

          <View style={styles.heroButtons}>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => navigation.navigate('Vehicles')}
            >
              <Text style={styles.primaryText}>Rent Now</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => navigation.navigate('Vehicles')}
            >
              <Text style={styles.secondaryText}>Browse Vehicles</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* SEARCH */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#6366f1" />
          <TextInput
            placeholder="Search by car or location"
            placeholderTextColor="#64748b"
            style={{ flex: 1, marginHorizontal: 10, color: '#fff' }}
          />
          <Ionicons name="options-outline" size={18} color="#64748b" />
        </View>

        {/* LOCATION */}
        <View style={styles.locationBox}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="location-outline" size={16} color="#22c55e" />
            <Text style={styles.locationText}>Colombo</Text>
          </View>

          <TouchableOpacity>
            <Text style={styles.changeText}>Change</Text>
          </TouchableOpacity>
        </View>

        {/* QUICK ACTIONS */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <View style={styles.grid}>
          {[
            { icon: 'car-sport-outline', label: 'Rent', color: '#6366f1' },
            { icon: 'calendar-outline', label: 'My Bookings', color: '#0ea5e9' },
            { icon: 'star-outline', label: 'Top Rated', color: '#ec4899' },
            { icon: 'location-outline', label: 'Near Me', color: '#10b981' },
          ].map((item) => (
            <TouchableOpacity key={item.label} style={styles.card}>
              <View style={[styles.iconCircle, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon} size={20} color="#fff" />
              </View>
              <Text style={styles.cardText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* RECOMMENDED */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Recommended Vehicles</Text>
          <Text style={styles.seeAll}>See all →</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.vehicleCard}>
            <Text style={styles.badge}>Popular</Text>
            <Text style={styles.vehicleText}>Car Preview</Text>
          </View>

          <View style={styles.vehicleCard}>
            <Text style={styles.badgeBlue}>Top Rated</Text>
            <Text style={styles.vehicleText}>Car Preview</Text>
          </View>
        </ScrollView>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0f172a' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
  },

  smallText: { color: '#94a3b8', fontSize: 13 },
  title: { color: '#fff', fontSize: 24, fontWeight: '700' },

  iconBtn: {
    backgroundColor: 'rgba(99,102,241,0.3)',
    padding: 10,
    borderRadius: 12,
  },

  hero: {
    margin: 20,
    padding: 20,
    borderRadius: 20,
  },

  available: { color: '#c7d2fe', fontSize: 12, marginBottom: 10 },
  heroTitle: { color: '#fff', fontSize: 26 },
  heroTitleBold: { color: '#fff', fontSize: 28, fontWeight: '800' },
  heroSub: { color: '#c7d2fe', marginVertical: 10 },

  heroButtons: { flexDirection: 'row', marginTop: 10 },

  primaryBtn: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    marginRight: 10,
  },
  primaryText: { color: '#4f46e5', fontWeight: '700' },

  secondaryBtn: {
    borderWidth: 1,
    borderColor: '#c7d2fe',
    padding: 10,
    borderRadius: 10,
  },
  secondaryText: { color: '#fff' },

  searchBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30,41,59,0.8)',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },

  locationBox: {
    backgroundColor: 'rgba(30,41,59,0.8)',
    margin: 20,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  locationText: { color: '#fff', marginLeft: 5 },
  changeText: { color: '#38bdf8' },

  sectionTitle: {
    color: '#fff',
    marginHorizontal: 20,
    marginTop: 10,
    fontWeight: '600',
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    margin: 20,
  },

  card: {
    width: (width - 60) / 2,
    backgroundColor: 'rgba(30,41,59,0.8)',
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },

  iconCircle: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },

  cardText: { color: '#cbd5f5' },

  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
  },

  seeAll: { color: '#6366f1' },

  vehicleCard: {
    width: 180,
    height: 120,
    backgroundColor: '#1e293b',
    marginLeft: 20,
    borderRadius: 16,
    padding: 10,
  },

  badge: {
    backgroundColor: '#ec4899',
    color: '#fff',
    padding: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },

  badgeBlue: {
    backgroundColor: '#0ea5e9',
    color: '#fff',
    padding: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },

  vehicleText: { color: '#fff', marginTop: 20 },
});