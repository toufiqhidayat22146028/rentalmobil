import { createContext, useContext, useState, useCallback } from 'react';
import { bookingsAPI, paymentsAPI, getErrorMessage } from '../services/api';

// ============================================================
// BOOKING CONTEXT — Menggunakan Backend API
// ============================================================
const BookingContext = createContext(null);

export const BookingProvider = ({ children }) => {
  const [bookings, setBookings]     = useState([]);
  const [isLoading, setIsLoading]   = useState(false);
  const [isFetched, setIsFetched]   = useState(false);

  // ──────────────────────────────────────────────────────────
  // FETCH: Ambil semua booking dari API
  // Admin mendapat semua booking; User mendapat miliknya saja
  // ──────────────────────────────────────────────────────────
  const fetchBookings = useCallback(async (params = {}) => {
    // Jangan fetch jika tidak ada token (belum login)
    const token = localStorage.getItem('rm_token');
    if (!token) return [];

    setIsLoading(true);
    try {
      const { data } = await bookingsAPI.getAll(params);
      if (data.success) {
        setBookings(data.data);
        setIsFetched(true);
      }
      return data.data;
    } catch (err) {
      // 401 = belum login, diabaikan — interceptor axios sudah handle redirect
      if (err?.response?.status !== 401) {
        console.error('[BookingContext] fetchBookings error:', err.message);
      }
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ──────────────────────────────────────────────────────────
  // CREATE: Tambah booking baru
  // ──────────────────────────────────────────────────────────
  const addBooking = async (bookingData) => {
    try {
      const { data } = await bookingsAPI.create(bookingData);
      if (data.success) {
        setBookings((prev) => [data.data, ...prev]);
        return { success: true, bookingId: data.bookingId };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: getErrorMessage(err) };
    }
  };

  // ──────────────────────────────────────────────────────────
  // UPDATE STATUS: Digunakan admin (approve, complete, dll)
  // ──────────────────────────────────────────────────────────
  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const { data } = await bookingsAPI.updateStatus(bookingId, newStatus);
      if (data.success) {
        setBookings((prev) =>
          prev.map((b) => b.id === bookingId ? data.data : b)
        );
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: getErrorMessage(err) };
    }
  };

  // ──────────────────────────────────────────────────────────
  // CANCEL: Batalkan booking
  // ──────────────────────────────────────────────────────────
  const cancelBooking = async (bookingId) => {
    try {
      const { data } = await bookingsAPI.cancel(bookingId);
      if (data.success) {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId ? { ...b, status: 'cancelled' } : b
          )
        );
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: getErrorMessage(err) };
    }
  };

  // ──────────────────────────────────────────────────────────
  // PAY: Proses pembayaran via payment gateway API
  // ──────────────────────────────────────────────────────────
  const updatePaymentStatus = async (bookingId, { paymentMethod, transactionId }) => {
    try {
      const { data } = await bookingsAPI.pay(bookingId, { paymentMethod, transactionId });
      if (data.success) {
        setBookings((prev) =>
          prev.map((b) => b.id === bookingId ? data.data : b)
        );
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: getErrorMessage(err) };
    }
  };

  // ──────────────────────────────────────────────────────────
  // GET BY USER ID — Filter dari state lokal
  // ──────────────────────────────────────────────────────────
  const getBookingsByUser = (userId) =>
    bookings
      .filter((b) => b.userId === userId || b.user_id === userId)
      .sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at));

  // ──────────────────────────────────────────────────────────
  // GET BY ID — Cari di state lokal
  // ──────────────────────────────────────────────────────────
  const getBookingById = (bookingId) =>
    bookings.find((b) => b.id === bookingId) || null;

  return (
    <BookingContext.Provider value={{
      bookings, isLoading, isFetched,
      fetchBookings, addBooking, updateBookingStatus,
      cancelBooking, updatePaymentStatus,
      getBookingsByUser, getBookingById,
    }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking harus digunakan di dalam BookingProvider');
  return ctx;
};

export default BookingContext;
