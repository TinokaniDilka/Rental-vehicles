import React, { useState, useCallback, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Dimensions, TextInput, ImageBackground, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const firstName = user?.name?.split(' ')[0] || 'Dilka';

  const [location, setLocation] = useState('Colombo');
const [showLocationModal, setShowLocationModal] = useState(false);
const [ongoingBooking, setOngoingBooking] = useState(null);

// useFocusEffect instead of useEffect(() => {...}, []): a plain effect only
// runs once on first mount, so after making a new booking or a booking's
// status changing (e.g. handover, cancellation) and returning to Home, the
// ongoing-booking card would still show stale data. This re-fetches every
// time Home comes back into focus, same pattern as MyBookingsScreen.
useFocusEffect(
  useCallback(() => {
    let isActive = true;

    const fetchOngoingBooking = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await api.get('/api/bookings/customer', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!isActive) return;
        const ongoing = res.data.find(b => b.status === 'ongoing');
        setOngoingBooking(ongoing || null);
      } catch (err) {
        console.error('Failed to fetch ongoing booking:', err.message);
      }
    };

    fetchOngoingBooking();

    return () => {
      isActive = false;
    };
  }, [])
);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <LinearGradient
        colors={['#ffffff', '#fff5eb', '#ffffff']}
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
            <Ionicons name="notifications-outline" size={20} color="#FF8C42" />
          </TouchableOpacity>
        </View>

        {/* HERO CARD */}
    

<ImageBackground
  source={{
    uri: 'https://i.pinimg.com/originals/97/87/23/9787239940becc079d01e6e5ee0bac16.jpg'
  }}
  style={styles.heroCard}
  imageStyle={{ borderRadius: 20 }}
>


  <View style={styles.overlay}>

    
    <Text style={styles.title}>
      Find Your{'\n'}Perfect Ride
    </Text>

 
    <View style={styles.buttonsRow}>
      <TouchableOpacity style={styles.primaryBtn}>
        <Text style={styles.primaryText}>Rent Now</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.outlineBtn}>
        <Text style={styles.outlineText}>Browse Vehicles</Text>
      </TouchableOpacity>
    </View>

  </View>
