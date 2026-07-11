import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');
      if (token && userData) {
        setUser(JSON.parse(userData));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    await AsyncStorage.setItem('token', res.data.token);
    await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    setUser(null);
  };

  // Merge and persist updated user fields (e.g. after profile/doc upload)
  const updateUser = async (updatedFields) => {
    setUser((prev) => {
      const merged = { ...(prev || {}), ...updatedFields };
      AsyncStorage.setItem('user', JSON.stringify(merged)).catch((e) => console.error(e));
      return merged;
    });
  };

  // Pull the latest user record from the server (e.g. verificationStatus
  // after admin approves ID/license on web). AsyncStorage only reflects
  // whatever was true at login time, so anything changed server-side
  // afterward (like admin approval) is invisible until this is called.
  const refreshUser = async () => {
    try {
      const res = await api.get('/api/auth/profile');
      const freshUser = res.data;
      setUser((prev) => {
        const merged = { ...(prev || {}), ...freshUser };
        AsyncStorage.setItem('user', JSON.stringify(merged)).catch((e) => console.error(e));
        return merged;
      });
      return freshUser;
    } catch (e) {
      console.error('refreshUser failed:', e);
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};