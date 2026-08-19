const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'd:\\rentalmobil\\backend\\.env' });
async function testUpdate() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME, port: process.env.DB_PORT
  });
  try {
    const id = 1;
    const [result] = await conn.query(
      `UPDATE mobil SET nama=?, merek=?, tipe=?, tahun=?, kapasitas=?, transmisi=?,
        bahan_bakar=?, harga_per_hari=?, biaya_sopir_per_hari=?, tersedia=?, prioritas=?,
        deskripsi=?, warna=?, nomor_plat=?, gambar=?, fitur=?, spesifikasi=?
       WHERE id=?`,
      ['Toyota Avanza', 'Toyota', 'MPV', 2023, 7, 'Manual', 'Bensin', 350000, 150000, 1, 0, 'Desc', '', '', '', JSON.stringify(['AC']), JSON.stringify({}), id]
    );
    console.log('Update OK:', result);
  } catch(e) {
    console.error('Update Failed:', e.message);
  }
  process.exit(0);
}
testUpdate();
