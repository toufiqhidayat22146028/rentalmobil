// LOGIKA TRANSAKSI PEMINJAMAN
// Di file ini backend mengatur pesanan masuk, status persetujuan admin, dan pengembalian mobil.

// ============================================================
// BOOKINGS ROUTES — /api/bookings (MySQL version)
// ============================================================

const router = require('express').Router();
const pool   = require('../db/database');
const { authenticate, adminOnly } = require('../middleware/auth');

const formatBooking = (b) => {
  if (!b) return null;
  return {
    id:                    b.id,
    userId:                b.pengguna_id,
    carId:                 b.mobil_id,
    carName:               b.carName || 'Kendaraan',
    carImage:              b.carImage || '',
    startDate:             b.tanggal_mulai,
    endDate:               b.tanggal_kembali,
    days:                  b.durasi_hari,
    pickupLocation:        b.lokasi_penjemputan,
    withDriver:            Boolean(b.dengan_sopir),
    totalCost:             Number(b.total_biaya),
    notes:                 b.catatan,
    status:                b.status,
    paymentStatus:         b.status_pembayaran === 'lunas' ? 'paid' : 'unpaid',
    paymentMethod:         b.metode_pembayaran,
    paymentTransactionId:  b.transaksi_pembayaran_id,
    paymentDate:           b.tanggal_pembayaran,
    usageArea:             b.area_pemakaian || 'dalam_kota',
    outOfTownCost:         Number(b.biaya_luar_kota) || 0,
    hasReviewed:           Boolean(b.hasReviewed),
    createdAt:             b.dibuat_pada,
  };
};

const generateBookingId = async () => {
  const [[{ cnt }]] = await pool.query('SELECT COUNT(*) AS cnt FROM peminjaman');
  return `BK-${String(cnt + 1).padStart(3, '0')}`;
};

