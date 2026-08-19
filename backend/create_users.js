const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: 'd:\\rentalmobil\\backend\\.env' });

async function createUsers() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME, port: process.env.DB_PORT
  });
  
  const names = ['Febri', 'Sanra', 'Ridho', 'Fadil', 'Rita'];
  const password = await bcrypt.hash('08032005', 10);
  
  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    const email = `${name.toLowerCase()}314@gmail.com`;
    // realistic indonesian phone numbers starting with 0812
    const phone = `0812${Math.floor(10000000 + Math.random() * 90000000)}`;
    
    await conn.query(
      'INSERT INTO pengguna (nama, email, kata_sandi, telepon, peran) VALUES (?, ?, ?, ?, ?)',
      [name, email, password, phone, 'user']
    );
  }
  
  console.log('5 user berhasil ditambahkan!');
  process.exit(0);
}
createUsers();
