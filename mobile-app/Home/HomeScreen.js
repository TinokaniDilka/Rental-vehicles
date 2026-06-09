import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
  const { user } = useContext(AuthContext);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0]} 👋</Text>
          <Text style={styles.subGreeting}>Where do you want to go?</Text>
        </View>
        <Ionicons name="notifications-outline" size={26} color="#4f46e5" />
      </View>

      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>QuickRide Rentals</Text>
        <Text style={styles.bannerSub}>Fast. Easy. Affordable.</Text>
        <TouchableOpacity
          style={styles.bannerButton}
          onPress={() => navigation.navigate('Vehicles')}
        >
          <Text style={styles.bannerButtonText}>Browse Vehicles →</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionRow}>
          {[
            { icon: 'car', label: 'Rent', screen: 'Vehicles' },
            { icon: 'calendar', label: 'Bookings', screen: 'Bookings' },
            { icon: 'person', label: 'Profile', screen: 'Profile' },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.actionCard}
              onPress={() => navigation.navigate(item.screen)}
            >
              <Ionicons name={item.icon} size={28} color="#4f46e5" />
              <Text style={styles.actionLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 56 },
  greeting: { fontSize: 24, fontWeight: '700', color: '#1e2937' },
  subGreeting: { fontSize: 14, color: '#64748b', marginTop: 2 },
  banner: { margin: 24, backgroundColor: '#4f46e5', borderRadius: 20, padding: 24 },
  bannerTitle: { fontSize: 26, fontWeight: '800', color: 'white' },
  bannerSub: { fontSize: 14, color: '#c7d2fe', marginTop: 4 },
  bannerButton: { marginTop: 16, backgroundColor: 'white', borderRadius: 10, padding: 12, alignSelf: 'flex-start' },
  bannerButtonText: { color: '#4f46e5', fontWeight: '700' },
  quickActions: { paddingHorizontal: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1e2937', marginBottom: 16 },
  actionRow: { flexDirection: 'row', gap: 12 },
  actionCard: { flex: 1, backgroundColor: 'white', borderRadius: 16, padding: 20, alignItems: 'center', elevation: 2 },
  actionLabel: { marginTop: 8, fontWeight: '600', color: '#1e2937' },
});