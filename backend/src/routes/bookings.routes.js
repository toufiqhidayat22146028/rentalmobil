// ============================================================
// BOOKINGS ROUTES — /api/bookings (MySQL version)
// ============================================================

const router = require('express').Router();
const pool   = require('../db/database');
const { authenticate, adminOnly } = require('../middleware/auth');

const formatBooking = (b) => ({
  ...b,
  withDriver:            Boolean(b.with_driver),
  totalCost:             Number(b.total_cost),
  pickupLocation:        b.pickup_location,
  paymentStatus:         b.payment_status,
  paymentMethod:         b.payment_method,
  paymentTransactionId:  b.payment_transaction_id,
  paymentDate:           b.payment_date,
  createdAt:             b.created_at,
  startDate:             b.start_date,
  endDate:               b.end_date,
  userId:                b.user_id,
  carId:                 b.car_id,
});

const generateBookingId = async () => {
  const [[{ cnt }]] = await pool.query('SELECT COUNT(*) AS cnt FROM bookings');
  return `BK-${String(cnt + 1).padStart(3, '0')}`;
};

// ── GET /api/bookings ─────────────────────────────────────
router.get('/', authenticate, async (req, res) => {
  try {
    const { status } = req.query;
    let sql    = 'SELECT * FROM bookings WHERE 1=1';
    const params = [];

    if (req.user.role !== 'admin') {
      sql += ' AND user_id = ?';
      params.push(req.user.id);
    }
    if (status && status !== 'all') {
      sql += ' AND status = ?';
      params.push(status);
    }
    sql += ' ORDER BY created_at DESC';

    const [rows] = await pool.query(sql, params);
    res.json({ success: true, data: rows.map(formatBooking), total: rows.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/bookings/stats/summary ──────────────────────
router.get('/stats/summary', authenticate, adminOnly, async (req, res) => {
  try {
    const [[{ totalRevenue }]]  = await pool.query("SELECT COALESCE(SUM(total_cost),0) AS totalRevenue FROM bookings WHERE payment_status='paid'");
    const [[{ totalBookings }]] = await pool.query('SELECT COUNT(*) AS totalBookings FROM bookings');
    const [[{ pending }]]       = await pool.query("SELECT COUNT(*) AS pending   FROM bookings WHERE status='pending'");
    const [[{ approved }]]      = await pool.query("SELECT COUNT(*) AS approved  FROM bookings WHERE status='approved'");
    const [[{ active }]]        = await pool.query("SELECT COUNT(*) AS active    FROM bookings WHERE status='active'");
    const [[{ completed }]]     = await pool.query("SELECT COUNT(*) AS completed FROM bookings WHERE status='completed'");
    const [[{ cancelled }]]     = await pool.query("SELECT COUNT(*) AS cancelled FROM bookings WHERE status='cancelled'");
    const [[{ totalCars }]]     = await pool.query('SELECT COUNT(*) AS totalCars  FROM cars');
    const [[{ availCars }]]     = await pool.query("SELECT COUNT(*) AS availCars  FROM cars WHERE available=1");
    const [[{ totalUsers }]]    = await pool.query("SELECT COUNT(*) AS totalUsers FROM users WHERE role='user'");

    const [carStats] = await pool.query(`
      SELECT c.id, c.name, c.image,
             COUNT(b.id) AS booking_count,
             COALESCE(SUM(CASE WHEN b.payment_status='paid' THEN b.total_cost ELSE 0 END), 0) AS revenue
      FROM cars c
      LEFT JOIN bookings b ON b.car_id = c.id
      GROUP BY c.id, c.name, c.image
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
      carStats,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/bookings/:id ─────────────────────────────────
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [[booking]] = await pool.query('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
    if (!booking) return res.status(404).json({ success: false, message: 'Peminjaman tidak ditemukan.' });

    if (req.user.role !== 'admin' && booking.user_id !== req.user.id)
      return res.status(403).json({ success: false, message: 'Akses ditolak.' });

    res.json({ success: true, data: formatBooking(booking) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/bookings ────────────────────────────────────
router.post('/', authenticate, async (req, res) => {
  try {
    const { carId, startDate, endDate, days, pickupLocation, withDriver, totalCost, notes } = req.body;

    if (!carId || !startDate || !endDate || !days || !totalCost)
      return res.status(400).json({ success: false, message: 'Data peminjaman tidak lengkap.' });

    const [[car]] = await pool.query('SELECT id, available FROM cars WHERE id = ?', [carId]);
    if (!car) return res.status(404).json({ success: false, message: 'Kendaraan tidak ditemukan.' });
    if (!car.available) return res.status(400).json({ success: false, message: 'Kendaraan tidak tersedia saat ini.' });

    const id = await generateBookingId();

    await pool.query(
      `INSERT INTO bookings (id, user_id, car_id, start_date, end_date, days,
        pickup_location, with_driver, total_cost, notes, status, payment_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'unpaid')`,
      [id, req.user.id, carId, startDate, endDate, days,
       pickupLocation || '', withDriver ? 1 : 0, totalCost, notes || '']
    );

    const [[newBooking]] = await pool.query('SELECT * FROM bookings WHERE id = ?', [id]);
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

    const [[booking]] = await pool.query('SELECT id FROM bookings WHERE id = ?', [req.params.id]);
    if (!booking) return res.status(404).json({ success: false, message: 'Peminjaman tidak ditemukan.' });

    await pool.query('UPDATE bookings SET status = ? WHERE id = ?', [status, req.params.id]);

    const [[updated]] = await pool.query('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: formatBooking(updated), message: `Status berhasil diubah ke "${status}".` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PATCH /api/bookings/:id/cancel ───────────────────────
router.patch('/:id/cancel', authenticate, async (req, res) => {
  try {
    const [[booking]] = await pool.query('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
    if (!booking) return res.status(404).json({ success: false, message: 'Peminjaman tidak ditemukan.' });

    if (req.user.role !== 'admin' && booking.user_id !== req.user.id)
      return res.status(403).json({ success: false, message: 'Akses ditolak.' });

    if (!['pending', 'approved'].includes(booking.status))
      return res.status(400).json({ success: false, message: 'Booking aktif/selesai tidak bisa dibatalkan.' });

    await pool.query("UPDATE bookings SET status = 'cancelled' WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: 'Peminjaman berhasil dibatalkan.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/bookings/:id/pay ────────────────────────────
router.post('/:id/pay', authenticate, async (req, res) => {
  try {
    const { paymentMethod, transactionId } = req.body;
    const [[booking]] = await pool.query('SELECT * FROM bookings WHERE id = ?', [req.params.id]);

    if (!booking) return res.status(404).json({ success: false, message: 'Peminjaman tidak ditemukan.' });
    if (req.user.role !== 'admin' && booking.user_id !== req.user.id)
      return res.status(403).json({ success: false, message: 'Akses ditolak.' });
    if (booking.payment_status === 'paid')
      return res.status(400).json({ success: false, message: 'Booking sudah dibayar.' });

    const paymentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const newStatus   = booking.status === 'approved' ? 'active' : booking.status;

    await pool.query(
      `UPDATE bookings SET payment_status='paid', payment_method=?, payment_transaction_id=?,
        payment_date=?, status=? WHERE id=?`,
      [paymentMethod, transactionId, paymentDate, newStatus, req.params.id]
    );

    const [[updated]] = await pool.query('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: formatBooking(updated), message: 'Pembayaran berhasil dikonfirmasi.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
