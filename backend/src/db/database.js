// ============================================================
// DATABASE.JS — MySQL Connection Pool menggunakan mysql2/promise
// ============================================================

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const mysql = require('mysql2/promise');

// Buat connection pool (lebih efisien dari single connection)
const pool = mysql.createPool({
  host:               process.env.DB_HOST     || 'localhost',
  port:               Number(process.env.DB_PORT) || 3306,
  user:               process.env.DB_USER     || 'root',
  password:           process.env.DB_PASSWORD || '',
  database:           process.env.DB_NAME     || 'rentalmobil',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  charset:            'utf8mb4',
  timezone:           '+07:00',
});

const ensureSessionIndex = async (conn, tableName, columnName) => {
  const [indexes] = await conn.query(`SHOW INDEX FROM \`${tableName}\``);
  const existingIndex = indexes.find((index) => index.Key_name === 'idx_session_id');

  if (!existingIndex) {
    await conn.query(`ALTER TABLE \`${tableName}\` ADD INDEX idx_session_id (\`${columnName}\`)`);
    return;
  }

  if (existingIndex.Non_unique === 0) {
    await conn.query(`ALTER TABLE \`${tableName}\` DROP INDEX \`idx_session_id\``);
    await conn.query(`ALTER TABLE \`${tableName}\` ADD INDEX idx_session_id (\`${columnName}\`)`);
  }
};

