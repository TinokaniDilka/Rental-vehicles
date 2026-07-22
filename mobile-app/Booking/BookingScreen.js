import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import CustomButton from '../components/CustomButton';
import InputField from '../components/InputField';
import { formatCurrency, calculateDays } from '../utils/helpers';

export default function BookingScreen({ route, navigation }) {
  const { vehicle } = route.params;
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [rentalTermsAccepted, setRentalTermsAccepted] = useState(false);

  const days = pickupDate && returnDate ? calculateDays(pickupDate, returnDate) : 0;
  const total = days * vehicle.pricePerDay;

  const handleBooking = () => {
    if (!pickupDate || !returnDate) {
      Alert.alert('Error', 'Please select both pickup and return dates');
      return;
    }
    if (!rentalTermsAccepted) {
      Alert.alert('Error', 'You must agree to the rental terms and damage policy.');
      return;
    }
    // Booking isn't created yet — pass details to Payment, where the
    // customer picks Card/Cash and the booking + payment are created together.
    navigation.navigate('Payment', {
      vehicle,
      startDate: pickupDate,
      endDate: returnDate,
      hasDriver: false,
      days,
      total,
    });
  };

  return (
    <LinearGradient colors={['#ffffff', '#fff5eb']} style={styles.gradientBg}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Row */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color="#1a1a1a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Book Vehicle</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Vehicle Info Glass Card */}
        <View style={styles.glassCard}>
          <View style={styles.vehicleTopRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.vehicleName}>{vehicle.name}</Text>
              <Text style={styles.vehiclePrice}>
                {formatCurrency(vehicle.pricePerDay)}
                <Text style={styles.perDay}> / day</Text>
              </Text>
            </View>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{vehicle.type || 'Vehicle'}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.vehicleMetaRow}>
            <Ionicons name="car-outline" size={15} color="#888888" />
            <Text style={styles.vehicleMetaText}>
              {vehicle.brand || 'Premium'} · {vehicle.seats ? `${vehicle.seats} seats` : 'Available now'}
            </Text>
          </View>
        </View>

        {/* Date Fields Section */}
        <Text style={styles.sectionLabel}>Booking Details</Text>

        {/* Pickup Date */}
        <View style={styles.glassCard}>
          <View style={styles.fieldLabelRow}>
            <Ionicons name="calendar-outline" size={16} color="#FF8C42" />
            <Text style={styles.fieldLabel}>Pickup Date</Text>
          </View>
          <TextInput
            style={styles.darkInput}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#4a4a4a"
            value={pickupDate}
            onChangeText={setPickupDate}
          />
        </View>

        {/* Return Date */}
        <View style={styles.glassCard}>
          <View style={styles.fieldLabelRow}>
            <Ionicons name="calendar" size={16} color="#FF8C42" />
            <Text style={styles.fieldLabel}>Return Date</Text>
          </View>
          <TextInput
            style={styles.darkInput}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#4a4a4a"
            value={returnDate}
            onChangeText={setReturnDate}
          />
        </View>

        {/* Price Summary Card */}
        {days > 0 && (
          <View style={styles.summaryCard}>
            <LinearGradient
              colors={['rgba(255, 140, 66, 0.18)', 'rgba(255, 140, 66, 0.06)']}
              style={styles.summaryGradient}
            >
              <Text style={styles.summaryTitle}>Price Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Duration</Text>
                <Text style={styles.summaryValue}>{days} day{days > 1 ? 's' : ''}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Rate</Text>
                <Text style={styles.summaryValue}>{formatCurrency(vehicle.pricePerDay)} × {days}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Deposit (Refundable)</Text>
                <Text style={styles.summaryValue}>{formatCurrency(vehicle.depositAmount || 5000)}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryTotalLabel}>Total</Text>
                <Text style={styles.summaryTotal}>{formatCurrency(total)}</Text>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Terms Checkbox */}
        <TouchableOpacity 
          style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, paddingHorizontal: 12, paddingVertical: 14, backgroundColor: 'rgba(255, 140, 66, 0.1)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255, 140, 66, 0.25)' }}
          onPress={() => setRentalTermsAccepted(!rentalTermsAccepted)}
        >
          <Ionicons name={rentalTermsAccepted ? "checkbox" : "square-outline"} size={22} color="#FF8C42" />
          <Text style={{ color: '#1a1a1a', marginLeft: 10, fontSize: 13, flex: 1, fontWeight: '500' }}>
            I agree to the rental terms and damage policy
          </Text>
        </TouchableOpacity>

        {/* Confirm Button */}
        <TouchableOpacity
          style={[styles.confirmBtnWrapper, !rentalTermsAccepted && { opacity: 0.5 }]}
          onPress={handleBooking}
          disabled={!rentalTermsAccepted}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#FF8C42', '#E6732A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.confirmBtn}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.confirmBtnText}>Continue to Payment</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.75}
        >
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBg: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 24,
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 140, 66, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 140, 66, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: 0.3,
  },
  headerSpacer: {
    width: 40,
  },

  // Glass Card
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 140, 66, 0.25)',
    padding: 18,
    marginBottom: 14,
    shadowColor: '#FF8C42',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  vehicleTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  vehicleName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  vehiclePrice: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FF8C42',
  },
  perDay: {
    fontSize: 14,
    fontWeight: '400',
    color: '#888888',
  },
  typeBadge: {
    backgroundColor: 'rgba(255, 140, 66, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 140, 66, 0.35)',
    marginLeft: 12,
    marginTop: 2,
  },
  typeBadgeText: {
    color: '#FFA366',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  vehicleMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  vehicleMetaText: {
    color: '#888888',
    fontSize: 13,
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 140, 66, 0.15)',
    marginVertical: 12,
  },

  // Section Label
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888888',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
    marginLeft: 4,
  },

  // Field
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888888',
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  darkInput: {
    backgroundColor: 'rgba(255, 245, 235, 0.8)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 140, 66, 0.25)',
    paddingHorizontal: 16,
    paddingVertical: 13,
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: '500',
  },

  // Price Summary
  summaryCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 140, 66, 0.25)',
    overflow: 'hidden',
    marginBottom: 24,
    marginTop: 6,
  },
  summaryGradient: {
    padding: 20,
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#888888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    color: '#888888',
    fontSize: 15,
  },
  summaryValue: {
    color: '#1a1a1a',
    fontSize: 15,
    fontWeight: '600',
  },
  summaryTotalLabel: {
    color: '#1a1a1a',
    fontSize: 17,
    fontWeight: '700',
  },
  summaryTotal: {
    color: '#FF8C42',
    fontSize: 24,
    fontWeight: '800',
  },

  // Buttons
  confirmBtnWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 14,
    shadowColor: '#FF8C42',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
  },
  confirmBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 140, 66, 0.25)',
  },
  cancelBtnText: {
    color: '#888888',
    fontSize: 16,
    fontWeight: '600',
  },
});