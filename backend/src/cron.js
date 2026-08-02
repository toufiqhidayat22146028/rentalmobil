const cron = require('node-cron');
const pool = require('./db/database');

// Jadwalkan cron untuk berjalan setiap 1 menit (untuk keperluan testing/demo)
// Di produksi nyata, bisa diubah jadi '0 * * * *' (setiap jam) atau '0 0 * * *' (tiap tengah malam)
cron.schedule('* * * * *', async () => {
  try {
    // 1. Cari semua peminjaman aktif yang tanggal kembalinya sudah lewat (kurang dari hari ini)
    const [expiredBookings] = await pool.query(
      `SELECT id, mobil_id 
       FROM peminjaman 
       WHERE status = 'active' 
       AND tanggal_kembali < CURRENT_DATE()`
    );

    if (expiredBookings.length > 0) {
      console.log(`[Cron] Ditemukan ${expiredBookings.length} peminjaman kedaluwarsa. Mengubah status...`);
      
      for (const booking of expiredBookings) {
        // Ubah status peminjaman menjadi 'completed'
        await pool.query('UPDATE peminjaman SET status = ? WHERE id = ?', ['completed', booking.id]);
        
        // Kembalikan ketersediaan mobil, asalkan mobilnya tidak sedang diperbaiki
        // (Jika sedang diperbaiki, ketersediaan tetap 0)
        await pool.query(
          `UPDATE mobil SET tersedia = 1 WHERE id = ? AND sedang_perbaikan = 0`,
          [booking.mobil_id]
        );
      }
      
      console.log('[Cron] Berhasil memperbarui status peminjaman dan ketersediaan mobil.');
    }
  } catch (error) {
    console.error('[Cron] Gagal menjalankan tugas pembaruan otomatis:', error.message);
  }
});

console.log('[Cron] Job pengembalian otomatis telah diaktifkan.');
