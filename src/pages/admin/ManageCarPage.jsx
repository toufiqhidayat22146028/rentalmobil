// HALAMAN KELOLA MOBIL (ADMIN)
// Di file ini admin bisa melakukan CRUD (Tambah, Edit, Hapus) dan mengatur Prioritas Tampilan.

import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Search, Loader2, X, Wrench } from 'lucide-react';
import Modal from '../../components/common/Modal';
import { carsAPI, uploadAPI, getErrorMessage } from '../../services/api';
import { formatCurrency } from '../../utils/formatCurrency';

const CAR_TYPES = ['MPV', 'SUV', 'City Car', 'Sedan', 'Luxury'];
const TRANSMISSIONS = ['Manual', 'Otomatis'];
const FUELS = ['Bensin', 'Diesel', 'Hybrid'];

const EMPTY_FORM = {
  name: '', brand: '', type: 'MPV', year: 2023, capacity: 5,
  transmission: 'Manual', fuel: 'Bensin', pricePerDay: '',
  driverCostPerDay: 150000, available: true, priority: 0, description: '',
  color: '', plateNumber: '', image: '', features: [], specs: {},
  imageFile: null, imagePreview: '',
};

const ManageCarPage = () => {
  const [cars, setCars]             = useState([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [search, setSearch]         = useState('');
  const [showModal, setShowModal]   = useState(false);
  const [editCar, setEditCar]       = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');
  const [featInput, setFeatInput]   = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchCars = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await carsAPI.getAll();
      if (data.success) setCars(data.data);
    } finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchCars(); }, [fetchCars]);

  const filtered = cars.filter(c =>
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.brand.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd  = () => { setEditCar(null); setForm(EMPTY_FORM); setError(''); setShowModal(true); };
  const openEdit = (car) => {
    setEditCar(car);
    setForm({
      name: car.name, brand: car.brand, type: car.type, year: car.year,
      capacity: car.capacity, transmission: car.transmission, fuel: car.fuel,
      pricePerDay: car.pricePerDay || car.price_per_day,
      driverCostPerDay: car.driverCostPerDay || car.driver_cost_per_day,
      available: car.available, priority: car.priority || 0, description: car.description, color: car.color,
      plateNumber: car.plateNumber || car.plate_number, image: car.image,
      features: [...(car.features || [])], specs: { ...(car.specs || {}) },
      imageFile: null, imagePreview: '',
    });
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.brand || !form.pricePerDay) {
      setError('Nama, merek, dan harga wajib diisi.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      let finalImageUrl = form.image;
      
      // Upload image first if there is a new file
      if (form.imageFile) {
        setUploadingImage(true);
        const { data } = await uploadAPI.uploadImage(form.imageFile);
        if (data.success) {
          finalImageUrl = data.url;
        } else {
          throw new Error('Gagal mengunggah gambar');
        }
      }

      const payload = { ...form, image: finalImageUrl };

      let res;
      if (editCar) {
        res = await carsAPI.update(editCar.id, payload);
      } else {
        res = await carsAPI.create(payload);
      }
      if (res.data.success) {
        fetchCars();
        setShowModal(false);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally { 
      setSaving(false); 
      setUploadingImage(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus kendaraan ini?')) return;
    try {
      await carsAPI.remove(id);
      setCars(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const handleToggle = async (id) => {
    try {
      const { data } = await carsAPI.toggleAvailability(id);
      if (data.success) {
        setCars(prev => prev.map(c => c.id === id ? { ...c, available: data.available } : c));
      }
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const handleMaintenanceToggle = async (car) => {
    try {
      const confirmMessage = car.isMaintenance 
        ? 'Selesaikan perbaikan dan kembalikan status mobil?' 
        : 'Tandai mobil ini dalam masa perbaikan? (Mobil tidak akan bisa disewa)';
        
      if (!window.confirm(confirmMessage)) return;

      const { data } = await carsAPI.toggleMaintenance(car.id, !car.isMaintenance);
      if (data.success) {
        setCars(prev => prev.map(c => c.id === car.id ? { 
          ...c, 
          isMaintenance: !car.isMaintenance,
          available: !car.isMaintenance ? false : true // Jika masuk perbaikan, tidak tersedia. Jika selesai, tersedia.
        } : c));
      }
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const addFeature = () => {
    if (featInput.trim() && !form.features.includes(featInput.trim())) {
      setForm(f => ({ ...f, features: [...f.features, featInput.trim()] }));
      setFeatInput('');
    }
  };

  const removeFeature = (feat) => setForm(f => ({ ...f, features: f.features.filter(x => x !== feat) }));

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Tampilkan preview lokal langsung
    const previewUrl = URL.createObjectURL(file);
    setForm(f => ({ ...f, imageFile: file, imagePreview: previewUrl }));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-800">Kelola Kendaraan</h1>
          <p className="text-gray-500 text-sm">{cars.length} kendaraan terdaftar</p>
        </div>
        <button onClick={openAdd} className="btn-primary text-sm py-2.5"><Plus className="w-4 h-4" /> Tambah Kendaraan</button>
      </div>

      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama atau merek..." className="form-input pl-11" />
      </div>

      {isLoading ? (
        <div className="card flex items-center justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-primary-600 mr-3" /><span className="text-gray-500">Memuat...</span></div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['Kendaraan', 'Tipe', 'Transmisi', 'Harga/Hari', 'Status', 'Aksi'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-400">Tidak ada kendaraan</td></tr>
                ) : filtered.map(car => (
                  <tr key={car.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img src={car.image} alt={car.name} className="w-12 h-9 object-cover rounded-lg flex-shrink-0" onError={e => e.target.style.display='none'} />
                        <div>
                          <p className="font-medium text-gray-800">{car.name}</p>
                          <p className="text-xs text-gray-500">{car.brand} • {car.year}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{car.type}</td>
                    <td className="px-5 py-3.5 text-gray-600">{car.transmission}</td>
                    <td className="px-5 py-3.5 font-semibold text-gray-800">{formatCurrency(car.pricePerDay || car.price_per_day)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        car.isMaintenance ? 'bg-amber-100 text-amber-700' : 
                        car.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                      }`}>
                        {car.isMaintenance ? 'Dalam Perbaikan' : car.available ? 'Tersedia' : 'Tidak Tersedia'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => openEdit(car)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleMaintenanceToggle(car)} className={`p-1.5 rounded-lg ${car.isMaintenance ? 'text-white bg-amber-500 hover:bg-amber-600' : 'text-amber-500 hover:bg-amber-50'}`} title="Perbaikan">
                          <Wrench className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleToggle(car.id)} className={`p-1.5 rounded-lg ${car.available ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`} title="Toggle Tersedia/Tidak">
                          {car.available ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                        </button>
                        <button onClick={() => handleDelete(car.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Form */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editCar ? 'Edit Kendaraan' : 'Tambah Kendaraan'} size="lg">
        <div className="space-y-4 text-sm max-h-[70vh] overflow-y-auto pr-1">
          {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}
          <div className="grid grid-cols-2 gap-3">
            {[['Nama Kendaraan', 'name', 'text', 'Toyota Avanza'], ['Merek', 'brand', 'text', 'Toyota']].map(([l, k, t, ph]) => (
              <div key={k}><label className="form-label">{l} *</label>
                <input type={t} value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} placeholder={ph} className="form-input" /></div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="form-label">Tipe</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="form-input">
                {CAR_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div><label className="form-label">Transmisi</label>
              <select value={form.transmission} onChange={e => setForm(f => ({ ...f, transmission: e.target.value }))} className="form-input">
                {TRANSMISSIONS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div><label className="form-label">Bahan Bakar</label>
              <select value={form.fuel} onChange={e => setForm(f => ({ ...f, fuel: e.target.value }))} className="form-input">
                {FUELS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[['Tahun', 'year', 'number'], ['Kapasitas', 'capacity', 'number'], ['Warna', 'color', 'text']].map(([l, k, t]) => (
              <div key={k}><label className="form-label">{l}</label>
                <input type={t} value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: t === 'number' ? Number(e.target.value) : e.target.value }))} className="form-input" /></div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="form-label">Harga/Hari (Rp) *</label>
              <input type="number" value={form.pricePerDay} onChange={e => setForm(f => ({ ...f, pricePerDay: Number(e.target.value) }))} className="form-input" /></div>
            <div><label className="form-label">Biaya Sopir/Hari (Rp)</label>
              <input type="number" value={form.driverCostPerDay} onChange={e => setForm(f => ({ ...f, driverCostPerDay: Number(e.target.value) }))} className="form-input" /></div>
          </div>
          <div><label className="form-label">Nomor Plat</label>
            <input value={form.plateNumber} onChange={e => setForm(f => ({ ...f, plateNumber: e.target.value }))} placeholder="B 1234 ABC" className="form-input" /></div>
          
          <div>
            <div>
              <label className="form-label">Gambar Kendaraan (URL)</label>
              <div className="flex items-center gap-4 mb-2">
                {(form.imagePreview || form.image) && (
                  <img src={form.imagePreview || form.image} alt="Preview" className="w-20 h-14 object-cover rounded-lg border border-gray-200" />
                )}
              </div>
              <input 
                value={form.image} 
                onChange={e => setForm(f => ({ ...f, image: e.target.value, imageFile: null, imagePreview: '' }))} 
                placeholder="Paste URL gambar mobil di sini (misal: dari Unsplash)..." 
                className="form-input text-xs" 
                disabled={saving} 
              />
              <p className="text-[10px] text-gray-500 mt-1">Karena hosting gratis (Vercel), mohon gunakan URL gambar (link) alih-alih mengunggah file langsung.</p>
            </div>
          </div>

          <div><label className="form-label">Deskripsi</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="form-input resize-none" /></div>
          <div>
            <label className="form-label">Fitur</label>
            <div className="flex gap-2 mb-2">
              <input value={featInput} onChange={e => setFeatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())} placeholder="Tambah fitur..." className="form-input flex-1" />
              <button type="button" onClick={addFeature} className="btn-outline py-2 px-3 text-sm">+</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.features.map(feat => (
                <span key={feat} className="flex items-center gap-1 text-xs bg-primary-50 text-primary-700 px-2.5 py-1 rounded-full">
                  {feat}<button onClick={() => removeFeature(feat)}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          </div>
            <div className="flex items-center gap-3">
              <label className="form-label mb-0 w-32">Tersedia:</label>
              <button type="button" onClick={() => setForm(f => ({ ...f, available: !f.available }))}
                className={`relative w-12 h-6 rounded-full transition-colors ${form.available ? 'bg-primary-700' : 'bg-gray-300'}`}>
                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.available ? 'translate-x-6' : ''}`} />
              </button>
              <span className="text-sm text-gray-600">{form.available ? 'Ya' : 'Tidak'}</span>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <label className="form-label mb-0 w-32">Prioritas Tampilan:</label>
              <input type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 0 })}
                className="form-input w-24 text-center" placeholder="0" min="0" />
              <span className="text-xs text-gray-400 italic">Angka lebih besar tampil paling atas</span>
            </div>
            <div className="flex gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border-2 border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-medium">Batal</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 btn-primary justify-center disabled:bg-gray-200">
              {saving ? 'Menyimpan...' : editCar ? 'Simpan Perubahan' : 'Tambahkan'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ManageCarPage;
