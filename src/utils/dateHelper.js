// ============================================================
// UTILITY: Helper fungsi tanggal
// ============================================================

// Hitung jumlah hari antara dua tanggal
export const calculateDays = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMs = end - start;
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return days > 0 ? days : 0;
};

// Format tanggal panjang: 21 Mei 2026
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
};

// Format tanggal pendek: 21 Mei '26
export const formatDateShort = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: '2-digit',
  });
};

// Ambil string hari ini dalam format YYYY-MM-DD
export const getTodayString = () => new Date().toISOString().split('T')[0];

// Ambil tanggal minimum pengembalian (startDate + minDays)
export const getMinReturnDate = (startDate, minDays = 1) => {
  if (!startDate) return getTodayString();
  const date = new Date(startDate);
  date.setDate(date.getDate() + minDays);
  return date.toISOString().split('T')[0];
};

// Format timestamp ke jam: "09:30"
export const formatTime = (isoString) => {
  return new Date(isoString).toLocaleTimeString('id-ID', {
    hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Jakarta'
  });
};

// Ambil tanggal maksimum pemesanan awal (misal max 7 hari ke depan)
export const getMaxBookingDate = (maxDays = 7) => {
  const date = new Date();
  date.setDate(date.getDate() + maxDays);
  return date.toISOString().split('T')[0];
};

// Ambil tanggal maksimum pengembalian berdasarkan tanggal mulai (misal max sewa 14 hari)
export const getMaxReturnDate = (startDate, maxDuration = 14) => {
  if (!startDate) return getMaxBookingDate(maxDuration);
  const date = new Date(startDate);
  date.setDate(date.getDate() + maxDuration);
  return date.toISOString().split('T')[0];
};
