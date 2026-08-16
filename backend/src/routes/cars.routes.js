// ============================================================
// CARS ROUTES — /api/cars (MySQL version)
// ============================================================

const router = require('express').Router();
const pool   = require('../db/database');
const { authenticate, adminOnly } = require('../middleware/auth');

// Helper: parse JSON fields yang disimpan di MySQL dan mapping ke properti bahasa Inggris (camelCase)
const parseCar = (row) => {
  if (!row) return null;
  return {
    id:                row.id,
    name:              row.nama,
    brand:             row.merek,
    type:              row.tipe,
    year:              row.tahun,
    capacity:          row.kapasitas,
    transmission:      row.transmisi,
    fuel:              row.bahan_bakar,
    pricePerDay:       Number(row.harga_per_hari),
    driverCostPerDay:  Number(row.biaya_sopir_per_hari),
    available:         Boolean(row.tersedia),
    priority:          row.prioritas || 0,
    isMaintenance:     Boolean(row.sedang_perbaikan),
    description:       row.deskripsi,
    color:             row.warna,
    plateNumber:       row.nomor_plat,
    image:             row.gambar,
    rating:            Number(row.rating),
    totalReviews:      row.total_ulasan,
    features:          typeof row.fitur === 'string' ? JSON.parse(row.fitur) : (row.fitur || []),
    specs:             typeof row.spesifikasi === 'string' ? JSON.parse(row.spesifikasi) : (row.spesifikasi || {}),
    createdAt:         row.dibuat_pada,
  };
};

