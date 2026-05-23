import { useEffect, useState } from 'react';
import { ClipboardList, CreditCard, Loader2 } from 'lucide-react';
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

const HistoryPage = () => {
  const { user } = useAuth();
  const { getBookingsByUser, cancelBooking, updatePaymentStatus, fetchBookings, isLoading } = useBooking();
  const [activeTab, setActiveTab]         = useState('all');
  const [payingBooking, setPayingBooking] = useState(null);

  // Fetch booking user saat halaman dibuka
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const myBookings = getBookingsByUser(user.id);
  const filtered   = activeTab === 'all'
    ? myBookings
    : myBookings.filter((b) => b.status === activeTab);

  const handlePaymentSuccess = async (txId, methodName) => {
    await updatePaymentStatus(payingBooking.id, {
      paymentMethod:  methodName,
      transactionId:  txId,
    });
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
                  <div className="mt-2 flex justify-end">
                    <span className="text-xs font-semibold text-primary-700 bg-primary-50 border border-primary-200 px-3 py-1.5 rounded-lg">
                      ✅ Lunas · {booking.paymentMethod}
                    </span>
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
    </>
  );
};

export default HistoryPage;
