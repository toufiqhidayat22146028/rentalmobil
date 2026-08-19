const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'd:\\rentalmobil\\backend\\.env' });
async function testNulls() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME, port: process.env.DB_PORT
  });
  try {
    const id = 15;
    const [result] = await conn.query(
      `UPDATE mobil SET nama=?, merek=?, tipe=?, tahun=?, kapasitas=?, transmisi=?,
        bahan_bakar=?, harga_per_hari=?, biaya_sopir_per_hari=?, tersedia=?, prioritas=?,
        deskripsi=?, warna=?, nomor_plat=?, gambar=?, fitur=?, spesifikasi=?
       WHERE id=?`,
      ['Test', 'Test', 'City Car', 2023, 5, 'Manual', 'Bensin', 300000, 150000, 1, 0, null, null, null, null, '[]', '{}', id]
    );
    console.log('Null update OK:', result);
  } catch(e) {
    console.error('Null update Failed:', e.message);
  }
  process.exit(0);
}
testNulls();
