import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Car, 
  Shield, 
  Clock, 
  Star, 
  MapPin,
  Users,
  CheckCircle,
  ChevronRight
} from 'lucide-react';

// ============================================================
// DATA STATISTIK - Ditampilkan di bagian statistik/counter
// ============================================================
const STATS = [
  { value: '500+', label: 'Armada Aktif', icon: Car },
  { value: '10K+', label: 'Pelanggan Puas', icon: Users },
  { value: '50+', label: 'Kota Tujuan', icon: MapPin },
  { value: '4.9', label: 'Rating Rata-rata', icon: Star },
];

// ============================================================
// DATA KEUNGGULAN LAYANAN
// ============================================================
const FEATURES = [
  {
    icon: Shield,
    title: 'Armada Terjamin',
    description: 'Semua kendaraan telah melalui inspeksi keselamatan dan diasuransikan penuh.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Clock,
    title: 'Layanan 24/7',
    description: 'Tim kami siap membantu kapan saja, termasuk darurat di tengah perjalanan.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: Car,
    title: 'Armada Lengkap',
    description: 'Dari city car hingga SUV premium, pilih yang sesuai kebutuhan Anda.',
    color: 'bg-primary-50 text-primary-700',
  },
  {
    icon: MapPin,
    title: 'Antar Jemput',
    description: 'Layanan pengantaran dan penjemputan mobil langsung ke lokasi Anda.',
    color: 'bg-purple-50 text-purple-600',
  },
];

// ============================================================
// DATA TESTIMONI PENGGUNA
// ============================================================
const TESTIMONIALS = [
  {
    id: 1,
    name: 'Rina Kusuma',
    location: 'Jakarta',
    rating: 5,
    text: 'Pelayanannya luar biasa! Mobil bersih, tepat waktu, dan harganya sangat terjangkau. Sangat rekomendasikan!',
    avatar: 'RK',
  },
  {
    id: 2,
    name: 'Budi Setiawan',
    location: 'Bandung',
    rating: 5,
    text: 'Proses peminjaman sangat mudah lewat website. Chatbot-nya juga responsif banget buat tanya-tanya info.',
    avatar: 'BS',
  },
  {
    id: 3,
    name: 'Sari Wulandari',
    location: 'Surabaya',
    rating: 5,
    text: 'Sudah 3x sewa di sini dan selalu puas. Armadanya terawat dan sopirnya profesional.',
    avatar: 'SW',
  },
];

