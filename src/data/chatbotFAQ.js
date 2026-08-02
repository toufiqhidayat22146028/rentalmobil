// ============================================================
// DATA CHATBOT INTERAKTIF SUBULUSSALAM RENTCAR
// Alur percakapan, quick replies, dan respons bot untuk UI interaktif.
// ============================================================

import { MOCK_CARS } from './mockCars';

const normalizeText = (text = '') => text.toLowerCase().trim();

const formatCurrency = (value) => {
  if (typeof value !== 'number') return value || '';
  return `Rp ${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
};

let carMenuButtons = MOCK_CARS.slice(0, 4).map((car, index) => ({
  id: `cars-${index + 1}`,
  label: `🚗 ${car.name}`,
  message: car.name,
  next: 'carDetail',
}));

export const MAIN_MENU_REPLIES = [
  { id: 'main-1', label: '🚗 Daftar Mobil', message: 'Daftar Mobil', next: 'cars' },
  { id: 'main-2', label: '💰 Harga Rental', message: 'Harga Rental', next: 'price' },
  { id: 'main-3', label: '📅 Cek Ketersediaan', message: 'Cek Ketersediaan', next: 'checkAvailability' },
  { id: 'main-4', label: '📝 Cara Pemesanan', message: 'Cara Pemesanan', next: 'booking' },
  { id: 'main-5', label: '📋 Syarat & Ketentuan', message: 'Syarat & Ketentuan', next: 'requirements' },
  { id: 'main-6', label: '🕘 Riwayat Chat', message: 'Riwayat Chat', next: 'history' },
  { id: 'main-7', label: '➕ Buat Obrolan Baru', message: 'Buat Obrolan Baru', next: 'newChat' },
  { id: 'main-8', label: '👨‍💼 Hubungi Admin', message: 'Hubungi Admin', next: 'admin' },
];

export let CAR_MENU_REPLIES = [
  ...carMenuButtons,
  { id: 'cars-5', label: '🚗 Lihat Semua Mobil', message: 'Lihat Semua Mobil', next: 'cars' },
  { id: 'cars-6', label: '🏠 Menu Utama', message: 'Menu Utama', next: 'main' },
];

export let PRICE_MENU_REPLIES = [
  ...carMenuButtons.map((button, index) => ({
    id: `price-${index + 1}`,
    label: button.label,
    message: `Harga ${button.message}`,
    next: 'priceDetail',
  })),
  { id: 'price-5', label: '🚗 Lihat Mobil Lain', message: 'Lihat Mobil Lain', next: 'cars' },
  { id: 'price-6', label: '🏠 Menu Utama', message: 'Menu Utama', next: 'main' },
];

export const updateFAQData = (apiCars) => {
  if (!apiCars || !apiCars.length) return;
  MOCK_CARS.length = 0;
  MOCK_CARS.push(...apiCars);

  carMenuButtons = MOCK_CARS.map((car, index) => ({
    id: `cars-${index + 1}`,
    label: `🚘 ${car.name}${car.available ? '' : ' (Tidak Tersedia)'}`,
    message: car.name,
    next: 'carDetail',
  }));

  CAR_MENU_REPLIES = [
    ...carMenuButtons,
    { id: 'cars-back', label: '🏠 Menu Utama', message: 'Menu Utama', next: 'main' },
  ];

  PRICE_MENU_REPLIES = [
    ...carMenuButtons.map((button) => ({
      id: `price-${button.id}`,
      label: button.label,
      message: `Harga ${button.message}`,
      next: 'priceDetail',
    })),
    { id: 'price-back', label: '🏠 Menu Utama', message: 'Menu Utama', next: 'main' },
  ];
};

export const BOOKING_MENU_REPLIES = [
  { id: 'book-1', label: '🚗 Pilih Mobil', message: 'Pilih Mobil', next: 'cars' },
  { id: 'book-2', label: '📅 Booking Sekarang', message: 'Booking Sekarang', next: 'postBooking' },
  { id: 'book-3', label: '👨‍💼 Hubungi Admin', message: 'Hubungi Admin', next: 'admin' },
  { id: 'book-4', label: '🏠 Menu Utama', message: 'Menu Utama', next: 'main' },
];

export const REQUIREMENTS_MENU_REPLIES = [
  { id: 'req-1', label: '📅 Cara Booking', message: 'Cara Booking', next: 'booking' },
  { id: 'req-2', label: '🚗 Lihat Mobil', message: 'Lihat Mobil', next: 'cars' },
  { id: 'req-3', label: '👨‍💼 Hubungi Admin', message: 'Hubungi Admin', next: 'admin' },
  { id: 'req-4', label: '🏠 Menu Utama', message: 'Menu Utama', next: 'main' },
];

export const RETURN_MENU_REPLIES = [
  { id: 'return-1', label: '📋 Ketentuan Pengembalian', message: 'Ketentuan Pengembalian', next: 'return' },
  { id: 'return-2', label: '👨‍💼 Hubungi Admin', message: 'Hubungi Admin', next: 'admin' },
  { id: 'return-3', label: '📅 Lihat Jadwal', message: 'Lihat Jadwal', next: 'booking' },
  { id: 'return-4', label: '🏠 Menu Utama', message: 'Menu Utama', next: 'main' },
];

export const LOCATION_MENU_REPLIES = [
  { id: 'loc-1', label: '📞 Hubungi Admin', message: 'Hubungi Admin', next: 'admin' },
  { id: 'loc-2', label: '🚗 Lihat Mobil', message: 'Lihat Mobil', next: 'cars' },
  { id: 'loc-3', label: '📅 Booking', message: 'Booking Sekarang', next: 'postBooking' },
  { id: 'loc-4', label: '🏠 Menu Utama', message: 'Menu Utama', next: 'main' },
];

export const ADMIN_MENU_REPLIES = [
  { id: 'admin-1', label: '💬 Chat Admin', message: 'Chat Admin', next: 'admin' },
  { id: 'admin-2', label: '📞 Telepon Admin', message: 'Telepon Admin', next: 'admin' },
  { id: 'admin-3', label: '🏠 Menu Utama', message: 'Menu Utama', next: 'main' },
];

export const POST_BOOKING_REPLIES = [
  { id: 'pb-1', label: '📅 Lanjutkan Booking', message: 'Lanjutkan Booking', next: 'booking' },
  { id: 'pb-2', label: '🔙 Kembali', message: 'Kembali', next: 'cars' },
  { id: 'pb-3', label: '🏠 Menu Utama', message: 'Menu Utama', next: 'main' },
];

export const CONFIRMATION_REPLIES = [
  { id: 'confirm-1', label: '📋 Lihat Detail Pesanan', message: 'Lihat Detail Pesanan', next: 'main' },
  { id: 'confirm-2', label: '👨‍💼 Hubungi Admin', message: 'Hubungi Admin', next: 'admin' },
  { id: 'confirm-3', label: '🏠 Menu Utama', message: 'Menu Utama', next: 'main' },
];

export const UNKNOWN_MENU_REPLIES = [
  { id: 'unk-1', label: '🚗 Lihat Mobil', message: 'Lihat Mobil', next: 'cars' },
  { id: 'unk-2', label: '💰 Harga Sewa', message: 'Harga Sewa', next: 'price' },
  { id: 'unk-3', label: '📅 Cara Booking', message: 'Cara Booking', next: 'booking' },
  { id: 'unk-4', label: '📋 Syarat Sewa', message: 'Syarat Sewa', next: 'requirements' },
  { id: 'unk-5', label: '🔄 Pengembalian', message: 'Pengembalian Mobil', next: 'return' },
  { id: 'unk-6', label: '👨‍💼 Hubungi Admin', message: 'Hubungi Admin', next: 'admin' },
  { id: 'unk-7', label: '🏠 Menu Utama', message: 'Menu Utama', next: 'main' },
];

export const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'bot',
  content:
    '👋 **Halo! Selamat datang di Rental Mobil 🚗**\n\nSaya siap membantu Anda mendapatkan informasi mengenai layanan rental mobil.\n\nSilakan pilih menu yang tersedia:',
  timestamp: new Date().toISOString(),
};

export const ADMIN_CONTACT = {
  phone: '0812-3456-7890',
  email: 'info@subulussalam.com',
  whatsapp: 'https://wa.me/6281234567890',
};

const getAvailableCarsList = () => {
  const lines = MOCK_CARS.map((car) =>
    `• ${car.name} (${car.type}) – ${car.capacity} orang – ${formatCurrency(car.pricePerDay)}/hari – ${car.available ? 'Tersedia' : 'Tidak tersedia'}`
  );
  return `🚗 **Daftar Mobil**\n\nSilakan pilih mobil yang ingin Anda lihat.`;
};

export const findCarByText = (text) => {
  const normalized = normalizeText(text);
  if (!normalized) return null;

  return MOCK_CARS.find((car) => {
    const name = normalizeText(car.name);
    const shortName = name.replace(/toyota|honda|mitsubishi|daihatsu|suzuki|nissan/g, '').trim();
    
    if (normalized.includes(name)) return true;
    if (shortName && normalized.includes(shortName)) return true;
    
    const words = name.split(' ').filter((w) => w.length > 3);
    return words.some((word) => normalized.includes(word));
  }) || null;
};

const extractRentalDays = (text) => {
  const match = text.match(/(\d+)\s*(hari|hr|day|days)/i);
  if (match) {
    return parseInt(match[1], 10);
  }
  return null;
};

const getCarDetailMessage = (car) => {
  if (!car) return null;

  const availability = car.available ? 'Tersedia' : 'Sedang tidak tersedia';
  return `🚗 Detail kendaraan:\n\nNama: ${car.name}\nTipe: ${car.type}\nKapasitas: ${car.capacity} orang\nTransmisi: ${car.transmission}\nBahan bakar: ${car.fuel}\nHarga: ${formatCurrency(car.pricePerDay)}/hari\nStatus: ${availability}\n\nUntuk menghitung estimasi harga, ketik durasi sewa dalam hari, misalnya "2 hari".`;
};

const getPriceSummaryMessage = () => {
  const lines = MOCK_CARS.map((car) => `• ${car.name} – ${formatCurrency(car.pricePerDay)}/hari`);
  return `💰 Harga sewa per hari:\n\n${lines.join('\n')}\n\nKetik nama mobil untuk melihat estimasi harga per durasi atau pilih menu di bawah.`;
};

const getPriceDetailMessage = (car, days = null) => {
  if (!car) return null;
  const total = days ? formatCurrency(car.pricePerDay * days) : null;
  const dayExamples = [1, 2, 3]
    .map((day) => `${day} hari: ${formatCurrency(car.pricePerDay * day)}`)
    .join('\n');

  return `💰 Estimasi harga ${car.name}:\n\nHarga per hari: ${formatCurrency(car.pricePerDay)}\n${days ? `Total untuk ${days} hari: ${total}\n` : ''}\n${dayExamples}\n\nJika ingin melakukan booking, ketik "Booking Sekarang" atau hubungi admin.`;
};

export const getLocalBotResponse = (nextKey, message = '') => {
  const normalized = normalizeText(message);
  const car = findCarByText(normalized);
  const days = extractRentalDays(message);

  switch (nextKey) {
    case 'cars':
      return {
        content: `🚗 **Daftar Mobil**\n\nSilakan pilih mobil yang ingin Anda lihat.`,
        next: 'cars',
        suggestions: CAR_MENU_REPLIES,
      };

    case 'carDetail':
      return {
        content:
          getCarDetailMessage(car) ||
          '🚗 Saya tidak menemukan mobil dengan nama tersebut. Silakan pilih dari daftar mobil yang tersedia atau ketik nama mobil yang ingin Anda lihat.',
        next: 'postBooking',
        suggestions: POST_BOOKING_REPLIES,
      };

    case 'price':
      return {
        content: getPriceSummaryMessage(),
        next: 'price',
        suggestions: PRICE_MENU_REPLIES,
      };

    case 'priceDetail':
      return {
        content:
          getPriceDetailMessage(car, days) ||
          '💰 Silakan pilih salah satu mobil untuk melihat harga sewa secara detail atau ketik nama mobil dan durasi sewa.',
        next: 'price',
        suggestions: PRICE_MENU_REPLIES,
      };

    case 'booking':
      return {
        content:
          '📝 **Cara Pemesanan**\n\n1️⃣ Pilih mobil.\n2️⃣ Cek ketersediaan.\n3️⃣ Tentukan tanggal rental.\n4️⃣ Isi data pelanggan.\n5️⃣ Periksa data pemesanan.\n6️⃣ Konfirmasi pemesanan.\n\nSilakan ikuti proses pemesanan yang tersedia pada sistem.',
        next: 'booking',
        suggestions: BOOKING_MENU_REPLIES,
      };

    case 'requirements':
      return {
        content:
          '📋 **Syarat & Ketentuan**\n\nPelanggan wajib memberikan data yang benar dan memenuhi persyaratan rental yang berlaku.\n\nSilakan membaca seluruh ketentuan sebelum melakukan pemesanan.',
        next: 'requirements',
        suggestions: REQUIREMENTS_MENU_REPLIES,
      };

    case 'return':
      return {
        content:
          '🔄 Kebijakan pengembalian:\n\n• Kembalikan mobil sesuai tanggal dan waktu yang disepakati.\n• Jaga kondisi kendaraan selama penggunaan.\n• Jika terlambat, segera beri tahu admin.\n• Denda keterlambatan dapat dikenakan sesuai ketentuan.\n\nUntuk perubahan jadwal pengembalian, langsung hubungi admin.',
        next: 'return',
        suggestions: RETURN_MENU_REPLIES,
      };

    case 'location':
      return {
        content:
          '📍 Informasi lokasi dan kontak Subulussalam Rentcar:\n\nCek halaman Kontak untuk alamat lengkap dan peta.\nJika ingin langsung menghubungi kami, gunakan WhatsApp atau email admin.',
        next: 'location',
        suggestions: LOCATION_MENU_REPLIES,
      };

    case 'admin':
      return {
        content:
          '👨‍💼 Baik, percakapan Anda akan dilanjutkan oleh Admin. Silakan tunggu, Admin akan membantu Anda melalui chat ini.',
        next: 'admin',
        suggestions: [],
      };

    case 'postBooking':
      return {
        content:
          '✅ Anda dapat melanjutkan pemesanan di halaman booking dengan memilih mobil dan mengisi tanggal serta data diri.\n\nJika memerlukan bantuan langsung, hubungi admin.',
        next: 'booking',
        suggestions: BOOKING_MENU_REPLIES,
      };

    case 'checkAvailability':
      if (car) {
        const matchStart = message.match(/(\d{1,2}(?:\s*(?:januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember|jan|feb|mar|apr|mei|jun|jul|agu|sep|okt|nov|des)[a-z]*\s*(?:\d{4})?)?)\s*(?:sampai|hingga|-|s\/d)\s*/i);
        const matchEnd = message.match(/(?:sampai|hingga|-|s\/d)\s*(\d{1,2}(?:\s*(?:januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember|jan|feb|mar|apr|mei|jun|jul|agu|sep|okt|nov|des)[a-z]*\s*(?:\d{4})?)?)/i);
        
        if (matchStart && matchStart[1] && matchEnd && matchEnd[1]) {
          const parsedStart = matchStart[1].trim();
          const parsedEnd = matchEnd[1].trim();
          
          if (parsedStart && parsedEnd) {
            const isAvail = car.available; 
            if (isAvail) {
              return {
                content: `✅ **Mobil Tersedia**\n\nMobil ${car.name} tersedia untuk tanggal ${parsedStart} sampai ${parsedEnd}.\n\nSilakan pilih menu **Mulai Pemesanan** untuk melanjutkan.`,
                next: 'order',
                suggestions: [{ id: 'avail-order', label: '📝 Mulai Pemesanan', message: 'Mulai Pemesanan', next: 'order' }],
              };
            } else {
              return {
                content: `❌ **Mobil Tidak Tersedia**\n\nMohon maaf, ${car.name} tidak tersedia untuk tanggal ${parsedStart} sampai ${parsedEnd}.\n\nSilakan pilih tanggal lain atau cek mobil lainnya:`,
                next: 'availability',
                suggestions: [
                  { id: 'avail-other-date', label: '📅 Cek Tanggal Lain', message: 'Cek Ketersediaan', next: 'availability' },
                  { id: 'avail-other-car', label: '🚗 Cek Daftar Mobil', message: 'Daftar Mobil', next: 'cars' }
                ]
              };
            }
          }
        }
        return {
          content: `📅 **Cek Ketersediaan**\n\nSilakan masukkan tanggal mulai dan tanggal selesai untuk ${car.name}.`,
          next: 'checkAvailability',
          suggestions: [],
        };
      }
      return {
        content:
          '📅 **Cek Ketersediaan**\n\nSilakan masukkan nama mobil dan tanggal rental.\n\nContoh:\n"Toyota Avanza, 10 sampai 12 Agustus."',
        next: 'checkAvailability',
        suggestions: [],
      };

    case 'confirmation':
      return {
        content:
          '✅ Terima kasih! Pesanan Anda telah dikirim.\n\nSilakan tunggu konfirmasi dari admin. Jika ada pertanyaan, admin siap membantu.',
        next: 'confirmation',
        suggestions: CONFIRMATION_REPLIES,
      };

    case 'main':
      return {
        content: WELCOME_MESSAGE.content,
        next: 'main',
        suggestions: MAIN_MENU_REPLIES,
      };

    default:
      return {
        content:
          'Maaf 🙏 Saya belum dapat memahami pertanyaan Anda.\n\nSilakan gunakan menu **Hubungi Admin** untuk mendapatkan bantuan langsung.',
        next: 'unknown',
        suggestions: MAIN_MENU_REPLIES,
      };
  }
};

export const FAQ_DATA = [
  {
    keywords: ['harga', 'tarif', 'biaya', 'sewa', 'bayar', 'harganya'],
    answer:
      '💰 **Harga Sewa Mobil Kami:**\n\n• Toyota Avanza : Rp 280.000/hari\n• Toyota Innova : Rp 450.000/hari\n• Toyota Fortuner : Rp 700.000/hari\n• Toyota Alphard : Rp 1.200.000/hari\n\nUntuk estimasi harga per durasi, ketik nama mobil dan jumlah hari sewa.',
    category: 'harga',
  },
  {
    keywords: ['ketersediaan', 'tersedia', 'stok', 'mobil apa', 'jenis', 'tipe', 'daftar mobil'],
    answer:
      '🚗 **Armada Mobil Tersedia:**\n• Toyota Avanza\n• Toyota Innova\n• Toyota Fortuner\n• Toyota Alphard\n• Honda CR-V\n• Mitsubishi Pajero Sport\n\nUntuk detail atau ketersediaan terkini, silakan pilih mobil atau hubungi admin.',
    category: 'armada',
  },
  {
    keywords: ['cara', 'pesan', 'booking', 'pinjam', 'pesanan'],
    answer:
      '📋 **Cara Booking:**\n1. Pilih mobil yang diinginkan.\n2. Masukkan tanggal sewa dan tanggal kembali.\n3. Isi data penyewa.\n4. Kirim request booking.\n5. Tunggu konfirmasi admin.\n\nUntuk bantuan langsung, hubungi admin.',
    category: 'pemesanan',
  },
];

export const getBotResponse = (userMessage) => {
  const lowerMessage = normalizeText(userMessage);
  const matchedFAQ = FAQ_DATA.find((faq) =>
    faq.keywords.some((keyword) => lowerMessage.includes(keyword))
  );
  if (matchedFAQ) return matchedFAQ.answer;
  return (
    '🤔 Maaf, saya belum mengerti pertanyaan Anda.\n\nSilakan pilih salah satu menu yang tersedia agar saya dapat membantu Anda.\n\n• 🚗 Lihat Mobil\n• 💰 Harga Sewa\n• 📅 Cara Booking\n• 📋 Syarat Sewa\n• 🔄 Pengembalian\n• 👨‍💼 Hubungi Admin\n• 🏠 Menu Utama'
  );
};
