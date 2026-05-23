// ============================================================
// DATA FAQ CHATBOT
// File ini berisi daftar pertanyaan dan jawaban yang digunakan
// oleh chatbot untuk memberikan respons otomatis.
// Format: Array of objects { keywords: [], answer: '' }
// ============================================================

export const FAQ_DATA = [
  {
    // Kata kunci yang dicari dalam pesan pengguna
    keywords: ['harga', 'tarif', 'biaya', 'sewa', 'bayar', 'harganya'],
    // Jawaban yang akan dikirim chatbot
    answer: '💰 **Harga Sewa Mobil Kami:**\n\n• Avanza / Xenia : Rp 280.000/hari\n• Toyota Innova : Rp 400.000/hari\n• Fortuner / Pajero : Rp 650.000/hari\n• Alphard : Rp 1.200.000/hari\n\n_Harga sudah termasuk BBM dan sopir (opsional)._\n\nMau lihat semua pilihan? Kunjungi halaman **Katalog Mobil**! 🚗',
    category: 'harga',
  },
  {
    keywords: ['tersedia', 'ada', 'stok', 'mobil apa', 'jenis', 'tipe', 'daftar mobil'],
    answer: '🚗 **Armada Mobil Tersedia:**\n\n• SUV: Fortuner, Pajero, CRV\n• MPV: Avanza, Xenia, Innova, Alphard\n• Sedan: Camry, Accord\n• City Car: Brio, Agya\n\nSemua dalam kondisi prima dan terawat! Cek ketersediaan terkini di halaman **Katalog Mobil**. 😊',
    category: 'armada',
  },
  {
    keywords: ['cara', 'pesan', 'booking', 'pinjam', 'sewa', 'bisa pesan', 'cara pinjam'],
    answer: '📋 **Cara Memesan / Meminjam Mobil:**\n\n1. 🔍 Pilih mobil di halaman Katalog\n2. 📅 Tentukan tanggal pinjam & kembali\n3. 📝 Isi form peminjaman dengan lengkap\n4. ✅ Tunggu konfirmasi dari admin (maks. 1x24 jam)\n5. 💳 Lakukan pembayaran sesuai instruksi\n6. 🚗 Ambil mobil sesuai jadwal!\n\nAda pertanyaan lain? 😊',
    category: 'pemesanan',
  },
  {
    keywords: ['syarat', 'persyaratan', 'dokumen', 'ktp', 'sim', 'berkas'],
    answer: '📄 **Persyaratan Peminjaman:**\n\n• ✅ KTP / Identitas diri yang masih berlaku\n• ✅ SIM A yang masih berlaku\n• ✅ Deposit jaminan (dikembalikan setelah selesai)\n• ✅ Akun terdaftar di sistem kami\n\n_Semua dokumen akan diverifikasi oleh admin sebelum konfirmasi._',
    category: 'syarat',
  },
  {
    keywords: ['kembali', 'telat', 'keterlambatan', 'lewat', 'denda', 'overtime'],
    answer: '⏰ **Kebijakan Keterlambatan:**\n\nBiaya keterlambatan:\n• < 3 jam : Rp 50.000/jam\n• > 3 jam : Dihitung 1 hari penuh\n\n_Mohon segera hubungi kami jika ada kendala pengembalian. Kami siap membantu! 📞_',
    category: 'kebijakan',
  },
  {
    keywords: ['bayar', 'pembayaran', 'transfer', 'metode', 'payment', 'cara bayar'],
    answer: '💳 **Metode Pembayaran:**\n\n• 🏦 Transfer Bank (BCA, Mandiri, BRI)\n• 📱 QRIS / GoPay / OVO / Dana\n• 💵 Tunai (bayar di lokasi)\n\n_Pembayaran dilakukan setelah konfirmasi dari admin._',
    category: 'pembayaran',
  },
  {
    keywords: ['batal', 'cancel', 'pembatalan', 'refund'],
    answer: '🚫 **Kebijakan Pembatalan:**\n\n• Batal > 24 jam sebelum: Refund 100%\n• Batal 12-24 jam sebelum: Refund 50%\n• Batal < 12 jam: Tidak ada refund\n\n_Untuk pembatalan, hubungi admin melalui sistem atau nomor kontak kami._',
    category: 'pembatalan',
  },
  {
    keywords: ['hubungi', 'kontak', 'telepon', 'whatsapp', 'email', 'cs', 'customer service'],
    answer: '📞 **Hubungi Kami:**\n\n• 📱 WhatsApp: 0812-3456-7890\n• 📧 Email: info@rentalmobil.com\n• 🕐 Layanan: Senin-Minggu, 07.00-21.00 WIB\n\nAtau kunjungi halaman **Kontak** untuk info lengkap!',
    category: 'kontak',
  },
  {
    keywords: ['jam', 'operasional', 'buka', 'tutup', 'waktu'],
    answer: '🕐 **Jam Operasional:**\n\n• Senin – Jumat: 07.00 – 21.00 WIB\n• Sabtu – Minggu: 08.00 – 20.00 WIB\n• Hari Libur Nasional: Tutup\n\n_Pemesanan online tetap bisa dilakukan 24 jam!_ ✨',
    category: 'operasional',
  },
];

