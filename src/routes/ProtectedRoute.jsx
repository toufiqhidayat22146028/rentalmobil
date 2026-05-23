import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ============================================================
// KOMPONEN: ProtectedRoute
// Melindungi route yang membutuhkan autentikasi.
// Props:
//   - requiredRole: 'user' | 'admin' | null (default: cukup login)
// ============================================================
const ProtectedRoute = ({ requiredRole = null }) => {
  const { isLoggedIn, isAdmin } = useAuth();
  const location = useLocation();

  // Jika belum login, redirect ke halaman login
  // Simpan halaman yang ingin dituju agar bisa redirect balik setelah login
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Jika butuh role admin tapi user bukan admin
  if (requiredRole === 'admin' && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Jika sudah login dan role sesuai, tampilkan route
  return <Outlet />;
};

export default ProtectedRoute;