</ImageBackground>

        {/* SEARCH */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#FF8C42" />
          <TextInput
            placeholder="Search by car or location"
            placeholderTextColor="#888888"
            style={{ flex: 1, marginHorizontal: 10, color: '#1a1a1a' }}
          />
          <Ionicons name="options-outline" size={18} color="#888888" />
        </View>

      
        {/* QUICK ACTIONS */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>

       

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
        {/* ONGOING BOOKING */}
{ongoingBooking && (
  <View style={{
    marginHorizontal: 20,
     marginTop: 20,
    marginBottom: 60,
    backgroundColor: 'rgba(255, 140, 66, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 140, 66, 0.3)',
    padding: 16,
  }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
      <View style={{
        backgroundColor: 'rgba(255, 140, 66, 0.2)',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
      }}>
        <Text style={{ color: '#FF8C42', fontWeight: '800', fontSize: 11 }}>🚗 ONGOING</Text>
      </View>
    </View>

    <Text style={{ color: '#1a1a1a', fontSize: 17, fontWeight: '800', marginBottom: 4 }}>
      {ongoingBooking.vehicleId?.name || 'Vehicle'}
    </Text>

    <View style={{ flexDirection: 'row', gap: 16, marginBottom: 10 }}>
      <Text style={{ color: '#4a4a4a', fontSize: 13 }}>
        📅 {new Date(ongoingBooking.startDate).toLocaleDateString()} → {new Date(ongoingBooking.endDate).toLocaleDateString()}
      </Text>
    </View>

    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text style={{ color: '#FF8C42', fontSize: 20, fontWeight: '800' }}>
        LKR {ongoingBooking.totalAmount?.toLocaleString()}
      </Text>
      <TouchableOpacity
        onPress={() => navigation.navigate('Bookings')}
        style={{
          backgroundColor: 'rgba(255, 140, 66, 0.2)',
          borderRadius: 10,
          paddingHorizontal: 14,
          paddingVertical: 8,
          borderWidth: 1,
          borderColor: 'rgba(255, 140, 66, 0.4)',
        }}
      >
        <Text style={{ color: '#FF8C42', fontWeight: '700', fontSize: 13 }}>View Details →</Text>
      </TouchableOpacity>
    </View>
  </View>
)}

        <View style={{ height: 40 }} />
      </ScrollView>

      
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#ffffff' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
  },

  smallText: { color: '#4a4a4a', fontSize: 13, fontWeight: '500' },
  title: { color: '#1a1a1a', fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },

  iconBtn: {
    backgroundColor: 'rgba(255, 140, 66, 0.15)',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 140, 66, 0.3)',
  },

  hero: {
    margin: 20,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 140, 66, 0.3)',
  },

  available: { color: '#FF8C42', fontSize: 13, marginBottom: 12, fontWeight: '600', letterSpacing: 0.5 },
  heroTitle: { color: '#1a1a1a', fontSize: 28, fontWeight: '700' },
  heroTitleBold: { color: '#1a1a1a', fontSize: 30, fontWeight: '900', letterSpacing: -1 },
  heroSub: { color: '#FF8C42', marginVertical: 12, fontSize: 15, lineHeight: 22 },

  heroButtons: { flexDirection: 'row', marginTop: 16, gap: 12 },

  primaryBtn: {
    backgroundColor: '#FF8C42',
    padding: 14,
    borderRadius: 14,
    marginRight: 0,
    shadowColor: '#FF8C42',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  primaryText: { color: '#fff', fontWeight: '800', fontSize: 15, letterSpacing: 0.5 },

  secondaryBtn: {
    borderWidth: 1.5,
    borderColor: '#FF8C42',
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 140, 66, 0.1)',
  },
  secondaryText: { color: '#1a1a1a', fontWeight: '700', fontSize: 15 },

  searchBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 140, 66, 0.2)',
  },

  locationBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    margin: 20,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255, 140, 66, 0.2)',
  },

  locationText: { color: '#1a1a1a', marginLeft: 8, fontSize: 15, fontWeight: '600' },
  changeText: { color: '#FF8C42', fontSize: 14, fontWeight: '700' },

  sectionTitle: {
    color: '#1a1a1a',
    marginHorizontal: 20,
    marginTop: 16,
    fontWeight: '800',
    fontSize: 20,
    letterSpacing: -0.5,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    margin: 20,
  },

  card: {
    width: (width - 60) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 140, 66, 0.15)',
    shadowColor: '#FF8C42',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },

  iconCircle: {
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
  },

  cardText: { color: '#1a1a1a', fontSize: 14, fontWeight: '600' },

  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    alignItems: 'center',
  },

  seeAll: { color: '#FF8C42', fontSize: 14, fontWeight: '700' },

  vehicleCard: {
    width: 180,
    height: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginLeft: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 140, 66, 0.2)',
    padding: 10,
  },

  badge: {
    backgroundColor: '#FF8C42',
    color: '#fff',
    padding: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },

  heroCard: {
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },

  overlay: {
    flex: 1,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
  },

  heroSmallText: {
    color: '#ddd',
    marginBottom: 10,
  },

  heroTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
  },

  heroSubtitle: {
    color: '#ddd',
    marginVertical: 10,
  },

  heroButtonsRow: {
    flexDirection: 'row',
    marginTop: 10,
  },

  heroPrimaryBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 10,
  },

  heroPrimaryText: {
    color: '#000',
    fontWeight: '600',
  },

  heroOutlineBtn: {
    borderWidth: 1,
    borderColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },

  heroOutlineText: {
    color: '#fff',
  },

  badgeBlue: {
    backgroundColor: '#FF8C42',
    color: '#fff',
    padding: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },

  vehicleText: { color: '#1a1a1a', marginTop: 20 },
});