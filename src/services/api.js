// ============================================================
// API SERVICE — Axios instance + semua fungsi pemanggilan API
// Base URL: http://localhost:5001/api
//
// Cara pakai di komponen:
//   import api from '../services/api';
//   const { data } = await api.cars.getAll({ type: 'SUV' });
// ============================================================

import axios from 'axios';

// ──────────────────────────────────────────────────────────
// KONFIGURASI AXIOS INSTANCE
// ──────────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // 15 detik timeout
  headers: { 'Content-Type': 'application/json' },
});

// ──────────────────────────────────────────────────────────
// REQUEST INTERCEPTOR — Tambahkan JWT token ke setiap request
// ──────────────────────────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('rm_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ──────────────────────────────────────────────────────────
// RESPONSE INTERCEPTOR — Handle error global
// ──────────────────────────────────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Token expired / tidak valid → hapus token & redirect ke login
    if (error.response?.status === 401) {
      localStorage.removeItem('rm_token');
      localStorage.removeItem('rm_user');
      // Redirect hanya jika bukan di halaman login/register
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Helper: extract error message dari response
export const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || 'Terjadi kesalahan.';

// ============================================================
// AUTH API
// ============================================================
export const authAPI = {
  /** Login: POST /auth/login */
  login: (email, password) =>
    axiosInstance.post('/auth/login', { email, password }),

  /** Register: POST /auth/register */
  register: (data) =>
    axiosInstance.post('/auth/register', data),

  /** Get current user: GET /auth/me */
  getMe: () =>
    axiosInstance.get('/auth/me'),

  /** Update profile: PUT /auth/profile */
  updateProfile: (data) =>
    axiosInstance.put('/auth/profile', data),

  /** Change password: PUT /auth/password */
  changePassword: (newPassword) =>
    axiosInstance.put('/auth/password', { newPassword }),
};

// ============================================================
// CARS API
// ============================================================
export const carsAPI = {
  /** Get all cars: GET /cars?type=&brand=&... */
  getAll: (params = {}) =>
    axiosInstance.get('/cars', { params }),

  /** Get single car: GET /cars/:id */
  getById: (id) =>
    axiosInstance.get(`/cars/${id}`),

  /** Create car (admin): POST /cars */
  create: (data) =>
    axiosInstance.post('/cars', data),

  /** Update car (admin): PUT /cars/:id */
  update: (id, data) =>
    axiosInstance.put(`/cars/${id}`, data),

  /** Delete car (admin): DELETE /cars/:id */
  remove: (id) =>
    axiosInstance.delete(`/cars/${id}`),

  /** Toggle availability (admin): PATCH /cars/:id/toggle */
  toggleAvailability: (id) =>
    axiosInstance.patch(`/cars/${id}/toggle`),

  /** Get meta options (types & brands): GET /cars/meta/options */
  getMetaOptions: () =>
    axiosInstance.get('/cars/meta/options'),
};

// ============================================================
// BOOKINGS API
// ============================================================
export const bookingsAPI = {
  /** Get bookings: GET /bookings (admin: all, user: own) */
  getAll: (params = {}) =>
    axiosInstance.get('/bookings', { params }),

  /** Get single booking: GET /bookings/:id */
  getById: (id) =>
    axiosInstance.get(`/bookings/${id}`),

  /** Create booking: POST /bookings */
  create: (data) =>
    axiosInstance.post('/bookings', data),

  /** Update status (admin): PATCH /bookings/:id/status */
  updateStatus: (id, status) =>
    axiosInstance.patch(`/bookings/${id}/status`, { status }),

  /** Cancel booking: PATCH /bookings/:id/cancel */
  cancel: (id) =>
    axiosInstance.patch(`/bookings/${id}/cancel`),

  /** Process payment: POST /bookings/:id/pay */
  pay: (id, data) =>
    axiosInstance.post(`/bookings/${id}/pay`, data),

  /** Get admin stats: GET /bookings/stats/summary */
  getStats: () =>
    axiosInstance.get('/bookings/stats/summary'),
};

// ============================================================
// USERS API (Admin only)
// ============================================================
export const usersAPI = {
  /** Get all users: GET /users */
  getAll: (params = {}) =>
    axiosInstance.get('/users', { params }),

  /** Get user by id: GET /users/:id */
  getById: (id) =>
    axiosInstance.get(`/users/${id}`),

  /** Toggle block status: PATCH /users/:id/toggle */
  toggleStatus: (id) =>
    axiosInstance.patch(`/users/${id}/toggle`),
};

// ============================================================
// PAYMENTS API
// ============================================================
export const paymentsAPI = {
  /** Process payment through gateway: POST /payments/process */
  process: (bookingId, paymentMethod) =>
    axiosInstance.post('/payments/process', { bookingId, paymentMethod }),

  /** Get available payment methods: GET /payments/methods */
  getMethods: () =>
    axiosInstance.get('/payments/methods'),
};

// Default export
export default {
  auth:     authAPI,
  cars:     carsAPI,
  bookings: bookingsAPI,
  users:    usersAPI,
  payments: paymentsAPI,
  getErrorMessage,
};
