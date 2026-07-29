import api from './api';

export const loginUser = (email, password) =>
  api.post('/api/auth/login', { email, password });

export const registerUser = (name, email, password) =>
  api.post('/api/auth/register', { name, email, password });

export const getProfile = () =>
  api.get('/api/auth/profile');

export const updateProfile = (data) =>
  api.put('/api/auth/profile', data);

export const forgotPassword = (email) =>
  api.post('/api/auth/forgot-password', { email });

export const verifyResetOtp = (email, otp) =>
  api.post('/api/auth/verify-reset-otp', { email, otp });

export const resetPassword = (email, otp, newPassword) =>
  api.post('/api/auth/reset-password', { email, otp, newPassword });

// Upload Profile Photo / ID Photo / License Photo as multipart form data.
// `docs` = { profilePhoto?: {uri,name,type}, idPhoto?: {...}, licensePhoto?: {...} }
export const uploadVerificationDocs = (docs) => {
  const formData = new FormData();
  if (docs.profilePhoto) {
    formData.append('profilePhoto', {
      uri: docs.profilePhoto.uri,
      name: docs.profilePhoto.name || 'profilePhoto.jpg',
      type: docs.profilePhoto.type || 'image/jpeg',
    });
  }
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

// Builds a full image URL from a relative path like "/uploads/profile/xyz.jpg"
// using whatever host api.js is configured with, so it works on device too.
export const getImageUrl = (path) => {
  if (!path) return null;
  const origin = api.defaults.baseURL.replace(/\/api\/?$/, '');
  return `${origin}${path}`;
};