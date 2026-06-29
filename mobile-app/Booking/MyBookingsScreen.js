import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getMyBookings } from '../services/bookingService';
import Loader from '../components/Loader';
import { formatDate, formatCurrency, getStatusColor } from '../utils/helpers';

const TABS = ['All', 'Pending', 'Active', 'Completed'];

export default function MyBookingsScreen({ navigation }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    getMyBookings()
      .then(res => setBookings(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader message="Loading bookings..." />;

  const filteredBookings =
    activeTab === 'All'
      ? bookings
      : bookings.filter(
          b => b.status?.toLowerCase() === activeTab.toLowerCase()
        );

  const getStatusBadgeStyle = (status) => {
    const s = status?.toLowerCase();
    if (s === 'active') return { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.4)', text: '#10b981' };
    if (s === 'pending') return { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.4)', text: '#f59e0b' };
    if (s === 'completed') return { bg: 'rgba(99,102,241,0.15)', border: 'rgba(99,102,241,0.4)', text: '#818cf8' };
    if (s === 'cancelled') return { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.4)', text: '#ef4444' };
    return { bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.3)', text: '#94a3b8' };
  };
const renderItem = ({ item }) => {
  console.log("Full Item:", JSON.stringify(item, null, 2));
  const badge = getStatusBadgeStyle(item.status);
  

   let vehicleName = 'Vehicle';

  if (item.vehicle) {
    vehicleName = 
      item.vehicle.name || 
      item.vehicle.model || 
      item.vehicle.brand || 
      item.vehicle.make || 
      item.vehicle.vehicleName || 
      item.vehicle.title || 
      'Vehicle';
  } else if (item.vehicleName || item.name) {
    vehicleName = item.vehicleName || item.name;
  }

  return (
    <View style={styles.bookingCard}>
      <View style={styles.cardTopRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.bookingId}>
            Booking #{(item._id || item.id || '').toString().slice(-6)}
          </Text>
          <Text style={styles.vehicleName}>
            {vehicleName}
          </Text>
        </View>

        <View style={[styles.statusBadge, { 
          backgroundColor: badge.bg, 
          borderColor: badge.border 
        }]}>
          <Text style={[styles.statusText, { color: badge.text }]}>
            {item.status?.toUpperCase() || 'ONGOING'}
          </Text>
        </View>
      </View>

      <View style={styles.datesRow}>
        <Ionicons name="calendar-outline" size={16} color="#6366f1" />
        <Text style={styles.dateText}>
          {formatDate(item.pickupDate || item.startDate) || '—'}
        </Text>
        <Ionicons name="arrow-forward" size={14} color="#475569" style={{ marginHorizontal: 8 }} />
        <Text style={styles.dateText}>
          {formatDate(item.returnDate || item.endDate) || '—'}
        </Text>
      </View>

      <View style={styles.cardDivider} />

      <View style={styles.cardBottomRow}>
        <Text style={styles.amountText}>
          {formatCurrency(item.totalAmount || item.amount)}
        </Text>
      </View>
    </View>
  );
};
  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconWrap}>
        <Ionicons name="calendar-outline" size={48} color="#475569" />
      </View>
      <Text style={styles.emptyTitle}>No Bookings Yet</Text>
      <Text style={styles.emptySubtitle}>
        Your {activeTab !== 'All' ? activeTab.toLowerCase() : ''} bookings will appear here.
      </Text>
    </View>
  );

  return (
    <LinearGradient colors={['#0f172a', '#1e1b4b']} style={styles.gradientBg}>
      <StatusBar barStyle="light-content" />

      {/* Page Header */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>My Bookings 📅</Text>
        <Text style={styles.pageSubtitle}>{bookings.length} total booking{bookings.length !== 1 ? 's' : ''}</Text>
      </View>

      {/* Tab Filter Row */}
      <View style={styles.tabContainer}>
        <View style={styles.tabRow}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={styles.tabItem}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.tabTextActive,
                ]}
              >
                {tab}
              </Text>
              {activeTab === tab && <View style={styles.tabUnderline} />}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Bookings List */}
      <FlatList
        data={filteredBookings}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyState />}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBg: {
    flex: 1,
  },

  // Header
  pageHeader: {
    paddingHorizontal: 22,
    paddingTop: 58,
    paddingBottom: 16,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: 0.2,
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
  },

  // Tabs
  tabContainer: {
    paddingHorizontal: 22,
    marginBottom: 16,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 4,
  },
  tabItem: {
    marginRight: 20,
    paddingBottom: 8,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
  },
  tabTextActive: {
    color: '#6366f1',
    fontWeight: '700',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2.5,
    backgroundColor: '#6366f1',
    borderRadius: 2,
  },

  // List
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  // Booking Card
  bookingCard: {
    backgroundColor: 'rgba(30,41,59,0.85)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.25)',
    padding: 18,
    shadowColor: '#6366f1',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  vehicleName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#f8fafc',
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },

    bookingId: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 2,
    letterSpacing: 0.5,
  },

  vehicleName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#f8fafc',
  },

  // Dates
  datesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 6,
  },

  // Location
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 6,
    flex: 1,
  },

  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(99,102,241,0.12)',
    marginVertical: 12,
  },

  // Bottom Row
   cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',   // Changed from space-between
    alignItems: 'center',
    marginTop: 4,
  },
  amountText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#6366f1',
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.4)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 7,
    gap: 4,
  },
  viewBtnText: {
    color: '#6366f1',
    fontSize: 13,
    fontWeight: '700',
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 30,
  },
  emptyIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(30,41,59,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 21,
  },
});