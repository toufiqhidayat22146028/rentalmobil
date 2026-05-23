import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Car, ClipboardList, Users, BarChart3,
  Menu, X, ChevronRight, LogOut, Settings,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// ============================================================
// KOMPONEN: Sidebar (Admin)
// Navigasi lateral untuk panel admin.
// ============================================================

const NAV_ITEMS = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/admin/mobil', label: 'Kelola Mobil', icon: Car },
  { path: '/admin/peminjaman', label: 'Kelola Peminjaman', icon: ClipboardList },
  { path: '/admin/pengguna', label: 'Kelola Pengguna', icon: Users },
  { path: '/admin/laporan', label: 'Laporan', icon: BarChart3 },
];

const Sidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-primary-700">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
            <Car className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-display font-bold text-white text-base leading-tight">RentalMobil</p>
            <p className="text-primary-300 text-xs">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ path, label, icon: Icon, exact }) => (
          <NavLink
            key={path}
            to={path}
            end={exact}
            onClick={() => setIsMobileOpen(false)}
            className={({ isActive }) => `
              flex items-center justify-between px-4 py-3 rounded-xl 
              transition-all duration-200 group
              ${isActive
                ? 'bg-white text-primary-800 font-semibold shadow-sm'
                : 'text-primary-200 hover:bg-primary-700 hover:text-white'
              }
            `}
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3">
                  <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-primary-800' : 'text-primary-300 group-hover:text-white'}`} />
                  <span className="text-sm">{label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-primary-600" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Info + Logout */}
      <div className="px-3 py-4 border-t border-primary-700">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user?.avatar || user?.name?.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
            <p className="text-primary-300 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-primary-300 hover:bg-red-500/20 hover:text-red-300 transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" />
          Keluar
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden lg:flex flex-col w-64 bg-gradient-to-b from-primary-900 to-primary-800 fixed left-0 top-0 h-full z-40">
        <SidebarContent />
      </aside>

      {/* HAMBURGER BUTTON - Mobile */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-primary-800 rounded-xl text-white shadow-lg"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* SIDEBAR MOBILE - Drawer */}
      {isMobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsMobileOpen(false)}
          />
          <aside className="lg:hidden fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-primary-900 to-primary-800 z-50 animate-slide-up flex flex-col">
            <button
              onClick={() => setIsMobileOpen(false)}
              className="absolute top-4 right-4 p-2 text-primary-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
};

export default Sidebar;
