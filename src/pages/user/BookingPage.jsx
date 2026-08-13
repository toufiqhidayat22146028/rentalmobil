import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { Calendar, MapPin, UserCheck, CreditCard, CheckCircle, ArrowLeft, Shield, FileText } from 'lucide-react';
import { MOCK_CARS } from '../../data/mockCars';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate, calculateDays, getTodayString, getMinReturnDate } from '../../utils/dateHelper';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import { carsAPI } from '../../services/api';
import PaymentGateway from '../../components/payment/PaymentGateway';

const PICKUP_OPTIONS = [
  'Kantor Pusat – Jl. Hamzah Fansuri No. 12, Subulussalam',
  'Antar ke Alamat (biaya tambahan berlaku)',
];

const BookingPage = () => {
  const { id }        = useParams();
  const location      = useLocation();
  const navigate      = useNavigate();
  const { user }      = useAuth();
  const { addBooking, updatePaymentStatus } = useBooking();

  const [car, setCar]   = useState(null);
  const [carLoading, setCarLoading] = useState(true);

  const stateData = location.state || {};
  const [startDate, setStartDate]           = useState(stateData.startDate || '');
  const [endDate, setEndDate]               = useState(stateData.endDate || '');
  const [withDriver, setWithDriver]         = useState(stateData.withDriver || false);
  const [usageArea, setUsageArea]           = useState(stateData.usageArea || 'dalam_kota');
  const [pickupLocation, setPickupLocation] = useState(PICKUP_OPTIONS[0]);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes]                   = useState('');
  const [nik, setNik]                       = useState(user?.ktp || '');
  const [sim, setSim]                       = useState(user?.sim || '');
  const [phone, setPhone]                   = useState(user?.phone || '');
  const [address, setAddress]               = useState(user?.address || '');
  const [isLoading, setIsLoading]           = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState('');
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [paymentDone, setPaymentDone]       = useState(false);
  const [paymentTxId, setPaymentTxId]       = useState('');
  const [paymentMethodName, setPaymentMethodName] = useState('');
  const [error, setError]                   = useState('');

  // Fetch car dari API
  useEffect(() => {
    setCarLoading(true);
    carsAPI.getById(id)
      .then(({ data }) => { if (data.success) setCar(data.data); })
      .catch(() => {
        // Fallback ke mock data jika API error
        const found = MOCK_CARS.find(c => c.id === Number(id));
        if (found) setCar(found);
      })
      .finally(() => setCarLoading(false));
  }, [id]);

  if (carLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-800 rounded-full animate-spin" />
    </div>
  );

  if (!car) return (
    <div className="text-center py-20">
      <p>Kendaraan tidak ditemukan.</p>
      <Link to="/katalog" className="btn-primary mt-4">Ke Katalog</Link>
    </div>
  );

  const pricePerDay       = car.pricePerDay || car.price_per_day;
  const driverCostPerDay  = car.driverCostPerDay || car.driver_cost_per_day;
  const days        = calculateDays(startDate, endDate);
  const carCost     = days * pricePerDay;
  const driverCost  = withDriver ? days * driverCostPerDay : 0;
  const outOfTownCost = usageArea === 'luar_kota' ? days * 150000 : 0;
  const totalCost   = carCost + driverCost + outOfTownCost;
  const isDelivery  = pickupLocation === PICKUP_OPTIONS[1];
  const isValid     = startDate && endDate && days > 0 && nik && phone && address && (withDriver || sim) && (!isDelivery || deliveryAddress.trim());

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;
    setIsLoading(true);
    setError('');

    const finalPickupLocation = isDelivery ? `Antar ke Alamat: ${deliveryAddress}` : pickupLocation;

    const result = await addBooking({
      carId: car.id, startDate, endDate, days,
      pickupLocation: finalPickupLocation, withDriver, totalCost, notes,
      nik, sim, phone, address, usageArea
    });

    setIsLoading(false);
    if (result.success) {
      setCreatedBookingId(result.bookingId);
      setShowPaymentGateway(true);
    } else {
      setError(result.message || 'Gagal membuat peminjaman.');
    }
  };

  const handlePaymentSuccess = async (txId, methodName) => {
    await updatePaymentStatus(createdBookingId, {
      paymentMethod: methodName,
      transactionId: txId,
    });
    setPaymentTxId(txId);
    setPaymentMethodName(methodName);
    setShowPaymentGateway(false);
    setPaymentDone(true);
  };

  // === SUKSES ===
  if (paymentDone) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="card p-10">
          <div className="w-24 h-24 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-12 h-12 text-emerald-600 animate-pulse" />
          </div>
          <h2 className="text-2xl font-display font-bold text-gray-800 mb-2">Peminjaman & Pembayaran Berhasil!</h2>
          <div className="bg-gray-50 rounded-2xl p-4 text-left text-sm space-y-2 my-6">
            {[
              ['ID Peminjaman', createdBookingId],
              ['ID Transaksi', paymentTxId],
              ['Metode Bayar', paymentMethodName],
              ['Total Dibayar', formatCurrency(totalCost)],
              ['Kendaraan', car.name],
              ['Tanggal', `${formatDate(startDate)} – ${formatDate(endDate)}`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4">
                <span className="text-gray-500">{k}</span>
                <span className="font-semibold text-gray-800 text-xs text-right">{v}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mb-6">Admin akan mengkonfirmasi dalam 1×24 jam.</p>
          <div className="flex flex-col gap-3">
            <Link to="/riwayat" className="btn-primary justify-center">Lihat Riwayat Peminjaman</Link>
            <Link to="/katalog" className="btn-outline justify-center">Cari Kendaraan Lain</Link>
          </div>
        </div>
      </div>
    );
  }

  const bookingForPayment = createdBookingId
    ? { id: createdBookingId, carId: car.id, totalCost, days, startDate, endDate, withDriver }
    : null;

  return (
    <>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-primary-700 font-medium mb-6 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
        <h1 className="text-2xl font-display font-bold text-gray-800 mb-6">Form Peminjaman</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-5">
              <div className="card p-5">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Calendar className="w-5 h-5 text-blue-600" /> Jadwal</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Tanggal Mulai *</label>
                    <input type="date" min={getTodayString()} value={startDate} onChange={e => { setStartDate(e.target.value); setEndDate(''); }} className="form-input" required />
                  </div>
                  <div>
                    <label className="form-label">Tanggal Kembali *</label>
                    <input type="date" min={startDate ? getMinReturnDate(startDate) : getTodayString()} value={endDate} onChange={e => setEndDate(e.target.value)} disabled={!startDate} className="form-input disabled:bg-gray-50" required />
                  </div>
                </div>
                {days > 0 && <div className="mt-3 text-sm text-blue-700 bg-blue-50/50 border border-blue-100 px-4 py-2.5 rounded-lg font-semibold">✓ Durasi: {days} hari</div>}
              </div>
              <div className="card p-5">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><MapPin className="w-5 h-5 text-blue-600" /> Lokasi</h3>
                {PICKUP_OPTIONS.map(opt => (
                  <label key={opt} className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all mb-2 ${pickupLocation === opt ? 'border-primary-800 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}>
                    <input type="radio" name="pickup" value={opt} checked={pickupLocation === opt} onChange={e => setPickupLocation(e.target.value)} className="accent-primary-800 mt-0.5" />
                    <span className="text-sm text-gray-700">{opt}</span>
                  </label>
                ))}
                
                {isDelivery && (
                  <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                    <label className="form-label">Alamat Pengantaran Mobil *</label>
                    <textarea 
                      value={deliveryAddress} 
                      onChange={e => setDeliveryAddress(e.target.value)} 
                      placeholder="Masukkan alamat lengkap tujuan pengantaran (misal: Hotel X, Jl. Y No.12)" 
                      rows={2} 
                      className="form-input resize-none" 
                      required 
                    />
                    <div className="flex gap-2 mt-2">
                      <button type="button" onClick={() => setDeliveryAddress(address)} className="text-xs text-primary-700 hover:underline">Sama dengan alamat domisili saya</button>
                    </div>
                  </div>
                )}
              </div>
              <div className="card p-5">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><MapPin className="w-5 h-5 text-blue-600" /> Area Pemakaian</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setUsageArea('dalam_kota')}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${usageArea === 'dalam_kota' ? 'border-primary-800 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}>
                    <p className="font-semibold text-sm text-gray-800">Dalam Kota</p>
                    <p className="text-xs text-gray-500">Harga standar</p>
                  </button>
                  <button type="button" onClick={() => setUsageArea('luar_kota')}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${usageArea === 'luar_kota' ? 'border-primary-800 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}>
                    <p className="font-semibold text-sm text-gray-800">Luar Kota</p>
                    <p className="text-xs text-gray-500">+Rp 150.000/hari</p>
                  </button>
                </div>
              </div>
              <div className="card p-5">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><UserCheck className="w-5 h-5 text-blue-600" /> Opsi Sopir</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[false, true].map(opt => (
                    <button key={String(opt)} type="button" onClick={() => setWithDriver(opt)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${withDriver === opt ? 'border-primary-800 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}>
                      <p className="font-semibold text-sm text-gray-800">{opt ? 'Dengan Sopir' : 'Tanpa Sopir'}</p>
                      <p className="text-xs text-gray-500">{opt ? `+${formatCurrency(driverCostPerDay)}/hari` : 'Anda yang mengemudi'}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="card p-5">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-blue-600" /> Data Diri Pemesan</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="form-label">Nomor Induk Kependudukan (NIK) *</label>
                    <input type="text" value={nik} onChange={e => setNik(e.target.value)} placeholder="Sesuai KTP" className="form-input" required />
                  </div>
                  <div>
                    <label className="form-label">Nomor Telepon / WhatsApp *</label>
                    <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="0812xxxx" className="form-input" required />
                  </div>
                  <div className="md:col-span-2">
                    <label className="form-label">Nomor SIM {withDriver ? '(Opsional)' : '*'}</label>
                    <input type="text" value={sim} onChange={e => setSim(e.target.value)} placeholder="Wajib jika Anda mengemudi sendiri" className="form-input" required={!withDriver} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="form-label">Alamat Domisili Lengkap *</label>
                    <textarea value={address} onChange={e => setAddress(e.target.value)} placeholder="Sesuai tempat tinggal saat ini" rows={2} className="form-input resize-none" required />
                  </div>
                </div>
              </div>
              <div className="card p-5">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5 text-blue-600" /> Catatan Tambahan</h3>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Contoh: butuh kursi bayi, dll." rows={3} className="form-input resize-none" />
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="card p-5 sticky top-20 space-y-4">
                <h3 className="font-display font-bold text-gray-800">Ringkasan</h3>
                <div className="flex gap-3">
                  <img src={car.image} alt={car.name} className="w-20 h-14 object-cover rounded-lg" onError={e => e.target.style.display='none'} />
                  <div><p className="font-semibold text-sm text-gray-800">{car.name}</p><p className="text-xs text-gray-500">{car.type}</p></div>
                </div>
                <hr />
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-gray-600"><span>Biaya Mobil</span><span>{days > 0 ? formatCurrency(carCost) : '-'}</span></div>
                  {withDriver && days > 0 && <div className="flex justify-between text-gray-600"><span>Biaya Sopir</span><span>{formatCurrency(driverCost)}</span></div>}
                  {outOfTownCost > 0 && <div className="flex justify-between text-gray-600"><span>Biaya Luar Kota</span><span>{formatCurrency(outOfTownCost)}</span></div>}
                  <hr />
                  <div className="flex justify-between font-bold text-gray-800 text-base pt-3 border-t">
                    <span>Total Pembayaran</span>
                    <span className="text-primary-800">{days > 0 ? formatCurrency(totalCost) : '-'}</span>
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                  <div className="flex gap-2"><Shield className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" /><p className="text-xs text-amber-700">Anda akan diarahkan ke halaman pembayaran aman.</p></div>
                </div>
                <button type="submit" disabled={!isValid || isLoading}
                  className="btn-primary w-full justify-center disabled:bg-gray-200 disabled:text-gray-400">
                  {isLoading ? 'Memproses...' : '🔒 Lanjut ke Pembayaran'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <PaymentGateway isOpen={showPaymentGateway} booking={bookingForPayment} onSuccess={handlePaymentSuccess}
        onClose={() => { setShowPaymentGateway(false); navigate('/riwayat'); }} />
    </>
  );
};

export default BookingPage;
