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
          <Ionicons name="search" size={18} color="#6366f1" />
          <TextInput
            placeholder="Search by car or location"
            placeholderTextColor="#64748b"
            style={{ flex: 1, marginHorizontal: 10, color: '#fff' }}
          />
          <Ionicons name="options-outline" size={18} color="#64748b" />
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
    backgroundColor: 'rgba(16,185,129,0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
    padding: 16,
  }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
      <View style={{
        backgroundColor: 'rgba(16,185,129,0.2)',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
      }}>
        <Text style={{ color: '#10b981', fontWeight: '800', fontSize: 11 }}>🚗 ONGOING</Text>
      </View>
    </View>

    <Text style={{ color: '#f8fafc', fontSize: 17, fontWeight: '800', marginBottom: 4 }}>
      {ongoingBooking.vehicleId?.name || 'Vehicle'}
    </Text>

    <View style={{ flexDirection: 'row', gap: 16, marginBottom: 10 }}>
      <Text style={{ color: '#94a3b8', fontSize: 13 }}>
        📅 {new Date(ongoingBooking.startDate).toLocaleDateString()} → {new Date(ongoingBooking.endDate).toLocaleDateString()}
      </Text>
    </View>

    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text style={{ color: '#10b981', fontSize: 20, fontWeight: '800' }}>
        LKR {ongoingBooking.totalAmount?.toLocaleString()}
      </Text>
      <TouchableOpacity
        onPress={() => navigation.navigate('Bookings')}
        style={{
          backgroundColor: 'rgba(16,185,129,0.2)',
          borderRadius: 10,
          paddingHorizontal: 14,
          paddingVertical: 8,
          borderWidth: 1,
          borderColor: 'rgba(16,185,129,0.4)',
        }}
      >
        <Text style={{ color: '#10b981', fontWeight: '700', fontSize: 13 }}>View Details →</Text>
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

smallText: {
  color: '#ddd',
  marginBottom: 10,
},

title: {
  fontSize: 26,
  fontWeight: '700',
  color: '#fff',
},

subtitle: {
  color: '#ddd',
  marginVertical: 10,
},

buttonsRow: {
  flexDirection: 'row',
  marginTop: 10,
},

primaryBtn: {
  backgroundColor: '#fff',
  paddingHorizontal: 16,
  paddingVertical: 8,
  borderRadius: 10,
  marginRight: 10,
},

primaryText: {
  color: '#000',
  fontWeight: '600',
},

outlineBtn: {
  borderWidth: 1,
  borderColor: '#fff',
  paddingHorizontal: 16,
  paddingVertical: 8,
  borderRadius: 10,
},

outlineText: {
  color: '#fff',
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