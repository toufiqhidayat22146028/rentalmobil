require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkChats() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'rentalmobil',
  });

  const [chats] = await conn.query('SELECT * FROM chat_percakapan');
  console.log("ALL CHATS:");
  console.table(chats);

  await conn.end();
}
checkChats();
