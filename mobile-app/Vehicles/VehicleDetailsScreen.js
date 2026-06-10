import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, Alert } from 'react-native';
import { getVehicleById } from '../services/vehicleService';
import CustomButton from '../components/CustomButton';
import Loader from '../components/Loader';
import { API_BASE_URL } from '../utils/constants';
import { formatCurrency } from '../utils/helpers';
import { Ionicons } from '@expo/vector-icons';

export default function VehicleDetailsScreen({ route, navigation }) {
  const { vehicleId } = route.params;
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVehicleById(vehicleId)
      .then(res => setVehicle(res.data))
      .catch(() => Alert.alert('Error', 'Failed to load vehicle'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader message="Loading details..." />;
  if (!vehicle) return null;

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: `${API_BASE_URL}${vehicle.image}` }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <Text style={styles.name}>{vehicle.name}</Text>
        <Text style={styles.price}>{formatCurrency(vehicle.pricePerDay)} / day</Text>

        <View style={styles.infoRow}>
          <Ionicons name="location" size={16} color="#64748b" />
          <Text style={styles.infoText}>{vehicle.location}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="people" size={16} color="#64748b" />
          <Text style={styles.infoText}>{vehicle.seats} Seats</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="speedometer" size={16} color="#64748b" />
          <Text style={styles.infoText}>{vehicle.transmission}</Text>
        </View>

        {vehicle.description ? (
          <Text style={styles.description}>{vehicle.description}</Text>
        ) : null}

        <CustomButton
          title="Book Now"
          onPress={() => navigation.navigate('Booking', { vehicle })}
        />
        <CustomButton
          title="Go Back"
          variant="outline"
          onPress={() => navigation.goBack()}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  image: { width: '100%', height: 240 },
  content: { padding: 24 },
  name: { fontSize: 26, fontWeight: '800', color: '#1e2937' },
  price: { fontSize: 20, fontWeight: '700', color: '#4f46e5', marginVertical: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  infoText: { color: '#64748b', fontSize: 14 },
  description: { marginTop: 16, color: '#475569', lineHeight: 22 },
});