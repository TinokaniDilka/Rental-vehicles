import React, { useState, useEffect, useContext } from 'react';
import { Alert } from 'react-native';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  TextInput,
  ImageBackground,
  Modal,                    // ✅ ADD THIS
  KeyboardAvoidingView,     // ✅ ADD THIS
  Platform,                 // ✅ ADD THIS
  ActivityIndicator,
  FlatList         // ✅ ADD THIS
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { COLORS, SHADOWS, SIZES } from '../utils/theme';
import { Image } from 'react-native';
// ─── Mini Components ────────────────────────────────────────────────────────

const MetricCard = ({ icon, title, value, color }) => (
  <View style={[styles.metricCard, { borderTopColor: color }]}>
    <View style={[styles.metricIconCircle, { backgroundColor: color + '25' }]}>
      <Text style={{ fontSize: 22 }}>{icon}</Text>
    </View>
    <Text style={styles.metricValue}>{value}</Text>
    <Text style={styles.metricTitle}>{title}</Text>
  </View>
);

const StatusBadge = ({ status }) => {
  const colors = {
    pending: { bg: 'rgba(245,158,11,0.2)', text: '#f59e0b' },
    confirmed: { bg: 'rgba(99,102,241,0.2)', text: '#818cf8' },
    approved: { bg: 'rgba(99,102,241,0.2)', text: '#818cf8' },
    ongoing: { bg: 'rgba(16,185,129,0.2)', text: '#10b981' },
    completed: { bg: 'rgba(148,163,184,0.2)', text: '#94a3b8' },
    rejected: { bg: 'rgba(239,68,68,0.2)', text: '#ef4444' },
  };
  const c = colors[status?.toLowerCase()] || colors.pending;
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeText, { color: c.text }]}>{status?.toUpperCase()}</Text>
    </View>
  );
};

const SectionHeader = ({ title, subtitle }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
  </View>
);

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function StaffDashboardScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);

  const [activePage, setActivePage] = useState('dashboard');
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  
  const [stats, setStats] = useState({ active: 0, pending: 0 });
  const [earnings, setEarnings] = useState(0);
  const [filterStatus, setFilterStatus] = useState('all');
  const [token, setToken] = useState('');


  // Vehicle modal
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [vehicleName, setVehicleName] = useState('');
  const [vehicleType, setVehicleType] = useState('car');
  const [vehiclePrice, setVehiclePrice] = useState('');
  const [vehicleLocation, setVehicleLocation] = useState('');
  const [vehicleDesc, setVehicleDesc] = useState('');
  const [vehicleSaving, setVehicleSaving] = useState(false);

  // Review booking modal
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('approved');
  const [driverName, setDriverName] = useState('');
  const [discount, setDiscount] = useState('');
  const [additionalFees, setAdditionalFees] = useState('');
  const [reviewSaving, setReviewSaving] = useState(false);

  // Return inspection modal
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedBookingForReturn, setSelectedBookingForReturn] = useState(null);
  const [actualReturnDate, setActualReturnDate] = useState('');
  const [returnMileage, setReturnMileage] = useState('');
  const [returnFuelLevel, setReturnFuelLevel] = useState('100');
  const [returnCondition, setReturnCondition] = useState('Good');
  const [damages, setDamages] = useState('');
  const [damageCharge, setDamageCharge] = useState('');
  const [returnSaving, setReturnSaving] = useState(false);

  // Complaint modal
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [complaintStatus, setComplaintStatus] = useState('Open');
  const [staffResponse, setStaffResponse] = useState('');
  const [complaintSaving, setComplaintSaving] = useState(false);

  // Reply modal
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedFeedbackForReply, setSelectedFeedbackForReply] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replySaving, setReplySaving] = useState(false);

  useEffect(() => {
    const loadToken = async () => {
      const t = await AsyncStorage.getItem('token');
      setToken(t || '');
      fetchAll(t || '');
    };
    loadToken();
  }, []);

  const authHeaders = (t) => ({ headers: { Authorization: `Bearer ${t || token}` } });

  const fetchAll = (t) => {
    fetchVehicles(t);
    fetchBookings(t);
    fetchFeedbacks(t);
  };

 const fetchVehicles = async (t) => {
  try {
    const res = await api.get('/api/vehicles/my-vehicles', authHeaders(t));
    console.log('Staff vehicles loaded:', res.data?.length || 0);
    setVehicles(res.data || []);
  } catch (err) {
    console.error('Failed to load vehicles:', err.response?.data || err.message);
  }
};

const fetchBookings = async (t) => {
  try {
    const res = await api.get('/api/bookings/staff/all', authHeaders(t));

    console.log('Staff bookings loaded:', res.data?.length || 0);
    setBookings(res.data || []);

    const pending = res.data.filter(b => b.status === 'pending').length;
    const active = res.data.filter(b => b.status === 'ongoing').length;

    const earn = res.data
      .filter(b => ['completed', 'ongoing', 'confirmed'].includes(b.status))
      .reduce((s, b) => s + (b.totalAmount || 0), 0);

    setStats({ active, pending });
    setEarnings(earn);

  } catch (err) {
    console.error('Failed to load bookings:', err.response?.data || err.message);
  }
};

  const fetchFeedbacks = async (t) => {
  try {
    const res = await api.get('/api/feedback', authHeaders(t));
    console.log('Feedbacks loaded:', res.data?.length || 0);
    setFeedbacks(res.data || []);
  } catch (err) {
    console.error('Failed to load feedbacks:', err.response?.data || err.message);
  }
};

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  // ── Vehicle CRUD ──
  const openVehicleModal = (vehicle = null) => {
  setEditingVehicle(vehicle);
  setVehicleName(vehicle?.name || '');
  setVehicleType(vehicle?.type || 'car');
  setVehiclePrice(vehicle?.pricePerDay?.toString() || '');
  setVehicleLocation(vehicle?.location || '');
  setVehicleDesc(vehicle?.description || '');

  setShowVehicleModal(true);
};


