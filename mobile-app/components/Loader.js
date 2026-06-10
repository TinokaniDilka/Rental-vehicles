import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';

export default function Loader({ message = "Loading..." }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4f46e5" />
      {message && <Text style={styles.text}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: 12,
    color: '#64748b',
    fontSize: 16,
  },
});