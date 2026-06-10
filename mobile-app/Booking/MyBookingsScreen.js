import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { getMyBookings } from '../services/bookingService';
import Loader from '../components/Loader';
import { formatDate, formatCurrency, getStatusColor } from '../utils/helpers';

export default function MyBookingsScreen() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyBookings()
      .then(res => setBookings(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader message="Loading bookings..." />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Bookings</Text>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No bookings yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.vehicleName}>{item.vehicle?.name || 'Vehicle'}</Text>
              <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
                {item.status?.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.detail}>📅 {formatDate(item.pickupDate)} → {formatDate(item.returnDate)}</Text>
            <Text style={styles.detail}>📍 {item.pickupLocation}</Text>
            <Text style={styles.amount}>{formatCurrency(item.totalAmount)}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', paddingTop: 56 },
  title: { fontSize: 24, fontWeight: '700', color: '#1e2937', paddingHorizontal: 24, marginBottom: 16 },
  list: { paddingHorizontal: 24, paddingBottom: 24 },
  empty: { textAlign: 'center', color: '#94a3b8', marginTop: 40 },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  vehicleName: { fontSize: 16, fontWeight: '700', color: '#1e2937' },
  status: { fontSize: 13, fontWeight: '700' },
  detail: { color: '#64748b', fontSize: 14, marginBottom: 4 },
  amount: { fontSize: 16, fontWeight: '700', color: '#4f46e5', marginTop: 8 },
});