// ============================================================
// KOMPONEN UTAMA: HomePage
// Halaman beranda / landing page sistem rental mobil
// ============================================================
const HomePage = () => {
  return (
    <div className="overflow-x-hidden">

      {/* ============================================================
          SECTION 1: HERO
          Latar belakang gradient hijau gelap dengan teks putih
          ============================================================ */}
      <section className="bg-hero-gradient min-h-[90vh] flex items-center relative overflow-hidden">
        
        {/* Dekorasi lingkaran latar belakang (visual effect) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-primary-400/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Kolom Kiri: Teks Hero */}
            <div className="animate-fade-in">
              {/* Badge kecil di atas judul */}
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-white/90 text-sm font-medium">
                  #1 Platform Rental Mobil Terpercaya
                </span>
              </div>

              {/* Judul utama hero */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-white leading-tight mb-6">
                Perjalanan Nyaman{' '}
                <span className="text-primary-300">
                  Dimulai di Sini
                </span>
              </h1>

              <p className="text-primary-100 text-lg leading-relaxed mb-8 max-w-lg">
                Temukan armada mobil terbaik untuk setiap kebutuhan perjalanan Anda. 
                Proses peminjaman mudah, harga transparan, dan layanan 24 jam.
              </p>

              {/* Tombol CTA */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/katalog" 
                  className="
                    inline-flex items-center justify-center gap-2
                    bg-white text-primary-800 font-bold
                    px-8 py-4 rounded-xl
                    hover:bg-primary-50 transition-all duration-200
                    shadow-lg hover:shadow-xl hover:-translate-y-0.5
                    text-base
                  "
                >
                  Lihat Katalog Mobil
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link 
                  to="/tentang" 
                  className="
                    inline-flex items-center justify-center gap-2
                    border-2 border-white/30 text-white font-semibold
                    px-8 py-4 rounded-xl
                    hover:bg-white/10 hover:border-white/50 
                    transition-all duration-200
                    text-base
                  "
                >
                  Cara Peminjaman
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>

              {/* Keuntungan singkat */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 mt-8">
                {['Tanpa DP', 'Asuransi Lengkap', 'Bisa Antar-Jemput'].map((benefit) => (
                  <div key={benefit} className="flex items-center gap-2 text-primary-200 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    {benefit}
                  </div>
                ))}
              </div>
            </div>

            {/* Kolom Kanan: Card Visual (Placeholder untuk gambar) */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative">
                {/* Kartu utama */}
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 w-80">
                  <div className="aspect-video bg-gradient-to-br from-primary-700 to-primary-500 rounded-2xl flex items-center justify-center mb-4">
                    <Car className="w-20 h-20 text-white/60" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-white/20 rounded-full w-3/4" />
                    <div className="h-3 bg-white/10 rounded-full w-1/2" />
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <div className="h-3 bg-white/10 rounded w-16 mb-1" />
                      <div className="h-5 bg-white/30 rounded w-24" />
                    </div>
                    <div className="bg-white/20 rounded-xl px-4 py-2">
                      <span className="text-white text-sm font-semibold">Pesan</span>
                    </div>
                  </div>
                </div>
                
                {/* Badge mengambang - Rating */}
                <div className="absolute -top-4 -right-4 bg-white rounded-2xl p-3 shadow-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center">
                      <Star className="w-4 h-4 text-white fill-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Rating</p>
                      <p className="font-bold text-gray-800 text-sm">4.9/5.0</p>
                    </div>
                  </div>
                </div>

                {/* Badge mengambang - Total armada */}
                <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-3 shadow-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-700 rounded-full flex items-center justify-center">
                      <Car className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Armada</p>
                      <p className="font-bold text-gray-800 text-sm">500+ Mobil</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 2: STATISTIK / COUNTER
          ============================================================ */}
      <section className="bg-white py-12 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map(({ value, label, icon: Icon }) => (
              <div key={label} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-3">
                  <Icon className="w-6 h-6 text-primary-700" />
                </div>
                <div className="text-3xl font-display font-bold text-primary-800 mb-1">{value}</div>
                <div className="text-sm text-gray-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 3: FITUR / KEUNGGULAN
          ============================================================ */}
      <section className="section-wrapper">
        <div className="text-center mb-12">
          <h2 className="section-title">Mengapa Memilih Kami?</h2>
          <p className="section-subtitle">
            Kami hadir dengan komitmen memberikan pengalaman rental terbaik
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="card p-6 text-center group">
              <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================
          SECTION 4: CTA (Call To Action) - Ajakan ke katalog
          ============================================================ */}
      <section className="bg-primary-800 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">
            Siap Memulai Perjalanan?
          </h2>
          <p className="text-primary-200 text-lg mb-8">
            Jelajahi ratusan pilihan mobil dan temukan yang paling sesuai kebutuhan Anda.
          </p>
          <Link
            to="/katalog"
            className="inline-flex items-center gap-2 bg-white text-primary-800 font-bold px-8 py-4 rounded-xl hover:bg-primary-50 transition-all duration-200 shadow-lg hover:-translate-y-0.5 text-base"
          >
            Mulai Cari Mobil
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ============================================================
          SECTION 5: TESTIMONI
          ============================================================ */}
      <section className="section-wrapper bg-gray-50">
        <div className="text-center mb-12">
          <h2 className="section-title">Kata Mereka</h2>
          <p className="section-subtitle">Ribuan pelanggan sudah mempercayai kami</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((testimonial) => (
            <div key={testimonial.id} className="card p-6">
              {/* Rating bintang */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-5 italic">
                "{testimonial.text}"
              </p>
              {/* Info reviewer */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-800 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{testimonial.name}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <MapPin className="w-3 h-3" />
                    {testimonial.location}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
