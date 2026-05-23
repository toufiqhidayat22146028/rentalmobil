import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Car, Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const result = await login(email, password); // ← await diperlukan karena login() adalah async
    setIsLoading(false);
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.message || 'Login gagal. Periksa email dan password.');
    }
  };

  const fillDemo = (role) => {
    if (role === 'admin') { setEmail('admin@rentalmobil.com'); setPassword('admin123'); }
    else { setEmail('user@test.com'); setPassword('user123'); }
  };

  return (
    <div className="min-h-screen flex">
      {/* Panel Kiri - Dekorasi */}
      <div className="hidden lg:flex lg:w-1/2 bg-hero-gradient flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-primary-400/10 rounded-full blur-3xl" />
        </div>
        <div className="relative text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/30">
            <Car className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-display font-bold text-white mb-3">RentalMobil</h2>
          <p className="text-primary-200 text-lg leading-relaxed max-w-sm">
            Solusi terpercaya untuk kebutuhan transportasi Anda. Ribuan pelanggan sudah mempercayai kami.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-6 text-center">
            {[['500+', 'Armada'], ['10K+', 'Pelanggan'], ['4.9', 'Rating']].map(([v, l]) => (
              <div key={l}><p className="text-2xl font-bold text-white">{v}</p><p className="text-primary-300 text-sm">{l}</p></div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel Kanan - Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-10 h-10 bg-primary-800 rounded-xl flex items-center justify-center">
              <Car className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-primary-800">RentalMobil</span>
          </div>

          <h1 className="text-2xl font-display font-bold text-gray-800 mb-1">Selamat Datang!</h1>
          <p className="text-gray-500 text-sm mb-6">Masuk ke akun Anda untuk melanjutkan.</p>

          {/* Demo accounts */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
            <p className="text-xs font-semibold text-amber-700 mb-2">🎯 Demo Akun:</p>
            <div className="flex gap-2">
              <button onClick={() => fillDemo('user')} className="flex-1 text-xs bg-white border border-amber-300 text-amber-700 py-1.5 rounded-lg hover:bg-amber-100 transition-colors font-medium">👤 Login sebagai User</button>
              <button onClick={() => fillDemo('admin')} className="flex-1 text-xs bg-amber-500 text-white py-1.5 rounded-lg hover:bg-amber-600 transition-colors font-medium">🔑 Login sebagai Admin</button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" className="form-input pl-11" required />
              </div>
            </div>
            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Masukkan password" className="form-input pl-11 pr-11" required />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center disabled:bg-gray-200 disabled:text-gray-400">
              {isLoading ? 'Memproses...' : <><LogIn className="w-4 h-4" /> Masuk</>}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Belum punya akun?{' '}
            <Link to="/register" className="text-primary-700 font-semibold hover:underline">Daftar Sekarang</Link>
          </p>
          <p className="text-center mt-3">
            <Link to="/" className="text-xs text-gray-400 hover:text-gray-600">← Kembali ke Beranda</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
