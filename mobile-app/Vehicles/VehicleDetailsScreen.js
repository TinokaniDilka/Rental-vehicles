import React, { useEffect, useState } from 'react';
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
import { getVehicleById } from '../services/vehicleService';
import CustomButton from '../components/CustomButton';
import Loader from '../components/Loader';
import { API_BASE_URL } from '../utils/constants';
import { formatCurrency } from '../utils/helpers';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const IMAGE_HEIGHT = 300;

export default function VehicleDetailsScreen({ route, navigation }) {
  const { vehicleId } = route.params;
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVehicleById(vehicleId)
      .then((res) => setVehicle(res.data.vehicle || res.data))
      .catch(() => Alert.alert('Error', 'Failed to load vehicle'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader message="Loading details..." />;
  if (!vehicle) return null;

  const SPECS = [
    { icon: 'location-outline', label: vehicle.location || 'N/A', color: '#6366f1' },
    { icon: 'people-outline', label: `${vehicle.seats || '—'} Seats`, color: '#0ea5e9' },
    { icon: 'speedometer-outline', label: vehicle.transmission || 'N/A', color: '#10b981' },
  ];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

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
            colors={['transparent', 'rgba(15,23,42,0.6)', '#0f172a']}
            locations={[0.4, 0.75, 1]}
            style={styles.imageOverlay}
          />

          {/* Floating Back Button */}
          <TouchableOpacity
            style={styles.backBtn}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color="#f8fafc" />
          </TouchableOpacity>

          {/* Availability badge */}
          <View style={styles.availBadge}>
            <View style={styles.availDot} />
            <Text style={styles.availText}>Available</Text>
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
              <View style={{ marginTop: 8, alignSelf: 'flex-start', backgroundColor: 'rgba(245,158,11,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                <Text style={{ color: '#f59e0b', fontSize: 12, fontWeight: '600' }}>🔒 Deposit: LKR {vehicle.depositAmount || 5000} (Refundable)</Text>
              </View>
            </View>
            <View style={styles.ratingBubble}>
              <Ionicons name="star" size={13} color="#f59e0b" />
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
                { icon: 'shield-checkmark-outline', label: 'Full insurance coverage', color: '#10b981' },
                { icon: 'location-outline', label: 'Free GPS navigation', color: '#0ea5e9' },
                { icon: 'call-outline', label: '24/7 roadside support', color: '#6366f1' },
                { icon: 'water-outline', label: 'Full fuel tank', color: '#f59e0b' },
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
        </View>

        {/* Space for sticky bar */}
        <View style={{ height: 96 }} />
      </ScrollView>

      {/* ── Sticky Bottom Bar ── */}
      <View style={styles.stickyBar}>
        <LinearGradient
          colors={['rgba(15,23,42,0.0)', '#0f172a']}
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
            onPress={() => navigation.navigate('Booking', { vehicle })}
          >
            <LinearGradient
              colors={['#6366f1', '#4f46e5']}
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
    backgroundColor: '#0f172a',
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(15,23,42,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  availBadge: {
    position: 'absolute',
    top: 56,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16,185,129,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.4)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  availDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 5,
  },
  availText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '600',
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
    marginBottom: 16,
  },
  namePriceBlock: {
    flex: 1,
    marginRight: 12,
  },
  vehicleName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: 0.2,
    lineHeight: 34,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 6,
  },
  priceAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: '#6366f1',
  },
  priceUnit: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
  },
  ratingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245,158,11,0.15)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f59e0b',
  },

  /* Spec Chips */
  specRow: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 4,
    marginBottom: 20,
  },
  specChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30,41,59,0.85)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.2)',
    gap: 7,
  },
  specIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  specLabel: {
    fontSize: 13,
    color: '#cbd5e1',
    fontWeight: '600',
  },

  /* Description Card */
  descCard: {
    backgroundColor: 'rgba(30,41,59,0.85)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.2)',
    padding: 20,
    marginBottom: 16,
  },
  descCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 10,
  },
  descCardText: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 22,
  },

  /* Features Card */
  featuresCard: {
    backgroundColor: 'rgba(30,41,59,0.85)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.2)',
    padding: 20,
    marginBottom: 16,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: 14,
    color: '#cbd5e1',
    fontWeight: '500',
  },

  /* Sticky Bottom Bar */
  stickyBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 24,
    paddingTop: 12,
  },
  stickyInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    backgroundColor: 'rgba(30,41,59,0.95)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.3)',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  stickyPriceLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
    marginBottom: 2,
  },
  stickyPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: '#6366f1',
  },
  bookBtnWrapper: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  bookBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
});