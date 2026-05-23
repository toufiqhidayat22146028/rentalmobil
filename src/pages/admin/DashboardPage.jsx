import { useState, useEffect, useCallback } from 'react';
import { BarChart3, TrendingUp, Car, Users, DollarSign, ClipboardList, Loader2 } from 'lucide-react';
import { bookingsAPI, usersAPI } from '../../services/api';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/dateHelper';

const STATUS_BADGE = {
  pending:   { color: 'bg-amber-100 text-amber-800',   label: 'Menunggu'   },
  approved:  { color: 'bg-blue-100 text-blue-800',     label: 'Disetujui'  },
  active:    { color: 'bg-primary-100 text-primary-800',label: 'Aktif'     },
  completed: { color: 'bg-gray-100 text-gray-700',     label: 'Selesai'    },
  cancelled: { color: 'bg-red-100 text-red-700',       label: 'Dibatalkan' },
};

const StatCard = ({ label, value, icon: Icon, color, sub }) => (
  <div className="card p-5">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${color}`}><Icon className="w-5 h-5" /></div>
    <p className="text-2xl font-display font-bold text-gray-800">{value}</p>
    <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

const DashboardPage = () => {
  const [stats, setStats]       = useState(null);
  const [carStats, setCarStats] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsRes, bookingsRes] = await Promise.all([
        bookingsAPI.getStats(),
        bookingsAPI.getAll(),
      ]);
      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
        setCarStats(statsRes.data.carStats || []);
      }
      if (bookingsRes.data.success) {
        // Ambil 5 booking terbaru
        setBookings(bookingsRes.data.data.slice(0, 5));
      }
    } catch (err) {
      console.error('[Dashboard] Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 text-primary-600 animate-spin mr-3" />
      <span className="text-gray-500">Memuat data dashboard...</span>
    </div>
  );

  const maxCount = carStats[0]?.booking_count || 1;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-800">Dashboard Admin</h1>
        <p className="text-gray-500 text-sm">Ringkasan aktivitas sistem hari ini</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Pendapatan" value={formatCurrency(stats?.totalRevenue || 0)} icon={DollarSign} color="bg-primary-50 text-primary-700" />
        <StatCard label="Total Peminjaman" value={stats?.totalBookings || 0} icon={ClipboardList} color="bg-blue-50 text-blue-700" sub={`${stats?.pending || 0} menunggu konfirmasi`} />
        <StatCard label="Total Kendaraan"  value={stats?.totalCars || 0} icon={Car} color="bg-amber-50 text-amber-700" sub={`${stats?.availCars || 0} tersedia`} />
        <StatCard label="Total Pengguna"   value={stats?.totalUsers || 0} icon={Users} color="bg-green-50 text-green-700" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart popularitas */}
        <div className="card p-6">
          <h3 className="font-display font-bold text-gray-800 mb-5 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary-700" /> Popularitas Kendaraan
          </h3>
          {carStats.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Belum ada data</p>
          ) : (
            <div className="space-y-4">
              {carStats.slice(0, 6).map((car, i) => (
                <div key={car.id} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-gray-700 truncate">{car.name}</span>
                      <span className="text-gray-400 ml-2 flex-shrink-0">{car.booking_count}x</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary-800 to-primary-500 rounded-full transition-all duration-700"
                           style={{ width: `${(car.booking_count / maxCount) * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-primary-800 w-20 text-right flex-shrink-0">{formatCurrency(car.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Distribusi Status */}
        <div className="card p-6">
          <h3 className="font-display font-bold text-gray-800 mb-5 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-700" /> Status Peminjaman
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Menunggu',    value: stats?.pending,   color: 'bg-amber-100 text-amber-800' },
              { label: 'Disetujui',  value: stats?.approved,  color: 'bg-blue-100 text-blue-800' },
              { label: 'Aktif',      value: stats?.active,    color: 'bg-primary-100 text-primary-800' },
              { label: 'Selesai',    value: stats?.completed, color: 'bg-gray-100 text-gray-700' },
              { label: 'Dibatalkan', value: stats?.cancelled, color: 'bg-red-100 text-red-700' },
            ].map(({ label, value, color }) => (
              <div key={label} className={`rounded-xl p-4 text-center ${color}`}>
                <p className="text-2xl font-display font-bold">{value || 0}</p>
                <p className="text-xs font-medium mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabel Transaksi Terbaru */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-display font-bold text-gray-800">Transaksi Terbaru</h3>
          <span className="text-xs text-gray-400">5 terbaru</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>{['ID', 'Tanggal', 'Total', 'Status', 'Bayar'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {bookings.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">Belum ada transaksi</td></tr>
              ) : bookings.map((b) => {
                const s = STATUS_BADGE[b.status] || STATUS_BADGE.pending;
                return (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-500">{b.id}</td>
                    <td className="px-5 py-3.5 text-gray-600">{formatDate(b.startDate || b.start_date)}</td>
                    <td className="px-5 py-3.5 font-semibold text-gray-800">{formatCurrency(b.totalCost || b.total_cost)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.color}`}>{s.label}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${(b.paymentStatus || b.payment_status) === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {(b.paymentStatus || b.payment_status) === 'paid' ? 'Lunas' : 'Belum'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
