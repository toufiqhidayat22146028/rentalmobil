import { useState, useEffect } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Car,
  Menu,
  X,
  User,
  LogIn,
  ChevronDown,
  History,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoggedIn, isAdmin, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navLinks = [
    { path: "/", label: "Beranda" },
    { path: "/katalog", label: "Katalog Mobil" },
    { path: "/tentang", label: "Tentang Kami" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-md border-b border-gray-100 transition-all duration-300 ${isScrolled ? "shadow-2xl shadow-sm" : ""}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-64 h-16 overflow-hidden flex items-center justify-start transition-transform group-hover:scale-105">
              <img
                src="/logo-new.jpg"
                alt="Logo"
                className="w-full h-full object-contain object-left"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
          </Link>

          {/* Nav Desktop */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === "/"}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive ? "text-blue-600 bg-blue-50 font-semibold" : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"}`
                }
              >
                {link.label}
              </NavLink>
            ))}
            {/* Link Admin jika role admin */}
            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive ? "text-blue-600 bg-blue-50 font-semibold" : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"}`
                }
              >
                Admin Panel
              </NavLink>
            )}
          </div>

          {/* Aksi User - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user?.avatar || user?.name?.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user?.name?.split(" ")[0]}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isUserDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isUserDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-[-1]"
                      onClick={() => setIsUserDropdownOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-chatbot border border-gray-100 overflow-hidden animate-fade-in z-50">
                      <div className="px-4 py-3 border-b border-gray-100 bg-primary-50">
                        <p className="text-sm font-semibold text-primary-800">
                          {user?.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user?.email}
                        </p>
                      </div>
                      <div className="py-1">
                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-800 transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4" /> Dashboard
                            Admin
                          </Link>
                        )}
                        <Link
                          to="/profil"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-800 transition-colors"
                        >
                          <User className="w-4 h-4" /> Profil Saya
                        </Link>
                        <Link
                          to="/riwayat"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-800 transition-colors"
                        >
                          <History className="w-4 h-4" /> Riwayat Peminjaman
                        </Link>
                        <hr className="my-1 border-gray-100" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" /> Keluar
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 rounded-lg hover:bg-gray-50 transition-all"
                >
                  <LogIn className="w-4 h-4" /> Masuk
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium py-2 px-5 transition-all"
                >
                  Daftar Sekarang
                </Link>
              </>
            )}
          </div>

          {/* Hamburger Mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-300 hover:bg-gray-50 transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100 mt-1 animate-fade-in bg-white px-4 shadow-xl">
            <div className="flex flex-col gap-1 pt-3">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === "/"}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive ? "text-blue-600 bg-blue-50 font-semibold" : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                >
                  Admin Panel
                </Link>
              )}
            </div>
            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-100">
              {!isLoggedIn ? (
                <>
                  <Link
                    to="/login"
                    className="flex items-center gap-2 justify-center bg-gray-100 text-gray-700 rounded-lg text-sm py-2.5 font-medium hover:bg-gray-200 transition-all"
                  >
                    <LogIn className="w-4 h-4" />
                    Masuk
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center gap-2 justify-center bg-blue-600 text-white rounded-lg text-sm py-2.5 font-medium hover:bg-blue-700 transition-all"
                  >
                    Daftar Sekarang
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/profil"
                    className="btn-outline justify-center text-sm py-2.5"
                  >
                    <User className="w-4 h-4" />
                    Profil
                  </Link>
                  <Link
                    to="/riwayat"
                    className="btn-outline justify-center text-sm py-2.5"
                  >
                    <History className="w-4 h-4" />
                    Riwayat
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 border-2 border-red-200 rounded-lg hover:bg-red-50 transition-all"
                  >
                    <LogOut className="w-4 h-4" /> Keluar
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
