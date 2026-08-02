import { Link } from 'react-router-dom';
import { Car, Phone, Mail, MapPin, Instagram, Facebook, Twitter } from 'lucide-react';

// ============================================================
// KOMPONEN: Footer
// Menampilkan informasi perusahaan, navigasi cepat, dan kontak
// ============================================================
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-900 text-white">
      {/* Area konten utama footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Kolom 1: Branding & Deskripsi */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4 w-fit">
              <div className="w-64 h-24 bg-white/5 rounded-xl flex items-center justify-start p-2">
                <img src="/logo-light.svg?v=3" alt="Logo" className="w-full h-full object-contain object-left" onError={(e) => { e.target.style.display = 'none'; }} />
              </div>
            </Link>
            <p className="text-primary-200 text-sm leading-relaxed max-w-xs">
              Solusi terpercaya untuk kebutuhan transportasi Anda. 
              Armada lengkap, harga terjangkau, pelayanan profesional 24/7.
            </p>
            {/* Sosial Media */}
            <div className="flex items-center gap-3 mt-5">
              {[
                { icon: Instagram, label: 'Instagram', href: '#' },
                { icon: Facebook, label: 'Facebook', href: '#' },
                { icon: Twitter, label: 'Twitter / X', href: '#' },
              ].map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="w-9 h-9 bg-white/10 hover:bg-primary-700 rounded-lg flex items-center justify-center transition-colors duration-200"
                  aria-label={label}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Kolom 2: Navigasi Cepat */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              Navigasi
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Beranda', path: '/' },
                { label: 'Katalog Mobil', path: '/katalog' },
                { label: 'Cara Peminjaman', path: '/tentang' },
                { label: 'Tentang Kami', path: '/tentang' },
                { label: 'Kontak', path: '/kontak' },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.path}
                    className="text-primary-300 hover:text-white text-sm transition-colors duration-200 hover:pl-1"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolom 3: Kontak */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              Hubungi Kami
            </h4>
            <ul className="space-y-3">
              {[
                { icon: Phone, text: '0812-3456-7890' },
                { icon: Mail, text: 'info@subulussalam.com' },
                { icon: MapPin, text: 'Jl. Contoh No.1, Kota Anda' },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3">
                  <Icon className="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" />
                  <span className="text-primary-200 text-sm">{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Garis bawah copyright */}
      <div className="border-t border-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-primary-400 text-xs">
            © {currentYear} Subulussalam Rent Car. Hak Cipta Dilindungi.
          </p>
          <p className="text-primary-400 text-xs">
            Dibuat dengan ❤️ menggunakan React JS & Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
