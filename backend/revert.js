const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'd:\\rentalmobil\\backend\\.env' });
async function revert() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME, port: process.env.DB_PORT
  });
  const id = 15;
  await conn.query(
    `UPDATE mobil SET nama=?, merek=?, tipe=?, tahun=?, kapasitas=?, transmisi=?,
      bahan_bakar=?, harga_per_hari=?, biaya_sopir_per_hari=?, tersedia=?, prioritas=?,
      deskripsi=?, warna=?, nomor_plat=?, gambar=?, fitur=?, spesifikasi=?
     WHERE id=?`,
    ['Daihatsu Ayla 1.2 R', 'Daihatsu', 'City Car', 2023, 5, 'Manual', 'Bensin', 300000, 150000, 1, 0, 'Pilihan hemat dan lincah untuk menemani aktivitas perkotaan. Biaya operasional rendah dengan ruang kabin yang dimaksimalkan untuk kenyamanan 5 penumpang.', '', '', 'https://images.unsplash.com/photo-1612825173281-9a193378527e?w=800&q=80', JSON.stringify(['Lampu Depan LED', 'AC Digital', 'Akses Tanpa Kunci', 'Kantung Udara Ganda', 'Rem ABS & EBD']), JSON.stringify({"engine":"1.2L WA-VE 3-Silinder","power":"88 PS","torque":"113 Nm","length":"3.760 mm","width":"1.665 mm","height":"1.510 mm"}), id]
  );
  process.exit(0);
}
revert();