// ── GET /api/bookings ─────────────────────────────────────
router.get('/', authenticate, async (req, res) => {
  try {
    const { status } = req.query;
    let sql    = 'SELECT p.*, m.nama AS carName, m.gambar AS carImage, (SELECT COUNT(*) FROM ulasan_mobil WHERE peminjaman_id = p.id) AS hasReviewed FROM peminjaman p LEFT JOIN mobil m ON p.mobil_id = m.id WHERE 1=1';
    const params = [];

    if (req.user.role !== 'admin') {
      sql += ' AND p.pengguna_id = ?';
      params.push(req.user.id);
    }
    if (status && status !== 'all') {
      sql += ' AND p.status = ?';
      params.push(status);
    }
    sql += ' ORDER BY p.dibuat_pada DESC';

    const [rows] = await pool.query(sql, params);
    res.json({ success: true, data: rows.map(formatBooking), total: rows.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/bookings/stats/summary ──────────────────────
router.get('/stats/summary', authenticate, adminOnly, async (req, res) => {
  try {
    const [[{ totalRevenue }]]  = await pool.query("SELECT COALESCE(SUM(total_biaya),0) AS totalRevenue FROM peminjaman WHERE status_pembayaran='lunas'");
    const [[{ totalBookings }]] = await pool.query('SELECT COUNT(*) AS totalBookings FROM peminjaman');
    const [[{ pending }]]       = await pool.query("SELECT COUNT(*) AS pending   FROM peminjaman WHERE status='pending'");
    const [[{ approved }]]      = await pool.query("SELECT COUNT(*) AS approved  FROM peminjaman WHERE status='approved'");
    const [[{ active }]]        = await pool.query("SELECT COUNT(*) AS active    FROM peminjaman WHERE status='active'");
    const [[{ completed }]]     = await pool.query("SELECT COUNT(*) AS completed FROM peminjaman WHERE status='completed'");
    const [[{ cancelled }]]     = await pool.query("SELECT COUNT(*) AS cancelled FROM peminjaman WHERE status='cancelled'");
    const [[{ totalCars }]]     = await pool.query('SELECT COUNT(*) AS totalCars  FROM mobil');
    const [[{ availCars }]]     = await pool.query("SELECT COUNT(*) AS availCars  FROM mobil WHERE tersedia=1");
    const [[{ totalUsers }]]    = await pool.query("SELECT COUNT(*) AS totalUsers FROM pengguna WHERE peran='user'");

    const [carStats] = await pool.query(`
      SELECT c.id, c.nama AS name, c.gambar AS image,
             COUNT(b.id) AS booking_count,
             COALESCE(SUM(CASE WHEN b.status_pembayaran='lunas' THEN b.total_biaya ELSE 0 END), 0) AS revenue
      FROM mobil c
      LEFT JOIN peminjaman b ON b.mobil_id = c.id
      GROUP BY c.id, c.nama, c.gambar
      ORDER BY booking_count DESC
      LIMIT 8
    `);

    res.json({
      success: true,
      stats: {
        totalRevenue: Number(totalRevenue),
        totalBookings, pending, approved, active, completed, cancelled,
        totalCars, availCars, totalUsers,
        statusDistribution: { pending, approved, active, completed, cancelled },
      },
      carStats: carStats.map(r => ({
        ...r,
        bookingCount: Number(r.booking_count),
        revenue: Number(r.revenue),
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/bookings/:id ─────────────────────────────────
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [[booking]] = await pool.query('SELECT p.*, m.nama AS carName, m.gambar AS carImage, (SELECT COUNT(*) FROM ulasan_mobil WHERE peminjaman_id = p.id) AS hasReviewed FROM peminjaman p LEFT JOIN mobil m ON p.mobil_id = m.id WHERE p.id = ?', [req.params.id]);
    if (!booking) return res.status(404).json({ success: false, message: 'Peminjaman tidak ditemukan.' });

    if (req.user.role !== 'admin' && booking.pengguna_id !== req.user.id)
      return res.status(403).json({ success: false, message: 'Akses ditolak.' });

    res.json({ success: true, data: formatBooking(booking) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/bookings ────────────────────────────────────
router.post('/', authenticate, async (req, res) => {
  try {
    const { carId, startDate, endDate, days, pickupLocation, withDriver, totalCost, notes, nik, sim, phone, address, usageArea } = req.body;

    if (!carId || !startDate || !endDate || !days || !totalCost || !nik || !phone || !address)
      return res.status(400).json({ success: false, message: 'Data peminjaman dan data diri tidak lengkap.' });

    const [[car]] = await pool.query('SELECT id, tersedia, harga_per_hari, biaya_sopir_per_hari FROM mobil WHERE id = ?', [carId]);
    if (!car) return res.status(404).json({ success: false, message: 'Kendaraan tidak ditemukan.' });
    if (!car.tersedia) return res.status(400).json({ success: false, message: 'Kendaraan tidak tersedia saat ini.' });

    // Validate backend total cost calculation
    const carCost = Number(car.harga_per_hari) * Number(days);
    const driverCost = withDriver ? Number(car.biaya_sopir_per_hari) * Number(days) : 0;
    const isOutOfTown = usageArea === 'luar_kota';
    const outOfTownCost = isOutOfTown ? Number(days) * 150000 : 0;
    
    // In production, you would strictly enforce `totalCost === expectedTotal`, but for now we trust or overwrite it.
    const finalTotalCost = carCost + driverCost + outOfTownCost;

    const id = await generateBookingId();

    await pool.query(
      `INSERT INTO peminjaman (id, pengguna_id, mobil_id, tanggal_mulai, tanggal_kembali, durasi_hari,
        area_pemakaian, lokasi_penjemputan, dengan_sopir, total_biaya, biaya_luar_kota, catatan, status, status_pembayaran)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'belum_bayar')`,
      [id, req.user.id, carId, startDate, endDate, days,
       isOutOfTown ? 'luar_kota' : 'dalam_kota', pickupLocation || '', withDriver ? 1 : 0, 
       finalTotalCost, outOfTownCost, notes || '']
    );

    // Kunci mobil agar tidak bisa dipinjam orang lain (set tersedia = 0)
    await pool.query('UPDATE mobil SET tersedia = 0 WHERE id = ?', [carId]);

    // Update profil pengguna dengan data diri terbaru
    await pool.query(
      'UPDATE pengguna SET ktp = ?, sim = ?, telepon = ?, alamat = ? WHERE id = ?',
      [nik, sim || '', phone, address, req.user.id]
    );

    const [[newBooking]] = await pool.query('SELECT p.*, m.nama AS carName, m.gambar AS carImage FROM peminjaman p LEFT JOIN mobil m ON p.mobil_id = m.id WHERE p.id = ?', [id]);
    res.status(201).json({
      success: true,
      data: formatBooking(newBooking),
      bookingId: id,
      message: 'Peminjaman berhasil diajukan.',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PATCH /api/bookings/:id/status ───────────────────────
router.patch('/:id/status', authenticate, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'approved', 'active', 'completed', 'cancelled'];
    if (!validStatuses.includes(status))
      return res.status(400).json({ success: false, message: 'Status tidak valid.' });

    const [[booking]] = await pool.query('SELECT id, mobil_id FROM peminjaman WHERE id = ?', [req.params.id]);
    if (!booking) return res.status(404).json({ success: false, message: 'Peminjaman tidak ditemukan.' });

    await pool.query('UPDATE peminjaman SET status = ? WHERE id = ?', [status, req.params.id]);

    // Perbarui ketersediaan mobil berdasarkan status baru
    if (status === 'completed' || status === 'cancelled') {
      await pool.query('UPDATE mobil SET tersedia = 1 WHERE id = ?', [booking.mobil_id]);
    } else {
      // Jika statusnya kembali pending/approved/active, pastikan mobil terkunci
      await pool.query('UPDATE mobil SET tersedia = 0 WHERE id = ?', [booking.mobil_id]);
    }

    const [[updated]] = await pool.query('SELECT p.*, m.nama AS carName, m.gambar AS carImage FROM peminjaman p LEFT JOIN mobil m ON p.mobil_id = m.id WHERE p.id = ?', [req.params.id]);
    res.json({ success: true, data: formatBooking(updated), message: `Status berhasil diubah ke "${status}".` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PATCH /api/bookings/:id/cancel ───────────────────────
router.patch('/:id/cancel', authenticate, async (req, res) => {
  try {
    const [[booking]] = await pool.query('SELECT * FROM peminjaman WHERE id = ?', [req.params.id]);
    if (!booking) return res.status(404).json({ success: false, message: 'Peminjaman tidak ditemukan.' });

    if (req.user.role !== 'admin' && booking.pengguna_id !== req.user.id)
      return res.status(403).json({ success: false, message: 'Akses ditolak.' });

    if (!['pending', 'approved'].includes(booking.status))
      return res.status(400).json({ success: false, message: 'Booking aktif/selesai tidak bisa dibatalkan.' });

    await pool.query("UPDATE peminjaman SET status = 'cancelled' WHERE id = ?", [req.params.id]);
    
    // Kembalikan ketersediaan mobil karena booking dibatalkan
    await pool.query('UPDATE mobil SET tersedia = 1 WHERE id = ?', [booking.mobil_id]);
    res.json({ success: true, message: 'Peminjaman berhasil dibatalkan.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/bookings/:id/pay ────────────────────────────
router.post('/:id/pay', authenticate, async (req, res) => {
  try {
    const { paymentMethod, transactionId } = req.body;
    const [[booking]] = await pool.query('SELECT * FROM peminjaman WHERE id = ?', [req.params.id]);

    if (!booking) return res.status(404).json({ success: false, message: 'Peminjaman tidak ditemukan.' });
    if (req.user.role !== 'admin' && booking.pengguna_id !== req.user.id)
      return res.status(403).json({ success: false, message: 'Akses ditolak.' });
    if (booking.status_pembayaran === 'lunas')
      return res.status(400).json({ success: false, message: 'Booking sudah dibayar.' });

    const paymentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const newStatus   = booking.status === 'approved' ? 'active' : booking.status;

    await pool.query(
      `UPDATE peminjaman SET status_pembayaran='lunas', metode_pembayaran=?, transaksi_pembayaran_id=?,
        tanggal_pembayaran=?, status=? WHERE id=?`,
      [paymentMethod, transactionId, paymentDate, newStatus, req.params.id]
    );

    const [[updated]] = await pool.query('SELECT p.*, m.nama AS carName, m.gambar AS carImage FROM peminjaman p LEFT JOIN mobil m ON p.mobil_id = m.id WHERE p.id = ?', [req.params.id]);
    res.json({ success: true, data: formatBooking(updated), message: 'Pembayaran berhasil dikonfirmasi.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
