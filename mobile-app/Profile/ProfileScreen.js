import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import CustomButton from '../components/CustomButton';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.avatar}>
        <Ionicons name="person-circle" size={90} color="#4f46e5" />
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.role}>{user?.role?.toUpperCase()}</Text>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="mail" size={18} color="#4f46e5" />
          <Text style={styles.infoText}>{user?.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="shield-checkmark" size={18} color="#4f46e5" />
          <Text style={styles.infoText}>{user?.role}</Text>
        </View>
      </View>

      <CustomButton title="Logout" onPress={handleLogout} variant="outline" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 24, paddingTop: 56 },
  title: { fontSize: 24, fontWeight: '700', color: '#1e2937', marginBottom: 24 },
  avatar: { alignItems: 'center', marginBottom: 24 },
  name: { fontSize: 22, fontWeight: '700', color: '#1e2937', marginTop: 8 },
  email: { color: '#64748b', fontSize: 14, marginTop: 4 },
  role: { color: '#4f46e5', fontWeight: '700', marginTop: 4 },
  infoCard: { backgroundColor: 'white', borderRadius: 16, padding: 20, marginBottom: 24, elevation: 2 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  infoText: { color: '#475569', fontSize: 15 },
});