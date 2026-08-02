import { Calendar, Car, MapPin, Clock, CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateShort } from '../../utils/dateHelper';

// ============================================================
// KOMPONEN: BookingCard
// Menampilkan ringkasan satu transaksi peminjaman.
// ============================================================

// Konfigurasi tampilan setiap status peminjaman
const STATUS_CONFIG = {
  pending:   { label: 'Menunggu Konfirmasi', color: 'bg-amber-100 text-amber-800',   icon: AlertCircle },
  approved:  { label: 'Disetujui',           color: 'bg-blue-100 text-blue-800',     icon: CheckCircle },
  active:    { label: 'Sedang Dipinjam',     color: 'bg-primary-100 text-primary-800', icon: Loader },
  completed: { label: 'Selesai',             color: 'bg-gray-100 text-gray-700',     icon: CheckCircle },
  cancelled: { label: 'Dibatalkan',          color: 'bg-red-100 text-red-700',       icon: XCircle },
};

const BookingCard = ({ booking, onCancel, showActions = true }) => {
  const status = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
  const StatusIcon = status.icon;

  if (!booking) return null;

  return (
    <div className="card p-5 flex flex-col sm:flex-row gap-4">
      {/* Gambar Mobil kecil */}
      <div className="w-full sm:w-28 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
        <img
          src={booking.carImage || undefined}
          alt={booking.carName}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
          <div>
            <p className="text-xs text-gray-400 font-mono">{booking.id}</p>
            <h4 className="font-display font-bold text-gray-800">{booking.carName}</h4>
          </div>
          {/* Badge Status */}
          <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${status.color}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            {status.label}
          </span>
        </div>

        {/* Detail Booking */}
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-500 mb-3">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-primary-600" />
            {formatDateShort(booking.startDate)} – {formatDateShort(booking.endDate)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-primary-600" />
            {booking.days} hari
          </span>
          <span className="flex items-center gap-1.5">
            <Car className="w-3.5 h-3.5 text-primary-600" />
            {booking.withDriver ? 'Dengan Sopir' : 'Tanpa Sopir'}
          </span>
        </div>

        {/* Footer: Harga + Tombol */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <span className="text-xs text-gray-400">Total Biaya</span>
            <p className="font-bold text-primary-800 text-base">{formatCurrency(booking.totalCost)}</p>
          </div>
          {showActions && booking.status === 'pending' && onCancel && (
            <button
              onClick={() => onCancel(booking.id)}
              className="text-xs font-semibold text-red-600 border border-red-200 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors"
            >
              Batalkan
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
