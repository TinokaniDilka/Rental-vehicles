import api from './api';

export const loginUser = (email, password) =>
  api.post('/api/auth/login', { email, password });

export const registerUser = (name, email, password) =>
  api.post('/api/auth/register', { name, email, password });

export const getProfile = () =>
  api.get('/api/auth/profile');

export const updateProfile = (data) =>
  api.put('/api/auth/profile', data);
