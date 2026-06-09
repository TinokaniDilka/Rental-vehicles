import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { createBooking } from '../services/bookingService';
import CustomButton from '../components/CustomButton';
import InputField from '../components/InputField';
import { formatCurrency, calculateDays } from '../utils/helpers';

export default function BookingScreen({ route, navigation }) {
  const { vehicle } = route.params;
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [loading, setLoading] = useState(false);

  const days = pickupDate && returnDate ? calculateDays(pickupDate, returnDate) : 0;
  const total = days * vehicle.pricePerDay;

  const handleBooking = async () => {
    if (!pickupDate || !returnDate || !pickupLocation) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await createBooking({
        vehicleId: vehicle._id,
        pickupDate,
        returnDate,
        pickupLocation,
        totalAmount: total,
      });
      navigation.navigate('Payment', { booking: res.data });
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Book Vehicle</Text>
      <View style={styles.vehicleInfo}>
        <Text style={styles.vehicleName}>{vehicle.name}</Text>
        <Text style={styles.vehiclePrice}>{formatCurrency(vehicle.pricePerDay)} / day</Text>
      </View>

      <InputField placeholder="Pickup Date (YYYY-MM-DD)" value={pickupDate} onChangeText={setPickupDate} />
      <InputField placeholder="Return Date (YYYY-MM-DD)" value={returnDate} onChangeText={setReturnDate} />
      <InputField placeholder="Pickup Location" value={pickupLocation} onChangeText={setPickupLocation} />

      {days > 0 && (
        <View style={styles.summary}>
          <Text style={styles.summaryText}>Duration: {days} day(s)</Text>
          <Text style={styles.summaryTotal}>Total: {formatCurrency(total)}</Text>
        </View>
      )}

      <CustomButton title="Confirm Booking" onPress={handleBooking} loading={loading} />
      <CustomButton title="Cancel" variant="outline" onPress={() => navigation.goBack()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 24, paddingTop: 56 },
  title: { fontSize: 24, fontWeight: '700', color: '#1e2937', marginBottom: 24 },
  vehicleInfo: { backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 24, elevation: 2 },
  vehicleName: { fontSize: 18, fontWeight: '700', color: '#1e2937' },
  vehiclePrice: { fontSize: 16, color: '#4f46e5', marginTop: 4 },
  summary: { backgroundColor: '#eef2ff', borderRadius: 12, padding: 16, marginBottom: 16 },
  summaryText: { color: '#475569', fontSize: 15 },
  summaryTotal: { fontSize: 18, fontWeight: '700', color: '#4f46e5', marginTop: 4 },
});