// ============================================================
// PESAN SAMBUTAN AWAL CHATBOT
// Muncul saat pertama kali chatbot dibuka
// ============================================================
export const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'bot',
  // Konten pesan sambutan
  content: '👋 Halo! Saya **AsistenBot RentalMobil**.\n\nSaya siap membantu Anda dengan informasi seputar:\n• 🚗 Katalog & ketersediaan mobil\n• 💰 Harga sewa\n• 📋 Cara peminjaman\n• 📄 Persyaratan & kebijakan\n\nSilakan ketik pertanyaan Anda! 😊',
  timestamp: new Date().toISOString(),
};

// ============================================================
// DAFTAR PERTANYAAN CEPAT (QUICK REPLIES)
// Tombol shortcut untuk pertanyaan yang paling sering ditanya
// ============================================================
export const QUICK_REPLIES = [
  { id: 'qr-1', label: '💰 Lihat Harga', message: 'Berapa harga sewa mobil?' },
  { id: 'qr-2', label: '🚗 Mobil Tersedia', message: 'Mobil apa saja yang tersedia?' },
  { id: 'qr-3', label: '📋 Cara Pesan', message: 'Bagaimana cara memesan mobil?' },
  { id: 'qr-4', label: '📄 Syarat Pinjam', message: 'Apa saja persyaratan peminjaman?' },
];

// ============================================================
// FUNGSI UTAMA: MENDAPATKAN RESPONS CHATBOT
// Menerima teks input pengguna, lalu mencari jawaban
// yang cocok berdasarkan kata kunci di FAQ_DATA
// ============================================================
export const getBotResponse = (userMessage) => {
  // Ubah pesan pengguna ke huruf kecil semua agar pencarian tidak case-sensitive
  const lowerMessage = userMessage.toLowerCase().trim();

  // Cari FAQ yang cocok dengan cara mengecek apakah salah satu keyword
  // ada dalam pesan pengguna menggunakan Array.some()
  const matchedFAQ = FAQ_DATA.find((faq) =>
    faq.keywords.some((keyword) => lowerMessage.includes(keyword))
  );

  // Jika ada FAQ yang cocok, kembalikan jawabannya
  if (matchedFAQ) {
    return matchedFAQ.answer;
  }

  // Jika tidak ada yang cocok, kembalikan pesan default
  return '🤔 Maaf, saya belum mengerti pertanyaan Anda.\n\nCoba tanyakan tentang:\n• Harga sewa mobil\n• Mobil yang tersedia\n• Cara pemesanan\n• Persyaratan pinjam\n\nAtau hubungi CS kami di **0812-3456-7890** untuk bantuan lebih lanjut! 😊';
};
