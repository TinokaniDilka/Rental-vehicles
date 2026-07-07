import api from './api'; // your existing axios instance (same one used by bookingService.js)

// Submit a review (type: "feedback") or complaint (type: "complaint") for a completed booking
export const submitFeedback = (data) => api.post('/api/feedback', data);
// data = { bookingId, type: 'feedback' | 'complaint', rating, comment, category }

// Get the logged-in customer's own feedback/complaints
export const getMyFeedback = () => api.get('/api/feedback/customer');

// Get all reviews for a specific vehicle (public, used to show reviews under a vehicle)
export const getVehicleReviews = (vehicleId) => api.get(`/api/feedback/vehicle/${vehicleId}`);

// Get all reviews across the platform (public)
export const getAllReviews = () => api.get('/api/feedback/reviews');

// Update an existing review/complaint (customer, must be owner)
export const updateFeedback = (feedbackId, data) => api.put(`/api/feedback/${feedbackId}`, data);

// Delete a review/complaint (customer, must be owner)
export const deleteFeedback = (feedbackId) => api.delete(`/api/feedback/${feedbackId}`);