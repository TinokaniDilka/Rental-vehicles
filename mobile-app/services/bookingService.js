import api from './api';

export const createBooking = (data) =>
  api.post('/api/bookings', data);

export const getMyBookings = () =>
  api.get('/api/bookings/my');

export const cancelBooking = (id) =>
  api.put(`/api/bookings/${id}/cancel`);

export const getBookingById = (id) =>
  api.get(`/api/bookings/${id}`);