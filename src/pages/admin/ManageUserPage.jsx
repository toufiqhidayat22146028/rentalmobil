import { useState, useEffect, useCallback } from 'react';
import { Search, Shield, ShieldOff, Eye, Users, Loader2 } from 'lucide-react';
import Modal from '../../components/common/Modal';
import { usersAPI, bookingsAPI, getErrorMessage } from '../../services/api';
import { formatDate } from '../../utils/dateHelper';
import { formatCurrency } from '../../utils/formatCurrency';

const ManageUserPage = () => {
  const [users, setUsers]             = useState([]);
  const [bookings, setBookings]       = useState([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [search, setSearch]           = useState('');
  const [detailUser, setDetailUser]   = useState(null);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [uRes, bRes] = await Promise.all([usersAPI.getAll(), bookingsAPI.getAll()]);
      if (uRes.data.success) setUsers(uRes.data.data);
      if (bRes.data.success) setBookings(bRes.data.data);
    } finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const getUserBookings = (userId) =>
    bookings.filter(b => (b.userId || b.user_id) === userId);

  const handleToggle = async (userId) => {
    try {
      const { data } = await usersAPI.toggleStatus(userId);
      if (data.success) setUsers(prev => prev.map(u => u.id === userId ? data.data : u));
    } catch (err) { alert(getErrorMessage(err)); }
  };

  const filtered = users.filter(u =>
    !search ||
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-800">Kelola Pengguna</h1>
          <p className="text-gray-500 text-sm">{users.length} pengguna terdaftar</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Users className="w-4 h-4 text-primary-700" />
          <span className="font-medium text-gray-600">{users.filter(u => u.status === 'active').length} aktif</span>
        </div>
      </div>

      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama atau email..." className="form-input pl-11" />
      </div>

      {isLoading ? (
        <div className="card flex items-center justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-primary-600 mr-3" /><span className="text-gray-500">Memuat...</span></div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['Pengguna', 'Email', 'Telepon', 'Peminjaman', 'Status', 'Aksi'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-400">Tidak ada pengguna</td></tr>
                ) : filtered.map(u => {
                  const bCount = getUserBookings(u.id).length;
                  return (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-primary-800 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {u.avatar || u.name?.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-800">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">{u.email}</td>
                      <td className="px-5 py-3.5 text-gray-500">{u.phone || '-'}</td>
                      <td className="px-5 py-3.5 text-center font-semibold text-gray-800">{bCount}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                          {u.status === 'active' ? 'Aktif' : 'Diblokir'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-1.5">
                          <button onClick={() => setDetailUser(u)} className="p-1.5 text-primary-700 hover:bg-primary-50 rounded-lg" title="Detail"><Eye className="w-4 h-4" /></button>
                          <button onClick={() => handleToggle(u.id)}
                            className={`p-1.5 rounded-lg ${u.status === 'active' ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                            title={u.status === 'active' ? 'Blokir' : 'Aktifkan'}>
                            {u.status === 'active' ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                          </button>
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

      {detailUser && (() => {
        const u  = detailUser;
        const bs = getUserBookings(u.id);
        const paid = bs.filter(b => (b.paymentStatus || b.payment_status) === 'paid').reduce((s, b) => s + (b.totalCost || b.total_cost), 0);
        return (
          <Modal isOpen onClose={() => setDetailUser(null)} title="Detail Pengguna" size="md">
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                <div className="w-16 h-16 bg-primary-800 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">{u.avatar || u.name?.charAt(0)}</div>
                <div>
                  <p className="text-lg font-display font-bold text-gray-800">{u.name}</p>
                  <p className="text-gray-500">{u.email}</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{u.status === 'active' ? 'Aktif' : 'Diblokir'}</span>
                </div>
              </div>
              {[['Telepon', u.phone || '-'], ['Alamat', u.address || '-'], ['Terdaftar', formatDate(u.created_at)]].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-2 border-b border-gray-50">
                  <span className="text-gray-500">{k}</span><span className="text-gray-800 font-medium">{v}</span>
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3 py-2">
                <div className="bg-primary-50 rounded-xl p-3 text-center"><p className="text-xl font-display font-bold text-primary-800">{bs.length}</p><p className="text-xs text-gray-500">Total Peminjaman</p></div>
                <div className="bg-green-50 rounded-xl p-3 text-center"><p className="text-xl font-display font-bold text-green-700">{formatCurrency(paid)}</p><p className="text-xs text-gray-500">Total Dibayar</p></div>
              </div>
              <button onClick={() => { handleToggle(u.id); setDetailUser(null); }}
                className={`w-full py-2.5 rounded-xl font-semibold transition-colors ${u.status === 'active' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}>
                {u.status === 'active' ? '🚫 Blokir Pengguna' : '✅ Aktifkan Pengguna'}
              </button>
            </div>
          </Modal>
        );
      })()}
    </div>
  );
};

export default ManageUserPage;
