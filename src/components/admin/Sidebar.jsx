import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, 
  Car, 
  ClipboardList, 
  Users, 
  BarChart3,
  Menu, 
  X, 
  ChevronRight, 
  LogOut, 
  Settings,
  Bell,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { chatAPI, bookingsAPI } from '../../services/api';

// ============================================================
// KOMPONEN: Sidebar (Admin)
// Navigasi lateral untuk panel admin - Desain Premium Royal Blue
// ============================================================

// Custom inline Compass icon because it's not imported directly or might be needed
const Compass = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
);


const NAV_ITEMS = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/admin/mobil', label: 'Kelola Mobil', icon: Car },
  { path: '/admin/peminjaman', label: 'Kelola Peminjaman', icon: ClipboardList },
  { path: '/admin/pengguna', label: 'Kelola Pengguna', icon: Users },
  { path: '/admin/laporan', label: 'Laporan', icon: BarChart3 },
  { path: '/admin/chat', label: 'Kelola Chat', icon: MessageSquare },
];

const Sidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [pendingBookingCount, setPendingBookingCount] = useState(0);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const prevUnreadRef = useRef(0);
  const prevPendingBookingRef = useRef(0);

  useEffect(() => {
    if (user?.role !== 'admin') return;

    const fetchUnreadCount = async () => {
      try {
        const [chatRes, bookingRes] = await Promise.all([
          chatAPI.getConversations(),
          bookingsAPI.getAll()
        ]);
        
        // Chat count
        if (chatRes.data.success) {
          const count = chatRes.data.data.reduce((total, conv) => {
            return total + (conv.unread_count || conv.unreadCount || 0);
          }, 0);
          
          if (count > prevUnreadRef.current) {
            try {
              const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
              audio.play().catch(e => console.log('Audio blocked', e));
            } catch (e) {}
          }
          prevUnreadRef.current = count;
          setUnreadChatCount(count);
        }

        // Booking count
        if (bookingRes.data.success) {
          const count = bookingRes.data.data.filter(b => b.status === 'pending' || b.status === 'menunggu').length;
          if (count > prevPendingBookingRef.current) {
            try {
              const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
              audio.play().catch(e => console.log('Audio blocked', e));
            } catch (e) {}
          }
          prevPendingBookingRef.current = count;
          setPendingBookingCount(count);
        }
      } catch (err) {
        // Silent catch for background polling
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      
      {/* Header Sidebar: Logo CarRent - Admin */}
      <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-48 h-16 overflow-hidden flex items-center justify-start p-0.5">
            <img src="/logo-new.jpg" alt="Logo" className="w-full h-full object-contain object-left" onError={(e) => { e.target.style.display = 'none'; }} />
          </div>
        </div>
      </div>

      {/* Nav Links (Royal Blue Minimalist) */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        
        {/* Shortcut to Main site */}
        <NavLink
          to="/"
          className="flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all duration-300 text-slate-400 hover:text-slate-800 hover:bg-slate-50 font-semibold text-sm"
        >
          <div className="flex items-center gap-4">
            <Compass className="w-5 h-5 text-slate-400" />
            <span>Lihat Website</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300" />
        </NavLink>

        <div className="my-4 border-t border-slate-100 pt-4">
          <p className="px-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">Management</p>
          {NAV_ITEMS.map(({ path, label, icon: Icon, exact }) => (
            <NavLink
              key={path}
              to={path}
              end={exact}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) => `
                flex items-center justify-between px-5 py-3.5 rounded-2xl 
                transition-all duration-300 group relative text-sm font-semibold
                ${isActive
                  ? 'bg-blue-50/50 text-blue-600 font-bold'
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-800'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  {/* Indicator Line Aktif */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-7 bg-blue-600 rounded-r-full" />
                  )}
                  <div className="flex items-center gap-4 flex-1">
                    <Icon className={`w-5 h-5 transition-transform group-hover:scale-105 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-800'}`} />
                    <span>{label}</span>
                    {path === '/admin/chat' && unreadChatCount > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow-sm animate-pulse min-w-[20px] text-center">
                        {unreadChatCount}
                      </span>
                    )}
                    {path === '/admin/peminjaman' && pendingBookingCount > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow-sm animate-pulse min-w-[20px] text-center">
                        {pendingBookingCount}
                      </span>
                    )}
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-blue-600" />}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* User Info + Logout (Desain Minimalis Mewah) */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/30">
        
        {/* Akun Admin Card */}
        <div className="flex items-center gap-3.5 px-4 py-3.5 bg-white border border-slate-200/50 rounded-2xl shadow-sm mb-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-rose-600 to-orange-500 rounded-full flex items-center justify-center text-white font-extrabold text-sm shadow-inner flex-shrink-0">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="min-w-0">
            <p className="text-slate-800 text-sm font-extrabold truncate leading-tight mb-1">{user?.name || 'Administrator'}</p>
            <span className="inline-block text-[9px] font-extrabold text-rose-600 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded">
              Super Admin
            </span>
          </div>
        </div>

        {/* Tombol Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors font-extrabold text-sm border border-transparent hover:border-rose-100"
        >
          <LogOut className="w-4.5 h-4.5" />
          Keluar Ke Beranda
        </button>
      </div>

    </div>
  );

  return (
    <>
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200/50 fixed left-0 top-0 h-full z-40">
        <SidebarContent />
      </aside>

      {/* HAMBURGER BUTTON - Mobile */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 shadow-md hover:bg-slate-50"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* SIDEBAR MOBILE - Drawer */}
      {isMobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsMobileOpen(false)}
          />
          <aside className="lg:hidden fixed left-0 top-0 h-full w-64 bg-white z-50 animate-slide-up flex flex-col border-r border-slate-200">
            <button
              onClick={() => setIsMobileOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600"
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
