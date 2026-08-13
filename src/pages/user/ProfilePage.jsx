import { useState } from 'react';
import { User, Phone, MapPin, Mail, Edit3, Save, X, Lock, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import { formatCurrency } from '../../utils/formatCurrency';

const ProfilePage = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const { getBookingsByUser } = useBooking();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [form, setForm] = useState({ name: user.name, phone: user.phone || '', address: user.address || '' });
  const [passForm, setPassForm] = useState({ newPass: '', confirmPass: '' });

  const myBookings = getBookingsByUser(user.id);
  const totalSpent = myBookings.filter((b) => b.paymentStatus === 'paid').reduce((s, b) => s + b.totalCost, 0);

  const handleSaveProfile = () => {
    if (!form.name.trim()) return;
    updateProfile(form);
    setIsEditing(false);
    setSaveMsg('Profil berhasil diperbarui!');
    setTimeout(() => setSaveMsg(''), 3000);
  };

  const handleSavePassword = async () => {
    if (passForm.newPass.length < 6) { setSaveMsg('Password minimal 6 karakter!'); setTimeout(() => setSaveMsg(''), 3000); return; }
    if (passForm.newPass !== passForm.confirmPass) { setSaveMsg('Password tidak cocok!'); setTimeout(() => setSaveMsg(''), 3000); return; }
    
    const result = await changePassword(passForm.newPass);
    if (result.success) {
      setIsChangingPass(false);
      setPassForm({ newPass: '', confirmPass: '' });
      setSaveMsg('Password berhasil diubah!');
    } else {
      setSaveMsg(result.message || 'Gagal mengubah password!');
    }
    setTimeout(() => setSaveMsg(''), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-display font-bold text-gray-800 mb-6">Profil Saya</h1>

      {/* Notifikasi simpan */}
      {saveMsg && (
        <div className="flex items-center gap-2 bg-primary-50 border border-primary-200 text-primary-800 text-sm font-medium px-4 py-3 rounded-xl mb-5">
          <CheckCircle className="w-4 h-4" /> {saveMsg}
        </div>
      )}

      {/* Avatar & Stats */}
      <div className="card p-6 mb-5">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="w-20 h-20 bg-primary-800 rounded-2xl flex items-center justify-center text-white font-display font-bold text-2xl flex-shrink-0">
            {user.avatar || user.name.charAt(0)}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-display font-bold text-gray-800">{user.name}</h2>
            <p className="text-gray-500 text-sm mb-3">{user.email}</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-4">
              {[
                { label: 'Total Peminjaman', value: myBookings.length },
                { label: 'Selesai', value: myBookings.filter(b => b.status === 'completed').length },
                { label: 'Total Pengeluaran', value: formatCurrency(totalSpent) },
              ].map(({ label, value }) => (
                <div key={label} className="text-center bg-gray-50 rounded-xl px-4 py-2.5">
                  <p className="text-base font-bold text-primary-800">{value}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profil */}
      <div className="card p-6 mb-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2"><User className="w-5 h-5 text-primary-700" /> Informasi Pribadi</h3>
          {!isEditing
            ? <button onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 text-sm text-primary-700 font-medium hover:underline"><Edit3 className="w-4 h-4" /> Edit</button>
            : <button onClick={() => setIsEditing(false)} className="p-1.5 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
          }
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div><label className="form-label">Nama Lengkap</label><input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className="form-input" /></div>
            <div><label className="form-label">Nomor HP</label><input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} className="form-input" /></div>
            <div><label className="form-label">Alamat</label><textarea value={form.address} onChange={e => setForm(f => ({...f, address: e.target.value}))} rows={2} className="form-input resize-none" /></div>
            <button onClick={handleSaveProfile} className="btn-primary"><Save className="w-4 h-4" /> Simpan Perubahan</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {[
              { icon: User, label: 'Nama', value: user.name },
              { icon: Mail, label: 'Email', value: user.email },
              { icon: Phone, label: 'No. HP', value: user.phone || '-' },
              { icon: MapPin, label: 'Alamat', value: user.address || '-' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <Icon className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
                <div><p className="text-xs text-gray-400">{label}</p><p className="font-medium text-gray-700 break-all">{value}</p></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ganti Password */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Lock className="w-5 h-5 text-primary-700" /> Keamanan Akun</h3>
          {!isChangingPass
            ? <button onClick={() => setIsChangingPass(true)} className="flex items-center gap-1.5 text-sm text-primary-700 font-medium hover:underline"><Edit3 className="w-4 h-4" /> Ganti Password</button>
            : <button onClick={() => setIsChangingPass(false)} className="p-1.5 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
          }
        </div>
        {isChangingPass ? (
          <div className="space-y-4">
            <div><label className="form-label">Password Baru (min. 6 karakter)</label><input type="password" value={passForm.newPass} onChange={e => setPassForm(f => ({...f, newPass: e.target.value}))} className="form-input" /></div>
            <div><label className="form-label">Konfirmasi Password Baru</label><input type="password" value={passForm.confirmPass} onChange={e => setPassForm(f => ({...f, confirmPass: e.target.value}))} className="form-input" /></div>
            <button onClick={handleSavePassword} className="btn-primary"><Save className="w-4 h-4" /> Simpan Password</button>
          </div>
        ) : (
          <p className="text-sm text-gray-400">Password tersimpan dengan aman. Ubah secara berkala untuk keamanan akun Anda.</p>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