// ── GET /api/cars ─────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { type, brand, transmission, available, maxPrice, sort, search } = req.query;

    let sql    = 'SELECT * FROM mobil WHERE 1=1';
    const params = [];

    if (type)         { sql += ' AND tipe = ?';         params.push(type); }
    if (brand)        { sql += ' AND merek = ?';        params.push(brand); }
    if (transmission) { sql += ' AND transmisi LIKE ?'; params.push('%' + transmission + '%'); }
    if (available !== undefined && available !== '') {
      sql += ' AND tersedia = ?';
      params.push(available === 'true' ? 1 : 0);
    }
    if (maxPrice) { sql += ' AND harga_per_hari <= ?'; params.push(Number(maxPrice)); }
    if (search)   { sql += ' AND (nama LIKE ? OR merek LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

    const sortMap = {
      price_asc:  'harga_per_hari ASC',
      price_desc: 'harga_per_hari DESC',
      rating:     'rating DESC',
      default:    'prioritas DESC, id DESC',
    };
    sql += ` ORDER BY ${sortMap[sort] || 'prioritas DESC, id DESC'}`;

    const [rows] = await pool.query(sql, params);
    res.json({ success: true, data: rows.map(parseCar), total: rows.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/cars/meta/options ────────────────────────────
router.get('/meta/options', async (req, res) => {
  try {
    const [[types], [brands]] = await Promise.all([
      pool.query('SELECT DISTINCT tipe AS type FROM mobil ORDER BY tipe'),
      pool.query('SELECT DISTINCT merek AS brand FROM mobil ORDER BY merek'),
    ]);
    res.json({ success: true, types: types.map(r => r.type), brands: brands.map(r => r.brand) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/cars/:id ─────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const [[car]] = await pool.query('SELECT * FROM mobil WHERE id = ?', [req.params.id]);
    if (!car) return res.status(404).json({ success: false, message: 'Kendaraan tidak ditemukan.' });
    res.json({ success: true, data: parseCar(car) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/cars ────────────────────────────────────────
router.post('/', authenticate, adminOnly, async (req, res) => {
  try {
    const { name, brand, type, year, capacity, transmission, fuel, pricePerDay,
            driverCostPerDay, available, priority = 0, description, color, plateNumber, image,
            features = [], specs = {} } = req.body;

    if (!name || !brand || !pricePerDay)
      return res.status(400).json({ success: false, message: 'Nama, merek, dan harga wajib diisi.' });

    const [result] = await pool.query(
      `INSERT INTO mobil (nama, merek, tipe, tahun, kapasitas, transmisi, bahan_bakar,
        harga_per_hari, biaya_sopir_per_hari, tersedia, prioritas, deskripsi, warna,
        nomor_plat, gambar, fitur, spesifikasi)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, brand, type || 'MPV', year || 2023, capacity || 5,
       transmission || 'Manual', fuel || 'Bensin', pricePerDay,
       driverCostPerDay || 150000, available ? 1 : 0, priority,
       description || '', color || '', plateNumber || '', image || '',
       JSON.stringify(features), JSON.stringify(specs)]
    );

    const [[newCar]] = await pool.query('SELECT * FROM mobil WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: parseCar(newCar), message: 'Kendaraan berhasil ditambahkan.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PUT /api/cars/:id ─────────────────────────────────────
router.put('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const [[car]] = await pool.query('SELECT id FROM mobil WHERE id = ?', [req.params.id]);
    if (!car) return res.status(404).json({ success: false, message: 'Kendaraan tidak ditemukan.' });

    const { name, brand, type, year, capacity, transmission, fuel, pricePerDay,
            driverCostPerDay, available, priority = 0, description, color, plateNumber, image,
            features, specs } = req.body;

    await pool.query(
      `UPDATE mobil SET nama=?, merek=?, tipe=?, tahun=?, kapasitas=?, transmisi=?,
        bahan_bakar=?, harga_per_hari=?, biaya_sopir_per_hari=?, tersedia=?, prioritas=?,
        deskripsi=?, warna=?, nomor_plat=?, gambar=?, fitur=?, spesifikasi=?
       WHERE id=?`,
      [name, brand, type, year, capacity, transmission, fuel,
       pricePerDay, driverCostPerDay, available ? 1 : 0, priority,
       description, color, plateNumber, image,
       JSON.stringify(features || []), JSON.stringify(specs || {}),
       req.params.id]
    );

    const [[updated]] = await pool.query('SELECT * FROM mobil WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: parseCar(updated), message: 'Data kendaraan berhasil diperbarui.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PATCH /api/cars/:id/maintenance ─────────────────────
router.patch('/:id/maintenance', authenticate, adminOnly, async (req, res) => {
  try {
    const { isMaintenance } = req.body;
    const maintenanceVal = isMaintenance ? 1 : 0;
    
    // Jika mobil masuk perbaikan, set tersedia = 0.
    // Jika mobil selesai perbaikan, set tersedia = 1.
    const availableVal = isMaintenance ? 0 : 1;

    await pool.query(
      'UPDATE mobil SET sedang_perbaikan = ?, tersedia = ? WHERE id = ?',
      [maintenanceVal, availableVal, req.params.id]
    );

    const [[updatedRow]] = await pool.query('SELECT * FROM mobil WHERE id = ?', [req.params.id]);
    if (!updatedRow) return res.status(404).json({ success: false, message: 'Kendaraan tidak ditemukan' });

    res.json({
      success: true,
      message: isMaintenance ? 'Mobil ditandai dalam perbaikan.' : 'Mobil selesai perbaikan dan tersedia kembali.',
      data: parseCar(updatedRow)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── DELETE /api/cars/:id ──────────────────────────────────
router.delete('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const [[car]] = await pool.query('SELECT id FROM mobil WHERE id = ?', [req.params.id]);
    if (!car) return res.status(404).json({ success: false, message: 'Kendaraan tidak ditemukan.' });

    await pool.query('DELETE FROM mobil WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Kendaraan berhasil dihapus.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PATCH /api/cars/:id/toggle ────────────────────────────
router.patch('/:id/toggle', authenticate, adminOnly, async (req, res) => {
  try {
    const [[car]] = await pool.query('SELECT id, tersedia FROM mobil WHERE id = ?', [req.params.id]);
    if (!car) return res.status(404).json({ success: false, message: 'Kendaraan tidak ditemukan.' });

    const newStatus = car.tersedia ? 0 : 1;
    await pool.query('UPDATE mobil SET tersedia = ? WHERE id = ?', [newStatus, req.params.id]);
    res.json({
      success: true,
      available: Boolean(newStatus),
      message: `Kendaraan berhasil ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}.`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
// ── GET /api/cars/:id/reviews ──────────────────────────────────────
router.get('/:id/reviews', async (req, res) => {
  try {
    const [reviews] = await pool.query(
      `SELECT u.*, p.nama AS userName, p.avatar AS userAvatar
       FROM ulasan_mobil u
       JOIN pengguna p ON u.pengguna_id = p.id
       WHERE u.mobil_id = ?
       ORDER BY u.dibuat_pada DESC`,
      [req.params.id]
    );
    res.json({ success: true, data: reviews });
  } catch (err) {
    console.error('[CARS API ERROR] GET /:id/reviews', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/cars/:id/reviews ─────────────────────────────────────
router.post('/:id/reviews', authenticate, async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;
    const mobilId = req.params.id;
    const userId = req.user.id;

    if (!bookingId || !rating) {
      return res.status(400).json({ success: false, message: 'Data ulasan tidak lengkap.' });
    }

    // Pastikan booking valid dan milik user, serta statusnya completed
    const [[booking]] = await pool.query(
      'SELECT id, status FROM peminjaman WHERE id = ? AND pengguna_id = ? AND mobil_id = ?',
      [bookingId, userId, mobilId]
    );

    if (!booking) {
      return res.status(403).json({ success: false, message: 'Peminjaman tidak valid atau bukan milik Anda.' });
    }
    if (booking.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Ulasan hanya dapat diberikan setelah peminjaman selesai.' });
    }

    // Insert ulasan (jika duplikat peminjaman_id, database akan menolak karena UNIQUE)
    await pool.query(
      'INSERT INTO ulasan_mobil (peminjaman_id, pengguna_id, mobil_id, rating, komentar) VALUES (?, ?, ?, ?, ?)',
      [bookingId, userId, mobilId, rating, comment || '']
    );

    // Hitung ulang rating & total_ulasan
    const [[stats]] = await pool.query(
      'SELECT COUNT(*) as total, AVG(rating) as avg_rating FROM ulasan_mobil WHERE mobil_id = ?',
      [mobilId]
    );

    await pool.query(
      'UPDATE mobil SET rating = ?, total_ulasan = ? WHERE id = ?',
      [stats.avg_rating || 0, stats.total, mobilId]
    );

    res.status(201).json({ success: true, message: 'Ulasan berhasil disimpan.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Anda sudah memberikan ulasan untuk peminjaman ini.' });
    }
    console.error('[CARS API ERROR] POST /:id/reviews', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
