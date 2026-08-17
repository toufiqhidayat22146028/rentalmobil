import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import ChatbotWidget from '../components/chatbot/ChatbotWidget';
import { useAuth } from '../context/AuthContext';

// ============================================================
// KOMPONEN: UserLayout
// Layout wrapper untuk semua halaman yang dapat diakses publik.
// Strukturnya:
//   ┌──────────────┐
//   │   Navbar     │  <- Fixed di atas
//   ├──────────────┤
//   │   Konten     │  <- <Outlet/> dari React Router (halaman aktif)
//   │   Halaman    │
//   ├──────────────┤
//   │   Footer     │
//   └──────────────┘
//   [ChatbotWidget]   <- Fixed di pojok kanan bawah
// ============================================================
const UserLayout = () => {
  const { user } = useAuth();
  
  return (
    // min-h-screen: Pastikan layout memenuhi minimal tinggi viewport
    // flex flex-col: Susun elemen secara vertikal agar footer selalu di bawah
    <div className="min-h-screen flex flex-col bg-transparent">
      
      {/* NAVBAR - Komponen navigasi atas */}
      <Navbar />

      {/* 
        AREA KONTEN UTAMA
        pt-16: Padding atas sebesar tinggi navbar (h-16 = 64px)
              agar konten tidak tertutup oleh navbar yang fixed
        flex-1: Mengisi sisa ruang vertikal (mendorong footer ke bawah)
      */}
      <main className="flex-1 pt-16">
        {/* 
          <Outlet /> adalah placeholder dari React Router.
          React Router akan mengganti elemen ini dengan komponen halaman
          yang sesuai dengan URL yang sedang dikunjungi.
          Contoh: Jika URL = /katalog, maka Outlet = <CatalogPage />
        */}
        <Outlet />
      </main>

      {/* FOOTER - Bagian bawah halaman */}
      <Footer />

      {/* 
        CHATBOT WIDGET - Selalu tampil di semua halaman user
        Sembunyikan untuk role admin agar tidak mengganggu operasional.
      */}
      {user?.role !== 'admin' && <ChatbotWidget />}
    </div>
  );
};

export default UserLayout;
