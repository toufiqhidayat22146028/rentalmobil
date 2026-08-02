// ============================================================
// CHAT ROUTES — /api/chat (MySQL version)
// Live chat dengan FAQ bot & admin support
// ============================================================

const router = require('express').Router();
const pool   = require('../db/database');
const { authenticate, adminOnly } = require('../middleware/auth');

const normalizeText = (text = '') => text.toLowerCase().trim();

const formatCurrency = (value) => {
  const amount = Number(value || 0);
  if (Number.isNaN(amount)) return 'Rp 0';
  return `Rp ${amount.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

const parseCarRow = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    name: row.nama,
    brand: row.merek,
    type: row.tipe,
    year: row.tahun,
    capacity: row.kapasitas,
    transmission: row.transmisi,
    fuel: row.bahan_bakar,
    pricePerDay: Number(row.harga_per_hari),
    available: Boolean(row.tersedia),
  };
};

const WELCOME_MESSAGE =
  '👋 Halo! Selamat datang di layanan Rental Mobil 🚗\n\n' +
  'Saya siap membantu Anda mendapatkan informasi dan melakukan pemesanan.\n\n' +
  'Silakan pilih menu:\n\n' +
  '🚗 Daftar Mobil\n' +
  '💰 Harga Rental\n' +
  '📅 Cek Ketersediaan\n' +
  '📝 Cara Pemesanan\n' +
  '📋 Syarat & Ketentuan\n' +
  '💳 Informasi Pembayaran\n' +
  '📦 Cek Pesanan\n' +
  '❌ Pembatalan Pesanan\n' +
  '💬 Pertanyaan Lainnya\n' +
  '👨‍💼 Hubungi Admin\n\n' +
  'Silakan pilih salah satu menu atau ketik pertanyaan mengenai rental mobil.';

const parseIndonesianDateText = (text) => {
  if (!text) return null;
  const match = text.trim().toLowerCase().match(/(\d{1,2})\s*(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember|jan|feb|mar|apr|mei|jun|jul|agu|sep|okt|nov|des)?\s*(\d{4})?/);
  if (!match) return null;
  const day = parseInt(match[1], 10);
  const months = ['jan', 'feb', 'mar', 'apr', 'mei', 'jun', 'jul', 'agu', 'sep', 'okt', 'nov', 'des'];
  let month = new Date().getMonth();
  if (match[2]) {
    const m = match[2].substring(0, 3);
    const mIndex = months.indexOf(m);
    if (mIndex !== -1) month = mIndex;
  }
  const year = match[3] ? parseInt(match[3], 10) : new Date().getFullYear();
  const d = new Date(year, month, day);
  return d.toISOString().split('T')[0];
};

const checkAvailability = async (carId, startDate, endDate) => {
  const [rows] = await pool.query(`
    SELECT * FROM peminjaman 
    WHERE mobil_id = ? 
      AND status IN ('pending', 'approved', 'active') 
      AND (tanggal_mulai <= ? AND tanggal_kembali >= ?)
  `, [carId, endDate, startDate]);
  return rows.length === 0;
};

const buildCarListMessage = async () => {
  const [rows] = await pool.query('SELECT * FROM mobil ORDER BY id ASC');
  const today = new Date().toISOString().split('T')[0];
  
  const suggestions = await Promise.all(rows.map(async row => {
    const isAvailable = await checkAvailability(row.id, today, today);
    const isReallyAvailable = Boolean(row.tersedia) && isAvailable;
    
    return {
      id: `car-${row.id}`,
      label: `🚘 ${row.nama}${isReallyAvailable ? '' : ' (Tidak Tersedia)'}`,
      message: row.nama,
      next: 'car_detail'
    };
  }));
  
  suggestions.push({ id: 'cars-back', label: '🏠 Menu Utama', message: 'Menu Utama', next: 'main' });

  return {
    response: '🚗 **Daftar Mobil**\n\nSilakan pilih mobil yang ingin Anda lihat.',
    suggestions
  };
};

const buildPriceListMessage = async () => {
  return '💰 **Harga Rental**\n\nSilakan pilih mobil yang ingin Anda ketahui harganya.';
};

const buildBookingGuide = () =>
  '📝 **Cara Pemesanan**\n\n' +
  '1️⃣ Pilih mobil.\n' +
  '2️⃣ Cek ketersediaan.\n' +
  '3️⃣ Tentukan tanggal rental.\n' +
  '4️⃣ Isi data pelanggan.\n' +
  '5️⃣ Periksa data pemesanan.\n' +
  '6️⃣ Konfirmasi pemesanan.\n\n' +
  'Silakan ikuti proses pemesanan yang tersedia pada sistem.';

const buildTermsMessage = () =>
  '📋 **Syarat & Ketentuan**\n\n' +
  'Pelanggan wajib memberikan data yang benar dan memenuhi persyaratan rental yang berlaku.\n\n' +
  'Silakan membaca seluruh ketentuan sebelum melakukan pemesanan.';

const buildPaymentInfoMessage = () =>
  '💳 **Informasi Pembayaran**\n\n' +
  'Pembayaran dilakukan sesuai metode pembayaran yang tersedia pada sistem.\n\n' +
  'Silakan pilih:\n' +
  '💳 Metode Pembayaran\n' +
  '📦 Status Pembayaran\n' +
  '🔙 Menu Utama';

const buildCheckOrderPrompt = () =>
  '📦 **Cek Pesanan**\n\n' +
  'Silakan masukkan:\n\n' +
  '🔢 Nomor Pesanan\n' +
  'atau\n' +
  '📱 Nomor WhatsApp yang digunakan saat melakukan pemesanan.';

const buildCancelPrompt = () =>
  '❌ **Pembatalan Pesanan**\n\n' +
  'Silakan masukkan nomor pesanan atau nomor WhatsApp yang digunakan saat melakukan pemesanan.';

const buildOtherQuestionPrompt = () =>
  '💬 Silakan tuliskan pertanyaan Anda mengenai layanan rental mobil.\n\n' +
  'Contoh:\n' +
  '🚗 Mobil apa yang tersedia?\n' +
  '💰 Berapa harga Avanza?\n' +
  '📅 Apakah Avanza tersedia?\n' +
  '📝 Bagaimana cara rental?\n' +
  '💳 Bagaimana cara pembayaran?';

const findCarByText = async (text) => {
  const normalized = normalizeText(text);
  if (!normalized) return null;

  const [rows] = await pool.query('SELECT * FROM mobil');
  
  const foundCar = rows.find((car) => {
    const name = normalizeText(car.nama);
    const shortName = name.replace(/toyota|honda|mitsubishi|daihatsu|suzuki|nissan/g, '').trim();
    
    if (normalized.includes(name)) return true;
    if (shortName && normalized.includes(shortName)) return true;
    
    const words = name.split(' ').filter(w => w.length > 3);
    return words.some(word => normalized.includes(word));
  });

  return foundCar ? parseCarRow(foundCar) : null;
};

const getBotResponse = async (userMessage) => {
  const lower = normalizeText(userMessage);
  const car = await findCarByText(lower);
  const result = { response: '', setAdminMode: false };

  if (/hubungi admin|kontak admin|chat admin|customer service|👨‍💼 hubungi admin/.test(lower)) {
    result.response = '👨‍💼 Baik, percakapan Anda akan dilanjutkan oleh Admin. Silakan tunggu, Admin akan membantu Anda melalui chat ini.';
    result.setAdminMode = true;
    return result;
  }

  if (/daftar mobil|lihat mobil|armada|list mobil|🚗 daftar mobil/.test(lower)) {
    const listMsg = await buildCarListMessage();
    result.response = listMsg.response;
    result.suggestions = listMsg.suggestions;
    return result;
  }

  if (/harga rental|harga sewa|berapa harga|tarif|biaya sewa|💰 harga rental/.test(lower)) {
    if (car) {
      const dayMatch = lower.match(/(\d+)\s*hari/);
      if (dayMatch) {
        const days = parseInt(dayMatch[1], 10);
        const total = car.pricePerDay * days;
        result.response = `💰 **Estimasi Rental**\n\nMobil: ${car.name}\nDurasi: ${days} hari\nTotal Harga: ${formatCurrency(total)}\n\nApakah Anda ingin melanjutkan pemesanan?`;
      } else {
        result.response = `🚗 ${car.name}\n\n💰 Harga rental: ${formatCurrency(car.pricePerDay)}/hari\n\nBerapa hari Anda ingin menyewa?`;
      }
      return result;
    }
    result.response = await buildPriceListMessage();
    return result;
  }

  // Handle specific car query if it contains days without "harga rental" keyword
  if (car) {
    const dayMatch = lower.match(/(\d+)\s*hari/);
    if (dayMatch) {
      const days = parseInt(dayMatch[1], 10);
      const total = car.pricePerDay * days;
      result.response = `💰 **Estimasi Rental**\n\nMobil: ${car.name}\nDurasi: ${days} hari\nTotal Harga: ${formatCurrency(total)}\n\nApakah Anda ingin melanjutkan pemesanan?`;
      return result;
    }
  }

  if (/cek ketersediaan|ketersediaan|tersedia|📅 cek ketersediaan/.test(lower)) {
    const dateMatch = lower.match(/(\d{1,2}(?:\s*(?:januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember|jan|feb|mar|apr|mei|jun|jul|agu|sep|okt|nov|des)[a-z]*\s*(?:\d{4})?)?)\s*(?:sampai|hingga|-|s\/d)\s*(\d{1,2}(?:\s*(?:januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember|jan|feb|mar|apr|mei|jun|jul|agu|sep|okt|nov|des)[a-z]*\s*(?:\d{4})?)?)/);
    
    if (car && dateMatch) {
       const startStr = dateMatch[1].trim();
       const endStr = dateMatch[2].trim();
       const parsedStart = parseIndonesianDateText(startStr);
       const parsedEnd = parseIndonesianDateText(endStr);
       
       if (parsedStart && parsedEnd) {
         const isAvailable = await checkAvailability(car.id, parsedStart, parsedEnd);
         if (isAvailable) {
           result.response = `✅ **Mobil Tersedia**\n\nMobil ${car.name} tersedia untuk tanggal ${startStr} sampai ${endStr}.\n\nSilakan pilih menu **Mulai Pemesanan** untuk melanjutkan.`;
           result.suggestions = [{ id: 'avail-order', label: '📝 Mulai Pemesanan', message: 'Mulai Pemesanan', next: 'order' }];
         } else {
           result.response = `❌ **Mobil Tidak Tersedia**\n\nMohon maaf, ${car.name} tidak tersedia untuk tanggal ${startStr} sampai ${endStr}.\n\nSilakan pilih tanggal lain atau cek mobil lainnya:`;
           result.suggestions = [
             { id: 'avail-other-date', label: '📅 Cek Tanggal Lain', message: 'Cek Ketersediaan', next: 'availability' },
             { id: 'avail-other-car', label: '🚗 Cek Daftar Mobil', message: 'Daftar Mobil', next: 'cars' }
           ];
         }
       } else {
         result.response = `✅ **Mobil Tersedia**\n\nMobil ${car.name} tersedia untuk tanggal ${startStr} sampai ${endStr}.\n\nSilakan pilih menu **Mulai Pemesanan** untuk melanjutkan.`;
         result.suggestions = [{ id: 'avail-order', label: '📝 Mulai Pemesanan', message: 'Mulai Pemesanan', next: 'order' }];
       }
       return result;
    }

    if (car) {
      result.response = `📅 **Cek Ketersediaan**\n\nSilakan masukkan tanggal mulai dan tanggal selesai untuk ${car.name}.`;
      return result;
    }
    result.response = '📅 **Cek Ketersediaan**\n\nSilakan masukkan nama mobil dan tanggal rental.\n\nContoh:\n"Toyota Avanza, 10 sampai 12 Agustus."';
    return result;
  }

  if (/cara pemesanan|cara booking|bagaimana cara memesan|bagaimana cara rental|📝 cara pemesanan/.test(lower)) {
    result.response = buildBookingGuide();
    return result;
  }

  if (/syarat|ketentuan|persyaratan|📋 syarat & ketentuan/.test(lower)) {
    result.response = buildTermsMessage();
    return result;
  }

  if (/informasi pembayaran|metode pembayaran|status pembayaran|pembayaran/.test(lower)) {
    result.response = buildPaymentInfoMessage();
    return result;
  }

  if (/cek pesanan|nomor pesanan|status pesanan|status order/.test(lower)) {
    result.response = buildCheckOrderPrompt();
    return result;
  }

  if (/pembatalan|batalkan|cancel/.test(lower)) {
    result.response = buildCancelPrompt();
    return result;
  }

  if (/pertanyaan lain|pertanyaan lainnya|lainnya|tanya/.test(lower)) {
    result.response = buildOtherQuestionPrompt();
    return result;
  }

  if (car) {
    result.response = `🚘 **${car.name}**\n\n💺 Kapasitas: ${car.capacity} orang\n⚙️ Transmisi: ${car.transmission}\n⛽ Bahan bakar: ${car.fuel}\n💰 Harga: ${formatCurrency(car.pricePerDay)}/hari\n\nSilakan pilih menu berikut:\n\n📅 Cek Ketersediaan\n📝 Cara Pemesanan`;
    return result;
  }

  result.response = 'Maaf 🙏 Saya belum dapat membantu dengan pertanyaan tersebut. Silakan gunakan menu **Hubungi Admin** agar dapat dibantu langsung.';
  return result;
};

// ── Helpers: Map data database ke format payload bahasa Inggris ──
const mapConversation = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    session_id: row.session_id,
    sessionId: row.session_id,
    user_id: row.pengguna_id,
    userId: row.pengguna_id,
    status: row.status === 'aktif' ? 'active' : 'closed',
    admin_mode: row.admin_mode,
    adminMode: Boolean(row.admin_mode),
    unread_count: row.jumlah_belum_dibaca,
    unreadCount: row.jumlah_belum_dibaca,
    last_message_at: row.pesan_terakhir_pada,
    lastMessageAt: row.pesan_terakhir_pada,
    created_at: row.dibuat_pada,
    createdAt: row.dibuat_pada,
    user_name: row.user_name,
    user_email: row.user_email,
    user_avatar: row.user_avatar,
    last_message: row.last_message,
  };
};

const mapMessage = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    session_id: row.session_id,
    sessionId: row.session_id,
    conversation_id: row.percakapan_id,
    conversationId: row.percakapan_id,
    sender_role: row.peran_pengirim,
    senderRole: row.peran_pengirim,
    role: row.peran_pengirim,
    sender_name: row.nama_pengirim,
    senderName: row.nama_pengirim,
    content: row.isi_pesan,
    is_read: row.sudah_dibaca,
    isRead: Boolean(row.sudah_dibaca),
    created_at: row.dibuat_pada,
    createdAt: row.dibuat_pada,
  };
};

// ── GET /api/chat/history — Ambil history conversation ──
router.get('/history', authenticate, async (req, res) => {
  try {
    const [conversations] = await pool.query(`
      SELECT c.*,
             (SELECT isi_pesan FROM chat_pesan WHERE percakapan_id = c.id ORDER BY dibuat_pada DESC LIMIT 1) AS last_message
      FROM chat_percakapan c
      WHERE c.pengguna_id = ?
      ORDER BY c.dibuat_pada DESC
    `, [req.user.id]);

    res.json({ success: true, data: conversations.map(mapConversation), total: conversations.length });
  } catch (err) {
    console.error('[CHAT API ERROR] GET /history', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/chat — Buat atau ambil conversation aktif ───
router.post('/', authenticate, async (req, res) => {
  try {
    const { forceNew } = req.body || {};

    let existing = [];
    if (!forceNew) {
      // Cek apakah user sudah punya conversation aktif
      const [rows] = await pool.query(
        'SELECT * FROM chat_percakapan WHERE pengguna_id = ? AND status = ? ORDER BY dibuat_pada DESC LIMIT 1',
        [req.user.id, 'aktif']
      );
      existing = rows;
    }

    let conversation;

    if (existing.length > 0) {
      // Sudah ada conversation aktif, ambil beserta pesan-pesannya
      conversation = mapConversation(existing[0]);
      const [messages] = await pool.query(
        'SELECT * FROM chat_pesan WHERE percakapan_id = ? ORDER BY dibuat_pada ASC',
        [conversation.id]
      );
      return res.json({
        success: true,
        data: { ...conversation, messages: messages.map(mapMessage) },
        message: 'Conversation aktif ditemukan.',
      });
    }

    // Buat conversation baru
    const sessionId = `CHAT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      const [result] = await pool.query(
        `INSERT INTO chat_percakapan (pengguna_id, session_id, status, pesan_terakhir_pada, dibuat_pada)
         VALUES (?, ?, 'aktif', ?, ?)`,
        [req.user.id, sessionId, new Date(), new Date()]
      );
    const conversationId = result.insertId;

    // Masukkan pesan pembuka otomatis dari bot
    await pool.query(
        `INSERT INTO chat_pesan (percakapan_id, session_id, peran_pengirim, nama_pengirim, isi_pesan, sudah_dibaca, dibuat_pada)
         VALUES (?, ?, 'bot', 'AsistenBot', ?, 1, ?)`,
        [conversationId, sessionId, WELCOME_MESSAGE, new Date()]
    );

    // Ambil data conversation yang baru dibuat
    const [[newConvRow]] = await pool.query(
      'SELECT * FROM chat_percakapan WHERE id = ?',
      [conversationId]
    );
    const newConv = mapConversation(newConvRow);
    const [messages] = await pool.query(
      'SELECT * FROM chat_pesan WHERE percakapan_id = ? ORDER BY dibuat_pada ASC',
      [conversationId]
    );

    res.status(201).json({
      success: true,
      data: { ...newConv, messages: messages.map(mapMessage) },
      message: 'Conversation baru berhasil dibuat.',
    });
  } catch (err) {
    console.error('[CHAT API ERROR] POST /', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/chat/conversations — Semua conversation (admin)
// ⚠️ Harus didaftarkan SEBELUM route /:id agar tidak tertangkap sebagai param
router.get('/conversations', authenticate, adminOnly, async (req, res) => {
  try {
    const [conversations] = await pool.query(`
      SELECT c.*, u.nama AS user_name, u.email AS user_email, u.avatar AS user_avatar,
             (SELECT isi_pesan FROM chat_pesan WHERE percakapan_id = c.id ORDER BY dibuat_pada DESC LIMIT 1) AS last_message
      FROM chat_percakapan c
      JOIN pengguna u ON u.id = c.pengguna_id
      ORDER BY c.pesan_terakhir_pada DESC
    `);

    res.json({ success: true, data: conversations.map(mapConversation), total: conversations.length });
  } catch (err) {
    console.error('[CHAT API ERROR] GET /conversations', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/chat/:id/messages — Ambil pesan conversation ─
router.get('/:id/messages', authenticate, async (req, res) => {
  try {
    // Ambil conversation & verifikasi akses
    const [[row]] = await pool.query(
      'SELECT * FROM chat_percakapan WHERE id = ?',
      [req.params.id]
    );
    const conversation = mapConversation(row);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation tidak ditemukan.' });
    }

    // Pastikan user pemilik conversation atau admin
    if (req.user.role !== 'admin' && conversation.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Akses ditolak.' });
    }

    const [messages] = await pool.query(
      'SELECT * FROM chat_pesan WHERE percakapan_id = ? ORDER BY dibuat_pada ASC',
      [req.params.id]
    );

    res.json({ success: true, data: messages.map(mapMessage) });
  } catch (err) {
    console.error('[CHAT API ERROR] GET /:id/messages', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/chat/:id/messages — Kirim pesan ke conversation
router.post('/:id/messages', authenticate, async (req, res) => {
  try {
    const { content, senderRole } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Isi pesan tidak boleh kosong.' });
    }

    // Validasi senderRole
    if (!['user', 'admin'].includes(senderRole)) {
      return res.status(400).json({ success: false, message: 'Role pengirim tidak valid.' });
    }

    // Verifikasi conversation ada dan aktif
    const [[row]] = await pool.query(
      'SELECT * FROM chat_percakapan WHERE id = ?',
      [req.params.id]
    );
    const conversation = mapConversation(row);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation tidak ditemukan.' });
    }

    if (row.status !== 'aktif') {
      return res.status(400).json({ success: false, message: 'Conversation sudah ditutup. Silakan mulai percakapan baru.' });
    }

    // Pastikan user pemilik conversation atau admin
    if (req.user.role !== 'admin' && conversation.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Akses ditolak.' });
    }

    const resultMessages = [];

    if (senderRole === 'user') {
      // ── Simpan pesan user ────────────────────────────────
      const [userResult] = await pool.query(
        `INSERT INTO chat_pesan (percakapan_id, session_id, peran_pengirim, nama_pengirim, isi_pesan, sudah_dibaca, dibuat_pada)
         VALUES (?, ?, 'user', ?, ?, 0, ?)`,
        [req.params.id, conversation.session_id, req.user.name || '', content.trim(), new Date()]
      );
      const [[userMsgRow]] = await pool.query('SELECT * FROM chat_pesan WHERE id = ?', [userResult.insertId]);
      resultMessages.push(mapMessage(userMsgRow));

      // Jika admin_mode tidak aktif, bot merespon
      if (!conversation.adminMode) {
        const botResultData = await getBotResponse(content);
        if (botResultData) {
          if (botResultData.setAdminMode) {
            await pool.query('UPDATE chat_percakapan SET admin_mode = 1 WHERE id = ?', [req.params.id]);
          }
          const [botResult] = await pool.query(
            `INSERT INTO chat_pesan (percakapan_id, session_id, peran_pengirim, nama_pengirim, isi_pesan, sudah_dibaca, dibuat_pada)
             VALUES (?, ?, 'bot', 'AsistenBot', ?, 0, ?)`,
            [req.params.id, conversation.session_id, botResultData.response, new Date()]
          );
          const [[botMsgRow]] = await pool.query('SELECT * FROM chat_pesan WHERE id = ?', [botResult.insertId]);
          const botMsgObj = mapMessage(botMsgRow);
          if (botResultData.suggestions) {
            botMsgObj.suggestions = botResultData.suggestions;
          }
          resultMessages.push(botMsgObj);
        }
      }

      // Update pesan_terakhir_pada & increment jumlah_belum_dibaca (untuk admin)
      await pool.query(
        'UPDATE chat_percakapan SET pesan_terakhir_pada = ?, jumlah_belum_dibaca = jumlah_belum_dibaca + 1 WHERE id = ?',
        [new Date(), req.params.id]
      );
    } else if (senderRole === 'admin') {
      // ── Simpan pesan admin ───────────────────────────────
      const [adminResult] = await pool.query(
        `INSERT INTO chat_pesan (percakapan_id, session_id, peran_pengirim, nama_pengirim, isi_pesan, sudah_dibaca, dibuat_pada)
         VALUES (?, ?, 'admin', ?, ?, 1, ?)`,
        [req.params.id, conversation.session_id, req.user.name || 'Admin', content.trim(), new Date()]
      );
      const [[adminMsgRow]] = await pool.query('SELECT * FROM chat_pesan WHERE id = ?', [adminResult.insertId]);
      resultMessages.push(mapMessage(adminMsgRow));

      // Update pesan_terakhir_pada & reset jumlah_belum_dibaca (admin sudah baca), and set admin_mode = 1
      await pool.query(
        'UPDATE chat_percakapan SET pesan_terakhir_pada = ?, jumlah_belum_dibaca = 0, admin_mode = 1 WHERE id = ?',
        [new Date(), req.params.id]
      );
    }

    res.status(201).json({
      success: true,
      data: resultMessages,
      message: 'Pesan berhasil dikirim.',
    });
  } catch (err) {
    console.error('[CHAT API ERROR] POST /:id/messages', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PATCH /api/chat/:id/read — Tandai sudah dibaca (admin) ─
router.patch('/:id/read', authenticate, adminOnly, async (req, res) => {
  try {
    const [[row]] = await pool.query(
      'SELECT id FROM chat_percakapan WHERE id = ?',
      [req.params.id]
    );
    if (!row) {
      return res.status(404).json({ success: false, message: 'Conversation tidak ditemukan.' });
    }

    // Tandai semua pesan user sebagai sudah dibaca
    await pool.query(
      "UPDATE chat_pesan SET sudah_dibaca = 1 WHERE percakapan_id = ? AND peran_pengirim = 'user'",
      [req.params.id]
    );

    // Reset jumlah_belum_dibaca pada conversation
    await pool.query(
      'UPDATE chat_percakapan SET jumlah_belum_dibaca = 0 WHERE id = ?',
      [req.params.id]
    );

    res.json({ success: true, message: 'Semua pesan ditandai sudah dibaca.' });
  } catch (err) {
    console.error('[CHAT API ERROR] PATCH /:id/read', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PATCH /api/chat/:id/close — Tutup conversation (user atau admin) ─
router.patch('/:id/close', authenticate, async (req, res) => {
  try {
    const [[row]] = await pool.query(
      'SELECT * FROM chat_percakapan WHERE id = ?',
      [req.params.id]
    );
    if (!row) {
      return res.status(404).json({ success: false, message: 'Conversation tidak ditemukan.' });
    }

    if (req.user.role !== 'admin' && row.pengguna_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Akses ditolak.' });
    }

    await pool.query(
      "UPDATE chat_percakapan SET status = 'ditutup', jumlah_belum_dibaca = 0 WHERE id = ?",
      [req.params.id]
    );

    res.json({ success: true, message: 'Conversation berhasil ditutup.' });
  } catch (err) {
    console.error('[CHAT API ERROR] PATCH /:id/close', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── DELETE /api/chat/:id — Hapus conversation (admin) ─
router.delete('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const [[row]] = await pool.query(
      'SELECT id FROM chat_percakapan WHERE id = ?',
      [req.params.id]
    );
    if (!row) {
      return res.status(404).json({ success: false, message: 'Conversation tidak ditemukan.' });
    }

    await pool.query('DELETE FROM chat_percakapan WHERE id = ?', [req.params.id]);

    res.json({ success: true, message: 'Percakapan berhasil dihapus.' });
  } catch (err) {
    console.error('[CHAT API ERROR] DELETE /:id', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PATCH /api/chat/:id/reopen — Buka kembali conversation ─
router.patch('/:id/reopen', authenticate, adminOnly, async (req, res) => {
  try {
    const [[row]] = await pool.query(
      'SELECT id, status FROM chat_percakapan WHERE id = ?',
      [req.params.id]
    );
    if (!row) {
      return res.status(404).json({ success: false, message: 'Conversation tidak ditemukan.' });
    }

    await pool.query(
      "UPDATE chat_percakapan SET status = 'aktif' WHERE id = ?",
      [req.params.id]
    );

    res.json({ success: true, message: 'Conversation berhasil dibuka kembali.' });
  } catch (err) {
    console.error('[CHAT API ERROR] PATCH /:id/reopen', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
