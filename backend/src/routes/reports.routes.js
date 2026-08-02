const express = require('express');
const router = express.Router();
const pool = require('../db/database');
const { authenticate, adminOnly } = require('../middleware/auth');

// GET /api/reports?period=harian|mingguan|bulanan
router.get('/', authenticate, adminOnly, async (req, res) => {
  try {
    const { period = 'bulanan' } = req.query;

    const [rows] = await pool.query(`
      SELECT 
        p.id, p.tanggal_mulai, p.tanggal_kembali, p.durasi_hari, p.total_biaya, p.status, p.status_pembayaran, p.dibuat_pada, p.dengan_sopir,
        u.nama AS nama_pengguna,
        m.nama AS nama_mobil, m.merek, m.gambar
      FROM peminjaman p
      JOIN pengguna u ON p.pengguna_id = u.id
      JOIN mobil m ON p.mobil_id = m.id
      ORDER BY p.dibuat_pada DESC
    `);
    
    const now = new Date();
    
    // Filter rentang waktu berjalan (current period)
    const isCurrentPeriod = (dateStr) => {
      if (!dateStr) return false;
      const date = new Date(dateStr);
      if (period === 'harian') {
        return date.toDateString() === now.toDateString();
      } else if (period === 'mingguan') {
        const diff = (now - date) / (1000 * 60 * 60 * 24);
        return diff <= 7 && diff >= 0;
      } else if (period === 'bulanan') {
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }
      return true; // default all
    };

    let totalPendapatan = 0;
    let totalTransaksi = 0;
    let transaksiSelesai = 0;
    let dibatalkan = 0;
    let denganSopir = 0;
    
    const popularCarsMap = {};
    const filteredRows = [];

    rows.forEach(row => {
      const isPaid = row.status_pembayaran === 'lunas';
      const isCompleted = row.status === 'completed';
      const isCancelled = row.status === 'cancelled';

      if (isCurrentPeriod(row.dibuat_pada)) {
        filteredRows.push(row);
        totalTransaksi++;
        if (isPaid) totalPendapatan += Number(row.total_biaya);
        if (isCompleted) transaksiSelesai++;
        if (isCancelled) dibatalkan++;
        if (row.dengan_sopir) denganSopir++;
        
        // Count Popular Cars
        if (!popularCarsMap[row.nama_mobil]) {
          popularCarsMap[row.nama_mobil] = { 
            id: row.mobil_id, name: row.nama_mobil, count: 0, revenue: 0, image: row.gambar
          };
        }
        popularCarsMap[row.nama_mobil].count++;
        if (isPaid) popularCarsMap[row.nama_mobil].revenue += Number(row.total_biaya);
      }
    });

    const popularCars = Object.values(popularCarsMap)
      .sort((a, b) => b.count - a.count);

    res.json({
      success: true,
      data: {
        kpi: {
          totalPendapatan,
          totalTransaksi,
          transaksiSelesai,
          dibatalkan,
          denganSopir
        },
        popularCars,
        transactions: filteredRows
      }
    });

  } catch (err) {
    console.error('[API Laporan Error]', err);
    res.status(500).json({ success: false, message: 'Gagal memuat data laporan.' });
  }
});

module.exports = router;