const saveVehicle = async () => {
  if (!vehicleName || !vehiclePrice || !vehicleLocation) {
    Alert.alert('Error', 'Please fill all required fields');
    return;
  }
  setVehicleSaving(true);
  try {
    const payload = {
      name: vehicleName, 
      type: vehicleType,
      pricePerDay: parseFloat(vehiclePrice), // better to send as number
      location: vehicleLocation,
      description: vehicleDesc,
    };

    if (editingVehicle) {
      await api.put(`/api/vehicles/${editingVehicle._id}`, payload, authHeaders());
      Alert.alert('Success', 'Vehicle updated successfully ✅');
    } else {
      await api.post('/api/vehicles', payload, authHeaders());   // ← Fixed
      Alert.alert('Success', 'Vehicle added successfully ✅');
    }
    setShowVehicleModal(false);
    fetchVehicles();   // refresh list
  } catch (err) {
    console.error('Save vehicle error:', err.response?.data || err.message);
    Alert.alert('Error', err.response?.data?.message || 'Could not save vehicle');
  } finally { 
    setVehicleSaving(false); 
  }
};

 const deleteVehicle = (id) => {
  Alert.alert('Delete Vehicle', 'Are you sure you want to delete this vehicle?', [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Delete', 
      style: 'destructive', 
      onPress: async () => {
        try {
          await api.delete(`/api/vehicles/${id}`, authHeaders());  // ← Fixed
          fetchVehicles();
          Alert.alert('Success', 'Vehicle deleted');
        } catch (err) {
          Alert.alert('Error', err.response?.data?.message || 'Delete failed');
        }
      }
    }
  ]);
};

  const openReplyModal = (feedback) => {
  setSelectedFeedbackForReply(feedback);
  setReplyText('');
  setShowReplyModal(true);
};

const saveReply = async () => {
  if (!replyText.trim()) {
    Alert.alert('Error', 'Reply text cannot be empty');
    return;
  }

  setReplySaving(true);

  try {
    await api.post(
      `/api/feedback/${selectedFeedbackForReply._id}/staff-reply`,
      { replyText },
      authHeaders()
    );

    Alert.alert('Success', 'Reply added ✅');
    setShowReplyModal(false);
    fetchFeedbacks();

  } catch (err) {
    console.log("REPLY ERROR:", err.response?.data || err.message);

    Alert.alert(
      'Error',
      err.response?.data?.message || 'Reply failed'
    );

  } finally {
    setReplySaving(false);
  }
};
  // ── Booking Actions ──
  const openReviewModal = (booking) => {
    setSelectedBookingForReview(booking);
    setReviewStatus('approved');
    setDriverName('');
    setDiscount('');
    setAdditionalFees('');
    setShowReviewModal(true);
  };

  const saveReview = async () => {
    setReviewSaving(true);
    try {
      await api.put(
        `/bookings/${selectedBookingForReview._id}/review`,
        { status: reviewStatus, driverName, discount: Number(discount) || 0, additionalFees: Number(additionalFees) || 0 },
        authHeaders()
      );
      Alert.alert('Success', `Booking ${reviewStatus} successfully ✅`);
      setShowReviewModal(false);
      fetchBookings();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Review failed');
    } finally { setReviewSaving(false); }
  };

  const handlePickup = async (bookingId) => {
    try {
      await api.put(`/bookings/${bookingId}/pickup`, {}, authHeaders());
      Alert.alert('Success', 'Rental started! Booking is now ongoing 🚗');
      fetchBookings();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Pickup failed');
    }
  };

  const openReturnModal = (booking) => {
    setSelectedBookingForReturn(booking);
    setActualReturnDate(new Date().toISOString().substring(0, 10));
    setReturnMileage('');
    setReturnFuelLevel('100');
    setReturnCondition('Good');
    setDamages('');
    setDamageCharge('');
    setShowReturnModal(true);
  };

const saveReturn = async () => {
  if (!selectedBookingForReturn?._id) {
    Alert.alert('Error', 'No booking selected');
    return;
  }

  if (!returnMileage) {
    Alert.alert('Error', 'Return mileage is required');
    return;
  }

  setReturnSaving(true);

  try {
    await api.put(
      `/api/bookings/${selectedBookingForReturn._id}/return`,
      {
        actualReturnDate: new Date().toISOString(),
        returnMileage: Number(returnMileage),
        returnFuelLevel: Number(returnFuelLevel) || 100,
        returnCondition,
        damages,
        damageCharge: Number(damageCharge) || 0,
      },
      authHeaders()
    );

    Alert.alert('Success', 'Vehicle return finalized ✅');
    setShowReturnModal(false);
    fetchBookings();

  } catch (err) {
    console.log("RETURN ERROR:", err.response?.data || err.message);

    Alert.alert(
      'Error',
      err.response?.data?.message || 'Return failed'
    );

  } finally {
    setReturnSaving(false);
  }
};

 const openComplaintModal = (item) => {
  setSelectedComplaint(item);
  setComplaintStatus(item.complaintStatus || 'Open');
  setStaffResponse(item.staffResponse || '');
  setShowComplaintModal(true);
};

