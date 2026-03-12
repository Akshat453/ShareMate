import { create } from 'zustand';
import api from '../services/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: localStorage.getItem('accessToken') || null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
  loading: false,
  error: null,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('accessToken', data.data.accessToken);
      set({
        user: data.data.user,
        accessToken: data.data.accessToken,
        isAuthenticated: true,
        loading: false,
      });
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      set({ loading: false, error: message });
      throw new Error(message);
    }
  },

  register: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('accessToken', data.data.accessToken);
      set({
        user: data.data.user,
        accessToken: data.data.accessToken,
        isAuthenticated: true,
        loading: false,
      });
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      set({ loading: false, error: message });
      throw new Error(message);
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) { /* ignore */ }
    localStorage.removeItem('accessToken');
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  fetchUser: async () => {
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data.data.user, isAuthenticated: true });
    } catch (err) {
      localStorage.removeItem('accessToken');
      set({ user: null, accessToken: null, isAuthenticated: false });
    }
  },

  refreshToken: async () => {
    try {
      const { data } = await api.post('/auth/refresh');
      localStorage.setItem('accessToken', data.data.accessToken);
      set({ accessToken: data.data.accessToken });
      return data.data.accessToken;
    } catch (err) {
      get().logout();
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
