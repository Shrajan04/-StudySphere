import axios from 'axios';

// Use relative /api path so Vite's dev proxy handles it (avoids CORS).
// In production, set VITE_API_URL to your backend URL.
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach JWT token from localStorage
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — redirect on 401
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
