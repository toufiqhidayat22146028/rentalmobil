import { BarChart3, Download, Calendar, TrendingUp, Car, Users, DollarSign, ClipboardList } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import { MOCK_CARS } from '../../data/mockCars';
import { formatCurrency } from '../../utils/formatCurrency';

const ReportPage = () => {
  const { bookings } = useBooking();
  const { users }    = useBooking();

  const totalRev    = bookings.filter(b => b.paymentStatus === 'paid').reduce((s, b) => s + b.totalCost, 0);
  const completed   = bookings.filter(b => b.status === 'completed').length;
  const cancelled   = bookings.filter(b => b.status === 'cancelled').length;
  const withDriver  = bookings.filter(b => b.withDriver).length;

  // Hitung mobil paling sering disewa
  const carFreq = MOCK_CARS.map(car => ({
    ...car,
    count: bookings.filter(b => b.carId === car.id).length,
    revenue: bookings.filter(b => b.carId === car.id && b.paymentStatus === 'paid').reduce((s, b) => s + b.totalCost, 0),
  })).sort((a, b) => b.count - a.count);

  const maxCount = carFreq[0]?.count || 1;

  const handleExport = () => {
    const csv = [
      ['ID', 'User ID', 'Car ID', 'Tanggal Mulai', 'Tanggal Selesai', 'Hari', 'Total', 'Status', 'Pembayaran'],
      ...bookings.map(b => [b.id, b.userId, b.carId, b.startDate, b.endDate, b.days, b.totalCost, b.status, b.paymentStatus])
    ].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'laporan-peminjaman.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-800">Laporan & Statistik</h1>
          <p className="text-gray-500 text-sm">Ringkasan data seluruh aktivitas sistem</p>
        </div>
        <button onClick={handleExport} className="btn-outline text-sm py-2.5">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Stat Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Pendapatan', value: formatCurrency(totalRev), icon: DollarSign, color: 'bg-primary-50 text-primary-700' },
          { label: 'Total Transaksi', value: bookings.length, icon: ClipboardList, color: 'bg-blue-50 text-blue-700' },
          { label: 'Transaksi Selesai', value: completed, icon: TrendingUp, color: 'bg-green-50 text-green-700' },
          { label: 'Peminjaman dengan Sopir', value: withDriver, icon: Users, color: 'bg-amber-50 text-amber-700' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}><Icon className="w-5 h-5" /></div>
            <p className="text-xl font-display font-bold text-gray-800">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabel Popularitas Mobil */}
      <div className="card p-6">
        <h3 className="font-display font-bold text-gray-800 mb-5 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary-700" /> Popularitas Kendaraan
        </h3>
        <div className="space-y-4">
          {carFreq.slice(0, 8).map((car, i) => (
            <div key={car.id} className="flex items-center gap-4">
              <span className="text-xs font-bold text-gray-400 w-5 text-right">{i + 1}</span>
              <div className="w-10 h-7 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                <img src={car.image} alt={car.name} className="w-full h-full object-cover" onError={e => e.target.style.display = 'none'} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-gray-800 truncate">{car.name}</span>
                  <span className="text-gray-500 ml-2 flex-shrink-0">{car.count}x disewa</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary-800 to-primary-600 rounded-full" style={{ width: `${(car.count / maxCount) * 100}%` }} />
                </div>
              </div>
              <span className="text-sm font-semibold text-primary-800 w-24 text-right flex-shrink-0">{formatCurrency(car.revenue)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Ringkasan Status */}
      <div className="card p-6">
        <h3 className="font-display font-bold text-gray-800 mb-5">Distribusi Status Peminjaman</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Menunggu',    value: bookings.filter(b => b.status === 'pending').length,   color: 'bg-amber-100 text-amber-800' },
            { label: 'Disetujui',  value: bookings.filter(b => b.status === 'approved').length,  color: 'bg-blue-100 text-blue-800' },
            { label: 'Aktif',      value: bookings.filter(b => b.status === 'active').length,    color: 'bg-primary-100 text-primary-800' },
            { label: 'Selesai',    value: completed, color: 'bg-gray-100 text-gray-700' },
            { label: 'Dibatalkan', value: cancelled, color: 'bg-red-100 text-red-700' },
          ].map(({ label, value, color }) => (
            <div key={label} className={`rounded-xl p-4 text-center ${color}`}>
              <p className="text-2xl font-display font-bold">{value}</p>
              <p className="text-xs font-medium mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
