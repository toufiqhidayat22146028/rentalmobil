import { useEffect, useState } from 'react';
import { ClipboardList, CreditCard, Loader2, Star, X } from 'lucide-react';
import BookingCard from '../../components/booking/BookingCard';
import PaymentGateway from '../../components/payment/PaymentGateway';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';

const STATUS_TABS = [
  { value: 'all',       label: 'Semua' },
  { value: 'pending',   label: 'Menunggu' },
  { value: 'approved',  label: 'Disetujui' },
  { value: 'active',    label: 'Aktif' },
  { value: 'completed', label: 'Selesai' },
  { value: 'cancelled', label: 'Dibatalkan' },
];

const ReviewModal = ({ isOpen, booking, onClose, onSuccess }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !booking) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/cars/${booking.carId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('rm_token')}`,
        },
        body: JSON.stringify({ bookingId: booking.id, rating, comment }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-display font-bold text-gray-800">Beri Ulasan</h3>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5">
          <div className="mb-4 text-center">
            <p className="text-sm text-gray-500 mb-2">Bagaimana pengalaman Anda menggunakan {booking.carName}?</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star className={`w-8 h-8 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Komentar (Opsional)</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm"
              rows={3}
              placeholder="Ceritakan pengalaman Anda..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl">{error}</div>}
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-800 hover:bg-primary-700 rounded-xl transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Menyimpan...' : 'Kirim Ulasan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const HistoryPage = () => {
  const { user } = useAuth();
  const { getBookingsByUser, cancelBooking, fetchBookings, isLoading } = useBooking();
  const [activeTab, setActiveTab]         = useState('all');
  const [payingBooking, setPayingBooking] = useState(null);
  const [reviewingBooking, setReviewingBooking] = useState(null);

  // Fetch booking user saat halaman dibuka
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const myBookings = getBookingsByUser(user.id);
  const filtered   = activeTab === 'all'
    ? myBookings
    : myBookings.filter((b) => b.status === activeTab);

  const handlePaymentSuccess = async (txId, methodName) => {
    setPayingBooking(null);
    // Refresh data
    fetchBookings();
  };

  const handleCancel = async (bookingId) => {
    await cancelBooking(bookingId);
    fetchBookings();
  };

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-display font-bold text-gray-800 mb-6">Riwayat Peminjaman</h1>

        {/* Tab Filter Status */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6" style={{ scrollbarWidth: 'none' }}>
          {STATUS_TABS.map(({ value, label }) => {
            const count = value === 'all'
              ? myBookings.length
              : myBookings.filter((b) => b.status === value).length;
            return (
              <button
                key={value}
                onClick={() => setActiveTab(value)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                  activeTab === value
                    ? 'bg-primary-800 text-white border-primary-800'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
                }`}
              >
                {label}
                {count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === value ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20 card">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin mr-3" />
            <span className="text-gray-500">Memuat data peminjaman...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 card">
            <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-600 mb-1">Belum Ada Peminjaman</h3>
            <p className="text-gray-400 text-sm">
              {activeTab === 'all'
                ? 'Anda belum pernah melakukan peminjaman.'
                : `Tidak ada peminjaman dengan status "${STATUS_TABS.find(t => t.value === activeTab)?.label}".`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((booking) => (
              <div key={booking.id}>
                <BookingCard booking={booking} onCancel={handleCancel} showActions />
                {/* Tombol Bayar Sekarang */}
                {booking.paymentStatus === 'unpaid' && booking.status !== 'cancelled' && (
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={() => setPayingBooking(booking)}
                      className="flex items-center gap-2 text-sm font-semibold bg-primary-800 hover:bg-primary-700 text-white px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
                    >
                      <CreditCard className="w-4 h-4" /> Bayar Sekarang
                    </button>
                  </div>
                )}
                {booking.paymentStatus === 'paid' && (
                  <div className="mt-2 flex justify-end gap-2 items-center">
                    <span className="text-xs font-semibold text-primary-700 bg-primary-50 border border-primary-200 px-3 py-1.5 rounded-lg">
                      ✅ Lunas · {booking.paymentMethod}
                    </span>
                    {booking.status === 'completed' && !booking.hasReviewed && (
                      <button
                        onClick={() => setReviewingBooking(booking)}
                        className="flex items-center gap-1.5 text-sm font-medium text-yellow-600 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 px-4 py-1.5 rounded-lg transition-colors"
                      >
                        <Star className="w-4 h-4 fill-yellow-600" /> Beri Ulasan
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <PaymentGateway
        isOpen={!!payingBooking}
        booking={payingBooking}
        onSuccess={handlePaymentSuccess}
        onClose={() => setPayingBooking(null)}
      />

      <ReviewModal
        isOpen={!!reviewingBooking}
        booking={reviewingBooking}
        onClose={() => setReviewingBooking(null)}
        onSuccess={() => {
          setReviewingBooking(null);
          fetchBookings();
        }}
      />
    </>
  );
};

export default HistoryPage;
