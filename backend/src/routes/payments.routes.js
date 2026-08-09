// ============================================================
// PAYMENTS ROUTES — /api/payments (MySQL version)
// ============================================================

const router = require('express').Router();
const pool   = require('../db/database');
const { authenticate } = require('../middleware/auth');
const { snap } = require('../config/midtrans');

const genTxId = () =>
  `TRX-RM-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

// ── POST /api/payments/process (Create Snap Token) ──────────
router.post('/process', authenticate, async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId)
      return res.status(400).json({ success: false, message: 'Booking ID wajib diisi.' });

    const [[booking]] = await pool.query('SELECT * FROM peminjaman WHERE id = ?', [bookingId]);
    if (!booking)
      return res.status(404).json({ success: false, message: 'Peminjaman tidak ditemukan.' });

    if (booking.pengguna_id !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Akses ditolak.' });

    if (booking.status_pembayaran === 'lunas')
      return res.status(400).json({ success: false, message: 'Transaksi ini sudah dibayar.' });

    // Cek apakah user info tersedia (untuk dikirim ke midtrans)
    const [[user]] = await pool.query('SELECT nama, email, telepon FROM pengguna WHERE id = ?', [booking.pengguna_id]);

    const orderId = `${bookingId}-${Date.now()}`;
    const amount = Number(booking.total_biaya);

    // Buat parameter transaksi Midtrans
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      customer_details: {
        first_name: user?.nama || 'User',
        email: user?.email || 'user@example.com',
        phone: user?.telepon || '081234567890',
      }
    };

    const transaction = await snap.createTransaction(parameter);

    // Simpan orderId midtrans sementara ke transaksi_pembayaran_id
    await pool.query(
      `UPDATE peminjaman SET transaksi_pembayaran_id=? WHERE id=?`,
      [orderId, bookingId]
    );

    res.json({
      success: true,
      token: transaction.token,
      redirect_url: transaction.redirect_url,
      order_id: orderId
    });
  } catch (err) {
    console.error('[Midtrans Process Error]', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/payments/webhook (Midtrans Notification) ──────
router.post('/webhook', async (req, res) => {
  try {
    const notificationJson = req.body;
    const statusResponse = await snap.transaction.notification(notificationJson);

    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    // Ekstrak bookingId dari orderId (karena format orderId adalah BookingID-Timestamp)
    const bookingId = orderId.split('-').slice(0, 2).join('-'); 
    // Wait, bookingId format is BK-001. So split('-') gives ['BK', '001', '168...']
    // So slice(0,2).join('-') -> BK-001

    if (transactionStatus == 'capture') {
      if (fraudStatus == 'challenge') {
        // TODO set transaction status on your database to 'challenge'
      } else if (fraudStatus == 'accept') {
        // TODO set transaction status on your database to 'success'
        await handlePaymentSuccess(bookingId, orderId, statusResponse.payment_type);
      }
    } else if (transactionStatus == 'settlement') {
      await handlePaymentSuccess(bookingId, orderId, statusResponse.payment_type);
    } else if (transactionStatus == 'cancel' || transactionStatus == 'deny' || transactionStatus == 'expire') {
      // TODO set transaction status on your database to 'failure'
    } else if (transactionStatus == 'pending') {
      // TODO set transaction status on your database to 'pending'
    }

    res.status(200).json({ success: true, message: 'OK' });
  } catch (err) {
    console.error('[Midtrans Webhook Error]', err.message);
    // Selalu kembalikan 200 OK agar Midtrans tidak terus mengulang (retry) atau menggagalkan tes webhook
    res.status(200).json({ success: false, message: 'Terjadi kesalahan internal, tapi webhook diterima.' });
  }
});

async function handlePaymentSuccess(bookingId, orderId, paymentType) {
  const [[booking]] = await pool.query('SELECT status, status_pembayaran FROM peminjaman WHERE id = ?', [bookingId]);
  if (!booking || booking.status_pembayaran === 'lunas') return;

  const paymentDate = new Date();
  const newStatus = booking.status === 'approved' ? 'active' : booking.status;

  await pool.query(
    `UPDATE peminjaman SET status_pembayaran='lunas', metode_pembayaran=?, transaksi_pembayaran_id=?,
      tanggal_pembayaran=?, status=? WHERE id=?`,
    [paymentType, orderId, paymentDate, newStatus, bookingId]
  );
}

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