// ============================================================
// INISIALISASI SCHEMA — Buat tabel jika belum ada
// ============================================================
const initSchema = async () => {
  const conn = await pool.getConnection();
  try {
    // Buat database jika belum ada
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'rentalmobil'}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await conn.query(`USE \`${process.env.DB_NAME || 'rentalmobil'}\``);

    // Hapus tabel lama berbahasa Inggris yang tidak digunakan jika ada
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    await conn.query('DROP TABLE IF EXISTS bookings');
    await conn.query('DROP TABLE IF EXISTS cars');
    await conn.query('DROP TABLE IF EXISTS users');
    await conn.query('DROP TABLE IF EXISTS chat_conversations');
    await conn.query('DROP TABLE IF EXISTS chat_messages');
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');

    // ── TABEL: pengguna ──────────────────────────────────────────
    await conn.query(`
      CREATE TABLE IF NOT EXISTS pengguna (
        id          INT            NOT NULL AUTO_INCREMENT PRIMARY KEY,
        nama        VARCHAR(150)   NOT NULL,
        email       VARCHAR(150)   NOT NULL UNIQUE,
        kata_sandi  VARCHAR(255)   NOT NULL,
        telepon     VARCHAR(20)    DEFAULT '',
        alamat      TEXT           DEFAULT NULL,
        sim         VARCHAR(50)    DEFAULT '',
        ktp         VARCHAR(50)    DEFAULT '',
        avatar      VARCHAR(10)    DEFAULT '',
        peran       ENUM('user','admin')   NOT NULL DEFAULT 'user',
        status      ENUM('aktif','diblokir') NOT NULL DEFAULT 'aktif',
        dibuat_pada DATETIME       DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_peran (peran)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // ── TABEL: mobil ───────────────────────────────────────────
    await conn.query(`
      CREATE TABLE IF NOT EXISTS mobil (
        id                    INT            NOT NULL AUTO_INCREMENT PRIMARY KEY,
        nama                  VARCHAR(150)   NOT NULL,
        merek                 VARCHAR(100)   NOT NULL,
        tipe                  VARCHAR(50)    NOT NULL DEFAULT 'MPV',
        tahun                 YEAR           DEFAULT '2023',
        kapasitas             TINYINT        DEFAULT 5,
        transmisi             VARCHAR(20)    DEFAULT 'Manual',
        bahan_bakar           VARCHAR(20)    DEFAULT 'Bensin',
        harga_per_hari        DECIMAL(12,2)  NOT NULL,
        biaya_sopir_per_hari  DECIMAL(12,2)  DEFAULT 150000.00,
        tersedia              TINYINT(1)     NOT NULL DEFAULT 1,
        prioritas             INT            DEFAULT 0,
        sedang_perbaikan      TINYINT(1)     DEFAULT 0,
        deskripsi             TEXT           DEFAULT NULL,
        warna                 VARCHAR(50)    DEFAULT '',
        nomor_plat            VARCHAR(20)    DEFAULT '',
        gambar                TEXT           DEFAULT NULL,
        rating                DECIMAL(3,1)   DEFAULT 4.5,
        total_ulasan          INT            DEFAULT 0,
        fitur                 JSON           DEFAULT NULL,
        spesifikasi           JSON           DEFAULT NULL,
        dibuat_pada           DATETIME       DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_tersedia (tersedia),
        INDEX idx_tipe     (tipe),
        INDEX idx_merek    (merek)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // ── TABEL: peminjaman ───────────────────────────────────────
    await conn.query(`
      CREATE TABLE IF NOT EXISTS peminjaman (
        id                     VARCHAR(20)   NOT NULL PRIMARY KEY,
        pengguna_id            INT           NOT NULL,
        mobil_id               INT           NOT NULL,
        tanggal_mulai          DATE          NOT NULL,
        tanggal_kembali        DATE          NOT NULL,
        durasi_hari            INT           NOT NULL,
        area_pemakaian         ENUM('dalam_kota', 'luar_kota') DEFAULT 'dalam_kota',
        lokasi_penjemputan     VARCHAR(255)  DEFAULT '',
        dengan_sopir           BOOLEAN       DEFAULT FALSE,
        total_biaya            DECIMAL(15,2) NOT NULL,
        biaya_luar_kota        DECIMAL(15,2) DEFAULT 0,
        catatan                TEXT          DEFAULT NULL,
        status                 ENUM('pending','approved','active','completed','cancelled') NOT NULL DEFAULT 'pending',
        status_pembayaran      ENUM('belum_bayar','lunas') NOT NULL DEFAULT 'belum_bayar',
        metode_pembayaran      VARCHAR(50)   DEFAULT '',
        transaksi_pembayaran_id VARCHAR(100)  DEFAULT '',
        tanggal_pembayaran     DATETIME      DEFAULT NULL,
        dibuat_pada            DATETIME      DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (pengguna_id) REFERENCES pengguna(id) ON DELETE CASCADE,
        FOREIGN KEY (mobil_id)  REFERENCES mobil(id)  ON DELETE CASCADE,
        INDEX idx_pengguna_id       (pengguna_id),
        INDEX idx_mobil_id          (mobil_id),
        INDEX idx_status            (status),
        INDEX idx_status_pembayaran (status_pembayaran),
        INDEX idx_transaksi_pembayaran_id (transaksi_pembayaran_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // ── TABEL: chat_percakapan ─────────────────────────────
    await conn.query(`
      CREATE TABLE IF NOT EXISTS chat_percakapan (
        id                   INT            NOT NULL AUTO_INCREMENT PRIMARY KEY,
        pengguna_id          INT            NOT NULL,
        status               ENUM('aktif','ditutup') NOT NULL DEFAULT 'aktif',
        admin_mode           TINYINT(1)     DEFAULT 0,
        jumlah_belum_dibaca  INT            DEFAULT 0,
        session_id           VARCHAR(50)    NOT NULL DEFAULT '',
        pesan_terakhir_pada  DATETIME       DEFAULT CURRENT_TIMESTAMP,
        dibuat_pada          DATETIME       DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (pengguna_id) REFERENCES pengguna(id) ON DELETE CASCADE,
        INDEX idx_pengguna_id (pengguna_id),
        INDEX idx_status  (status),
        INDEX idx_session_id (session_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    await conn.query(
      `ALTER TABLE chat_percakapan ADD COLUMN IF NOT EXISTS session_id VARCHAR(50) NOT NULL DEFAULT '' AFTER jumlah_belum_dibaca`
    );
    await conn.query(
      `ALTER TABLE chat_percakapan ADD COLUMN IF NOT EXISTS admin_mode TINYINT(1) DEFAULT 0 AFTER status`
    );
    await ensureSessionIndex(conn, 'chat_percakapan', 'session_id');

    // ── TABEL: chat_pesan ──────────────────────────────────
    await conn.query(`
      CREATE TABLE IF NOT EXISTS chat_pesan (
        id             INT            NOT NULL AUTO_INCREMENT PRIMARY KEY,
        percakapan_id  INT            NOT NULL,
        session_id     VARCHAR(50)    NOT NULL DEFAULT '',
        peran_pengirim ENUM('user','bot','admin') NOT NULL,
        nama_pengirim  VARCHAR(150)   NOT NULL DEFAULT '',
        isi_pesan      TEXT           NOT NULL,
        sudah_dibaca   TINYINT(1)     NOT NULL DEFAULT 0,
        dibuat_pada    DATETIME       DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (percakapan_id) REFERENCES chat_percakapan(id) ON DELETE CASCADE,
        INDEX idx_percakapan (percakapan_id),
        INDEX idx_session_id (session_id),
        INDEX idx_peran_pengirim  (peran_pengirim)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    await conn.query(
      `ALTER TABLE chat_pesan ADD COLUMN IF NOT EXISTS session_id VARCHAR(50) NOT NULL DEFAULT '' AFTER percakapan_id`
    );
    await ensureSessionIndex(conn, 'chat_pesan', 'session_id');

    // ── TABEL: ulasan_mobil ────────────────────────────────────────
    await conn.query(`
      CREATE TABLE IF NOT EXISTS ulasan_mobil (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        peminjaman_id VARCHAR(20) NOT NULL UNIQUE,
        pengguna_id INT NOT NULL,
        mobil_id INT NOT NULL,
        rating TINYINT NOT NULL CHECK(rating >= 1 AND rating <= 5),
        komentar TEXT,
        dibuat_pada DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (peminjaman_id) REFERENCES peminjaman(id) ON DELETE CASCADE,
        FOREIGN KEY (pengguna_id) REFERENCES pengguna(id) ON DELETE CASCADE,
        FOREIGN KEY (mobil_id) REFERENCES mobil(id) ON DELETE CASCADE,
        INDEX idx_mobil_id (mobil_id),
        INDEX idx_pengguna_id (pengguna_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('[DB] ✅ Schema MySQL berhasil diinisialisasi');
  } finally {
    conn.release();
  }
};

// Jalankan schema saat module ini pertama kali diload
initSchema().catch((err) => {
  console.error('[DB] ❌ Gagal inisialisasi schema:', err.message);
  console.error('[DB] ⚠️ Backend tetap berjalan, tapi fitur database tidak akan berfungsi hingga MySQL dinyalakan.');
});

module.exports = pool;
