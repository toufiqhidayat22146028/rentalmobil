import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, getErrorMessage } from '../services/api';

// ============================================================
// AUTH CONTEXT — Menggunakan Backend API (Express + JWT)
// ============================================================
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // User state — inisialisasi dari localStorage
  const [user, setUser] = useState(() => {
    try {
      const token = localStorage.getItem('rm_token');
      if (!token) return null;
      const saved = localStorage.getItem('rm_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  // Sinkronisasi user state ke localStorage setiap kali berubah
  useEffect(() => {
    if (user) localStorage.setItem('rm_user', JSON.stringify(user));
    else localStorage.removeItem('rm_user');
  }, [user]);

  // ──────────────────────────────────────────────────────────
  // Verifikasi token saat app pertama dimuat (re-fetch /me)
  // Memastikan data user selalu fresh dari server
  // ──────────────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('rm_token');
    if (!token) {
      if (user) logout();
      return;
    }
    if (user) return;

    authAPI.getMe()
      .then(({ data }) => {
        if (data.success) {
          setUser(data.user);
          localStorage.setItem('rm_user', JSON.stringify(data.user));
        }
      })
      .catch(() => {
        // Token invalid/expired → logout
        logout();
      });
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // ──────────────────────────────────────────────────────────
  // LOGIN
  // ──────────────────────────────────────────────────────────
  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const { data } = await authAPI.login(email, password);
      if (data.success) {
        localStorage.setItem('rm_token', data.token);
        localStorage.setItem('rm_user', JSON.stringify(data.user));
        setUser(data.user);
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: getErrorMessage(err) };
    } finally {
      setIsLoading(false);
    }
  };

  // ──────────────────────────────────────────────────────────
  // LOGOUT
  // ──────────────────────────────────────────────────────────
  const logout = () => {
    setUser(null);
    localStorage.removeItem('rm_token');
    localStorage.removeItem('rm_user');
  };

  // ──────────────────────────────────────────────────────────
  // REGISTER
  // ──────────────────────────────────────────────────────────
  const register = async (formData) => {
    setIsLoading(true);
    try {
      const { data } = await authAPI.register(formData);
      if (data.success) {
        localStorage.setItem('rm_token', data.token);
        localStorage.setItem('rm_user', JSON.stringify(data.user));
        setUser(data.user);
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: getErrorMessage(err) };
    } finally {
      setIsLoading(false);
    }
  };

  // ──────────────────────────────────────────────────────────
  // UPDATE PROFILE
  // ──────────────────────────────────────────────────────────
  const updateProfile = async (profileData) => {
    try {
      const { data } = await authAPI.updateProfile(profileData);
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('rm_user', JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: getErrorMessage(err) };
    }
  };

  // ──────────────────────────────────────────────────────────
  // CHANGE PASSWORD
  // ──────────────────────────────────────────────────────────
  const changePassword = async (newPassword) => {
    try {
      const { data } = await authAPI.changePassword(newPassword);
      return { success: data.success, message: data.message };
    } catch (err) {
      return { success: false, message: getErrorMessage(err) };
    }
  };

  const isAdmin    = user?.role === 'admin';
  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider value={{
      user, isLoggedIn, isAdmin, isLoading,
      login, logout, register, updateProfile, changePassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus digunakan di dalam AuthProvider');
  return ctx;
};

export default AuthContext;
