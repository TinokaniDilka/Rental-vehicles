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

export default function PaymentScreen({ route, navigation }) {
  const { booking } = route.params;
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    // Simulate payment — wire to real payment gateway later
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        '🎉 Payment Successful',
        'Your booking has been confirmed! You will receive a confirmation shortly.',
        [{ text: 'Done', onPress: () => navigation.navigate('Main') }]
      );
    }, 1500);
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
            <Text style={styles.amountValue}>{formatCurrency(booking.totalAmount)}</Text>
            <View style={styles.bookingIdPill}>
              <Ionicons name="pricetag-outline" size={12} color="#94a3b8" />
              <Text style={styles.bookingIdText} numberOfLines={1}>
                {booking._id ? `#${booking._id.slice(-8).toUpperCase()}` : 'N/A'}
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Booking Details Card */}
        <View style={styles.sectionLabel_wrap}>
          <Text style={styles.sectionLabel}>Booking Details</Text>
        </View>

        <View style={styles.glassCard}>
          {/* Booking ID */}
          <View style={styles.detailRow}>
            <View style={styles.detailIconWrap}>
              <Ionicons name="receipt-outline" size={16} color="#6366f1" />
            </View>
            <View style={styles.detailTextWrap}>
              <Text style={styles.detailLabel}>Booking ID</Text>
              <Text style={styles.detailValue} numberOfLines={1}>
                {booking._id || 'N/A'}
              </Text>
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
                <Text style={styles.statusPillText}>
                  {booking.status?.toUpperCase() || 'PENDING'}
                </Text>
              </View>
            </View>
          </View>

          {booking.vehicle && (
            <>
              <View style={styles.rowDivider} />
              <View style={styles.detailRow}>
                <View style={styles.detailIconWrap}>
                  <Ionicons name="car-outline" size={16} color="#6366f1" />
                </View>
                <View style={styles.detailTextWrap}>
                  <Text style={styles.detailLabel}>Vehicle</Text>
                  <Text style={styles.detailValue}>
                    {booking.vehicle?.name || 'N/A'}
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Payment Method Section */}
        <Text style={styles.sectionLabel}>Payment Method</Text>

        <View style={styles.paymentMethodCard}>
          <View style={styles.paymentMethodRow}>
            <View style={styles.cardIconWrap}>
              <Ionicons name="card" size={22} color="#6366f1" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.paymentMethodTitle}>Credit / Debit Card</Text>
              <Text style={styles.paymentMethodSub}>Secure payment via card</Text>
            </View>
            <View style={styles.checkCircle}>
              <Ionicons name="checkmark" size={16} color="#fff" />
            </View>
          </View>
        </View>

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
                <Ionicons name="lock-closed" size={18} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.payBtnText}>Pay Now · {formatCurrency(booking.totalAmount)}</Text>
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
    borderColor: 'rgba(99,102,241,0.4)',
    padding: 18,
    marginBottom: 28,
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