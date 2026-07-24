import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  Alert,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { getVehicleById } from '../services/vehicleService';
import CustomButton from '../components/CustomButton';
import Loader from '../components/Loader';
import { API_BASE_URL } from '../utils/constants';
import { formatCurrency } from '../utils/helpers';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import VehicleReviewsSection from '../components/VehicleReviewsSection';

const { width, height } = Dimensions.get('window');
const IMAGE_HEIGHT = 300;

export default function VehicleDetailsScreen({ route, navigation }) {
  const { vehicleId } = route.params;
  const { user, refreshUser } = useContext(AuthContext);
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);

  // AuthContext's `user` only reflects whatever was true at login. If admin
  // approves ID/license on web while the customer is still logged in on
  // mobile, this pulls the current status so "Book Now" isn't stuck behind
  // a stale "Pending Review" value.
  useFocusEffect(
    React.useCallback(() => {
      refreshUser();
    }, [])
  );

  const handleBookNowPress = async () => {
    const freshUser = await refreshUser();
    const status = (freshUser || user)?.verificationStatus;

    if (status !== 'Verified') {
      Alert.alert(
        'Account Not Verified',
        status === 'Pending Review'
          ? "Your ID and license are still under review by our team. You'll be able to book once approved."
          : 'Please upload your ID and license documents and wait for admin approval before booking.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to Profile', onPress: () => navigation.navigate('Profile') },
        ]
      );
      return;
    }
    navigation.navigate('Booking', { vehicle });
  };

  useEffect(() => {
    getVehicleById(vehicleId)
      .then((res) => setVehicle(res.data.vehicle || res.data))
      .catch(() => Alert.alert('Error', 'Failed to load vehicle'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader message="Loading details..." />;
  if (!vehicle) return null;

  const SPECS = [
    { icon: 'location-outline', label: vehicle.location || 'N/A', color: '#1E3A8A' },
    { icon: 'people-outline', label: `${vehicle.seats || '—'} Seats`, color: '#D4AF37' },
    { icon: 'speedometer-outline', label: vehicle.transmission || 'N/A', color: '#10b981' },
  ];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* ── Scrollable Body ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Image ── */}
        <View style={styles.imageContainer}>
          <Image
           source={{
  uri: vehicle?.image
    ? `http://10.24.89.129:5000${vehicle.image}`
    : 'https://via.placeholder.com/300'
}} style={styles.heroImage}
            resizeMode="cover"
          />
          {/* Overlay gradient so the bottom text remains readable */}
          <LinearGradient
            colors={['transparent', 'rgba(255,245,235,0.6)', '#ffffff']}
            locations={[0.4, 0.75, 1]}
            style={styles.imageOverlay}
          />

          {/* Floating Back Button */}
          <TouchableOpacity
            style={styles.backBtn}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color="#1E3A8A" />
          </TouchableOpacity>

          {/* Availability badge */}
          <View style={styles.availBadge}>
            <View style={styles.availDot} />
            <Text style={styles.availText}>Premium</Text>
          </View>
        </View>

        {/* ── Content ── */}
        <View style={styles.content}>
          {/* Name + Price */}
          <View style={styles.nameRow}>
            <View style={styles.namePriceBlock}>
              <Text style={styles.vehicleName}>{vehicle.name}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.priceAmount}>{formatCurrency(vehicle.pricePerDay)}</Text>
                <Text style={styles.priceUnit}> / day</Text>
              </View>
              <View style={{ marginTop: 8, alignSelf: 'flex-start', backgroundColor: '#FAF0D7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                <Text style={{ color: '#D4AF37', fontSize: 12, fontWeight: '600' }}>🔒 Deposit: LKR {vehicle.depositAmount || 5000} (Refundable)</Text>
              </View>
            </View>
            <View style={styles.ratingBubble}>
              <Ionicons name="star" size={13} color="#D4AF37" />
              <Text style={styles.ratingText}>4.8</Text>
            </View>
          </View>

          {/* Spec Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.specRow}
          >
            {SPECS.map((spec) => (
              <View key={spec.label} style={styles.specChip}>
                <View style={[styles.specIconCircle, { backgroundColor: spec.color + '22' }]}>
                  <Ionicons name={spec.icon} size={15} color={spec.color} />
                </View>
                <Text style={styles.specLabel}>{spec.label}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Description Card */}
          {vehicle.description ? (
            <View style={styles.descCard}>
              <Text style={styles.descCardTitle}>About this vehicle</Text>
              <Text style={styles.descCardText}>{vehicle.description}</Text>
            </View>
          ) : null}

          {/* Features Card */}
          <View style={styles.featuresCard}>
            <Text style={styles.descCardTitle}>What's Included</Text>
            <View style={styles.featuresList}>
              {[
                { icon: 'shield-checkmark-outline', label: 'Full insurance coverage', color: '#1E3A8A' },
                { icon: 'location-outline', label: 'Free GPS navigation', color: '#1E3A8A' },
                { icon: 'call-outline', label: '24/7 roadside support', color: '#1E3A8A' },
                { icon: 'water-outline', label: 'Full fuel tank', color: '#1E3A8A' },
              ].map((f) => (
                <View key={f.label} style={styles.featureItem}>
                  <View style={[styles.featureIcon, { backgroundColor: f.color + '22' }]}>
                    <Ionicons name={f.icon} size={15} color={f.color} />
                  </View>
                  <Text style={styles.featureText}>{f.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Customer Reviews */}
          <VehicleReviewsSection vehicleId={vehicle._id} />
        </View>

        {/* Space for sticky bar */}
        <View style={{ height: 96 }} />
      </ScrollView>

      {/* ── Sticky Bottom Bar ── */}
      <View style={styles.stickyBar}>
        <LinearGradient
          colors={['rgba(255,255,255,0.0)', '#ffffff']}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <View style={styles.stickyInner}>
          <View>
            <Text style={styles.stickyPriceLabel}>Price per day</Text>
            <Text style={styles.stickyPrice}>{formatCurrency(vehicle.pricePerDay)}</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.bookBtnWrapper}
            onPress={handleBookNowPress}
          >
            <LinearGradient
              colors={['#1E3A8A', '#1E3A8A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.bookBtn}
            >
              <Ionicons name="calendar-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.bookBtnText}>Book Now</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 0,
  },

  /* Hero Image */
  imageContainer: {
    width: '100%',
    height: IMAGE_HEIGHT,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: IMAGE_HEIGHT,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  backBtn: {
    position: 'absolute',
    top: 52,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  availBadge: {
    position: 'absolute',
    top: 56,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF0D7',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    borderRadius: 22,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  availDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D4AF37',
    marginRight: 6,
  },
  availText: {
    color: '#D4AF37',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  /* Content */
  content: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },

  /* Name + Price */
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  namePriceBlock: {
    flex: 1,
    marginRight: 12,
  },
  vehicleName: {
    fontSize: 30,
    fontWeight: '900',
    color: '#1a1a1a',
    letterSpacing: -0.5,
    lineHeight: 36,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 8,
  },
  priceAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E3A8A',
  },
  priceUnit: {
    fontSize: 15,
    color: '#4a4a4a',
    fontWeight: '500',
  },
  ratingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FAF0D7',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#D4AF37',
  },

  /* Spec Chips */
  specRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 4,
    marginBottom: 22,
  },
  specChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF0D7',
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    gap: 8,
  },
  specIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  specLabel: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '600',
  },

  /* Description Card */
  descCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,140,66,0.15)',
    padding: 22,
    marginBottom: 18,
  },
  descCardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  descCardText: {
    fontSize: 15,
    color: '#4a4a4a',
    lineHeight: 24,
  },

  /* Features Card */
  featuresCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,140,66,0.15)',
    padding: 22,
    marginBottom: 18,
  },
  featuresList: {
    gap: 14,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: 15,
    color: '#1a1a1a',
    fontWeight: '500',
  },

  /* Sticky Bottom Bar */
  stickyBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 28,
    paddingTop: 14,
  },
  stickyInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(30,58,138,0.3)',
    paddingHorizontal: 22,
    paddingVertical: 16,
    shadowColor: '#1E3A8A',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -4 },
    elevation: 10,
  },
  stickyPriceLabel: {
    fontSize: 13,
    color: '#4a4a4a',
    fontWeight: '600',
    marginBottom: 3,
  },
  stickyPrice: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1E3A8A',
  },
  bookBtnWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 16,
  },
  bookBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
});