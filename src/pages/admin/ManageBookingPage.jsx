import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle, Eye, Search, Loader2 } from 'lucide-react';
import Modal from '../../components/common/Modal';
import { bookingsAPI, usersAPI, carsAPI } from '../../services/api';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateShort, formatDate } from '../../utils/dateHelper';

const STATUS_TABS = [
  { value: 'all', label: 'Semua' },
  { value: 'pending',   label: 'Menunggu' },
  { value: 'approved',  label: 'Disetujui' },
  { value: 'active',    label: 'Aktif' },
  { value: 'completed', label: 'Selesai' },
  { value: 'cancelled', label: 'Dibatalkan' },
];

const STATUS_BADGE = {
  pending:   { color: 'bg-amber-100 text-amber-800', label: 'Menunggu',   icon: AlertCircle },
  approved:  { color: 'bg-blue-100 text-blue-800',   label: 'Disetujui',  icon: CheckCircle },
  active:    { color: 'bg-primary-100 text-primary-800', label: 'Aktif',  icon: Clock },
  completed: { color: 'bg-gray-100 text-gray-700',   label: 'Selesai',    icon: CheckCircle },
  cancelled: { color: 'bg-red-100 text-red-700',     label: 'Dibatalkan', icon: XCircle },
};

const ManageBookingPage = () => {
  const [bookings, setBookings]       = useState([]);
  const [users, setUsers]             = useState({});
  const [cars, setCars]               = useState({});
  const [isLoading, setIsLoading]     = useState(true);
  const [activeTab, setActiveTab]     = useState('all');
  const [search, setSearch]           = useState('');
  const [detailBooking, setDetailBooking] = useState(null);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [bRes, uRes, cRes] = await Promise.all([
        bookingsAPI.getAll(),
        usersAPI.getAll(),
        carsAPI.getAll(),
      ]);
      if (bRes.data.success) setBookings(bRes.data.data);
      if (uRes.data.success) {
        const uMap = {};
        uRes.data.data.forEach(u => { uMap[u.id] = u; });
        setUsers(uMap);
      }
      if (cRes.data.success) {
        const cMap = {};
        cRes.data.data.forEach(c => { cMap[c.id] = c; });
        setCars(cMap);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchAll(); 
    const interval = setInterval(() => {
      bookingsAPI.getAll().then(res => {
        if (res.data.success) setBookings(res.data.data);
      }).catch(err => {
        // silent catch
      });
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const getUser = (id) => users[id] || { name: `User #${id}`, email: '-' };
  const getCar  = (id) => cars[id]  || { name: `Car #${id}` };

  const handleAction = async (bookingId, newStatus) => {
    const { data } = await bookingsAPI.updateStatus(bookingId, newStatus);
    if (data.success) {
      setBookings(prev => prev.map(b => b.id === bookingId ? data.data : b));
      if (detailBooking?.id === bookingId) setDetailBooking(data.data);
    }
  };

  const filtered = bookings.filter(b => {
    if (activeTab !== 'all' && b.status !== activeTab) return false;
    if (search && !b.id.toLowerCase().includes(search.toLowerCase()) &&
        !getUser(b.userId || b.user_id)?.name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-800">Kelola Peminjaman</h1>
        <p className="text-gray-500 text-sm">{bookings.length} total transaksi</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUS_TABS.map(({ value, label }) => {
          const count = value === 'all' ? bookings.length : bookings.filter(b => b.status === value).length;
          return (
            <button key={value} onClick={() => setActiveTab(value)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${activeTab === value ? 'bg-primary-800 text-white border-primary-800' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'}`}>
              {label} {count > 0 && <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === value ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>{count}</span>}
            </button>
          );
        })}
      </div>

      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari ID atau nama pengguna..." className="form-input pl-11" />
      </div>

      {isLoading ? (
        <div className="card flex items-center justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-primary-600 mr-3" /><span className="text-gray-500">Memuat data...</span></div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['ID', 'Pengguna', 'Kendaraan', 'Tanggal', 'Total', 'Status', 'Pembayaran', 'Aksi'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-12 text-gray-400">Tidak ada data</td></tr>
                ) : filtered.map(b => {
                  const uid = b.userId || b.user_id;
                  const cid = b.carId  || b.car_id;
                  const u   = getUser(uid);
                  const c   = getCar(cid);
                  const s   = STATUS_BADGE[b.status] || STATUS_BADGE.pending;
                  const SIcon = s.icon;
                  const paid  = (b.paymentStatus || b.payment_status) === 'paid';
                  return (
                    <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-xs text-gray-500">{b.id}</td>
                      <td className="px-5 py-3.5 font-medium text-gray-800">{u.name}</td>
                      <td className="px-5 py-3.5 text-gray-600">{c.name}</td>
                      <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">{formatDateShort(b.startDate || b.start_date)} – {formatDateShort(b.endDate || b.end_date)}</td>
                      <td className="px-5 py-3.5 font-semibold text-gray-800 whitespace-nowrap">{formatCurrency(b.totalCost || b.total_cost)}</td>
                      <td className="px-5 py-3.5">
                        <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full w-fit ${s.color}`}><SIcon className="w-3 h-3" />{s.label}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${paid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                          {paid ? '✓ Lunas' : '✗ Belum'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => setDetailBooking(b)} className="p-1.5 text-primary-700 hover:bg-primary-50 rounded-lg" title="Detail"><Eye className="w-4 h-4" /></button>
                          {b.status === 'pending' && <>
                            <button onClick={() => handleAction(b.id, 'approved')} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg" title="Setujui"><CheckCircle className="w-4 h-4" /></button>
                            <button onClick={() => handleAction(b.id, 'cancelled')} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="Tolak"><XCircle className="w-4 h-4" /></button>
                          </>}
                          {b.status === 'approved' && (
                            <button onClick={() => handleAction(b.id, 'completed')} className="text-xs px-2 py-1 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-lg font-medium">Selesai</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {detailBooking && (() => {
        const b   = detailBooking;
        const uid = b.userId || b.user_id;
        const cid = b.carId  || b.car_id;
        const u   = getUser(uid);
        const c   = getCar(cid);
        const s   = STATUS_BADGE[b.status] || STATUS_BADGE.pending;
        return (
          <Modal isOpen onClose={() => setDetailBooking(null)} title={`Detail ${b.id}`} size="md">
            <div className="space-y-4 text-sm">
              <div className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold ${s.color}`}><s.icon className="w-4 h-4" /> Status: {s.label}</div>
              {[
                ['Pengguna', u.name], ['Email', u.email], ['Kendaraan', c.name],
                ['Tanggal Mulai', formatDate(b.startDate || b.start_date)],
                ['Tanggal Kembali', formatDate(b.endDate || b.end_date)],
                ['Durasi', `${b.days} hari`],
                ['Area Pemakaian', b.usageArea === 'luar_kota' ? 'Luar Kota (+Rp 150k/hari)' : 'Dalam Kota'],
                ['Dengan Sopir', (b.withDriver || b.with_driver) ? 'Ya' : 'Tidak'],
                ['Lokasi', b.pickupLocation || b.pickup_location || '-'],
                ['Status Bayar', (b.paymentStatus || b.payment_status) === 'paid' ? '✅ Lunas' : '❌ Belum Bayar'],
                ['Metode Bayar', b.paymentMethod || b.payment_method || '-'],
                ...(b.paymentTransactionId || b.payment_transaction_id ? [['ID Transaksi', b.paymentTransactionId || b.payment_transaction_id]] : []),
                ['Total', formatCurrency(b.totalCost || b.total_cost)],
                ...(b.notes ? [['Catatan', b.notes]] : []),
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-2 border-b border-gray-50">
                  <span className="text-gray-500 flex-shrink-0">{k}</span>
                  <span className="text-gray-800 font-medium text-right">{v}</span>
                </div>
              ))}
              {b.status === 'pending' && (
                <div className="flex gap-3 pt-2">
                  <button onClick={() => { handleAction(b.id, 'cancelled'); setDetailBooking(null); }} className="flex-1 border-2 border-red-200 text-red-600 hover:bg-red-50 font-semibold py-2.5 rounded-xl">Tolak</button>
                  <button onClick={() => handleAction(b.id, 'approved')} className="flex-1 btn-primary justify-center">Setujui</button>
                </div>
              )}
            </div>
          </Modal>
        );
      })()}
    </div>
  );
};

export default ManageBookingPage;
