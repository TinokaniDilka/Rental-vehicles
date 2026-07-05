import api from './api';

export const loginUser = (email, password) =>
  api.post('/api/auth/login', { email, password });

export const registerUser = (name, email, password) =>
  api.post('/api/auth/register', { name, email, password });

export const getProfile = () =>
  api.get('/api/auth/profile');

export const updateProfile = (data) =>
  api.put('/api/auth/profile', data);

// Upload ID Photo / License Photo as multipart form data.
// `docs` = { idPhoto?: { uri, name, type }, licensePhoto?: { uri, name, type } }
export const uploadVerificationDocs = (docs) => {
  const formData = new FormData();
  if (docs.idPhoto) {
    formData.append('idPhoto', {
      uri: docs.idPhoto.uri,
      name: docs.idPhoto.name || 'idPhoto.jpg',
      type: docs.idPhoto.type || 'image/jpeg',
    });
  }
  if (docs.licensePhoto) {
    formData.append('licensePhoto', {
      uri: docs.licensePhoto.uri,
      name: docs.licensePhoto.name || 'licensePhoto.jpg',
      type: docs.licensePhoto.type || 'image/jpeg',
    });
  }

  return api.put('/api/auth/profile/upload-docs', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};