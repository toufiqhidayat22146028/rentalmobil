import { Link } from 'react-router-dom';
import { Car, Phone, Mail, MapPin, MessageCircle } from 'lucide-react';

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
            <Link to="/" className="flex items-center gap-2.5 mb-4 w-fit inline-block">
              <div className="h-24 w-fit bg-white/5 rounded-xl flex items-center justify-start p-2">
                <img src="/logo-new.jpg" alt="Logo" className="h-full w-auto object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
              </div>
            </Link>
            <p className="text-primary-200 text-sm leading-relaxed max-w-xs">
              Solusi terpercaya untuk kebutuhan transportasi Anda. 
              Mobil lengkap, harga terjangkau, pelayanan profesional 24/7.
            </p>
            {/* Sosial Media */}
            <div className="flex items-center gap-3 mt-5">
              <a
                href="https://wa.me/628566299954?text=Halo%20Admin%20Subulussalam%20Rent%20Car,%20saya%20memiliki%20pertanyaan%20seputar%20peminjaman%20mobil."
                target="_blank"
                rel="noreferrer"
                className="bg-white/10 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 w-fit text-sm font-medium"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp Kami
              </a>
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
                { icon: Phone, text: '0856-6299-954' },
                { icon: MapPin, text: 'Jl. Hamzah Fansuri No. 12, Dusun Rundeng Tengah, Kampong Pasar Rundeng, Kec. Rundeng, Kota Subulussalam, Aceh 27822' },
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-center text-center">
          <p className="text-primary-400 text-xs">
            © {currentYear} Subulussalam Rent Car. Hak Cipta Dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
