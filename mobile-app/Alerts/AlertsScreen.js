import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// PLACEHOLDER — this tab didn't exist before the nav redesign.
// Replace this with your real notifications list (booking updates,
// return reminders, admin approvals, etc.) whenever that's ready.
export default function AlertsScreen() {
  return (
    <LinearGradient colors={['#ffffff', '#fff5eb']} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Ionicons name="notifications-outline" size={40} color="#FFA366" />
        </View>
        <Text style={styles.title}>Alerts</Text>
        <Text style={styles.subtitle}>
          Booking updates and reminders will show up here.
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  iconWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(255, 140, 66, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 140, 66, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 21,
  },
});