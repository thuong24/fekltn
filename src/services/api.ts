import axios from 'axios';
import { AuthState } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://values-combines-glance-hourly.trycloudflare.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const authData = localStorage.getItem('auth');
    if (authData) {
      const { accessToken } = JSON.parse(authData) as AuthState;
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
  }
  return config;
});

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry && typeof window !== 'undefined') {
      originalRequest._retry = true;
      try {
        const authData = localStorage.getItem('auth');
        if (authData) {
          const { refreshToken } = JSON.parse(authData) as AuthState;
          if (refreshToken) {
            const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
            if (res.data.success) {
              const newAuthData = JSON.parse(authData);
              newAuthData.accessToken = res.data.data.accessToken;
              localStorage.setItem('auth', JSON.stringify(newAuthData));
              originalRequest.headers.Authorization = `Bearer ${res.data.data.accessToken}`;
              return api(originalRequest);
            }
          }
        }
      } catch (err) {
        // Refresh failed, logout
        localStorage.removeItem('auth');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
