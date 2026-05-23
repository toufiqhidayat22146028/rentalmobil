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

// ============================================================
// INISIALISASI SCHEMA — Buat tabel jika belum ada
// ============================================================
const initSchema = async () => {
  const conn = await pool.getConnection();
  try {
    // Buat database jika belum ada
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'rentalmobil'}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await conn.query(`USE \`${process.env.DB_NAME || 'rentalmobil'}\``);

    // ── TABEL: users ──────────────────────────────────────────
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id         INT            NOT NULL AUTO_INCREMENT PRIMARY KEY,
        name       VARCHAR(150)   NOT NULL,
        email      VARCHAR(150)   NOT NULL UNIQUE,
        password   VARCHAR(255)   NOT NULL,
        phone      VARCHAR(20)    DEFAULT '',
        address    TEXT           DEFAULT NULL,
        sim        VARCHAR(50)    DEFAULT '',
        ktp        VARCHAR(50)    DEFAULT '',
        avatar     VARCHAR(10)    DEFAULT '',
        role       ENUM('user','admin')   NOT NULL DEFAULT 'user',
        status     ENUM('active','blocked') NOT NULL DEFAULT 'active',
        created_at DATETIME       DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role  (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // ── TABEL: cars ───────────────────────────────────────────
    await conn.query(`
      CREATE TABLE IF NOT EXISTS cars (
        id                  INT            NOT NULL AUTO_INCREMENT PRIMARY KEY,
        name                VARCHAR(150)   NOT NULL,
        brand               VARCHAR(100)   NOT NULL,
        type                VARCHAR(50)    NOT NULL DEFAULT 'MPV',
        year                YEAR           DEFAULT '2023',
        capacity            TINYINT        DEFAULT 5,
        transmission        VARCHAR(20)    DEFAULT 'Manual',
        fuel                VARCHAR(20)    DEFAULT 'Bensin',
        price_per_day       DECIMAL(12,2)  NOT NULL,
        driver_cost_per_day DECIMAL(12,2)  DEFAULT 150000.00,
        available           TINYINT(1)     NOT NULL DEFAULT 1,
        description         TEXT           DEFAULT NULL,
        color               VARCHAR(50)    DEFAULT '',
        plate_number        VARCHAR(20)    DEFAULT '',
        image               TEXT           DEFAULT NULL,
        rating              DECIMAL(3,1)   DEFAULT 4.5,
        total_reviews       INT            DEFAULT 0,
        features            JSON           DEFAULT NULL,
        specs               JSON           DEFAULT NULL,
        created_at          DATETIME       DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_available (available),
        INDEX idx_type      (type),
        INDEX idx_brand     (brand)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // ── TABEL: bookings ───────────────────────────────────────
    await conn.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id                     VARCHAR(20)   NOT NULL PRIMARY KEY,
        user_id                INT           NOT NULL,
        car_id                 INT           NOT NULL,
        start_date             DATE          NOT NULL,
        end_date               DATE          NOT NULL,
        days                   SMALLINT      NOT NULL,
        pickup_location        TEXT          DEFAULT NULL,
        with_driver            TINYINT(1)    DEFAULT 0,
        total_cost             DECIMAL(15,2) NOT NULL,
        notes                  TEXT          DEFAULT NULL,
        status                 ENUM('pending','approved','active','completed','cancelled') NOT NULL DEFAULT 'pending',
        payment_status         ENUM('unpaid','paid') NOT NULL DEFAULT 'unpaid',
        payment_method         VARCHAR(50)   DEFAULT '',
        payment_transaction_id VARCHAR(100)  DEFAULT '',
        payment_date           DATETIME      DEFAULT NULL,
        created_at             DATETIME      DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (car_id)  REFERENCES cars(id)  ON DELETE CASCADE,
        INDEX idx_user_id       (user_id),
        INDEX idx_car_id        (car_id),
        INDEX idx_status        (status),
        INDEX idx_payment_status(payment_status)
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
  process.exit(1);
});

module.exports = pool;
