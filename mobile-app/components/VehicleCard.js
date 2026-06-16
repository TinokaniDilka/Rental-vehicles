import React from 'react';
import { API_BASE_URL } from '../utils/constants';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../utils/theme';
import { ImageBackground } from 'react-native';
export default function VehicleCard({ vehicle, onPress }) {
  const isAvailable = vehicle.isAvailable !== false;
console.log('IMAGE PATH:', vehicle.image);
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
  
  <View style={styles.imageContainer}>
    <Image
  source={{
    uri: vehicle.image
      ? `http://10.24.89.129:5000${vehicle.image}`
      : 'https://via.placeholder.com/300'
  }}
  style={styles.image}
  resizeMode="cover"
/>

    

    {/* ✅ BADGE */}
    <View
      style={[
        styles.badge,
        { backgroundColor: isAvailable ? COLORS.success : COLORS.danger },
      ]}
    >
      <Text style={styles.badgeText}>
        {isAvailable ? 'Available' : 'Rented'}
      </Text>
    </View>

  </View>

  <View style={styles.info}>
    
    <View style={styles.cardHeader}>
      <Text style={styles.name}>{vehicle.name}</Text>
      <Text style={styles.category}>
        {vehicle.type?.toUpperCase()}
      </Text>
    </View>

    <View style={styles.divider} />

    <View style={styles.footer}>
      <Text style={styles.location}>📍 {vehicle.location}</Text>

      <Text style={styles.price}>
        <Text style={styles.priceNum}>
          ${vehicle.pricePerDay}
        </Text>
        <Text style={styles.priceDay}> / day</Text>
      </Text>
    </View>

  </View>

</TouchableOpacity>

  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.backgroundCardLight,
    borderRadius: SIZES.radiusLg,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.medium,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 180,
    backgroundColor: '#cbd5e1',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  badgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  info: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
  },
  category: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginLeft: 10,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceNum: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  priceDay: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  location: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
});