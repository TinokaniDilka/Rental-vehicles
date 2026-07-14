import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '../utils/helpers';
import { createBookingWithPayment } from '../services/bookingService';
import { CardField, useStripe, useConfirmPayment } from '@stripe/stripe-react-native';


export default function PaymentScreen({ route, navigation }) {
  const { vehicle, startDate, endDate, hasDriver, days, total } = route.params;
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'cash'

  const handlePayment = async () => {
    setLoading(true);
    try {
      const res = await createBookingWithPayment({
        vehicleId: vehicle._id,
        startDate,
        endDate,
        hasDriver: hasDriver || false,
        paymentMethod,
        amount: total,
      });
      setLoading(false);
      if (paymentMethod === 'cash') {
        Alert.alert(
          '✅ Booking Confirmed',
          'Your booking is confirmed. Please pay the amount in cash to staff when you pick up the vehicle.',
          [{ text: 'Done', onPress: () => navigation.navigate('Main') }]
        );
      } else {
        Alert.alert(
          '🎉 Payment Successful',
          'Your booking has been confirmed! You will receive a confirmation shortly.',
          [{ text: 'Done', onPress: () => navigation.navigate('Main') }]
        );
      }
    } catch (err) {
      setLoading(false);
      console.error('Payment error:', err);
      if (err.response?.status === 403) {
        Alert.alert(
          'Account Not Verified',
          err.response?.data?.message || 'Please upload your ID and license documents and wait for admin approval before booking.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Go to Profile', onPress: () => navigation.navigate('Profile') },
          ]
        );
      } else {
        Alert.alert('Error', err.response?.data?.message || 'Payment failed. Please try again.');
      }
    }
  };

  const handlePayLater = () => {
    navigation.navigate('Main');
  };

  return (
    <LinearGradient colors={['#0f172a', '#1e1b4b']} style={styles.gradientBg}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color="#f8fafc" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Amount Display Card */}
        <View style={styles.amountCard}>
          <LinearGradient
            colors={['rgba(99,102,241,0.2)', 'rgba(99,102,241,0.05)']}
            style={styles.amountCardGradient}
          >
            <Text style={styles.cardEmoji}>💳</Text>
            <Text style={styles.amountDueLabel}>Amount Due</Text>
            <Text style={styles.amountValue}>{formatCurrency(total)}</Text>
            <View style={styles.bookingIdPill}>
              <Ionicons name="pricetag-outline" size={12} color="#94a3b8" />
              <Text style={styles.bookingIdText} numberOfLines={1}>
                {days} day{days !== 1 ? 's' : ''} · {vehicle.name}
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Booking Details Card */}
        <View style={styles.sectionLabel_wrap}>
          <Text style={styles.sectionLabel}>Booking Details</Text>
        </View>

        <View style={styles.glassCard}>
          {/* Vehicle */}
          <View style={styles.detailRow}>
            <View style={styles.detailIconWrap}>
              <Ionicons name="car-outline" size={16} color="#6366f1" />
            </View>
            <View style={styles.detailTextWrap}>
              <Text style={styles.detailLabel}>Vehicle</Text>
              <Text style={styles.detailValue}>{vehicle.name}</Text>
            </View>
          </View>

          <View style={styles.rowDivider} />

          {/* Dates */}
          <View style={styles.detailRow}>
            <View style={styles.detailIconWrap}>
              <Ionicons name="calendar-outline" size={16} color="#6366f1" />
            </View>
            <View style={styles.detailTextWrap}>
              <Text style={styles.detailLabel}>Dates</Text>
              <Text style={styles.detailValue}>{startDate} → {endDate}</Text>
            </View>
          </View>

          <View style={styles.rowDivider} />

          {/* Status */}
          <View style={styles.detailRow}>
            <View style={styles.detailIconWrap}>
              <Ionicons name="pulse-outline" size={16} color="#6366f1" />
            </View>
            <View style={styles.detailTextWrap}>
              <Text style={styles.detailLabel}>Status</Text>
              <View style={styles.statusPill}>
                <Text style={styles.statusPillText}>NOT YET BOOKED</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Payment Method Section */}
        <Text style={styles.sectionLabel}>Payment Method</Text>

        <TouchableOpacity
          style={[
            styles.paymentMethodCard,
            paymentMethod === 'card' && styles.paymentMethodCardActive,
          ]}
          onPress={() => setPaymentMethod('card')}
          activeOpacity={0.85}
        >
          <View style={styles.paymentMethodRow}>
            <View style={styles.cardIconWrap}>
              <Ionicons name="card" size={22} color="#6366f1" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.paymentMethodTitle}>Credit / Debit Card</Text>
              <Text style={styles.paymentMethodSub}>Secure payment via card</Text>
            </View>
            <View style={[styles.checkCircle, paymentMethod !== 'card' && styles.checkCircleInactive]}>
              {paymentMethod === 'card' && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.paymentMethodCard,
            paymentMethod === 'cash' && styles.paymentMethodCardActive,
            { marginBottom: 28 },
          ]}
          onPress={() => setPaymentMethod('cash')}
          activeOpacity={0.85}
        >
          <View style={styles.paymentMethodRow}>
            <View style={styles.cardIconWrap}>
              <Ionicons name="cash" size={22} color="#10b981" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.paymentMethodTitle}>Cash on Pickup</Text>
              <Text style={styles.paymentMethodSub}>Pay in cash when you collect the vehicle</Text>
            </View>
            <View style={[styles.checkCircle, paymentMethod !== 'cash' && styles.checkCircleInactive]}>
              {paymentMethod === 'cash' && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
          </View>
        </TouchableOpacity>

        {paymentMethod === 'cash' && (
          <View style={styles.cashNotice}>
            <Ionicons name="information-circle-outline" size={16} color="#f59e0b" />
            <Text style={styles.cashNoticeText}>
              Your booking will be confirmed now. Pay {formatCurrency(total)} in cash to staff at pickup.
            </Text>
          </View>
        )}

        {/* Pay Now Button */}
        <TouchableOpacity
          style={styles.payBtnWrapper}
          onPress={handlePayment}
          disabled={loading}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#6366f1', '#4f46e5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.payBtn}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons
                  name={paymentMethod === 'cash' ? 'checkmark-circle-outline' : 'lock-closed'}
                  size={18}
                  color="#fff"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.payBtnText}>
                  {paymentMethod === 'cash'
                    ? `Confirm Booking · ${formatCurrency(total)}`
                    : `Pay Now · ${formatCurrency(total)}`}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Pay Later Link */}
        <TouchableOpacity onPress={handlePayLater} style={styles.payLaterBtn} activeOpacity={0.7}>
          <Text style={styles.payLaterText}>Pay Later</Text>
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
    backgroundColor: 'rgba(99,102,241,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: '#f8fafc',
    letterSpacing: 0.3,
  },
  headerSpacer: {
    width: 40,
  },

  // Amount Card
  amountCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.3)',
    overflow: 'hidden',
    marginBottom: 28,
    shadowColor: '#6366f1',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  amountCardGradient: {
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 24,
  },
  cardEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  amountDueLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 40,
    fontWeight: '800',
    color: '#6366f1',
    marginBottom: 14,
    letterSpacing: -0.5,
  },
  bookingIdPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(15,23,42,0.5)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.15)',
  },
  bookingIdText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },

  // Section Label
  sectionLabel_wrap: {
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
    marginLeft: 2,
  },

  // Glass Card
  glassCard: {
    backgroundColor: 'rgba(30,41,59,0.85)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.25)',
    padding: 18,
    marginBottom: 24,
    shadowColor: '#6366f1',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  detailIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(99,102,241,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  detailTextWrap: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  detailValue: {
    fontSize: 14,
    color: '#f8fafc',
    fontWeight: '600',
  },
  rowDivider: {
    height: 1,
    backgroundColor: 'rgba(99,102,241,0.1)',
    marginVertical: 10,
  },
  statusPill: {
    backgroundColor: 'rgba(245,158,11,0.15)',
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.35)',
  },
  statusPillText: {
    color: '#f59e0b',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // Payment Method
  paymentMethodCard: {
    backgroundColor: 'rgba(30,41,59,0.85)',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(99,102,241,0.15)',
    padding: 18,
    marginBottom: 12,
  },
  paymentMethodCardActive: {
    borderColor: 'rgba(99,102,241,0.5)',
  },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(99,102,241,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  paymentMethodTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#f8fafc',
  },
  paymentMethodSub: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleInactive: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(148,163,184,0.4)',
  },
  cashNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(245,158,11,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.25)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  cashNoticeText: {
    color: '#fbbf24',
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },

  // Buttons
  payBtnWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#6366f1',
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 17,
    borderRadius: 16,
  },
  payBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  payLaterBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  payLaterText: {
    color: '#94a3b8',
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});