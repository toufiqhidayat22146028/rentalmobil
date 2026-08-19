const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'd:\\rentalmobil\\backend\\.env' });
async function updatePlates() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME, port: process.env.DB_PORT
  });
  
  const [cars] = await conn.query('SELECT id FROM mobil');
  
  for (const car of cars) {
    const number = Math.floor(Math.random() * 8999) + 1000;
    const suffixes = ['IA', 'IB', 'IC', 'ID', 'IE', 'IF', 'IG', 'IH'];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const plat = `BL ${number} ${suffix}`;
    
    await conn.query('UPDATE mobil SET nomor_plat=? WHERE id=?', [plat, car.id]);
  }
  
  console.log('Plat nomor Subulussalam berhasil ditambahkan!');
  process.exit(0);
}
updatePlates();
