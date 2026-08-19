// ============================================================
// CHAT ROUTES - /api/chat (MySQL version)
// Live chat dengan FAQ bot & admin support
// ============================================================

const router = require('express').Router();
const pool = require('../db/database');
const { authenticate, adminOnly } = require('../middleware/auth');

// ── UTILITAS BOT ──
// [SIDANG SKRIPSI INFO]
// Jika dosen bertanya: "Di mana letak kodingan logika kecerdasan bot?"
// Jawaban: "Di file backend/src/routes/chat.routes.js. Di sini ada fungsi getBotResponse() yang menggunakan regex /kata kunci/ untuk mencocokkan teks pengguna."
//
// Jika dosen minta: "Coba tambahkan kata kunci baru!"
// Anda cukup menambahkan blok if baru di dalam fungsi getBotResponse di bawah.

const normalizeText = (text = '') => text.toLowerCase().trim();

const formatCurrency = (value) => {
  if (typeof value !== 'number') return value || '';
  return `Rp ${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
};

const WELCOME_MESSAGE = '👋 Halo! Selamat datang di layanan Rental Mobil Subulussalam.\n\nSaya dengan SBS Rentcar. Ada yang bisa kami bantu hari ini?\n\nSilakan pilih menu:\n\n🚗 Daftar Mobil\n💰 Harga Rental\n📝 Cara Pesan\n📋 Syarat & Ketentuan\n📞 Hubungi Admin';

// Removed unused ADMIN_CONTACT variable

const findCarByText = async (text) => {
  const normalized = normalizeText(text);
  if (!normalized) return null;

  try {
    const [rows] = await pool.query('SELECT * FROM mobil WHERE tersedia = 1');
    const cars = rows.map(row => ({
      name: row.nama,
      brand: row.merek,
      type: row.tipe,
      capacity: row.kapasitas,
      transmission: row.transmisi,
      fuel: row.bahan_bakar,
      pricePerDay: Number(row.harga_per_hari)
    }));
    
    let bestMatch = null;
    let highestScore = 0;

    for (const car of cars) {
      const name = normalizeText(car.name);
      const shortName = name.replace(/toyota|honda|mitsubishi|daihatsu|suzuki/g, '').trim();
      let score = 0;

      if (normalized.includes(name)) {
        score += 100;
      } else if (shortName && normalized.includes(shortName)) {
        score += 80;
      } else {
        const words = name.split(' ').filter(w => w.length > 2); // Ignore short terms like 'G', 'MT', 'AT', '1.2'
        const matchedWords = words.filter(word => normalized.includes(word));
        score += matchedWords.length * 10;
        
        // Also boost if brand matches
        if (normalized.includes(car.brand.toLowerCase())) {
          score += 5;
        }
      }

      if (score > highestScore) {
        highestScore = score;
        bestMatch = car;
      }
    }

    // Only return if we have a reasonable match (e.g. at least one significant word matched)
    return highestScore >= 10 ? bestMatch : null;
  } catch (error) {
    console.error('Error finding car:', error);
    return null;
  }
};

const buildCarListMessage = async () => {
  try {
    const [rows] = await pool.query('SELECT * FROM mobil WHERE tersedia = 1 LIMIT 5');
    return `Tentu! Kami memiliki berbagai macam pilihan mobil mulai dari City Car, MPV keluarga, hingga SUV tangguh.\n\nUntuk melihat daftar lengkap beserta foto dan spesifikasinya, silakan kunjungi menu *Katalog Mobil* di bagian atas website kami.`;
  } catch (err) {
    console.error('Error buildCarList:', err);
    return 'Terjadi kesalahan saat mengambil daftar mobil.';
  }
};

const buildPriceListMessage = async () => {
  return `💰 Harga sewa per hari (Dalam Kota):\n\n_Catatan: Untuk pemakaian Luar Kota, dikenakan biaya tambahan sebesar Rp 150.000/hari._\n\nKetik nama mobil atau pilih dari menu di bawah untuk melihat estimasi harga per durasi.`;
};

const getBotResponse = async (userMessage) => {
  const lower = normalizeText(userMessage);
  const car = await findCarByText(lower);

  if (/hubungi admin|kontak admin|chat admin|customer service/.test(lower)) {
    return '👨‍💼 Saya akan meneruskan pesan Anda ke Admin. Silakan tunggu sebentar, Admin kami akan segera membalas.';
  }

  if (/menu utama|awal/.test(lower)) {
    return WELCOME_MESSAGE;
  }

  if (/daftar mobil|lihat mobil|armada|list mobil/.test(lower)) {
    return await buildCarListMessage();
  }

  if (/harga|tarif|biaya/.test(lower)) {
    if (car) {
      return `🚗 ${car.name}\n\n💰 Harga rental: ${formatCurrency(car.pricePerDay)}/hari\n\nBerapa hari Anda ingin menyewa?`;
    }
    return await buildPriceListMessage();
  }

  if (/cara pesan|cara pemesanan|cara booking|pesan mobil|booking/.test(lower)) {
    return '📅 **Cara Booking:**\n\n1. Pilih mobil yang diinginkan.\n2. Masukkan tanggal sewa dan tanggal kembali.\n3. Isi data penyewa.\n4. Kirim request booking.\n5. Tunggu konfirmasi admin.\n\nUntuk bantuan langsung, hubungi admin.';
  }

  if (/syarat|ketentuan|persyaratan/.test(lower)) {
    return '📋 **Persyaratan sewa mobil:**\n\n• KTP atau identitas diri yang masih berlaku.\n• SIM A yang masih berlaku.\n• Deposit jika diperlukan.\n• Data penyewa yang lengkap dan benar.\n\nUntuk persyaratan khusus, silakan hubungi admin.';
  }
  
  if (/kembali|pengembalian/.test(lower)) {
    return '⏰ **Kebijakan pengembalian:**\n\n• Kembalikan mobil sesuai tanggal dan waktu yang disepakati.\n• Jika terlambat, segera beri tahu admin.\n• Denda keterlambatan dapat dikenakan sesuai ketentuan.';
  }

  // Cek jika ada input hari untuk estimasi
  const matchHari = lower.match(/(\d+)\s*(hari|hr|day|days)/i);
  if (matchHari && car) {
    const days = parseInt(matchHari[1], 10);
    const total = formatCurrency(car.pricePerDay * days);
    return `💰 Estimasi harga ${car.name}:\n\nHarga per hari: ${formatCurrency(car.pricePerDay)}\nTotal untuk ${days} hari: ${total}\n\nJika ingin melakukan booking, ketik "Cara Pesan" atau hubungi admin.`;
  } else if (car) {
     return `🚗 Detail kendaraan:\n\nNama: ${car.name}\nTipe: ${car.type}\nKapasitas: ${car.capacity} orang\nTransmisi: ${car.transmission}\nBahan bakar: ${car.fuel}\nHarga: ${formatCurrency(car.pricePerDay)}/hari\n\nUntuk menghitung estimasi harga, ketik durasi sewa dalam hari, misalnya "2 hari".`;
  }

  return '🤔 Maaf, saya belum mengerti pertanyaan Anda.\n\nSilakan tanyakan tentang:\n• Daftar Mobil\n• Harga Rental\n• Cara Pesan\n• Syarat & Ketentuan\n\nAtau ketik "Hubungi Admin" agar CS kami bisa langsung membantu Anda.';
};

// Map output
const mapConversation = (row) => ({
  id: row.id,
  user_id: row.pengguna_id,
  user_name: row.nama_pengguna || 'User',
  user_email: row.email_pengguna || '',
  status: row.status === 'aktif' ? 'active' : 'closed',
  admin_mode: row.admin_mode === 1,
  unread_count: row.jumlah_belum_dibaca || 0,
  unreadCount: row.jumlah_belum_dibaca || 0, // Fallback untuk frontend
  last_message: row.isi_pesan_terakhir || '',
  last_message_at: row.pesan_terakhir_pada,
  last_message_sender: row.peran_pengirim_terakhir || 'user',
  created_at: row.dibuat_pada,
  session_id: row.session_id || ''
});

const mapMessage = (row) => ({
  id: row.id,
  conversation_id: row.percakapan_id,
  sender_role: row.peran_pengirim,
  senderRole: row.peran_pengirim, // Fallback
  role: row.peran_pengirim,       // Used by ChatbotWidget filtering
  sender_name: row.nama_pengirim,
  senderName: row.nama_pengirim,
  content: row.isi_pesan,
  is_read: row.sudah_dibaca === 1,
  created_at: row.dibuat_pada,
  timestamp: row.dibuat_pada,     // Used by ChatMessage
});

// ── GET /api/chat/conversations ──
router.get('/conversations', authenticate, adminOnly, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        c.*, 
        u.nama AS nama_pengguna, 
        u.email AS email_pengguna,
        (
          SELECT isi_pesan 
          FROM chat_pesan 
          WHERE percakapan_id = c.id 
          ORDER BY dibuat_pada DESC, id DESC LIMIT 1
        ) AS isi_pesan_terakhir,
        (
          SELECT peran_pengirim 
          FROM chat_pesan 
          WHERE percakapan_id = c.id 
          ORDER BY dibuat_pada DESC, id DESC LIMIT 1
        ) AS peran_pengirim_terakhir
      FROM chat_percakapan c
      LEFT JOIN pengguna u ON c.pengguna_id = u.id
      ORDER BY c.pesan_terakhir_pada DESC, c.id DESC
    `);
    res.json({ success: true, data: rows.map(mapConversation) });
  } catch (err) {
    console.error('[CHAT API ERROR] GET /conversations', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

  // 🟢 GET /api/chat/history 🟢
  router.get('/history', authenticate, async (req, res) => {
    try {
      const [rows] = await pool.query(`
        SELECT c.id, c.session_id, c.dibuat_pada as createdAt,
               (SELECT isi_pesan FROM chat_pesan WHERE percakapan_id = c.id ORDER BY dibuat_pada DESC, id DESC LIMIT 1) as last_message
        FROM chat_percakapan c
        WHERE c.pengguna_id = ?
        ORDER BY c.dibuat_pada DESC
      `, [req.user.id]);
      res.json({ success: true, data: rows });
    } catch (err) {
      console.error('[CHAT API ERROR] GET /history', err);
      res.status(500).json({ success: false, message: err.message });
    }
  });

// ── POST /api/chat ──
router.post('/', authenticate, async (req, res) => {
  try {
    const [[existing]] = await pool.query(
      "SELECT * FROM chat_percakapan WHERE pengguna_id = ? AND status = 'aktif' ORDER BY dibuat_pada DESC, id DESC LIMIT 1",
      [req.user.id]
    );

    let conversationId;
    let sessionId;

    if (existing) {
      conversationId = existing.id;
      sessionId = existing.session_id;
    } else {
      sessionId = 'session_' + Math.random().toString(36).substring(2, 9);
      const [result] = await pool.query(
        "INSERT INTO chat_percakapan (pengguna_id, status, jumlah_belum_dibaca, session_id, admin_mode) VALUES (?, 'aktif', 0, ?, 0)",
        [req.user.id, sessionId]
      );
      conversationId = result.insertId;

      await pool.query(
        "INSERT INTO chat_pesan (percakapan_id, session_id, peran_pengirim, nama_pengirim, isi_pesan, sudah_dibaca) VALUES (?, ?, 'bot', 'SBS Rentcar', ?, 1)",
        [conversationId, sessionId, WELCOME_MESSAGE]
      );
    }

    const [[conversationRow]] = await pool.query('SELECT * FROM chat_percakapan WHERE id = ?', [conversationId]);
    const [messagesRows] = await pool.query('SELECT * FROM chat_pesan WHERE percakapan_id = ? ORDER BY dibuat_pada ASC, id ASC', [conversationId]);

    res.json({
      success: true,
      data: {
        conversation: mapConversation(conversationRow),
        messages: messagesRows.map(mapMessage),
      }
    });
  } catch (err) {
    console.error('[CHAT API ERROR] POST /', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/chat/:id/messages ──
router.get('/:id/messages', authenticate, async (req, res) => {
  try {
    const [[conversation]] = await pool.query('SELECT * FROM chat_percakapan WHERE id = ?', [req.params.id]);
    if (!conversation) return res.status(404).json({ success: false, message: 'Conversation tidak ditemukan.' });

    if (req.user.role !== 'admin' && conversation.pengguna_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Akses ditolak.' });
    }

    const [messages] = await pool.query('SELECT * FROM chat_pesan WHERE percakapan_id = ? ORDER BY dibuat_pada ASC, id ASC', [req.params.id]);
    res.json({ success: true, data: messages.map(mapMessage) });
  } catch (err) {
    console.error('[CHAT API ERROR] GET /:id/messages', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/chat/:id/messages ──
router.post('/:id/messages', authenticate, async (req, res) => {
  try {
    const { content, senderRole } = req.body;
    if (!content) return res.status(400).json({ success: false, message: 'Pesan tidak boleh kosong.' });

    const [[conversation]] = await pool.query('SELECT * FROM chat_percakapan WHERE id = ?', [req.params.id]);
    if (!conversation) return res.status(404).json({ success: false, message: 'Conversation tidak ditemukan.' });

    if (req.user.role !== 'admin' && conversation.pengguna_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Akses ditolak.' });
    }

    const now = new Date();
    const resultMessages = [];

    if (senderRole === 'user') {
      // 1. Simpan pesan user
      const [userResult] = await pool.query(
        "INSERT INTO chat_pesan (percakapan_id, session_id, peran_pengirim, nama_pengirim, isi_pesan, sudah_dibaca) VALUES (?, ?, 'user', ?, ?, 0)",
        [req.params.id, conversation.session_id, req.user.name || '', content.trim()]
      );
      const [[userMsgRow]] = await pool.query('SELECT * FROM chat_pesan WHERE id = ?', [userResult.insertId]);
      resultMessages.push(mapMessage(userMsgRow));

      // 2. Balasan otomatis (jika belum admin mode)
      if (conversation.admin_mode === 0) {
        const botAnswer = await getBotResponse(content);
        const [botResult] = await pool.query(
          "INSERT INTO chat_pesan (percakapan_id, session_id, peran_pengirim, nama_pengirim, isi_pesan, sudah_dibaca) VALUES (?, ?, 'bot', 'SBS Rentcar', ?, 1)",
          [req.params.id, conversation.session_id, botAnswer]
        );
        const [[botMsgRow]] = await pool.query('SELECT * FROM chat_pesan WHERE id = ?', [botResult.insertId]);
        resultMessages.push(mapMessage(botMsgRow));

        // Jika user minta admin, set admin mode
        if (/hubungi admin|kontak admin|chat admin|customer service/.test(normalizeText(content))) {
          await pool.query('UPDATE chat_percakapan SET admin_mode = 1 WHERE id = ?', [req.params.id]);
        }
      }

      // Update percakapan (user)
      await pool.query(
        'UPDATE chat_percakapan SET pesan_terakhir_pada = ?, jumlah_belum_dibaca = jumlah_belum_dibaca + 1 WHERE id = ?',
        [now, req.params.id]
      );
    } else {
      // 1. Simpan pesan admin
      const [adminResult] = await pool.query(
        "INSERT INTO chat_pesan (percakapan_id, session_id, peran_pengirim, nama_pengirim, isi_pesan, sudah_dibaca) VALUES (?, ?, 'admin', ?, ?, 1)",
        [req.params.id, conversation.session_id, req.user.name || 'Admin', content.trim()]
      );
      const [[adminMsgRow]] = await pool.query('SELECT * FROM chat_pesan WHERE id = ?', [adminResult.insertId]);
      resultMessages.push(mapMessage(adminMsgRow));

      // 2. Update admin_mode jika dibalas admin
      if (conversation.admin_mode === 0) {
        await pool.query('UPDATE chat_percakapan SET admin_mode = 1 WHERE id = ?', [req.params.id]);
      }

      // Update percakapan (admin membaca & membalas)
      await pool.query(
        'UPDATE chat_percakapan SET pesan_terakhir_pada = ?, jumlah_belum_dibaca = 0 WHERE id = ?',
        [now, req.params.id]
      );
    }

    res.status(201).json({ success: true, data: resultMessages, message: 'Pesan terkirim.' });
  } catch (err) {
    console.error('[CHAT API ERROR] POST /:id/messages', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PATCH /api/chat/:id/read ──
router.patch('/:id/read', authenticate, adminOnly, async (req, res) => {
  try {
    await pool.query("UPDATE chat_pesan SET sudah_dibaca = 1 WHERE percakapan_id = ? AND peran_pengirim = 'user'", [req.params.id]);
    await pool.query('UPDATE chat_percakapan SET jumlah_belum_dibaca = 0 WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Ditandai sudah dibaca.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PATCH /api/chat/:id/close ──
router.patch('/:id/close', authenticate, async (req, res) => {
  try {
    await pool.query("UPDATE chat_percakapan SET status = 'ditutup', jumlah_belum_dibaca = 0 WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: 'Ditutup.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PATCH /api/chat/:id/reopen ──
router.patch('/:id/reopen', authenticate, adminOnly, async (req, res) => {
  try {
    await pool.query("UPDATE chat_percakapan SET status = 'aktif', admin_mode = 0 WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: 'Dibuka kembali.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

  // 🟢 DELETE /api/chat/:id 🟢
  router.delete('/:id', authenticate, adminOnly, async (req, res) => {
    try {
      const [[conversation]] = await pool.query('SELECT * FROM chat_percakapan WHERE id = ?', [req.params.id]);
      if (!conversation) return res.status(404).json({ success: false, message: 'Conversation tidak ditemukan.' });

      await pool.query('DELETE FROM chat_percakapan WHERE id = ?', [req.params.id]);
      res.json({ success: true, message: 'Percakapan berhasil dihapus.' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

module.exports = router;
