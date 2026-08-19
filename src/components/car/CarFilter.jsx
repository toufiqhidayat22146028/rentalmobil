import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { CAR_TYPES, CAR_BRANDS } from '../../data/mockCars';

// ============================================================
// KOMPONEN: CarFilter
// Panel filter untuk katalog mobil.
// Props:
//   - filters: object { type, brand, transmission, minPrice, maxPrice, available }
//   - onChange: (key, value) => void
//   - onReset: () => void
//   - activeCount: number (jumlah filter aktif)
// ============================================================
const CarFilter = ({ filters, onChange, onReset, activeCount }) => {
  const transmissions = ['Manual', 'Matic'];
  const availabilities = [
    { label: 'Semua', value: '' },
    { label: 'Tersedia', value: 'true' },
    { label: 'Tidak Tersedia', value: 'false' },
  ];

  return (
    <div className="card p-5 sticky top-20">
      {/* Header Filter */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-primary-700" />
          <h3 className="font-display font-bold text-gray-800">Filter</h3>
          {activeCount > 0 && (
            <span className="bg-primary-800 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
          >
            <X className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>

      <div className="space-y-5">
        {/* Filter: Tipe Kendaraan */}
        <FilterSection title="Tipe Kendaraan">
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="type"
                value=""
                checked={filters.type === ''}
                onChange={(e) => onChange('type', e.target.value)}
                className="accent-primary-800 w-4 h-4"
              />
              <span className="text-sm text-gray-600 group-hover:text-primary-800 transition-colors">
                Semua Tipe
              </span>
            </label>
            {CAR_TYPES.map((type) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="type"
                  value={type}
                  checked={filters.type === type}
                  onChange={(e) => onChange('type', e.target.value)}
                  className="accent-primary-800 w-4 h-4"
                />
                <span className="text-sm text-gray-600 group-hover:text-primary-800 transition-colors">
                  {type}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        <hr className="border-gray-100" />

        {/* Filter: Brand */}
        <FilterSection title="Merek">
          <select
            value={filters.brand}
            onChange={(e) => onChange('brand', e.target.value)}
            className="form-input text-sm py-2"
          >
            <option value="">Semua Merek</option>
            {CAR_BRANDS.map((brand) => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
        </FilterSection>

        <hr className="border-gray-100" />

        {/* Filter: Transmisi */}
        <FilterSection title="Transmisi">
          <div className="flex gap-2">
            <button
              onClick={() => onChange('transmission', '')}
              className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${
                filters.transmission === '' 
                  ? 'bg-primary-800 text-white border-primary-800' 
                  : 'bg-white text-gray-600 border-gray-200 hover:border-primary-400'
              }`}
            >
              Semua
            </button>
            {transmissions.map((t) => (
              <button
                key={t}
                onClick={() => onChange('transmission', t)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${
                  filters.transmission === t 
                    ? 'bg-primary-800 text-white border-primary-800' 
                    : 'bg-white text-gray-600 border-gray-200 hover:border-primary-400'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </FilterSection>

        <hr className="border-gray-100" />

        {/* Filter: Ketersediaan */}
        <FilterSection title="Ketersediaan">
          <div className="space-y-2">
            {availabilities.map(({ label, value }) => (
              <label key={label} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="available"
                  value={value}
                  checked={filters.available === value}
                  onChange={(e) => onChange('available', e.target.value)}
                  className="accent-primary-800 w-4 h-4"
                />
                <span className="text-sm text-gray-600 group-hover:text-primary-800 transition-colors">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        <hr className="border-gray-100" />

        {/* Filter: Rentang Harga */}
        <FilterSection title="Harga Maksimum / Hari">
          <div>
            <input
              type="range"
              min={200000}
              max={1500000}
              step={50000}
              value={filters.maxPrice}
              onChange={(e) => onChange('maxPrice', Number(e.target.value))}
              className="w-full accent-primary-800"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Rp 200rb</span>
              <span className="font-semibold text-primary-800">
                Rp {(filters.maxPrice / 1000).toFixed(0)}rb
              </span>
              <span>Rp 1,5jt</span>
            </div>
          </div>
        </FilterSection>
      </div>
    </div>
  );
};

// Sub-komponen untuk judul setiap section filter
const FilterSection = ({ title, children }) => (
  <div>
    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">{title}</p>
    {children}
  </div>
);

export default CarFilter;
