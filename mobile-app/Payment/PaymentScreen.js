import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import CustomButton from '../components/CustomButton';
import { formatCurrency } from '../utils/helpers';

export default function PaymentScreen({ route, navigation }) {
  const { booking } = route.params;
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    // Simulate payment — wire to real payment gateway later
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Payment Successful', 'Your booking is confirmed!', [
        { text: 'OK', onPress: () => navigation.navigate('Main') }
      ]);
    }, 1500);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Payment</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Booking ID</Text>
        <Text style={styles.value}>{booking._id}</Text>

        <Text style={styles.label}>Amount Due</Text>
        <Text style={styles.amount}>{formatCurrency(booking.totalAmount)}</Text>

        <Text style={styles.label}>Status</Text>
        <Text style={styles.value}>{booking.status}</Text>
      </View>

      <CustomButton title="Pay Now" onPress={handlePayment} loading={loading} />
      <CustomButton title="Pay Later" variant="outline" onPress={() => navigation.navigate('Main')} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 24, paddingTop: 56 },
  title: { fontSize: 24, fontWeight: '700', color: '#1e2937', marginBottom: 24 },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 20, marginBottom: 24, elevation: 2 },
  label: { fontSize: 13, color: '#94a3b8', marginTop: 12 },
  value: { fontSize: 15, color: '#1e2937', fontWeight: '600' },
  amount: { fontSize: 24, fontWeight: '800', color: '#4f46e5' },
});