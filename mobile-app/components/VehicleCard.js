import React from 'react';
import { API_BASE_URL } from '../utils/constants';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

export default function VehicleCard({ vehicle, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image
        source={{ uri: `${API_BASE_URL}${vehicle.image}` }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.info}>
        <Text style={styles.name}>{vehicle.name}</Text>
        <Text style={styles.price}>${vehicle.pricePerDay} / day</Text>
        <Text style={styles.location}>📍 {vehicle.location}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 180,
  },
  info: {
    padding: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e2937',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4f46e5',
    marginVertical: 4,
  },
  location: {
    color: '#64748b',
    fontSize: 14,
  },
});