import api from './api';

export const createBooking = (data) =>
  api.post('/api/bookings', data);

// Creates booking + payment in one step — booking comes back already
// calculated (totalAmount, _id, etc.) and confirmed, no staff approval needed first.
export const createBookingWithPayment = (data) =>
  api.post('/api/bookings/create-with-payment', data);

// Pay for an already-approved booking (staff-approval flow, not used by
// the direct booking flow above, but kept for compatibility)
export const payBooking = (id, data) =>
  api.put(`/api/bookings/${id}/pay`, data);

export const getMyBookings = () =>
  api.get('/api/bookings/customer');     // ← Fixed

export const cancelBooking = (id) =>
  api.put(`/api/bookings/${id}/cancel`);

export const getBookingById = (id) =>
  api.get(`/api/bookings/${id}`);

export const updateHandoverStatus = (id, data) =>
  api.put(`/api/bookings/${id}/handover`, data);