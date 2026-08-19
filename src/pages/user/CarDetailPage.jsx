// HALAMAN DETAIL MOBIL & PEMESANAN
// Di file ini terjadi logika perhitungan total harga = durasi hari * harga sewa.

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Users, Settings, Fuel, Star, CheckCircle, XCircle,
  Car, Calendar, UserCheck, ChevronRight, Shield, MapPin, Loader2
} from 'lucide-react';
import { carsAPI } from '../../services/api';
import { formatCurrency } from '../../utils/formatCurrency';
import { calculateDays, getTodayString, getMinReturnDate, getMaxBookingDate, getMaxReturnDate } from '../../utils/dateHelper';
import { useAuth } from '../../context/AuthContext';

const CarDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [car, setCar] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [withDriver, setWithDriver] = useState(false);
  const [usageArea, setUsageArea] = useState('dalam_kota');

  useEffect(() => {
    const fetchCarDetail = async () => {
      setIsLoading(true);
      try {
        const [res, reviewsRes] = await Promise.all([
          carsAPI.getById(id),
          fetch(`/api/cars/${id}/reviews`).then(r => r.json())
        ]);
        if (res.data.success) {
          setCar(res.data.data);
        }
        if (reviewsRes.success) {
          setReviews(reviewsRes.data);
        }
      } catch (err) {
        console.error('[CarDetail] Gagal memuat detail mobil:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCarDetail();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="text-gray-500 font-medium">Memuat detail kendaraan...</span>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">Kendaraan Tidak Ditemukan</h2>
          <Link to="/katalog" className="btn-primary mt-4">Kembali ke Katalog</Link>
        </div>
      </div>
    );
  }

  const days = startDate && endDate ? calculateDays(startDate, endDate) : 0;
  const carCost = days > 0 ? car?.pricePerDay * days : 0;
  const driverCost = withDriver && days > 0 ? car?.driverCostPerDay * days : 0;
  const outOfTownCost = usageArea === 'luar_kota' && days > 0 ? 150000 * days : 0;
  const totalCost = carCost + driverCost + outOfTownCost;

  const handleBooking = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    navigate(`/peminjaman/${car.id}`, { 
      state: { car, startDate, endDate, days, withDriver, totalCost, usageArea } 
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-primary-700">Beranda</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to="/katalog" className="hover:text-primary-700">Katalog</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-800 font-medium">{car.name}</span>
      </div>

      {/* Back button mobile */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-primary-700 font-medium mb-6 hover:underline lg:hidden">
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* === KOLOM KIRI: Detail Mobil === */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gambar */}
          <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-gray-100 shadow-card">
            <img
              src={car.image || undefined}
              alt={car.name}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>

          {/* Header Info */}
          <div className="card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-slate-900 text-white text-xs font-semibold px-2.5 py-1 rounded-full">{car.type}</span>
                  <span className="text-xs text-gray-400">{car.brand} • {car.year}</span>
                </div>
                <h1 className="text-2xl font-display font-bold text-gray-800">{car.name}</h1>
              </div>
              <div className="flex items-center">
                {car.isMaintenance ? (
                  <span className="flex items-center gap-1.5 bg-amber-100 text-amber-700 text-sm font-semibold px-3 py-1.5 rounded-full border border-amber-200">
                    <CheckCircle className="w-4 h-4" /> Sedang Perbaikan
                  </span>
                ) : car.available ? (
                  <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-sm font-semibold px-3 py-1.5 rounded-full border border-emerald-200">
                    <CheckCircle className="w-4 h-4" /> Tersedia
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 bg-red-50 text-red-700 text-sm font-semibold px-3 py-1.5 rounded-full border border-red-200">
                    <XCircle className="w-4 h-4" /> Tidak Tersedia
                  </span>
                )}
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-5">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map((i) => (
                  <Star key={i} className={`w-4 h-4 ${i <= Math.round(car.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                ))}
              </div>
              <span className="font-semibold text-gray-700">{car.rating}</span>
              <span className="text-gray-400 text-sm">({car.totalReviews} ulasan)</span>
            </div>

            {/* Spesifikasi Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-5">
              {[
                { icon: Users, label: `${car.capacity} Penumpang` },
                { icon: Settings, label: car.transmission },
                { icon: Fuel, label: car.fuel },
                { icon: Car, label: car.specs?.engine || 'Mesin' },
                { icon: Shield, label: 'Diasuransikan' },
                { icon: MapPin, label: 'Antar-Jemput' },
              ].map(({ icon: Icon, label }, idx) => (
                <div key={`${label}-${idx}`} className="flex flex-col items-center gap-1 bg-gray-50 rounded-xl p-3 text-center">
                  <Icon className="w-5 h-5 text-blue-600" />
                  <span className="text-xs text-gray-600 leading-tight">{label}</span>
                </div>
              ))}
            </div>

            {/* Deskripsi */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Deskripsi</h3>
              {car.description ? (
                <p className="text-gray-600 text-sm leading-relaxed">{car.description}</p>
              ) : (
                <p className="text-sm text-gray-400 italic">Belum ada deskripsi untuk mobil ini.</p>
              )}
            </div>
          </div>

          {/* Fitur Kendaraan */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Fitur & Fasilitas</h3>
            {car.features && car.features.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {car.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-primary-600 flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">Belum ada informasi fitur ditambahkan.</p>
            )}
          </div>

          {/* Spesifikasi Teknis */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Spesifikasi Teknis</h3>
            {car.specs && Object.keys(car.specs).length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(car.specs).map(([k, v], idx) => (
                  <div key={`${k}-${idx}`} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 capitalize">{k}</p>
                    <p className="text-sm font-semibold text-gray-700">{v}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">Belum ada informasi spesifikasi teknis ditambahkan.</p>
            )}
          </div>

          {/* Ulasan Pelanggan */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              Ulasan Pelanggan ({reviews.length})
            </h3>
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold uppercase">
                          {r.userName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{r.userName}</p>
                          <p className="text-xs text-gray-400">{new Date(r.dibuat_pada).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className={`w-3.5 h-3.5 ${star <= r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    </div>
                    {r.komentar && (
                      <p className="text-sm text-gray-600 mt-2 italic">"{r.komentar}"</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">Belum ada ulasan untuk mobil ini.</p>
            )}
          </div>
        </div>

        {/* === KOLOM KANAN: Booking Panel === */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-20">
            <h3 className="font-display font-bold text-gray-800 text-lg mb-5">Hitung Biaya Sewa</h3>

            {/* Harga Dasar */}
            <div className="bg-primary-50 rounded-xl p-4 mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Harga sewa / hari</p>
                <p className="text-2xl font-display font-bold text-primary-800">{formatCurrency(car.pricePerDay)}</p>
              </div>
              <Car className="w-8 h-8 text-primary-300" />
            </div>

            {/* Date Picker */}
            <div className="space-y-3 mb-4">
              <div>
                <label className="form-label flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary-700" /> Tanggal Mulai
                </label>
                <input
                  type="date"
                  min={getTodayString()}
                  max={getMaxBookingDate(7)}
                  value={startDate}
                  onChange={(e) => { setStartDate(e.target.value); setEndDate(''); }}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary-700" /> Tanggal Kembali
                </label>
                <input
                  type="date"
                  min={startDate ? getMinReturnDate(startDate) : getTodayString()}
                  max={startDate ? getMaxReturnDate(startDate, 14) : getMaxBookingDate(14)}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={!startDate}
                  className="form-input disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Opsi Dengan Sopir */}
            <div
              onClick={() => setWithDriver(!withDriver)}
              className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all mb-5 ${
                withDriver ? 'border-primary-800 bg-primary-50' : 'border-gray-200 hover:border-primary-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <UserCheck className={`w-5 h-5 ${withDriver ? 'text-primary-700' : 'text-gray-400'}`} />
                <div>
                  <p className="text-sm font-semibold text-gray-700">Dengan Sopir</p>
                  <p className="text-xs text-gray-400">+{formatCurrency(car.driverCostPerDay)}/hari</p>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                withDriver ? 'border-primary-800 bg-primary-800' : 'border-gray-300'
              }`}>
                {withDriver && <CheckCircle className="w-3 h-3 text-white" />}
              </div>
            </div>

            {/* Area Pemakaian */}
            <div className="mb-5">
              <label className="form-label flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-primary-700" /> Area Pemakaian
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setUsageArea('dalam_kota')}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    usageArea === 'dalam_kota' ? 'border-primary-800 bg-primary-50' : 'border-gray-200 hover:border-primary-300'
                  }`}
                >
                  <p className="text-sm font-semibold text-gray-700">Dalam Kota</p>
                  <p className="text-xs text-gray-400">Harga Normal</p>
                </button>
                <button
                  onClick={() => setUsageArea('luar_kota')}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    usageArea === 'luar_kota' ? 'border-primary-800 bg-primary-50' : 'border-gray-200 hover:border-primary-300'
                  }`}
                >
                  <p className="text-sm font-semibold text-gray-700">Luar Kota</p>
                  <p className="text-xs text-gray-400">+Rp 150.000/hari</p>
                </button>
              </div>
            </div>

            {/* Kalkulasi Biaya */}
            {days > 0 && (
              <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>{formatCurrency(car.pricePerDay)} × {days} hari</span>
                  <span>{formatCurrency(carCost)}</span>
                </div>
                {withDriver && (
                  <div className="flex justify-between text-gray-600">
                    <span>Sopir × {days} hari</span>
                    <span>{formatCurrency(driverCost)}</span>
                  </div>
                )}
                {usageArea === 'luar_kota' && (
                  <div className="flex justify-between text-gray-600">
                    <span>Biaya Luar Kota × {days} hari</span>
                    <span>{formatCurrency(outOfTownCost)}</span>
                  </div>
                )}
                <hr className="border-gray-200" />
                <div className="flex justify-between font-bold text-gray-800 text-base">
                  <span>Total</span>
                  <span className="text-primary-800">{formatCurrency(totalCost)}</span>
                </div>
              </div>
            )}

            {/* Tombol Pesan */}
            <button
              onClick={handleBooking}
              disabled={car.isMaintenance || !car.available || !startDate || !endDate}
              className="btn-primary w-full justify-center disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {car.isMaintenance ? 'Dalam Perbaikan' : !car.available ? 'Tidak Tersedia' : !isLoggedIn ? 'Masuk untuk Memesan' : 'Pesan Sekarang'}
            </button>
            {!isLoggedIn && (
              <p className="text-xs text-center text-gray-400 mt-2">
                Belum punya akun? <Link to="/register" className="text-primary-700 font-medium hover:underline">Daftar gratis</Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetailPage;
