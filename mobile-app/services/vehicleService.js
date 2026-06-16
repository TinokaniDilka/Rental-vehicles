import api from './api';

export const getVehicles = (params) =>
  api.get('/vehicles', { params });

export const getVehicleById = (id) =>
  api.get(`/vehicles/${id}`);