import { useState, useEffect, useCallback } from 'react';
import {
  X, ChevronRight, ChevronLeft, Copy, Check, CreditCard,
  Smartphone, QrCode, Building2, Shield, Lock, RefreshCw,
  CheckCircle2, XCircle, Clock, AlertCircle, Zap
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/dateHelper';
import { paymentsAPI } from '../../services/api';

// ============================================================
// DATA METODE PEMBAYARAN
// ============================================================
const PAYMENT_CATEGORIES = [
  {
    id: 'va',
    label: 'Transfer Bank',
    icon: Building2,
    description: 'Virtual Account',
    methods: [
      { id: 'bca_va',     name: 'BCA',     logo: '🏦', color: '#006EB3', fee: 0 },
      { id: 'mandiri_va', name: 'Mandiri', logo: '🏦', color: '#003D7C', fee: 0 },
      { id: 'bri_va',     name: 'BRI',     logo: '🏦', color: '#00529B', fee: 0 },
      { id: 'bni_va',     name: 'BNI',     logo: '🏦', color: '#F68B1E', fee: 0 },
      { id: 'permata_va', name: 'Permata', logo: '🏦', color: '#E4002B', fee: 0 },
    ],
  },
  {
    id: 'qris',
    label: 'QRIS',
    icon: QrCode,
    description: 'Scan QR Code',
    methods: [
      { id: 'qris', name: 'QRIS', logo: '📱', color: '#E31837', fee: 0, note: 'Semua dompet digital & m-banking' },
    ],
  },
  {
    id: 'ewallet',
    label: 'Dompet Digital',
    icon: Smartphone,
    description: 'GoPay, OVO, dll',
    methods: [
      { id: 'gopay',     name: 'GoPay',     logo: '🟢', color: '#00AED6', fee: 0 },
      { id: 'ovo',       name: 'OVO',       logo: '🟣', color: '#4C3494', fee: 0 },
      { id: 'dana',      name: 'DANA',      logo: '🔵', color: '#118EEA', fee: 0 },
      { id: 'shopeepay', name: 'ShopeePay', logo: '🟠', color: '#EE4D2D', fee: 0 },
    ],
  },
  {
    id: 'card',
    label: 'Kartu Kredit',
    icon: CreditCard,
    description: 'Visa / Mastercard',
    methods: [
      { id: 'credit_card', name: 'Kartu Kredit/Debit', logo: '💳', color: '#1A1F71', fee: 2900 },
    ],
  },
];

// ============================================================
// HELPER: Generate nomor virtual account acak
// ============================================================
const generateVANumber = (bank) => {
  const prefixes = { bca_va: '8277', mandiri_va: '88908', bri_va: '88019', bni_va: '8809', permata_va: '8533' };
  const prefix = prefixes[bank] || '8000';
  const suffix = Math.random().toString().slice(2, 13);
  return prefix + suffix;
};

// ============================================================
// HELPER: Generate ID Transaksi
// ============================================================
const generateTxId = () => `TRX-RM-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

// ============================================================
// KOMPONEN: CountdownTimer
// Menampilkan hitung mundur waktu pembayaran (15 menit)
// ============================================================
const CountdownTimer = ({ minutes = 15 }) => {
  const [timeLeft, setTimeLeft] = useState(minutes * 60);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const secs = String(timeLeft % 60).padStart(2, '0');
  const isUrgent = timeLeft < 120; // Kurang dari 2 menit

  return (
    <div className={`flex items-center gap-2 text-sm font-semibold px-3 py-1.5 rounded-lg ${isUrgent ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-amber-50 text-amber-700'}`}>
      <Clock className="w-4 h-4" />
      Bayar dalam {mins}:{secs}
    </div>
  );
};

