import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, User, Mail, Lock, Phone, Eye, EyeOff, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPass, setShowPass]    = useState(false);
  const [error, setError]          = useState('');
  const [isLoading, setIsLoading]  = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Password dan konfirmasi password tidak cocok.'); return; }
    if (form.password.length < 6) { setError('Password minimal 6 karakter.'); return; }
    setIsLoading(true);
    const result = await register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
    setIsLoading(false);
    if (result.success) navigate('/');
    else setError(result.message || 'Pendaftaran gagal. Coba lagi.');
  };

  const strength = form.password.length >= 8 ? 'Kuat' : form.password.length >= 6 ? 'Sedang' : form.password.length > 0 ? 'Lemah' : '';
  const strengthColor = strength === 'Kuat' ? 'text-green-600' : strength === 'Sedang' ? 'text-amber-600' : 'text-red-500';

  return (
    <div className="min-h-screen flex">
      {/* Panel Kiri */}
      <div className="hidden lg:flex lg:w-2/5 bg-hero-gradient flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 right-0 w-48 h-48 bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-primary-400/10 rounded-full blur-3xl" />
        </div>
        <div className="relative text-center">
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/30">
            <Car className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-display font-bold text-white mb-3">Bergabung Sekarang</h2>
          <p className="text-primary-200 leading-relaxed max-w-xs">Daftar gratis dan nikmati kemudahan peminjaman mobil kapan saja, di mana saja.</p>
          <div className="mt-10 space-y-3 text-left">
            {['Akses 500+ armada kendaraan', 'Harga transparan tanpa biaya tersembunyi', 'Konfirmasi booking cepat', 'Layanan pelanggan 24/7'].map((f) => (
              <div key={f} className="flex items-center gap-3 text-primary-100 text-sm">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />{f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel Kanan - Form */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-64 h-20 overflow-hidden flex items-center justify-center p-0.5">
              <img src="/logo-light.svg?v=3" alt="Logo" className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
            </div>
          </div>

          <h1 className="text-2xl font-display font-bold text-gray-800 mb-1">Buat Akun Baru</h1>
          <p className="text-gray-500 text-sm mb-6">Isi data di bawah untuk mendaftar. Gratis!</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Nama Lengkap *</label>
              <div className="relative"><User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={form.name} onChange={set('name')} placeholder="Nama lengkap Anda" className="form-input pl-11" required />
              </div>
            </div>
            <div>
              <label className="form-label">Email *</label>
              <div className="relative"><Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="email" value={form.email} onChange={set('email')} placeholder="email@example.com" className="form-input pl-11" required />
              </div>
            </div>
            <div>
              <label className="form-label">Nomor HP</label>
              <div className="relative"><Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="tel" value={form.phone} onChange={set('phone')} placeholder="08xxxxxxxxxx" className="form-input pl-11" />
              </div>
            </div>
            <div>
              <label className="form-label">Password *</label>
              <div className="relative"><Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type={showPass ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="Min. 6 karakter" className="form-input pl-11 pr-11" required />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {strength && <p className={`text-xs mt-1 ${strengthColor}`}>Kekuatan Password: {strength}</p>}
            </div>
            <div>
              <label className="form-label">Konfirmasi Password *</label>
              <div className="relative"><Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="password" value={form.confirm} onChange={set('confirm')} placeholder="Ulangi password" className="form-input pl-11" required />
              </div>
              {form.confirm && form.password !== form.confirm && (
                <p className="text-xs text-red-500 mt-1">Password tidak cocok</p>
              )}
            </div>
            <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center disabled:bg-gray-200 disabled:text-gray-400">
              {isLoading ? 'Mendaftar...' : <><UserPlus className="w-4 h-4" /> Daftar Sekarang</>}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-primary-700 font-semibold hover:underline">Masuk di sini</Link>
          </p>
          <p className="text-center mt-3">
            <Link to="/" className="text-xs text-gray-400 hover:text-gray-600">← Kembali ke Beranda</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
