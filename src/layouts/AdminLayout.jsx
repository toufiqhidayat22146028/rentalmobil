import { Outlet } from 'react-router-dom';
import Sidebar from '../components/admin/Sidebar';

// ============================================================
// LAYOUT: AdminLayout
// Layout untuk semua halaman admin.
// Sidebar di kiri (fixed), konten di kanan.
// ============================================================
const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Admin */}
      <Sidebar />

      {/* Area Konten Utama */}
      {/* lg:ml-64: offset sebesar lebar sidebar di desktop */}
      <main className="flex-1 min-w-0 lg:ml-64 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
          {/* Outlet: Diisi oleh komponen halaman admin yang aktif */}
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
