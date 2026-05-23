// ============================================================
// PAYMENTS ROUTES — /api/payments (MySQL version)
// ============================================================

const router = require('express').Router();
const pool   = require('../db/database');
const { authenticate } = require('../middleware/auth');

const genTxId = () =>
  `TRX-RM-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

// ── POST /api/payments/process ────────────────────────────
router.post('/process', authenticate, async (req, res) => {
  try {
    const { bookingId, paymentMethod } = req.body;
    if (!bookingId || !paymentMethod)
      return res.status(400).json({ success: false, message: 'Booking ID dan metode pembayaran wajib diisi.' });

    const [[booking]] = await pool.query('SELECT * FROM bookings WHERE id = ?', [bookingId]);
    if (!booking)
      return res.status(404).json({ success: false, message: 'Peminjaman tidak ditemukan.' });

    if (booking.user_id !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Akses ditolak.' });

    if (booking.payment_status === 'paid')
      return res.status(400).json({ success: false, message: 'Transaksi ini sudah dibayar.' });

    // Simulasi proses gateway (500ms)
    await new Promise((r) => setTimeout(r, 500));

    // Simulasi 95% sukses
    const isSuccess = Math.random() > 0.05;
    if (!isSuccess) {
      return res.status(402).json({
        success: false,
        message: 'Pembayaran gagal diproses. Silakan coba lagi.',
        errorCode: 'PAYMENT_DECLINED',
      });
    }

    const transactionId = genTxId();
    const paymentDate   = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const newStatus     = booking.status === 'approved' ? 'active' : booking.status;

    await pool.query(
      `UPDATE bookings SET payment_status='paid', payment_method=?, payment_transaction_id=?,
        payment_date=?, status=? WHERE id=?`,
      [paymentMethod, transactionId, paymentDate, newStatus, bookingId]
    );

    const [[updated]] = await pool.query('SELECT * FROM bookings WHERE id = ?', [bookingId]);

    res.json({
      success: true,
      transactionId,
      paymentDate,
      amount: Number(booking.total_cost),
      message: 'Pembayaran berhasil dikonfirmasi.',
      booking: {
        id:            updated.id,
        status:        updated.status,
        paymentStatus: updated.payment_status,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/payments/methods ─────────────────────────────
router.get('/methods', (req, res) => {
  res.json({
    success: true,
    methods: [
      { id: 'va',      label: 'Transfer Bank',  description: 'Virtual Account',
        banks: [
          { id: 'bca_va',     name: 'BCA',     prefix: '8277' },
          { id: 'mandiri_va', name: 'Mandiri', prefix: '88908' },
          { id: 'bri_va',     name: 'BRI',     prefix: '88019' },
          { id: 'bni_va',     name: 'BNI',     prefix: '8809' },
        ],
      },
      { id: 'qris',    label: 'QRIS',           description: 'Scan QR Code' },
      { id: 'ewallet', label: 'Dompet Digital',  description: 'GoPay, OVO, dll',
        wallets: [
          { id: 'gopay',     name: 'GoPay' },
          { id: 'ovo',       name: 'OVO' },
          { id: 'dana',      name: 'DANA' },
          { id: 'shopeepay', name: 'ShopeePay' },
        ],
      },
      { id: 'card',    label: 'Kartu Kredit',   description: 'Visa / Mastercard', fee: 2900 },
    ],
  });
});

module.exports = router;
