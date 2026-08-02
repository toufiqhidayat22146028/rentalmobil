import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Contexts
import { AuthProvider } from '../context/AuthContext';
import { BookingProvider } from '../context/BookingContext';

// Layouts & Guards
import UserLayout from '../layouts/UserLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from './ProtectedRoute';

// User Pages
import HomePage       from '../pages/user/HomePage';
import CatalogPage    from '../pages/user/CatalogPage';
import CarDetailPage  from '../pages/user/CarDetailPage';
import BookingPage    from '../pages/user/BookingPage';
import HistoryPage    from '../pages/user/HistoryPage';
import ProfilePage    from '../pages/user/ProfilePage';
import ContactPage    from '../pages/user/ContactPage';
import AboutPage      from '../pages/user/AboutPage';

// Auth Pages
import LoginPage      from '../pages/auth/LoginPage';
import RegisterPage   from '../pages/auth/RegisterPage';

// Admin Pages
import DashboardPage      from '../pages/admin/DashboardPage';
import ManageCarPage      from '../pages/admin/ManageCarPage';
import ManageBookingPage  from '../pages/admin/ManageBookingPage';
import ManageUserPage     from '../pages/admin/ManageUserPage';
import ReportPage         from '../pages/admin/ReportPage';
import ManageChatPage     from '../pages/admin/ManageChatPage';

const AppRouter = () => {
  return (
    // AuthProvider dan BookingProvider membungkus seluruh aplikasi
    // agar state global bisa diakses dari mana saja
    <AuthProvider>
      <BookingProvider>
        <BrowserRouter>
          <Routes>

            {/* ================================================
                HALAMAN AUTENTIKASI (tanpa layout Navbar/Footer)
                ================================================ */}
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* ================================================
                HALAMAN PENGGUNA (dengan UserLayout: Navbar + Footer + Chatbot)
                ================================================ */}
            <Route element={<UserLayout />}>
              {/* Halaman Publik */}
              <Route path="/"          element={<HomePage />} />
              <Route path="/katalog"   element={<CatalogPage />} />
              <Route path="/tentang"   element={<AboutPage />} />
              <Route path="/kontak"     element={<ContactPage />} />
              <Route path="/mobil/:id" element={<CarDetailPage />} />

              {/* Halaman Terproteksi - butuh login */}
              <Route element={<ProtectedRoute />}>
                <Route path="/peminjaman/:id" element={<BookingPage />} />
                <Route path="/riwayat"        element={<HistoryPage />} />
                <Route path="/profil"         element={<ProfilePage />} />
              </Route>
            </Route>

            {/* ================================================
                HALAMAN ADMIN (dengan AdminLayout: Sidebar)
                Dilindungi: hanya bisa diakses role 'admin'
                ================================================ */}
            <Route element={<ProtectedRoute requiredRole="admin" />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin"              element={<DashboardPage />} />
                <Route path="/admin/mobil"        element={<ManageCarPage />} />
                <Route path="/admin/peminjaman"   element={<ManageBookingPage />} />
                <Route path="/admin/pengguna"     element={<ManageUserPage />} />
                <Route path="/admin/laporan"      element={<ReportPage />} />
                <Route path="/admin/chat"         element={<ManageChatPage />} />
              </Route>
            </Route>

            {/* Redirect semua path tak dikenal ke beranda */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </BookingProvider>
    </AuthProvider>
  );
};

export default AppRouter;