// ============================================================
// KOMPONEN: CopyButton
// Tombol salin dengan feedback visual
// ============================================================
const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
        copied ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
      }`}
    >
      {copied ? <><Check className="w-3.5 h-3.5" />Disalin!</> : <><Copy className="w-3.5 h-3.5" />Salin</>}
    </button>
  );
};

// ============================================================
// KOMPONEN: Virtual Account UI
// ============================================================
const VirtualAccountUI = ({ method, amount, vaNumber }) => (
  <div className="space-y-4 animate-fade-in">
    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
      <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">Bank {method.name}</p>
      <p className="text-xs text-gray-500 mb-3">Nomor Virtual Account</p>
      <div className="flex items-center justify-between gap-3 bg-white border border-blue-200 rounded-xl px-4 py-3">
        <span className="font-mono text-xl font-bold text-gray-800 tracking-widest">{vaNumber}</span>
        <CopyButton text={vaNumber} />
      </div>
    </div>

    <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-2.5 text-sm">
      <p className="font-semibold text-gray-700 mb-3">Cara Pembayaran:</p>
      {[
        `Buka aplikasi ${method.name} Mobile / ATM`,
        'Pilih menu "Transfer" → "Virtual Account"',
        `Masukkan nomor VA di atas: ${vaNumber}`,
        `Konfirmasi jumlah: ${formatCurrency(amount)}`,
        'Selesaikan transaksi dan simpan bukti bayar',
      ].map((step, i) => (
        <div key={i} className="flex items-start gap-3">
          <span className="w-6 h-6 bg-primary-800 text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">{i + 1}</span>
          <span className="text-gray-600 leading-relaxed">{step}</span>
        </div>
      ))}
    </div>

    <div className="flex items-start gap-2 text-xs text-gray-400 bg-gray-50 rounded-xl p-3">
      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
      Pembayaran otomatis terverifikasi dalam 1–5 menit setelah transfer berhasil.
    </div>
  </div>
);

// ============================================================
// KOMPONEN: QRIS UI
// ============================================================
const QrisUI = ({ amount, orderId }) => {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=SUBULUSSALAM-${orderId}-${amount}&bgcolor=FFFFFF&color=0f172a&margin=10`;
  return (
    <div className="space-y-4 animate-fade-in text-center">
      <div className="bg-gray-50 rounded-2xl p-6 inline-block mx-auto">
        <img
          src={qrUrl}
          alt="QR Code Pembayaran"
          className="w-48 h-48 mx-auto rounded-xl border-4 border-white shadow-md"
          onError={(e) => {
            // Fallback jika QR API tidak tersedia
            e.target.src = `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${orderId}&choe=UTF-8`;
          }}
        />
        <p className="text-xs text-gray-400 mt-3">Scan dengan aplikasi apapun yang mendukung QRIS</p>
      </div>

      <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 rounded-2xl p-4">
        <p className="text-sm font-bold text-gray-700 mb-1">Total Pembayaran</p>
        <p className="text-2xl font-display font-bold text-primary-800">{formatCurrency(amount)}</p>
      </div>

      <div className="text-left space-y-2.5 text-sm bg-white border border-gray-100 rounded-2xl p-4">
        <p className="font-semibold text-gray-700 mb-2">Cara Bayar:</p>
        {['Buka aplikasi m-banking atau e-wallet Anda', 'Pilih menu "Scan QR" atau "QRIS"', 'Arahkan kamera ke QR Code di atas', 'Konfirmasi jumlah pembayaran', 'Transaksi selesai!'].map((s, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="w-6 h-6 bg-primary-800 text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">{i + 1}</span>
            <span className="text-gray-600">{s}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400">Mendukung: GoPay, OVO, DANA, ShopeePay, LinkAja, semua m-banking</p>
    </div>
  );
};

// ============================================================
// KOMPONEN: E-Wallet UI
// ============================================================
const EWalletUI = ({ method, amount }) => {
  const [phone, setPhone] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (phone.length >= 10) setSent(true);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="text-center py-4">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-3 text-4xl shadow-sm border border-gray-100">
          {method.logo}
        </div>
        <h4 className="font-display font-bold text-gray-800 text-lg">{method.name}</h4>
        <p className="text-2xl font-bold text-primary-800 mt-1">{formatCurrency(amount)}</p>
      </div>

      {!sent ? (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 text-center">Masukkan nomor HP terdaftar di {method.name}:</p>
          <div className="flex gap-2">
            <div className="bg-gray-100 rounded-xl px-3 flex items-center text-sm font-semibold text-gray-600">+62</div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/, ''))}
              placeholder="8xxxxxxxxxx"
              maxLength={12}
              className="form-input flex-1"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={phone.length < 10}
            className="btn-primary w-full justify-center disabled:bg-gray-200 disabled:text-gray-400"
          >
            <Zap className="w-4 h-4" />
            Kirim Tagihan ke {method.name}
          </button>
        </div>
      ) : (
        <div className="bg-primary-50 border border-primary-200 rounded-2xl p-5 text-center space-y-3">
          <div className="w-12 h-12 bg-primary-800 rounded-full flex items-center justify-center mx-auto">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <p className="font-semibold text-primary-800">Notifikasi Dikirim!</p>
          <p className="text-sm text-gray-600">
            Tagihan sebesar <strong>{formatCurrency(amount)}</strong> dikirim ke{' '}
            <strong>+62{phone}</strong>.
          </p>
          <p className="text-sm text-gray-500">Buka aplikasi <strong>{method.name}</strong> dan selesaikan pembayaran.</p>
          <button onClick={() => setSent(false)} className="text-xs text-primary-600 hover:underline flex items-center gap-1 mx-auto">
            <RefreshCw className="w-3 h-3" /> Ubah nomor HP
          </button>
        </div>
      )}
    </div>
  );
};

