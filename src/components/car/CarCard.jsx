import { Link } from 'react-router-dom';
import { Users, Fuel, Settings, Star, CheckCircle, XCircle, Car } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';

// ============================================================
// KOMPONEN: CarCard
// Menampilkan kartu informasi singkat satu kendaraan.
// ============================================================
const CarCard = ({ car }) => {
  return (
    <div className="card group overflow-hidden flex flex-col">
      {/* Gambar Mobil */}
      <div className="relative overflow-hidden aspect-[16/10] bg-gray-100">
        <img
          src={car.image}
          alt={car.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            // Fallback jika gambar gagal dimuat
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        {/* Fallback placeholder */}
        <div
          className="absolute inset-0 hidden items-center justify-center bg-gradient-to-br from-primary-900 to-primary-700"
          aria-hidden="true"
        >
          <Car className="w-16 h-16 text-white/40" />
        </div>

        {/* Badge Tipe Kendaraan */}
        <div className="absolute top-3 left-3">
          <span className="bg-primary-800/90 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full">
            {car.type}
          </span>
        </div>

        {/* Badge Ketersediaan */}
        <div className="absolute top-3 right-3">
          {car.available ? (
            <span className="flex items-center gap-1 bg-green-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              <CheckCircle className="w-3 h-3" /> Tersedia
            </span>
          ) : (
            <span className="flex items-center gap-1 bg-red-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              <XCircle className="w-3 h-3" /> Tidak Tersedia
            </span>
          )}
        </div>
      </div>

      {/* Info Kendaraan */}
      <div className="p-5 flex flex-col flex-1">
        {/* Nama & Tahun */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-display font-bold text-gray-800 text-base leading-tight">
            {car.name}
          </h3>
          <span className="text-xs text-gray-400 whitespace-nowrap pt-0.5">{car.year}</span>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="text-sm font-semibold text-gray-700">{car.rating}</span>
          <span className="text-xs text-gray-400">({car.totalReviews} ulasan)</span>
        </div>

        {/* Spesifikasi Singkat */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="flex flex-col items-center gap-1 bg-gray-50 rounded-lg p-2">
            <Users className="w-4 h-4 text-primary-700" />
            <span className="text-xs text-gray-500">{car.capacity} Org</span>
          </div>
          <div className="flex flex-col items-center gap-1 bg-gray-50 rounded-lg p-2">
            <Settings className="w-4 h-4 text-primary-700" />
            <span className="text-xs text-gray-500 text-center leading-none">{car.transmission}</span>
          </div>
          <div className="flex flex-col items-center gap-1 bg-gray-50 rounded-lg p-2">
            <Fuel className="w-4 h-4 text-primary-700" />
            <span className="text-xs text-gray-500">{car.fuel}</span>
          </div>
        </div>

        {/* Harga & Tombol */}
        <div className="mt-auto flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-gray-400">Mulai dari</p>
            <p className="text-lg font-display font-bold text-primary-800">
              {formatCurrency(car.pricePerDay)}
            </p>
            <p className="text-xs text-gray-400">/ hari</p>
          </div>
          <Link
            to={`/mobil/${car.id}`}
            className={`
              px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
              ${car.available
                ? 'bg-primary-800 hover:bg-primary-700 text-white shadow-sm hover:shadow-card active:scale-95'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
              }
            `}
          >
            {car.available ? 'Lihat Detail' : 'Tidak Tersedia'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CarCard;
