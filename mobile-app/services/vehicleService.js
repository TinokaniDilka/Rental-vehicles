import api from './api';

export const getVehicles = (params) =>
  api.get('/api/vehicles', { params });

export const getVehicleById = (id) =>
  api.get(`/api/vehicles/${id}`);