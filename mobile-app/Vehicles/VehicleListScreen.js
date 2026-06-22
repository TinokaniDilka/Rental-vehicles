import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getVehicles } from '../services/vehicleService';
import VehicleCard from '../components/VehicleCard';
import Loader from '../components/Loader';
import { Ionicons } from '@expo/vector-icons';

import { API_BASE_URL } from '../utils/constants';

const FILTER_CHIPS = ['All', 'Car', 'Scooter', 'Three Wheel', 'Van'];

export default function VehicleListScreen({ navigation }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    fetchVehicles();
  }, []);

const fetchVehicles = async () => {
  try {
    console.log('Fetching vehicles...');
    const res = await getVehicles();
    console.log('Vehicles received:', res.data);
    setVehicles(res.data || []);
  } catch (err) {
    console.error('Failed to load vehicles:', err.message);
    if (err.response) {
      console.error('Response data:', err.response.data);
      console.error('Status:', err.response.status);
    } else if (err.request) {
      console.error('No response from server - Network / Base URL issue');
    }
  } finally {
    setLoading(false);
  }
};

  const filtered = vehicles.filter((v) => {
    const matchesSearch =
      v.name?.toLowerCase().includes(search.toLowerCase()) ||
      v.location?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      activeFilter === 'All' ||
      v.type?.toLowerCase() === activeFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  if (loading) return <Loader message="Loading vehicles..." />;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <LinearGradient
        colors={['#0f172a', '#1e1b4b']}
        style={StyleSheet.absoluteFill}
      />

      {/* ── Top Bar ── */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.title}>Available Vehicles 🚗</Text>
          <Text style={styles.subTitle}>{filtered.length} vehicles found</Text>
        </View>
        <TouchableOpacity style={styles.filterIconBtn} activeOpacity={0.7}>
          <Ionicons name="options-outline" size={20} color="#a5b4fc" />
        </TouchableOpacity>
      </View>

      {/* ── Search Bar ── */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#6366f1" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or location..."
            placeholderTextColor="#475569"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={18} color="#475569" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Filter Chips ── */}
      <View style={styles.chipsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {FILTER_CHIPS.map((chip) => {
            const isActive = activeFilter === chip;
            return (
              <TouchableOpacity
                key={chip}
                style={[styles.chip, isActive && styles.chipActive]}
                activeOpacity={0.75}
                onPress={() => setActiveFilter(chip)}
              >
                {isActive && (
                  <LinearGradient
                    colors={['#6366f1', '#4f46e5']}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    borderRadius={20}
                  />
                )}
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                  {chip}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Vehicle List ── */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <VehicleCard
            vehicle={item}
            onPress={() => navigation.navigate('VehicleDetails', { vehicleId: item._id })}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="car-outline" size={36} color="#6366f1" />
            </View>
            <Text style={styles.emptyTitle}>No vehicles found</Text>
            <Text style={styles.emptyText}>
              Try adjusting your search or filter to find available rides.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0f172a',
  },

  /* Top Bar */
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f8fafc',
    letterSpacing: 0.2,
  },
  subTitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
  },
  filterIconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(99,102,241,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.35)',
  },

  /* Search Bar */
  searchWrapper: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30,41,59,0.8)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.3)',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#f8fafc',
    paddingVertical: 0,
  },

  /* Filter Chips */
  chipsWrapper: {
    marginTop: 12,
  },
  chipsRow: {
    paddingHorizontal: 20,
    gap: 8,
    flexDirection: 'row',
    paddingBottom: 4,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(30,41,59,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.25)',
    overflow: 'hidden',
  },
  chipActive: {
    borderColor: '#6366f1',
  },
  chipText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#ffffff',
  },

  /* List */
  list: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },

  /* Empty State */
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(99,102,241,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.25)',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 21,
  },
});