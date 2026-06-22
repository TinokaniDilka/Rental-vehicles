import api from './api';

export const getVehicles = (params) =>
  api.get('/api/vehicles', { params });

export const getVehicleById = (id) =>
  api.get(`/api/vehicles/${id}`);

// Add or update this function
export const getMyVehicles = () =>
  api.get('/api/vehicles/my-vehicles');   // ← This is the one used in backend