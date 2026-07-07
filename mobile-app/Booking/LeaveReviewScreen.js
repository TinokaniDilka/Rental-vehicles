import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { submitFeedback } from '../services/feedbackService';

// Usage: navigation.navigate('LeaveReview', { bookingId, vehicleName })
export default function LeaveReviewScreen({ route, navigation }) {
  const { bookingId, vehicleName } = route.params;
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!comment.trim()) {
      Alert.alert('Error', 'Please write a short comment about your experience');
      return;
    }
    setLoading(true);
    try {
      await submitFeedback({
        bookingId,
        type: 'feedback',
        rating,
        comment: comment.trim(),
      });
      Alert.alert('Thank you! 🎉', 'Your review has been submitted.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      console.error('Review submit error:', err);
      Alert.alert('Error', err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0f172a', '#1e1b4b']} style={styles.gradientBg}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color="#f8fafc" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Leave a Review</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Vehicle Card */}
        <View style={styles.glassCard}>
          <Text style={styles.vehicleLabel}>REVIEWING</Text>
          <Text style={styles.vehicleName}>{vehicleName || 'Your Vehicle'}</Text>
        </View>

        {/* Star Rating */}
        <Text style={styles.sectionLabel}>Your Rating</Text>
        <View style={styles.glassCard}>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.7}>
                <Ionicons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={36}
                  color={star <= rating ? '#f59e0b' : '#475569'}
                  style={{ marginHorizontal: 4 }}
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.ratingText}>{rating} out of 5</Text>
        </View>

        {/* Comment */}
        <Text style={styles.sectionLabel}>Your Experience</Text>
        <View style={styles.glassCard}>
          <TextInput
            style={styles.textArea}
            placeholder="Tell us how your rental went..."
            placeholderTextColor="#475569"
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={styles.submitBtnWrapper}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#6366f1', '#4f46e5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitBtn}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="paper-plane-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.submitBtnText}>Submit Review</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBg: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 24 },

  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(99,102,241,0.15)',
    borderWidth: 1, borderColor: 'rgba(99,102,241,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    flex: 1, textAlign: 'center', fontSize: 20, fontWeight: '700',
    color: '#f8fafc', letterSpacing: 0.3,
  },
  headerSpacer: { width: 40 },

  glassCard: {
    backgroundColor: 'rgba(30,41,59,0.85)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.25)',
    padding: 18,
    marginBottom: 14,
    shadowColor: '#6366f1',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  vehicleLabel: {
    fontSize: 11, fontWeight: '700', color: '#94a3b8',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6,
  },
  vehicleName: { fontSize: 20, fontWeight: '800', color: '#f8fafc' },

  sectionLabel: {
    fontSize: 12, fontWeight: '700', color: '#94a3b8',
    textTransform: 'uppercase', letterSpacing: 1.2,
    marginBottom: 12, marginLeft: 4,
  },

  starsRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 10 },
  ratingText: { textAlign: 'center', color: '#94a3b8', fontSize: 14, fontWeight: '600' },

  textArea: {
    backgroundColor: 'rgba(15,23,42,0.6)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 13,
    color: '#f8fafc',
    fontSize: 15,
    minHeight: 110,
  },

  submitBtnWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 6,
    shadowColor: '#6366f1',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
  },
  submitBtnText: { color: '#fff', fontSize: 17, fontWeight: '700', letterSpacing: 0.3 },
});