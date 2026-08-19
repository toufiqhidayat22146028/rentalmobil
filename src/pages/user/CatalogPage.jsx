// HALAMAN KATALOG MOBIL
// Di file ini sistem menampilkan daftar mobil, filter pencarian, dan logika pengurutan (sorting).

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, Grid3X3, List, Loader2 } from 'lucide-react';
import CarCard from '../../components/car/CarCard';
import CarFilter from '../../components/car/CarFilter';
import { carsAPI } from '../../services/api';

const DEFAULT_FILTERS = {
  type: '', brand: '', transmission: '', available: '', maxPrice: 1500000,
};

const SORT_OPTIONS = [
  { value: 'default', label: 'Urutkan: Default' },
  { value: 'price_asc', label: 'Harga: Termurah' },
  { value: 'price_desc', label: 'Harga: Termahal' },
  { value: 'rating', label: 'Rating Tertinggi' },
];

const CatalogPage = () => {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    ...DEFAULT_FILTERS,
    type: searchParams.get('type') || '',
    brand: searchParams.get('brand') || '',
    transmission: searchParams.get('transmission') || '',
  });
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [sort, setSort] = useState('default');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  // Sinkronkan filter jika parameter pencarian di URL berubah
  useEffect(() => {
    const typeParam = searchParams.get('type') || '';
    const brandParam = searchParams.get('brand') || '';
    const transParam = searchParams.get('transmission') || '';
    const qParam = searchParams.get('q') || '';
    
    setFilters((f) => ({
      ...f,
      type: typeParam,
      brand: brandParam,
      transmission: transParam,
    }));
    setSearch(qParam);
  }, [searchParams]);

  const [cars, setCars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleFilterChange = (key, value) => setFilters((f) => ({ ...f, [key]: value }));
  const handleReset = () => setFilters(DEFAULT_FILTERS);

  const activeFilterCount = Object.entries(filters).filter(([k, v]) =>
    k === 'maxPrice' ? v < 1500000 : v !== ''
  ).length;

  const fetchCars = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await carsAPI.getAll({
        type: filters.type,
        brand: filters.brand,
        transmission: filters.transmission,
        available: filters.available,
        maxPrice: filters.maxPrice,
        sort: sort,
        search: search,
      });
      if (res.data.success) {
        setCars(res.data.data);
      }
    } catch (err) {
      console.error('[Catalog] Gagal memuat kendaraan:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters, sort, search]);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Halaman */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-800 mb-1">Katalog Kendaraan</h1>
        <p className="text-gray-500">Temukan kendaraan yang sesuai kebutuhan perjalanan Anda</p>
      </div>

      {/* Search & Sort Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama mobil atau merek..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input pl-11 pr-4"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="form-input sm:w-52 py-3"
        >
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        {/* Toggle grid/list */}
        <div className="hidden sm:flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
          <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-primary-800 text-white' : 'text-gray-500 hover:text-gray-800'}`}>
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-primary-800 text-white' : 'text-gray-500 hover:text-gray-800'}`}>
            <List className="w-4 h-4" />
          </button>
        </div>
        {/* Tombol filter mobile */}
        <button
          onClick={() => setShowMobileFilter(true)}
          className="lg:hidden flex items-center gap-2 btn-outline py-3"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filter {activeFilterCount > 0 && <span className="bg-primary-800 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{activeFilterCount}</span>}
        </button>
      </div>

      <div className="flex gap-6">
        {/* Filter Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-20 h-[calc(100vh-6rem)] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300 pr-2">
          <CarFilter filters={filters} onChange={handleFilterChange} onReset={handleReset} activeCount={activeFilterCount} />
        </aside>

        {/* Grid / List Mobil */}
        <div className="flex-1 min-w-0">
          {/* Hasil */}
          <p className="text-sm text-gray-500 mb-4">
            Menampilkan <span className="font-semibold text-gray-700">{cars.length}</span> kendaraan
          </p>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white border border-gray-100 rounded-xl shadow-soft">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-slate-400 text-sm font-medium">Memuat kendaraan...</p>
            </div>
          ) : cars.length === 0 ? (
            <div className="text-center py-20 card">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-600 mb-1">Kendaraan Tidak Ditemukan</h3>
              <p className="text-gray-400 text-sm">Coba ubah filter atau kata pencarian Anda</p>
              <button onClick={() => { handleReset(); setSearch(''); }} className="btn-primary mt-4">
                Reset Filter
              </button>
            </div>
          ) : (
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5'
                : 'flex flex-col gap-4'
            }>
              {cars.map((car) => <CarCard key={car.id} car={car} />)}
            </div>
          )}
        </div>
      </div>

      {/* Filter Modal - Mobile */}
      {showMobileFilter && (
        <div className="fixed inset-0 z-[90] flex lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilter(false)} />
          <div className="relative ml-auto w-80 max-w-full h-full bg-white overflow-y-auto p-5 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-gray-800">Filter Kendaraan</h3>
              <button onClick={() => setShowMobileFilter(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <CarFilter filters={filters} onChange={handleFilterChange} onReset={handleReset} activeCount={activeFilterCount} />
            <button onClick={() => setShowMobileFilter(false)} className="btn-primary w-full justify-center mt-5">
              Terapkan Filter
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogPage;
