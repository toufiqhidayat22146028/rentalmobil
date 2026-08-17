import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, 
  Car, 
  ShieldCheck, 
  Clock, 
  Check, 
  ChevronRight,
  ArrowRight,
  Loader2,
  MessageCircle,
  Star,
  Tag
} from 'lucide-react';
import { carsAPI } from '../../services/api';
import CarCard from '../../components/car/CarCard';

const HomePage = () => {
  const navigate = useNavigate();

  // State untuk pencarian cepat di Hero Section
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedTransmission, setSelectedTransmission] = useState('');

  // Ambil 4 mobil unggulan dari database untuk ditampilkan
  const [featuredCars, setFeaturedCars] = useState([]);
  const [isLoadingCars, setIsLoadingCars] = useState(true);

  useEffect(() => {
    const fetchFeaturedCars = async () => {
      try {
        const res = await carsAPI.getAll({ available: 'true' });
        if (res.data.success) {
          setFeaturedCars(res.data.data.slice(0, 4));
        }
      } catch (err) {
        console.error('[Home] Gagal memuat mobil unggulan:', err);
      } finally {
        setIsLoadingCars(false);
      }
    };
    fetchFeaturedCars();
  }, []);

  // Daftar tipe & transmisi unik untuk dropdown pencarian
  const CAR_TYPES = ['Sedan', 'SUV', 'MPV', 'City Car', 'Luxury'];
  const TRANSMISSIONS = ['Manual', 'Automatic'];

  // Handler Submit Pencarian Utama
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    let queryParams = [];
    if (searchQuery) queryParams.push(`q=${encodeURIComponent(searchQuery)}`);
    if (selectedType) queryParams.push(`type=${encodeURIComponent(selectedType)}`);
    if (selectedTransmission) queryParams.push(`transmission=${encodeURIComponent(selectedTransmission)}`);
    
    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
    navigate(`/katalog${queryString}`);
  };

  return (
    <div className="min-h-screen font-sans bg-transparent">

      {/* =======================================================================
          1. HERO SECTION (BANNER UTAMA DENGAN SEARCH WIDGET)
          ======================================================================= */}
      <header className="relative bg-transparent overflow-hidden pt-12 pb-20 lg:py-32">
        {/* Lingkaran Pendar Latar Belakang */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-[300px] h-[300px] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Kolom Kiri: Teks & Headline */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 rounded-full text-blue-400 text-xs font-bold uppercase tracking-wider">
                <Check className="w-3.5 h-3.5" />
                Layanan Sewa Mobil Terpercaya
              </div>
              <h1 className="font-display font-black text-slate-900 text-4xl sm:text-5xl lg:text-6xl leading-[1.1] tracking-tight">
                Sewa Mobil Impian Anda dengan <span className="text-blue-600">Mudah & Cepat</span>
              </h1>
              <p className="text-slate-600 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 font-medium">
                Sewa mobil impian Anda dengan harga terbaik, proses cepat kurang dari 5 menit, dan layanan pelanggan 24 jam penuh. Nyaman, aman, dan terpercaya.
              </p>
              
              {/* Fitur Singkat Elegan */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-6 pt-4 text-slate-900 text-xs font-bold uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">✓</div>
                  <span>Tanpa Biaya Tersembunyi</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">✓</div>
                  <span>Layanan Antar Rumah</span>
                </div>
              </div>
            </div>

              {/* Kolom Kanan: Visual Mobil Mewah (Dynamic 3D) */}
              <div className="lg:col-span-5 relative flex justify-center items-center mt-16 lg:mt-0">
                {/* Dekorasi Latar Belakang (Glowing Podium) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] bg-gradient-to-tr from-blue-500 to-cyan-300 rounded-full blur-[80px] opacity-30 animate-pulse" />
                
                {/* Kontainer Gambar Utama (Tanpa Kotak) */}
                <div className="relative w-full max-w-[500px] lg:max-w-none flex items-center justify-center">
                  <img
                    src="https://icms.bumenredjaabadi.com/assets/cars/thumbnail/car-thumbnail-1636964034.png"
                    alt="Mitsubishi Xpander"
                    className="relative z-10 w-full h-auto max-h-[350px] object-contain transform hover:scale-110 transition-transform duration-700 drop-shadow-[0_25px_35px_rgba(0,0,0,0.35)]"
                  />
                  
                  {/* Badge Mengambang 1: Kualitas Premium */}
                  <div className="absolute top-0 right-0 sm:-right-4 z-20 bg-white/80 backdrop-blur-md border border-white/50 px-4 py-3 rounded-2xl flex items-center gap-3 shadow-xl animate-[bounce_3s_infinite]">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-inner">
                      <Car className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-slate-800 text-sm font-bold tracking-wide">Kualitas Premium</p>
                      <p className="text-slate-500 text-xs font-medium">Siap Disewa</p>
                    </div>
                  </div>

                  {/* Badge Mengambang 2: Kondisi */}
                  <div className="absolute bottom-10 left-0 sm:-left-8 z-20 bg-white/80 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border border-white/50 flex items-center gap-3 animate-[bounce_4s_infinite]" style={{ animationDelay: '1s' }}>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center shadow-inner">
                      <Star className="w-5 h-5 text-white fill-current" />
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs font-medium">Kondisi Mesin</p>
                      <p className="text-slate-800 text-sm font-bold">Terawat Prima</p>
                    </div>
                  </div>

                  {/* Badge Mengambang 3: Harga */}
                  <div className="absolute -bottom-6 right-10 z-20 bg-white/80 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border border-white/50 flex items-center gap-3 animate-[bounce_3.5s_infinite]" style={{ animationDelay: '0.5s' }}>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-inner">
                      <Tag className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs font-medium">Harga Terbaik</p>
                      <p className="text-slate-800 text-sm font-bold">Terjangkau</p>
                    </div>
                  </div>

                </div>
              </div>

          </div>

          {/* =======================================================================
              SEARCH / BOOKING WIDGET (OVERLAY DI HERO BANNER)
              ======================================================================= */}
          <div className="mt-16 bg-white/95 backdrop-blur-md border border-slate-200 shadow-2xl rounded-3xl p-6 sm:p-8 max-w-5xl mx-auto">
            <h2 className="font-display font-extrabold text-slate-800 text-lg sm:text-xl mb-5 text-center sm:text-left flex items-center gap-2 justify-center sm:justify-start">
              <Car className="w-5 h-5 text-blue-600" />
              Cari & Sewa Mobil Sekarang
            </h2>
            
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Input Pencarian Nama/Merek */}
              <div className="relative">
                <label className="block text-[10px] font-extrabold uppercase text-slate-600 tracking-wider mb-2">Nama / Merek Mobil</label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input
                    type="text"
                    placeholder="Contoh: Innova, Honda..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-700 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold"
                  />
                </div>
              </div>

              {/* Pilihan Kategori */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-600 tracking-wider mb-2">Tipe Mobil</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold appearance-none cursor-pointer"
                >
                  <option value="">Semua Tipe</option>
                  {CAR_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Pilihan Transmisi */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-600 tracking-wider mb-2">Transmisi</label>
                <select
                  value={selectedTransmission}
                  onChange={(e) => setSelectedTransmission(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold appearance-none cursor-pointer"
                >
                  <option value="">Semua Transmisi</option>
                  {TRANSMISSIONS.map(trans => (
                    <option key={trans} value={trans}>{trans}</option>
                  ))}
                </select>
              </div>

              {/* Tombol Cari */}
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm py-3.5 px-6 rounded-xl transition-all duration-300 shadow-md shadow-blue-500/20 hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
                >
                  Cari Kendaraan
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

        </div>
      </header>

      {/* =======================================================================
          2. FEATURE SECTION: "MENGAPA MEMILIH KAMI" (3 POIN MINIMALIS)
          ======================================================================= */}
      <section className="py-20 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
            <h2 className="font-display font-black text-slate-800 text-2xl sm:text-3xl tracking-tight">
              Mengapa Memilih Kami?
            </h2>
            <p className="text-slate-600 text-sm font-medium">
              Kami menawarkan layanan transportasi terbaik untuk menjamin kepuasan dan keselamatan Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Poin 1 */}
            <div className="bg-white/60 backdrop-blur-lg border border-white/50 rounded-3xl p-8 hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                <Car className="w-6 h-6" />
              </div>
              <h3 className="font-display font-extrabold text-slate-800 text-lg mb-3">Mobil Prima & Bersih</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Semua unit kendaraan kami melewati inspeksi berkala yang ketat, dicuci bersih, dan disinfeksi sebelum diserahkan kepada Anda.
              </p>
            </div>

            {/* Poin 2 */}
            <div className="bg-white/60 backdrop-blur-lg border border-white/50 rounded-3xl p-8 hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-display font-extrabold text-slate-800 text-lg mb-3">Harga Jujur & Transparan</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Tidak ada biaya tambahan atau tersembunyi. Tarif sewa yang Anda lihat di formulir booking adalah harga final yang Anda bayar.
              </p>
            </div>

            {/* Poin 3 */}
            <div className="bg-white/60 backdrop-blur-lg border border-white/50 rounded-3xl p-8 hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-display font-extrabold text-slate-800 text-lg mb-3">Layanan CS & Bantuan 24 Jam</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Butuh bantuan di jalan atau memiliki pertanyaan darurat? Tim customer service kami siap melayani Anda kapan pun melalui chatbot.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* =======================================================================
          3. FEATURED CARS SECTION (GRID 4 MOBIL TERBAIK)
          ======================================================================= */}
      <section className="py-20 bg-transparent border-t border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-12">
            <div>
              <h2 className="font-display font-black text-slate-800 text-2xl sm:text-3xl tracking-tight">
                Pilihan Mobil Unggulan
              </h2>
              <p className="text-slate-600 text-sm font-medium mt-1">
                Jelajahi mobil terbaik kami yang siap dipinjam hari ini.
              </p>
            </div>
            
            <Link
              to="/katalog"
              className="inline-flex items-center gap-1 text-sm font-extrabold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Lihat Semua Mobil
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Grid Mobil */}
          {isLoadingCars ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-slate-600 text-sm font-medium">Memuat mobil pilihan...</p>
            </div>
          ) : featuredCars.length === 0 ? (
            <div className="text-center py-12 text-slate-600 text-sm">
              Tidak ada mobil unggulan yang tersedia saat ini.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredCars.map(car => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          )}

        </div>
      </section>

      {/* =======================================================================
          4. GLASSMORPHIC SUBSCRIBE BANNER (PENGERTIAN LEBIH SEDIKIT / BERSIH)
          ======================================================================= */}
      <section className="py-16 bg-transparent">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-white/60 backdrop-blur-xl border border-white/50 rounded-[2.5rem] p-8 sm:p-12 overflow-hidden shadow-2xl flex flex-col md:flex-row justify-between items-center gap-8 group">
            
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-[350px] h-[350px] bg-green-500/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="max-w-md text-center md:text-left z-10">
              <h2 className="text-slate-900 font-display font-black text-2xl sm:text-3xl leading-tight mb-3">
                Butuh Bantuan Memilih Mobil?
              </h2>
              <p className="text-slate-600 text-sm font-medium">
                Jangan ragu! Hubungi admin kami sekarang untuk konsultasi gratis atau menanyakan ketersediaan mobil untuk perjalanan Anda.
              </p>
            </div>

            <div className="w-full max-w-sm z-10 flex justify-center md:justify-end">
              <a
                href="https://wa.me/628566299954?text=Halo%20Admin%20Subulussalam%20Rent%20Car,%20saya%20ingin%20berkonsultasi%20seputar%20pilihan%20mobil."
                target="_blank"
                rel="noreferrer"
                className="bg-green-500 hover:bg-green-600 text-white font-extrabold text-sm px-6 py-4 rounded-xl transition-all duration-300 hover:shadow-lg active:scale-95 whitespace-nowrap flex items-center justify-center gap-3 w-full sm:w-auto"
              >
                <MessageCircle className="w-5 h-5" />
                Chat Admin Sekarang
              </a>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