// ============================================================
// KOMPONEN: Credit Card UI
// ============================================================
const CreditCardUI = ({ amount, onCardDataChange }) => {
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [flipped, setFlipped] = useState(false);

  const setField = (key, val) => {
    const updated = { ...card, [key]: val };
    setCard(updated);
    onCardDataChange && onCardDataChange(updated);
  };

  const formatCardNumber = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry = (v) => {
    const digits = v.replace(/\D/g, '').slice(0, 4);
    return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
  };

  const cardBrand = card.number.startsWith('4') ? 'Visa' : card.number.startsWith('5') ? 'Mastercard' : 'Kartu';

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Card Preview */}
      <div className={`relative h-48 rounded-2xl overflow-hidden select-none transition-all duration-500 ${flipped ? '[transform:rotateY(180deg)]' : ''}`}
           style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}>
        {/* Front */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-700 to-primary-500 rounded-2xl p-6 text-white"
             style={{ backfaceVisibility: 'hidden' }}>
          <div className="flex justify-between items-start mb-8">
            <div className="w-10 h-7 bg-white/20 rounded-md" />
            <span className="font-bold text-sm opacity-80">{cardBrand}</span>
          </div>
          <p className="font-mono text-lg tracking-widest mb-4">
            {card.number ? formatCardNumber(card.number).padEnd(19, '•') : '•••• •••• •••• ••••'}
          </p>
          <div className="flex justify-between text-xs">
            <div>
              <p className="opacity-60 mb-0.5">Nama Pemegang</p>
              <p className="font-semibold uppercase">{card.name || 'NAMA ANDA'}</p>
            </div>
            <div className="text-right">
              <p className="opacity-60 mb-0.5">Berlaku Hingga</p>
              <p className="font-semibold">{card.expiry || 'MM/YY'}</p>
            </div>
          </div>
        </div>
        {/* Back */}
        <div className="absolute inset-0 bg-gray-800 rounded-2xl"
             style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
          <div className="h-12 bg-gray-600 mt-8" />
          <div className="px-6 mt-4 flex justify-end items-center gap-3">
            <div className="flex-1 h-8 bg-white/10 rounded" />
            <div className="bg-white rounded-md px-4 py-2 font-mono font-bold text-gray-800 text-sm">
              {card.cvv || '•••'}
            </div>
          </div>
          <p className="text-xs text-gray-400 text-right px-6 mt-2">CVV</p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-3">
        <div>
          <label className="form-label">Nomor Kartu</label>
          <input
            type="text"
            value={formatCardNumber(card.number)}
            onChange={(e) => setField('number', e.target.value.replace(/\s/g, ''))}
            placeholder="0000 0000 0000 0000"
            maxLength={19}
            className="form-input font-mono tracking-wider"
          />
        </div>
        <div>
          <label className="form-label">Nama Pemegang Kartu</label>
          <input
            type="text"
            value={card.name}
            onChange={(e) => setField('name', e.target.value.toUpperCase())}
            placeholder="NAMA SESUAI KARTU"
            className="form-input uppercase"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="form-label">Tanggal Kedaluwarsa</label>
            <input
              type="text"
              value={card.expiry}
              onChange={(e) => setField('expiry', formatExpiry(e.target.value))}
              placeholder="MM/YY"
              maxLength={5}
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">CVV</label>
            <input
              type="text"
              value={card.cvv}
              onChange={(e) => setField('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
              onFocus={() => setFlipped(true)}
              onBlur={() => setFlipped(false)}
              placeholder="•••"
              maxLength={4}
              className="form-input font-mono"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 rounded-xl p-3">
        <Lock className="w-3.5 h-3.5 flex-shrink-0" />
        Data kartu dienkripsi dengan SSL 256-bit. Kami tidak menyimpan data kartu Anda.
      </div>
    </div>
  );
};

// ============================================================
// KOMPONEN UTAMA: PaymentGateway
// Modal payment gateway lengkap bergaya Midtrans Snap
// Props:
//   - isOpen: boolean
//   - booking: object (data booking)
//   - onSuccess: (transactionId, methodName) => void
//   - onClose: () => void
// ============================================================
const PaymentGateway = ({ isOpen, booking, onSuccess, onClose }) => {
  const [activeCategory, setActiveCategory] = useState('va');
  const [selectedMethod, setSelectedMethod] = useState(PAYMENT_CATEGORIES[0].methods[0]);
  const [vaNumber] = useState(generateVANumber('bca_va'));
  const [vaNumbers] = useState(() => {
    const nums = {};
    PAYMENT_CATEGORIES[0].methods.forEach((m) => { nums[m.id] = generateVANumber(m.id); });
    return nums;
  });
  const [cardData, setCardData] = useState({});
  const [step, setStep] = useState('select'); // 'select' | 'processing' | 'success' | 'failed'
  const [transactionId, setTransactionId] = useState('');

  const car = booking?.carData || null;
  const carName = booking?.carName || car?.name || 'Kendaraan';
  const category = PAYMENT_CATEGORIES.find((c) => c.id === activeCategory);
  const fee = selectedMethod?.fee || 0;
  const totalWithFee = (booking?.totalCost || 0) + fee;

  // Cegah scroll saat modal terbuka
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleCategoryChange = (catId) => {
    setActiveCategory(catId);
    const cat = PAYMENT_CATEGORIES.find((c) => c.id === catId);
    setSelectedMethod(cat?.methods[0] || null);
  };

  // ============================================================
  // FUNGSI: Proses Pembayaran via Backend API
  // POST /api/payments/process → { success, transactionId }
  // ============================================================
  const handlePay = async () => {
    // Validasi kartu kredit jika metode kartu
    if (selectedMethod.id === 'credit_card') {
      if (!cardData.number || cardData.number.length < 16 || !cardData.name || !cardData.expiry || !cardData.cvv) {
        alert('Harap isi semua data kartu kredit dengan benar.');
        return;
      }
    }

    setStep('processing');

    try {
      // Panggil API backend untuk proses pembayaran
      const { data } = await paymentsAPI.process(booking.id, selectedMethod.name);

      if (data.success) {
        setTransactionId(data.transactionId);
        setStep('success');
        // Panggil callback setelah animasi sukses
        setTimeout(() => onSuccess(data.transactionId, selectedMethod.name), 1000);
      } else {
        setStep('failed');
      }
    } catch (err) {
      // 402 Payment Declined → tampilkan halaman gagal
      setStep('failed');
    }
  };

  const handleRetry = () => {
    setStep('select');
  };

  if (!isOpen || !booking) return null;

  return (
    // Overlay full-screen
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">

        {/* ================================================
            HEADER PAYMENT GATEWAY
            ================================================ */}
        <div className="bg-gradient-to-r from-primary-900 to-primary-700 px-5 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-display font-bold text-white text-base leading-tight uppercase">Subulussalam Pay</p>
              <p className="text-primary-200 text-xs">Pembayaran Aman & Terenkripsi</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {step === 'select' && <CountdownTimer minutes={15} />}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================================================
            RINGKASAN PESANAN — Selalu tampil di atas
            ================================================ */}
        <div className="bg-gray-50 border-b border-gray-100 px-5 py-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            {car && (
              <div className="w-14 h-10 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
                <img src={car.image} alt={car.name} className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 text-sm truncate">{carName}</p>
              <p className="text-xs text-gray-500">{formatDate(booking.startDate)} → {formatDate(booking.endDate)} • {booking.days} hari</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs text-gray-400">ID: <span className="font-mono">{booking.id}</span></p>
              <p className="font-display font-bold text-primary-800 text-lg">{formatCurrency(totalWithFee)}</p>
            </div>
          </div>
        </div>

        {/* ================================================
            KONTEN UTAMA — Berubah berdasarkan step
            ================================================ */}
        <div className="flex-1 overflow-y-auto chat-scroll">

          {/* ----- STEP: SELECT (Pilih Metode) ----- */}
          {step === 'select' && (
            <div className="flex flex-col sm:flex-row h-full min-h-[400px]">

              {/* Panel Kiri: Kategori Pembayaran */}
              <div className="sm:w-44 bg-gray-50 border-r border-gray-100 flex-shrink-0">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-4 pt-4 pb-2">Metode</p>
                {PAYMENT_CATEGORIES.map((cat) => {
                  const CatIcon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 transition-all text-left border-l-4 ${
                        activeCategory === cat.id
                          ? 'border-primary-700 bg-white text-primary-800 font-semibold'
                          : 'border-transparent text-gray-600 hover:bg-white/80'
                      }`}
                    >
                      <CatIcon className="w-4 h-4 flex-shrink-0" />
                      <div>
                        <p className="text-sm leading-tight">{cat.label}</p>
                        <p className="text-xs text-gray-400 leading-tight">{cat.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Panel Kanan: Detail Metode */}
              <div className="flex-1 p-5 overflow-y-auto chat-scroll">

                {/* Pilihan sub-metode (jika lebih dari 1) */}
                {category && category.methods.length > 1 && (
                  <div className="mb-5">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Pilih {category.label}:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {category.methods.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => setSelectedMethod(m)}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 transition-all text-left ${
                            selectedMethod?.id === m.id
                              ? 'border-primary-700 bg-primary-50'
                              : 'border-gray-200 hover:border-primary-300 bg-white'
                          }`}
                        >
                          <span className="text-xl">{m.logo}</span>
                          <span className="text-sm font-semibold text-gray-700">{m.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* UI Spesifik per Metode */}
                {selectedMethod && (
                  <>
                    {activeCategory === 'va' && (
                      <VirtualAccountUI
                        method={selectedMethod}
                        amount={totalWithFee}
                        vaNumber={vaNumbers[selectedMethod.id] || generateVANumber(selectedMethod.id)}
                      />
                    )}
                    {activeCategory === 'qris' && (
                      <QrisUI amount={totalWithFee} orderId={booking.id} />
                    )}
                    {activeCategory === 'ewallet' && (
                      <EWalletUI method={selectedMethod} amount={totalWithFee} />
                    )}
                    {activeCategory === 'card' && (
                      <CreditCardUI amount={totalWithFee} onCardDataChange={setCardData} />
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* ----- STEP: PROCESSING ----- */}
          {step === 'processing' && (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="w-20 h-20 border-4 border-primary-200 border-t-primary-800 rounded-full animate-spin mb-6" />
              <h3 className="text-xl font-display font-bold text-gray-800 mb-2">Memproses Pembayaran</h3>
              <p className="text-gray-500 text-sm">Sedang melakukan verifikasi ke {selectedMethod?.name}...</p>
              <p className="text-xs text-gray-400 mt-2">Jangan tutup halaman ini</p>
            </div>
          )}

          {/* ----- STEP: SUCCESS ----- */}
          {step === 'success' && (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mb-5 animate-fade-in">
                <CheckCircle2 className="w-14 h-14 text-primary-700" />
              </div>
              <h3 className="text-2xl font-display font-bold text-gray-800 mb-2">Pembayaran Berhasil!</h3>
              <p className="text-gray-500 mb-5">Terima kasih! Pembayaran Anda telah dikonfirmasi.</p>

              <div className="w-full max-w-sm bg-gray-50 rounded-2xl p-5 text-left space-y-2.5 text-sm mb-5">
                {[
                  ['ID Transaksi', transactionId],
                  ['ID Peminjaman', booking.id],
                  ['Metode', selectedMethod?.name],
                  ['Jumlah', formatCurrency(totalWithFee)],
                  ['Status', '✅ Lunas'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4">
                    <span className="text-gray-500">{k}</span>
                    <span className="font-semibold text-gray-800 text-right font-mono text-xs sm:text-sm">{v}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Lock className="w-3.5 h-3.5" />
                Bukti pembayaran dikirim ke email Anda
              </div>
            </div>
          )}

          {/* ----- STEP: FAILED ----- */}
          {step === 'failed' && (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-5">
                <XCircle className="w-14 h-14 text-red-500" />
              </div>
              <h3 className="text-2xl font-display font-bold text-gray-800 mb-2">Pembayaran Gagal</h3>
              <p className="text-gray-500 text-sm mb-6">
                Transaksi tidak dapat diproses. Silakan coba lagi atau gunakan metode pembayaran lain.
              </p>
              <button onClick={handleRetry} className="btn-primary">
                <RefreshCw className="w-4 h-4" /> Coba Lagi
              </button>
            </div>
          )}
        </div>

        {/* ================================================
            FOOTER: Tombol Bayar (hanya di step select)
            ================================================ */}
        {step === 'select' && (
          <div className="border-t border-gray-100 px-5 py-4 bg-white flex-shrink-0">
            {fee > 0 && (
              <p className="text-xs text-gray-400 text-center mb-2">
                Biaya layanan kartu: {formatCurrency(fee)}
              </p>
            )}
            <button
              onClick={handlePay}
              disabled={!selectedMethod}
              className="btn-primary w-full justify-center text-base py-4 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              <Lock className="w-4 h-4" />
              Bayar {formatCurrency(totalWithFee)}
            </button>
            <div className="flex items-center justify-center gap-3 mt-3 text-xs text-gray-400">
              <Shield className="w-3.5 h-3.5" />
              <span>Transaksi dilindungi enkripsi SSL 256-bit</span>
              <Lock className="w-3.5 h-3.5" />
            </div>
          </div>
        )}

        {/* Footer minimal untuk step lain */}
        {(step === 'success' || step === 'failed') && (
          <div className="border-t border-gray-100 px-5 py-4 bg-white flex-shrink-0">
            <button onClick={onClose} className={`w-full py-3 rounded-xl font-semibold transition-colors ${step === 'success' ? 'btn-primary justify-center' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
              {step === 'success' ? 'Selesai' : 'Tutup'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentGateway;
