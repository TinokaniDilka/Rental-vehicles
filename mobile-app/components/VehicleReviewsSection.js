import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getVehicleReviews } from '../services/feedbackService';
import { formatDate } from '../utils/helpers';

// Usage: <VehicleReviewsSection vehicleId={vehicle._id} />
// Drop this inside your VehicleDetailsScreen, below the vehicle info card.
export default function VehicleReviewsSection({ vehicleId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!vehicleId) return;
    getVehicleReviews(vehicleId)
      .then((res) => setReviews(res.data))
      .catch((err) => console.error('Error loading reviews:', err))
      .finally(() => setLoading(false));
  }, [vehicleId]);

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
      : null;

  const renderStars = (rating) => (
    <View style={{ flexDirection: 'row' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={star <= rating ? 'star' : 'star-outline'}
          size={14}
          color={star <= rating ? '#f59e0b' : '#475569'}
          style={{ marginRight: 1 }}
        />
      ))}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color="#6366f1" size="small" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Customer Reviews</Text>
        {avgRating && (
          <View style={styles.avgBadge}>
            <Ionicons name="star" size={14} color="#f59e0b" />
            <Text style={styles.avgText}>{avgRating}</Text>
            <Text style={styles.avgCount}>({reviews.length})</Text>
          </View>
        )}
      </View>

      {reviews.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No reviews yet for this vehicle.</Text>
        </View>
      ) : (
        reviews.map((review) => (
          <View key={review._id} style={styles.reviewCard}>
            <View style={styles.reviewTopRow}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>
                  {(review.customerId?.name || 'U').charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.reviewerName}>{review.customerId?.name || 'Customer'}</Text>
                <Text style={styles.reviewDate}>{formatDate(review.createdAt)}</Text>
              </View>
              {renderStars(review.rating)}
            </View>
            <Text style={styles.reviewComment}>{review.comment}</Text>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 8, marginBottom: 16 },
  loadingWrap: { paddingVertical: 20, alignItems: 'center' },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#f8fafc' },
  avgBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245,158,11,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },
  avgText: { color: '#f59e0b', fontWeight: '700', fontSize: 13, marginLeft: 2 },
  avgCount: { color: '#94a3b8', fontSize: 12, marginLeft: 2 },

  emptyCard: {
    backgroundColor: 'rgba(30,41,59,0.6)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.15)',
    padding: 16,
    alignItems: 'center',
  },
  emptyText: { color: '#64748b', fontSize: 13 },

  reviewCard: {
    backgroundColor: 'rgba(30,41,59,0.85)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.2)',
    padding: 14,
    marginBottom: 10,
  },
  reviewTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  avatarCircle: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(99,102,241,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#818cf8', fontWeight: '700', fontSize: 14 },
  reviewerName: { color: '#f8fafc', fontWeight: '600', fontSize: 14 },
  reviewDate: { color: '#64748b', fontSize: 11, marginTop: 1 },
  reviewComment: { color: '#cbd5e1', fontSize: 13, lineHeight: 19 },
});