const saveComplaintResponse = async () => {
  if (!staffResponse.trim()) {
    Alert.alert('Error', 'Please enter a response');
    return;
  }

  setComplaintSaving(true);

  try {
    await api.put(
      `/api/feedback/${selectedComplaint._id}/respond`,
      {
        complaintStatus,
        staffResponse,
      },
      authHeaders()
    );

    Alert.alert('Success', 'Response submitted ✅');
    setShowComplaintModal(false);
    fetchFeedbacks();

  } catch (err) {
    Alert.alert(
      'Error',
      err.response?.data?.message || 'Failed to respond'
    );

  } finally {
    setComplaintSaving(false);
  }
};


  // ── Filtered Bookings ──
  const filteredBookings = filterStatus === 'all'
    ? bookings
    : bookings.filter(b => b.status === filterStatus);

  // ─── Render Pages ──────────────────────────────────────────────────────────
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "☀️ Good Morning";
  if (hour < 18) return "🌤️ Good Afternoon";
  return "🌙 Good Evening";
};

  const renderDashboard = () => (
    <ScrollView contentContainerStyle={styles.pageContent} showsVerticalScrollIndicator={false}>
          {/* Welcome Banner */}
      <View style={styles.welcomeBanner} />
      <Text style={styles.welcomeTitle}>{getGreeting()}, {user?.name?.split(' ')[0]}!</Text>
      <Text style={styles.welcomeSubtitle}>Let’s manage your rentals efficiently 🚀</Text>

     <View style={{ width: '100%', height: 220, borderRadius: 20, overflow: 'hidden', marginTop: 12, marginBottom: 16 }}>
  <ImageBackground
    source={{
      uri: 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800'
    }}
    style={{ width: '100%', height: '100%' }}
    imageStyle={{ borderRadius: 20 }}
  >
    <LinearGradient
      colors={['rgba(0,0,0,0.05)', 'rgba(15,10,60,0.85)']}
      style={{ flex: 1, justifyContent: 'flex-end', padding: 22, borderRadius: 20 }}
    >
      <Text style={{
        color: '#ffffff',
        fontSize: 30,
        fontWeight: '800',
        letterSpacing: 1,
        textShadowColor: 'rgba(0,0,0,0.9)',
        textShadowOffset: { width: 0, height: 3 },
        textShadowRadius: 10,
      }}>
        Ready for Today? 
      </Text>
      
    </LinearGradient>
  </ImageBackground>
</View>

{/* Metrics Grid */}
<View style={styles.metricsGrid}>
        <MetricCard icon="⏳" title="PENDING" value={stats.pending} color="#f59e0b" />
        <MetricCard icon="🚗" title="ACTIVE" value={stats.active} color="#6366f1" />
        <MetricCard icon="📂" title="FLEET" value={vehicles.length} color="#0ea5e9" />
        <MetricCard icon="💰" title="EARNINGS" value={`$${earnings}`} color="#10b981" />
      </View>

      {/* Quick Actions */}
      <View style={styles.glassCard}>
        <Text style={styles.cardTitle}>⚡ Quick Operations</Text>
        <View style={styles.quickActionsRow}>
          <TouchableOpacity style={styles.quickActionBtn} onPress={() => openVehicleModal(null)}>
            <LinearGradient colors={['#6366f1', '#4f46e5']} style={styles.quickActionGrad}>
              <Ionicons name="add-circle" size={22} color="white" />
              <Text style={styles.quickActionLabel}>Add Vehicle</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionBtn} onPress={() => setActivePage('bookings')}>
            <LinearGradient colors={['#0ea5e9', '#0284c7']} style={styles.quickActionGrad}>
              <Ionicons name="calendar-outline" size={22} color="white" />
              <Text style={styles.quickActionLabel}>Bookings</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionBtn} onPress={() => setActivePage('complaints')}>
            <LinearGradient colors={['#f43f5e', '#e11d48']} style={styles.quickActionGrad}>
              <Ionicons name="chatbubble-outline" size={22} color="white" />
              <Text style={styles.quickActionLabel}>Reviews</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Activity placeholder */}
      <View style={styles.glassCard}>
        <Text style={styles.cardTitle}>📊 Status Overview</Text>
        {[
          { label: 'Pending Approvals', val: stats.pending, color: '#f59e0b' },
          { label: 'Active Rentals', val: stats.active, color: '#10b981' },
          { label: 'Total Fleet', val: vehicles.length, color: '#6366f1' },
        ].map((item, i) => (
          <View key={i} style={styles.overviewRow}>
            <View style={[styles.overviewDot, { backgroundColor: item.color }]} />
            <Text style={styles.overviewLabel}>{item.label}</Text>
            <Text style={[styles.overviewVal, { color: item.color }]}>{item.val}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderVehicles = () => (
    <View style={{ flex: 1 }}>
      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>Vehicle Fleet 🚘</Text>
          <Text style={styles.pageSubtitle}>Manage your rental inventory</Text>
        </View>
        <TouchableOpacity onPress={() => openVehicleModal(null)}>
          <LinearGradient colors={['#6366f1', '#4f46e5']} style={styles.addBtn}>
            <Ionicons name="add" size={20} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
      <FlatList
        data={vehicles}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 48 }}>🚗</Text>
            <Text style={styles.emptyText}>No vehicles listed yet</Text>
            <Text style={styles.emptySubText}>Tap the + button to add your first vehicle</Text>
          </View>
        }
        renderItem={({ item: v }) => (
          <View style={styles.glassCard}>
            <View style={styles.vehicleRow}>
              <View style={styles.vehicleIconBox}>
                <Text style={{ fontSize: 28 }}>🚗</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.vehicleName}>{v.name}</Text>
                <Text style={styles.vehicleMeta}>📍 {v.location} · {v.type}</Text>
                <Text style={styles.vehiclePrice}>${v.pricePerDay}<Text style={styles.vehicleDay}>/day</Text></Text>
              </View>
              <View style={[styles.availBadge, { backgroundColor: v.isAvailable ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)' }]}>
                <Text style={{ color: v.isAvailable ? '#10b981' : '#ef4444', fontSize: 11, fontWeight: '700' }}>
                  {v.isAvailable ? 'AVAIL' : 'RENTED'}
                </Text>
              </View>
            </View>
            {v.description ? <Text style={styles.vehicleDesc}>{v.description}</Text> : null}
            <View style={styles.vehicleActions}>
              <TouchableOpacity style={[styles.actionBtnSmall, { backgroundColor: 'rgba(99,102,241,0.2)' }]} onPress={() => openVehicleModal(v)}>
                <Ionicons name="pencil" size={14} color="#6366f1" />
                <Text style={[styles.actionBtnText, { color: '#6366f1' }]}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtnSmall, { backgroundColor: 'rgba(239,68,68,0.2)' }]} onPress={() => deleteVehicle(v._id)}>
                <Ionicons name="trash" size={14} color="#ef4444" />
                <Text style={[styles.actionBtnText, { color: '#ef4444' }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );

  const renderBookings = () => (
    <View style={{ flex: 1 }}>
      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>Booking Requests 📋</Text>
          <Text style={styles.pageSubtitle}>Process approvals, pickups & returns</Text>
        </View>
      </View>
      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {['all', 'pending', 'confirmed', 'ongoing', 'completed', 'rejected'].map(s => (
          <TouchableOpacity key={s} onPress={() => setFilterStatus(s)}
            style={[styles.filterChip, filterStatus === s && styles.filterChipActive]}>
            <Text style={[styles.filterChipText, filterStatus === s && styles.filterChipTextActive]}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 48 }}>📋</Text>
            <Text style={styles.emptyText}>No bookings found</Text>
          </View>
        }
        renderItem={({ item: b }) => (
          <View style={styles.glassCard}>
            <View style={styles.bookingHeaderRow}>
              <Text style={styles.bookingVehicle}>{b.vehicleId?.name || 'Vehicle'}</Text>
              <StatusBadge status={b.status} />
            </View>
            <Text style={styles.bookingCustomer}>👤 {b.customerId?.name} · {b.customerId?.email}</Text>
            <Text style={styles.bookingDates}>
              📅 {new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()}
            </Text>
            {b.hasDriver && (
              <Text style={styles.driverNote}>🚖 Driver requested {b.driverName ? `· ${b.driverName}` : ''}</Text>
            )}
            <View style={styles.bookingAmountRow}>
              <Text style={styles.bookingAmount}>${b.totalAmount || '—'}</Text>
              {b.status === 'pending' && (
                <TouchableOpacity onPress={() => openReviewModal(b)}>
                  <LinearGradient colors={['#6366f1', '#4f46e5']} style={styles.bookingActionBtn}>
                    <Text style={styles.bookingActionText}>🔍 Review</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
              {b.status === 'confirmed' && (
                <TouchableOpacity onPress={() => handlePickup(b._id)}>
                  <LinearGradient colors={['#10b981', '#059669']} style={styles.bookingActionBtn}>
                    <Text style={styles.bookingActionText}>🚗 Start Rental</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
              {b.status === 'ongoing' && (
                <TouchableOpacity onPress={() => openReturnModal(b)}>
                  <LinearGradient colors={['#f59e0b', '#d97706']} style={styles.bookingActionBtn}>
                    <Text style={styles.bookingActionText}>🔧 Inspect Return</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
    // ─── Profile Page ─────────────────────────────────────────────────────────
  const renderProfile = () => {
    const avatarLetter = user?.name ? user.name.charAt(0).toUpperCase() : '?';
    const memberSince = user?.createdAt
      ? new Date(user.createdAt).getFullYear()
      : '2024';

    const SETTINGS_ITEMS = [
      { icon: 'person-outline', label: 'Edit Profile', route: 'EditProfile' },
      { icon: 'notifications-outline', label: 'Notifications', route: 'Notifications' },
      { icon: 'help-circle-outline', label: 'Help & Support', route: 'Support' },
    ];

    return (
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={profileStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Page Title */}
        <View style={profileStyles.pageHeader}>
          <Text style={profileStyles.pageTitle}>Profile</Text>
          <TouchableOpacity style={profileStyles.settingsIconBtn} activeOpacity={0.75}>
            <Ionicons name="settings-outline" size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* Avatar Section */}
        <View style={profileStyles.avatarSection}>
          <LinearGradient
            colors={['#6366f1', '#4f46e5']}
            style={profileStyles.avatarCircle}
          >
            {user?.name ? (
              <Text style={profileStyles.avatarLetter}>{avatarLetter}</Text>
            ) : (
              <Ionicons name="person" size={38} color="#fff" />
            )}
          </LinearGradient>

          <View style={profileStyles.onlineDot} />

          <Text style={profileStyles.userName}>{user?.name || 'Staff Member'}</Text>
          <Text style={profileStyles.userEmail}>{user?.email || 'staff@quickride.com'}</Text>

          <View style={profileStyles.roleBadge}>
            <Ionicons name="shield-checkmark" size={12} color="#818cf8" />
            <Text style={profileStyles.roleBadgeText}>
              {user?.role?.toUpperCase() || 'STAFF'}
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={profileStyles.statsRow}>
          <View style={profileStyles.statCard}>
            <Text style={profileStyles.statValue}>{bookings.length}</Text>
            <Text style={profileStyles.statLabel}>Bookings</Text>
          </View>
          <View style={[profileStyles.statCard, profileStyles.statCardMiddle]}>
            <Text style={profileStyles.statValue}>{memberSince}</Text>
            <Text style={profileStyles.statLabel}>Member Since</Text>
          </View>
          <View style={profileStyles.statCard}>
            <View style={profileStyles.statActiveDot} />
            <Text style={profileStyles.statLabel}>Status</Text>
            <Text style={profileStyles.statActiveText}>Active</Text>
          </View>
        </View>

        {/* Info Card */}
        <Text style={profileStyles.sectionLabel}>Account Info</Text>
        <View style={profileStyles.glassCard}>
          <View style={profileStyles.infoRow}>
            <View style={profileStyles.infoIconWrap}>
              <Ionicons name="mail-outline" size={16} color="#6366f1" />
            </View>
            <View style={profileStyles.infoTextWrap}>
              <Text style={profileStyles.infoLabel}>Email</Text>
              <Text style={profileStyles.infoValue} numberOfLines={1}>
                {user?.email || '—'}
              </Text>
            </View>
          </View>

          <View style={profileStyles.rowDivider} />

          <View style={profileStyles.infoRow}>
            <View style={profileStyles.infoIconWrap}>
              <Ionicons name="shield-checkmark-outline" size={16} color="#6366f1" />
            </View>
            <View style={profileStyles.infoTextWrap}>
              <Text style={profileStyles.infoLabel}>Role</Text>
              <Text style={profileStyles.infoValue}>{user?.role || 'Staff'}</Text>
            </View>
          </View>
        </View>

        {/* Settings Section */}
        <Text style={profileStyles.sectionLabel}>Settings</Text>
        <View style={profileStyles.glassCard}>
          {SETTINGS_ITEMS.map((item, index) => (
            <React.Fragment key={item.label}>
              <TouchableOpacity
                style={profileStyles.settingsRow}
                onPress={() => navigation && navigation.navigate && navigation.navigate(item.route)}
                activeOpacity={0.7}
              >
                <View style={profileStyles.settingsIconWrap}>
                  <Ionicons name={item.icon} size={18} color="#6366f1" />
                </View>
                <Text style={profileStyles.settingsLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={16} color="#475569" />
              </TouchableOpacity>
              {index < SETTINGS_ITEMS.length - 1 && <View style={profileStyles.rowDivider} />}
            </React.Fragment>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={profileStyles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={profileStyles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    );
  };

  const renderComplaints = () => (
    <View style={{ flex: 1 }}>
      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageTitle}>Reviews & Complaints 📣</Text>
          <Text style={styles.pageSubtitle}>Respond to customers & monitor feedback</Text>
        </View>
      </View>
      <FlatList
        data={feedbacks}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 48 }}>💬</Text>
            <Text style={styles.emptyText}>No feedback yet</Text>
          </View>
        }
        renderItem={({ item: f }) => (
          <View style={styles.glassCard}>
            <View style={styles.feedbackHeaderRow}>
              <View style={[styles.typePill, {
                backgroundColor: f.type === 'complaint' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'
              }]}>
                <Text style={{ color: f.type === 'complaint' ? '#ef4444' : '#f59e0b', fontSize: 11, fontWeight: '700' }}>
                  {f.type?.toUpperCase()}
                </Text>
              </View>
              {f.type === 'feedback' && (
                <Text style={{ color: '#fbbf24', fontSize: 14 }}>{'★'.repeat(f.rating || 0)}</Text>
              )}
            </View>
            <Text style={styles.feedbackComment}>"{f.comment}"</Text>
            <Text style={styles.feedbackMeta}>From: {f.customerId?.name}</Text>
            {f.type === 'complaint' && (
              <View style={styles.complaintStatusRow}>
                <Text style={styles.feedbackMeta}>
                  Status:{' '}
                  <Text style={{ color: f.complaintStatus === 'Resolved' ? '#10b981' : '#f59e0b', fontWeight: '700' }}>
                    {f.complaintStatus}
                  </Text>
                </Text>
              </View>
            )}

            {f.staffResponse ? (
              <Text style={styles.staffResponseText}>💬 Response: {f.staffResponse}</Text>
            ) : null}
            <View style={styles.feedbackActions}>
              {f.type === 'complaint' && (
                <TouchableOpacity style={styles.feedbackActionBtn} onPress={() => openComplaintModal(f)}>
                  <LinearGradient colors={['rgba(99,102,241,0.3)', 'rgba(79,70,229,0.3)']} style={styles.feedbackActionGrad}>
                    <Text style={styles.feedbackActionText}>Resolve</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.feedbackActionBtn} onPress={() => openReplyModal(f)}>
                <LinearGradient colors={['rgba(14,165,233,0.3)', 'rgba(2,132,199,0.3)']} style={styles.feedbackActionGrad}>
                  <Text style={styles.feedbackActionText}>
                    💬 {f.staffReplies?.length > 0 ? `Replies (${f.staffReplies.length})` : 'Reply'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );

  // ─── Bottom Tab Navigation ──────────────────────────────────────────────────

  const tabs = [
    { id: 'dashboard', icon: 'grid-outline', label: 'Dashboard' },
    { id: 'vehicles', icon: 'car-outline', label: 'Vehicles' },
    { id: 'bookings', icon: 'calendar-outline', label: 'Bookings' },
    { id: 'profile', icon: 'person-outline', label: 'Profile' },
  ];

  // ─── Modal: Add/Edit Vehicle ────────────────────────────────────────────────

  const VehicleModal = () => (
    <Modal
      visible={showVehicleModal}
      animationType="slide"
      transparent
      onRequestClose={() => setShowVehicleModal(false)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        style={styles.modalOverlay}
      >
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>
            {editingVehicle ? '✏️ Edit Vehicle' : '➕ Add Vehicle'}
          </Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            contentContainerStyle={{ paddingBottom: 150 }}
            bounces={false}
          >
            <Text style={styles.inputLabel}>Vehicle Name *</Text>
            <TextInput
              style={styles.modalInput}
              value={vehicleName}
              onChangeText={setVehicleName}
              placeholder="e.g. Toyota Corolla"
              placeholderTextColor="#475569"
              autoCorrect={false}
              autoCapitalize="words"
              returnKeyType="next"
              blurOnSubmit={false}
              enablesReturnKeyAutomatically={true}
            />

            <Text style={styles.inputLabel}>Category</Text>
            <View style={styles.typeRow}>
              {['car', 'scooter', 'three wheel', 'Van'].map(t => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setVehicleType(t)}
                  style={[styles.typeChip, vehicleType === t && styles.typeChipActive]}
                >
                  <Text style={[styles.typeChipText, vehicleType === t && { color: 'white' }]}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Price Per Day ($) *</Text>
            <TextInput
              style={styles.modalInput}
              value={vehiclePrice}
              onChangeText={setVehiclePrice}
              placeholder="e.g. 45"
              placeholderTextColor="#475569"
              keyboardType="numeric"
              returnKeyType="next"
              blurOnSubmit={false}
              enablesReturnKeyAutomatically={true}
            />

            <Text style={styles.inputLabel}>Location *</Text>
            <TextInput
              style={styles.modalInput}
              value={vehicleLocation}
              onChangeText={setVehicleLocation}
              placeholder="e.g. Colombo"
              placeholderTextColor="#475569"
              returnKeyType="next"
              blurOnSubmit={false}
              enablesReturnKeyAutomatically={true}
            />

            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.modalInput, { height: 100, textAlignVertical: 'top' }]}
              value={vehicleDesc}
              onChangeText={setVehicleDesc}
              placeholder="Optional description..."
              placeholderTextColor="#475569"
              multiline
              returnKeyType="done"
              blurOnSubmit={true}
            />

            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowVehicleModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ flex: 2 }} onPress={saveVehicle} disabled={vehicleSaving}>
                <LinearGradient colors={['#6366f1', '#4f46e5']} style={styles.primaryBtn}>
                  {vehicleSaving
                    ? <ActivityIndicator color="white" size="small" />
                    : <Text style={styles.primaryBtnText}>Save Vehicle</Text>}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  // ─── Modal: Review Booking ────────────────────────────────────────────────

  const ReviewModal = () => (
    <Modal visible={showReviewModal} animationType="slide" transparent onRequestClose={() => setShowReviewModal(false)}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>🔍 Review Booking</Text>
          <Text style={styles.modalSubtitle}>Customer: {selectedBookingForReview?.customerId?.name}</Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.inputLabel}>Decision</Text>
            <View style={styles.typeRow}>
              {['approved', 'rejected'].map(s => (
                <TouchableOpacity key={s} onPress={() => setReviewStatus(s)}
                  style={[styles.typeChip, reviewStatus === s && { ...styles.typeChipActive, backgroundColor: s === 'rejected' ? '#ef4444' : '#6366f1' }]}>
                  <Text style={[styles.typeChipText, reviewStatus === s && { color: 'white' }]}>
                    {s === 'approved' ? '✅ Approve' : '❌ Reject'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {reviewStatus === 'approved' && (
              <>
                {selectedBookingForReview?.hasDriver && (
                  <>
                    <Text style={styles.inputLabel}>Assign Driver Name *</Text>
                    <TextInput style={styles.modalInput} value={driverName} onChangeText={setDriverName} placeholder="Driver full name" placeholderTextColor="#475569" />
                  </>
                )}
                <Text style={styles.inputLabel}>Discount Amount ($)</Text>
                <TextInput style={styles.modalInput} value={discount} onChangeText={setDiscount} placeholder="0" placeholderTextColor="#475569" keyboardType="numeric" />
                <Text style={styles.inputLabel}>Additional Fees ($)</Text>
                <TextInput style={styles.modalInput} value={additionalFees} onChangeText={setAdditionalFees} placeholder="0" placeholderTextColor="#475569" keyboardType="numeric" />
              </>
            )}

            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowReviewModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ flex: 2 }} onPress={saveReview} disabled={reviewSaving}>
                <LinearGradient colors={['#6366f1', '#4f46e5']} style={styles.primaryBtn}>
                  {reviewSaving ? <ActivityIndicator color="white" size="small" /> : <Text style={styles.primaryBtnText}>Submit Review</Text>}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  // ─── Modal: Return Inspection ─────────────────────────────────────────────

  const ReturnModal = () => (
    <Modal visible={showReturnModal} animationType="slide" transparent onRequestClose={() => setShowReturnModal(false)}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>🔧 Return Inspection</Text>
          <Text style={styles.modalSubtitle}>{selectedBookingForReturn?.vehicleId?.name}</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.inputLabel}>Actual Return Date</Text>
            <TextInput style={styles.modalInput} value={actualReturnDate} onChangeText={setActualReturnDate} placeholder="YYYY-MM-DD" placeholderTextColor="#475569" />

            <Text style={styles.inputLabel}>Return Mileage (km) *</Text>
            <TextInput style={styles.modalInput} value={returnMileage} onChangeText={setReturnMileage} placeholder="e.g. 12500" placeholderTextColor="#475569" keyboardType="numeric" />

            <Text style={styles.inputLabel}>Fuel Level (%)</Text>
            <TextInput style={styles.modalInput} value={returnFuelLevel} onChangeText={setReturnFuelLevel} placeholder="100" placeholderTextColor="#475569" keyboardType="numeric" />

            <Text style={styles.inputLabel}>Vehicle Condition</Text>
            <View style={styles.typeRow}>
              {['Good', 'Dirty', 'Damaged'].map(c => (
                <TouchableOpacity key={c} onPress={() => setReturnCondition(c)}
                  style={[styles.typeChip, returnCondition === c && styles.typeChipActive]}>
                  <Text style={[styles.typeChipText, returnCondition === c && { color: 'white' }]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {returnCondition === 'Damaged' && (
              <>
                <Text style={styles.inputLabel}>Damage Description</Text>
                <TextInput style={styles.modalInput} value={damages} onChangeText={setDamages} placeholder="Describe the damage..." placeholderTextColor="#475569" />
                <Text style={styles.inputLabel}>Damage Repair Charge ($)</Text>
                <TextInput style={styles.modalInput} value={damageCharge} onChangeText={setDamageCharge} placeholder="0" placeholderTextColor="#475569" keyboardType="numeric" />
              </>
            )}

            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowReturnModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ flex: 2 }} onPress={saveReturn} disabled={returnSaving}>
                <LinearGradient colors={['#6366f1', '#4f46e5']} style={styles.primaryBtn}>
                  {returnSaving ? <ActivityIndicator color="white" size="small" /> : <Text style={styles.primaryBtnText}>Finalize Return</Text>}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  // ─── Modal: Complaint Response ────────────────────────────────────────────

  const ComplaintModal = () => (
    <Modal visible={showComplaintModal} animationType="slide" transparent onRequestClose={() => setShowComplaintModal(false)}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>💬 Respond to Complaint</Text>
          <Text style={styles.modalSubtitle}>"{selectedComplaint?.comment}"</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.inputLabel}>Update Status</Text>
            <View style={styles.typeRow}>
              {['Open', 'In Progress', 'Resolved', 'Closed'].map(s => (
                <TouchableOpacity key={s} onPress={() => setComplaintStatus(s)}
                  style={[styles.typeChip, complaintStatus === s && styles.typeChipActive]}>
                  <Text style={[styles.typeChipText, complaintStatus === s && { color: 'white' }]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Response Comments *</Text>
            <TextInput
              style={[styles.modalInput, { height: 100, textAlignVertical: 'top' }]}
              value={staffResponse} onChangeText={setStaffResponse}
              placeholder="Type your response..." placeholderTextColor="#475569" multiline
            />

            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowComplaintModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ flex: 2 }} onPress={saveComplaintResponse} disabled={complaintSaving}>
                <LinearGradient colors={['#6366f1', '#4f46e5']} style={styles.primaryBtn}>
                  {complaintSaving ? <ActivityIndicator color="white" size="small" /> : <Text style={styles.primaryBtnText}>Submit Response</Text>}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  // ─── Modal: Add Reply ─────────────────────────────────────────────────────

  const ReplyModal = () => (
    <Modal visible={showReplyModal} animationType="slide" transparent onRequestClose={() => setShowReplyModal(false)}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>💬 Add Reply</Text>
          <Text style={styles.modalSubtitle}>"{selectedFeedbackForReply?.comment}"</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {selectedFeedbackForReply?.staffReplies?.length > 0 && (
              <View style={styles.previousReplies}>
                <Text style={styles.prevRepliesTitle}>Previous Replies</Text>
                {selectedFeedbackForReply.staffReplies.map(r => (
                  <View key={r._id} style={styles.replyItem}>
                    <Text style={styles.replyStaff}>{r.staffName}</Text>
                    <Text style={styles.replyText}>{r.replyText}</Text>
                  </View>
                ))}
              </View>
            )}

            <Text style={styles.inputLabel}>Your Reply *</Text>
            <TextInput
              style={[styles.modalInput, { height: 100, textAlignVertical: 'top' }]}
              value={replyText} onChangeText={setReplyText}
              placeholder="Type your reply..." placeholderTextColor="#475569" multiline
            />

            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowReplyModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ flex: 2 }} onPress={saveReply} disabled={replySaving}>
                <LinearGradient colors={['#6366f1', '#4f46e5']} style={styles.primaryBtn}>
                  {replySaving ? <ActivityIndicator color="white" size="small" /> : <Text style={styles.primaryBtnText}>Add Reply</Text>}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  // ─── Main Render ──────────────────────────────────────────────────────────

  return (
    <LinearGradient colors={['#0f172a', '#1e1b4b', '#0f172a']} style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      {/* Top Navbar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.topBarBrand}>🛠️ QuickRide Staff</Text>
          <Text style={styles.topBarUser}>{user?.name}</Text>
        </View>
      </View>

      {/* Page Content */}
      <View style={{ flex: 1 }}>
        {activePage === 'dashboard' && renderDashboard()}
        {activePage === 'vehicles' && renderVehicles()}
        {activePage === 'bookings' && renderBookings()}
        {activePage === 'complaints' && renderComplaints()}
        {activePage === 'profile' && renderProfile()}
      </View>

      {/* Bottom Tab Bar */}
      <View style={styles.bottomBar}>
        {tabs.map(tab => (
          <TouchableOpacity key={tab.id} style={styles.tabItem} onPress={() => setActivePage(tab.id)}>
            <View style={[styles.tabIconWrap, activePage === tab.id && styles.tabIconWrapActive]}>
              <Ionicons name={tab.icon} size={22} color={activePage === tab.id ? '#6366f1' : '#475569'} />
            </View>
            <Text style={[styles.tabLabel, activePage === tab.id && styles.tabLabelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Modals */}
      <VehicleModal />
      <ReviewModal />
      <ReturnModal />
      <ComplaintModal />
      <ReplyModal />
    </LinearGradient>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Top Bar
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 52, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: 'rgba(99,102,241,0.2)',
  },
  topBarBrand: { fontSize: 20, fontWeight: '800', color: '#f8fafc' },
  topBarUser: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  logoutBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(239,68,68,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },

  // Bottom Bar
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15,23,42,0.95)',
    borderTopWidth: 1, borderTopColor: 'rgba(99,102,241,0.2)',
    paddingBottom: 20, paddingTop: 8,
  },
  tabItem: { flex: 1, alignItems: 'center' },
  tabIconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  tabIconWrapActive: { backgroundColor: 'rgba(99,102,241,0.2)' },
  tabLabel: { fontSize: 10, color: '#475569', marginTop: 2 },
  tabLabelActive: { color: '#6366f1', fontWeight: '700' },

  // Page Header
  pageHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 16,
  },
  pageTitle: { fontSize: 22, fontWeight: '800', color: '#f8fafc' },
  pageSubtitle: { fontSize: 13, color: '#94a3b8', marginTop: 2 },
  addBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },

  // Glass Card
  glassCard: {
    backgroundColor: 'rgba(30,41,59,0.85)',
    borderRadius: 20, borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.2)',
    padding: 18, marginBottom: 14,
    shadowColor: '#6366f1', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 6,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#f8fafc', marginBottom: 14 },

  // Dashboard
  pageContent: { padding: 16, paddingBottom: 100 },

welcomeBanner: {
  borderRadius: 20,
  padding: 0,         // remove padding if needed
  marginBottom: 18,
  alignItems: 'center',
  backgroundColor: 'transparent', // ✅ important
},


  welcomeTitle: { fontSize: 20, fontWeight: '800', color: 'white', marginBottom: 6 },
  welcomeSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 18 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  metricCard: {
    width: '47%', backgroundColor: 'rgba(30,41,59,0.85)',
    borderRadius: 16, padding: 16, borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.2)', borderTopWidth: 3,
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 6, elevation: 4,
  },
  metricIconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  metricValue: { fontSize: 24, fontWeight: '800', color: '#f8fafc' },
  metricTitle: { fontSize: 10, fontWeight: '700', color: '#64748b', textTransform: 'uppercase',color: '#cbd5f5', letterSpacing: 0.5, marginTop: 2 },

  quickActionsRow: { flexDirection: 'row', gap: 10 },
  quickActionBtn: { flex: 1 },
  quickActionGrad: { borderRadius: 14, padding: 14, alignItems: 'center', gap: 6 },
  quickActionLabel: { color: 'white', fontSize: 12, fontWeight: '600' },

  overviewRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(99,102,241,0.1)' },
  overviewDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },

overviewLabel: { 
  flex: 1, 
  color: '#f8fafc',   // ✅ WHITE
  fontSize: 14 
},
  overviewVal: { fontSize: 18, fontWeight: '800' },

  sectionHeader: { marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#f8fafc' },
  sectionSubtitle: { fontSize: 13, color: '#94a3b8', marginTop: 2 },

  // Vehicles
  vehicleRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12 },
  vehicleIconBox: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: 'rgba(99,102,241,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  vehicleName: { fontSize: 16, fontWeight: '700', color: '#f8fafc' },
  vehicleMeta: { fontSize: 12, color: '#e2e8f0', marginTop: 2 },
  vehiclePrice: { fontSize: 18, fontWeight: '800', color: '#6366f1', marginTop: 4 },
  vehicleDay: { fontSize: 12, color: '#94a3b8', fontWeight: '400' },
  availBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  vehicleDesc: { fontSize: 13, color: '#64748b', marginBottom: 12, lineHeight: 18 },
  vehicleActions: { flexDirection: 'row', gap: 10 },
  actionBtnSmall: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: 10, paddingVertical: 8, gap: 6,
  },
  actionBtnText: { fontSize: 13, fontWeight: '600' },

  // Bookings
  filterRow: { marginBottom: 8 },
filterChip: {
  paddingHorizontal: 15,
  paddingVertical: 6,
  borderRadius: 20,
  backgroundColor: 'rgba(30,41,59,1)',   // ✅ solid
  borderWidth: 1.2,
  borderColor: '#6366f1',                // ✅ visible border
},

  filterChipActive: { backgroundColor: '#6366f1', borderColor: '#6366f1' },
filterChipText: {
  fontSize: 13, 
  color: '#ffffff',   // ✅ bright white
  fontWeight: '700',
 
},
  filterChipTextActive: { color: 'white' },

  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: '800' },

  bookingHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  bookingVehicle: { fontSize: 16, fontWeight: '700', color: '#f8fafc', flex: 1 },
  bookingCustomer: { fontSize: 13, color: '#94a3b8', marginBottom: 4 },
  bookingDates: { fontSize: 13, color: '#94a3b8', marginBottom: 4 },
  driverNote: { fontSize: 12, color: '#6366f1', fontWeight: '600', marginBottom: 4 },
  bookingAmountRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  bookingAmount: { fontSize: 20, fontWeight: '800', color: '#6366f1' },
  bookingActionBtn: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  bookingActionText: { color: 'white', fontWeight: '700', fontSize: 13 },

  // Complaints / Feedback
  feedbackHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  typePill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  feedbackComment: { fontSize: 15, color: '#e2e8f0', fontStyle: 'italic', marginBottom: 6, lineHeight: 22 },
  feedbackMeta: { fontSize: 12, color: '#64748b', marginBottom: 4 },
  complaintStatusRow: { marginBottom: 6 },
  staffResponseText: { fontSize: 13, color: '#94a3b8', marginBottom: 8, fontStyle: 'italic' },
  feedbackActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  feedbackActionBtn: { flex: 1 },
  feedbackActionGrad: { borderRadius: 10, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  feedbackActionText: { color: '#f8fafc', fontWeight: '600', fontSize: 13 },

  // Empty State
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 60 },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#f8fafc', marginTop: 16 },
  emptySubText: { fontSize: 14, color: '#64748b', marginTop: 6, textAlign: 'center' },

  // Modals
  modalOverlay: {
    flex: 1, justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalSheet: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, maxHeight: '90%',
    borderTopWidth: 1, borderColor: 'rgba(99,102,241,0.3)',
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(148,163,184,0.4)',
    alignSelf: 'center', marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#f8fafc', marginBottom: 4 },
  modalSubtitle: { fontSize: 13, color: '#94a3b8', marginBottom: 20, lineHeight: 18 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: '#94a3b8', marginBottom: 6, marginTop: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  modalInput: {
    backgroundColor: 'rgba(15,23,42,0.6)',
    borderRadius: 12, borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.3)',
    color: '#f8fafc', padding: 14, fontSize: 15,
  },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12,
    backgroundColor: 'rgba(30,41,59,0.8)', borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.3)',
  },
  typeChipActive: { backgroundColor: '#6366f1', borderColor: '#6366f1' },
  typeChipText: { fontSize: 13, color: '#94a3b8', fontWeight: '600' },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 24, marginBottom: 8 },
  cancelBtn: {
    flex: 1, borderRadius: 14, paddingVertical: 14,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(30,41,59,0.8)',
    borderWidth: 1, borderColor: 'rgba(99,102,241,0.2)',
  },
  cancelBtnText: { color: '#94a3b8', fontWeight: '700', fontSize: 15 },
  primaryBtn: { borderRadius: 14, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: 'white', fontWeight: '700', fontSize: 15 },


  
  // Replies
  previousReplies: {
    backgroundColor: 'rgba(15,23,42,0.5)',
    borderRadius: 12, padding: 12, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(99,102,241,0.15)',
  },
  prevRepliesTitle: { fontSize: 13, fontWeight: '700', color: '#f8fafc', marginBottom: 10 },
  replyItem: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(99,102,241,0.1)' },
  replyStaff: { fontSize: 11, fontWeight: '700', color: '#6366f1', marginBottom: 2 },
  replyText: { fontSize: 13, color: '#94a3b8', lineHeight: 18 },
});
// Profile specific styles
const profileStyles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: 0.2,
  },
welcomeImage: {
  width: '100%',
  height: 120,
  marginTop: 12,
  borderRadius: 12,
},

  settingsIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(30,41,59,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366f1',
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  avatarLetter: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
  },
  onlineDot: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10b981',
    borderWidth: 2.5,
    borderColor: '#0f172a',
    top: 66,
    right: '37%',
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#f8fafc',
    marginTop: 14,
    letterSpacing: 0.2,
  },
  userEmail: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(99,102,241,0.15)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.3)',
  },
  roleBadgeText: {
    color: '#818cf8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginLeft: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(30,41,59,0.85)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.2)',
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  statCardMiddle: {
    borderColor: 'rgba(99,102,241,0.35)',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#6366f1',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statActiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginBottom: 6,
  },
  statActiveText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#10b981',
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
    marginLeft: 2,
  },
smallWelcomeImage: {
  width: 60,
  height: 60,
  borderRadius: 30,
  marginVertical: 10,
  alignSelf: 'center',
},
heroImage: {
  width: '100%',
  height: 200,        // ✅ increase this
  marginTop: 12,
  marginBottom: 16,
  borderRadius: 20,
  overflow: 'hidden',
},

heroOverlay: {
  flex: 1,
  justifyContent: 'flex-end',
  paddingHorizontal: 20,
  paddingBottom: 20,
},

heroTitle: {
  color: '#ffffff',
  fontSize: 28,
  fontWeight: '800',
  letterSpacing: 1.2,
  textShadowColor: 'rgba(0,0,0,0.85)',
  textShadowOffset: { width: 0, height: 4 },
  textShadowRadius: 12,
},

heroSubtitle: {
  color: '#e0f2fe',
  fontSize: 16,
  fontWeight: '600',
  textAlign: 'center',
  marginBottom: 24,
  textShadowColor: 'rgba(0,0,0,0.6)',
  textShadowOffset: { width: 0, height: 2 },
  textShadowRadius: 4,
},


heroButton: {
  backgroundColor: '#6366f1',
  paddingVertical: 12,
  paddingHorizontal: 24,
  borderRadius: 12,
  alignSelf: 'flex-start',
},

heroButtonText: {
  color: '#ffffff',
  fontWeight: '700',
  fontSize: 15,
},


  glassCard: {
    backgroundColor: 'rgba(30,41,59,0.85)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.25)',
    padding: 18,
    marginBottom: 24,
    shadowColor: '#6366f1',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  rowDivider: {
    height: 1,
    backgroundColor: 'rgba(99,102,241,0.1)',
    marginVertical: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(99,102,241,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  infoTextWrap: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: '#f8fafc',
    fontWeight: '600',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  settingsIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(99,102,241,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  settingsLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#f8fafc',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(239,68,68,0.4)',
    backgroundColor: 'rgba(239,68,68,0.08)',
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});