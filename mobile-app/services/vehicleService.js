import api from './api';

export const getVehicles = () => {
  return api.get('/vehicles');
};
