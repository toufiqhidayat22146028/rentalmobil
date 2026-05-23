// ============================================================
// SEED.JS — Mengisi database MySQL dengan data awal
// Jalankan: node src/db/seed.js
// Reset  :  node src/db/seed.js --fresh
// ============================================================

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const mysql  = require('mysql2/promise');

const isFresh = process.argv.includes('--fresh');

const DB_CONFIG = {
  host:     process.env.DB_HOST     || 'localhost',
  port:     Number(process.env.DB_PORT) || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true,
  charset: 'utf8mb4',
};

const run = async () => {
  console.log('[SEED] 🚀 Memulai proses seeding MySQL...');

  // Koneksi tanpa database dulu (untuk CREATE DATABASE)
  let conn = await mysql.createConnection(DB_CONFIG);

  const dbName = process.env.DB_NAME || 'rentalmobil';

  // Buat database jika belum ada
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await conn.query(`USE \`${dbName}\``);
  console.log(`[SEED] 🗄️  Database: ${dbName}`);

  // ── Buat tabel ────────────────────────────────────────────
  await conn.query(`
    CREATE TABLE IF NOT EXISTS users (
      id         INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      name       VARCHAR(150) NOT NULL,
      email      VARCHAR(150) NOT NULL UNIQUE,
      password   VARCHAR(255) NOT NULL,
      phone      VARCHAR(20)  DEFAULT '',
      address    TEXT,
      sim        VARCHAR(50)  DEFAULT '',
      ktp        VARCHAR(50)  DEFAULT '',
      avatar     VARCHAR(10)  DEFAULT '',
      role       ENUM('user','admin') NOT NULL DEFAULT 'user',
      status     ENUM('active','blocked') NOT NULL DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS cars (
      id                  INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      name                VARCHAR(150) NOT NULL,
      brand               VARCHAR(100) NOT NULL,
      type                VARCHAR(50)  DEFAULT 'MPV',
      year                YEAR         DEFAULT '2023',
      capacity            TINYINT      DEFAULT 5,
      transmission        VARCHAR(20)  DEFAULT 'Manual',
      fuel                VARCHAR(20)  DEFAULT 'Bensin',
      price_per_day       DECIMAL(12,2) NOT NULL,
      driver_cost_per_day DECIMAL(12,2) DEFAULT 150000.00,
      available           TINYINT(1)   DEFAULT 1,
      description         TEXT,
      color               VARCHAR(50)  DEFAULT '',
      plate_number        VARCHAR(20)  DEFAULT '',
      image               TEXT,
      rating              DECIMAL(3,1) DEFAULT 4.5,
      total_reviews       INT          DEFAULT 0,
      features            JSON,
      specs               JSON,
      created_at          DATETIME     DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id                     VARCHAR(20) NOT NULL PRIMARY KEY,
      user_id                INT NOT NULL,
      car_id                 INT NOT NULL,
      start_date             DATE NOT NULL,
      end_date               DATE NOT NULL,
      days                   SMALLINT NOT NULL,
      pickup_location        TEXT,
      with_driver            TINYINT(1) DEFAULT 0,
      total_cost             DECIMAL(15,2) NOT NULL,
      notes                  TEXT,
      status                 ENUM('pending','approved','active','completed','cancelled') NOT NULL DEFAULT 'pending',
      payment_status         ENUM('unpaid','paid') NOT NULL DEFAULT 'unpaid',
      payment_method         VARCHAR(50)  DEFAULT '',
      payment_transaction_id VARCHAR(100) DEFAULT '',
      payment_date           DATETIME     DEFAULT NULL,
      created_at             DATETIME     DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (car_id)  REFERENCES cars(id)  ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // ── Hapus data lama jika --fresh ──────────────────────────
  if (isFresh) {
    console.log('[SEED] 🗑️  Menghapus data lama (--fresh)...');
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    await conn.query('TRUNCATE TABLE bookings');
    await conn.query('TRUNCATE TABLE cars');
    await conn.query('TRUNCATE TABLE users');
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');
  }

  // ── Cek apakah data sudah ada ─────────────────────────────
  const [[{ cnt }]] = await conn.query('SELECT COUNT(*) AS cnt FROM users');
  if (cnt > 0 && !isFresh) {
    console.log('[SEED] ⚠️  Data sudah ada. Gunakan --fresh untuk reset.');
    await conn.end();
    process.exit(0);
  }

  // ── USERS ─────────────────────────────────────────────────
  console.log('[SEED] 👤 Menyimpan data pengguna...');
  const USERS = [
    { name: 'Administrator',  email: 'admin@rentalmobil.com', password: 'admin123', phone: '08121234567', address: 'Jl. Admin No.1, Jakarta',          role: 'admin', avatar: 'AD' },
    { name: 'Budi Santoso',   email: 'user@test.com',         password: 'user123',  phone: '08129876543', address: 'Jl. Merdeka No.10, Bandung',        role: 'user',  avatar: 'BS' },
    { name: 'Sari Wulandari', email: 'sari@test.com',         password: 'user123',  phone: '08211122334', address: 'Jl. Sudirman No.5, Surabaya',       role: 'user',  avatar: 'SW' },
    { name: 'Rina Kusuma',    email: 'rina@test.com',         password: 'user123',  phone: '08563344556', address: 'Jl. Gatot Subroto No.88, Jakarta',  role: 'user',  avatar: 'RK' },
    { name: 'Agus Prasetyo',  email: 'agus@test.com',         password: 'user123',  phone: '08774455667', address: 'Jl. Ahmad Yani No.22, Yogyakarta',  role: 'user',  avatar: 'AP', status: 'blocked' },
  ];

  const userIds = {};
  for (const u of USERS) {
    const hashed = await bcrypt.hash(u.password, 10);
    const [res] = await conn.query(
      'INSERT INTO users (name, email, password, phone, address, role, status, avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [u.name, u.email, hashed, u.phone, u.address, u.role, u.status || 'active', u.avatar]
    );
    userIds[u.email] = res.insertId;
    console.log(`   ✓ User [${res.insertId}]: ${u.email}`);
  }

  // ── CARS (12 kendaraan) ───────────────────────────────────
  console.log('[SEED] 🚗 Menyimpan data kendaraan...');
  const CARS = [
    { name: 'Toyota Avanza',         brand: 'Toyota',     type: 'MPV',      year: 2023, capacity: 7, transmission: 'Manual',   fuel: 'Bensin', price_per_day: 280000, driver_cost_per_day: 150000, available: 1, color: 'Putih',        plate_number: 'B 1234 ABC', rating: 4.8, total_reviews: 124, image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&q=80', description: 'Toyota Avanza adalah MPV keluarga yang sangat populer di Indonesia.', features: JSON.stringify(['AC Double Blower','Power Window','Central Lock','Audio System','Power Steering','Airbag','Rem ABS']), specs: JSON.stringify({ engine:'1.5L', power:'102 hp', torque:'136 Nm' }) },
    { name: 'Toyota Innova Reborn',  brand: 'Toyota',     type: 'MPV',      year: 2023, capacity: 8, transmission: 'Otomatis', fuel: 'Diesel', price_per_day: 450000, driver_cost_per_day: 150000, available: 1, color: 'Silver',       plate_number: 'B 5678 DEF', rating: 4.9, total_reviews: 89,  image: 'https://images.unsplash.com/photo-1571987502654-002297197bea?w=800&q=80', description: 'Toyota Innova Reborn hadir dengan desain lebih modern.', features: JSON.stringify(['AC Triple Zone','Captain Seat','Power Sliding Door','7-Airbag','VSC']), specs: JSON.stringify({ engine:'2.0L GD', power:'149 hp', torque:'360 Nm' }) },
    { name: 'Toyota Fortuner',       brand: 'Toyota',     type: 'SUV',      year: 2023, capacity: 7, transmission: 'Otomatis', fuel: 'Diesel', price_per_day: 700000, driver_cost_per_day: 200000, available: 1, color: 'Hitam',        plate_number: 'B 9012 GHI', rating: 4.9, total_reviews: 56,  image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80', description: 'Toyota Fortuner adalah SUV tangguh yang mampu melewati berbagai medan.', features: JSON.stringify(['4WD','Hill Start Assist','Apple CarPlay','JBL Audio','Sunroof']), specs: JSON.stringify({ engine:'2.8L GD-FTV', power:'204 hp', torque:'500 Nm' }) },
    { name: 'Toyota Alphard',        brand: 'Toyota',     type: 'Luxury',   year: 2024, capacity: 7, transmission: 'Otomatis', fuel: 'Hybrid', price_per_day: 1200000,driver_cost_per_day: 300000, available: 1, color: 'Putih Mutiara',plate_number: 'B 3456 JKL', rating: 5.0, total_reviews: 34,  image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80', description: 'Toyota Alphard menawarkan pengalaman berkendara paling mewah.', features: JSON.stringify(['Executive Lounge Seat','Premium JBL Audio','Rear Entertainment','Power Door']), specs: JSON.stringify({ engine:'2.5L Hybrid', power:'182 hp', torque:'221 Nm' }) },
    { name: 'Honda CR-V Turbo',      brand: 'Honda',      type: 'SUV',      year: 2023, capacity: 5, transmission: 'Otomatis', fuel: 'Bensin', price_per_day: 550000, driver_cost_per_day: 180000, available: 0, color: 'Abu-abu',      plate_number: 'B 7890 MNO', rating: 4.7, total_reviews: 72,  image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80', description: 'Honda CR-V Turbo menghadirkan perpaduan sempurna antara performa dan efisiensi.', features: JSON.stringify(['Honda Sensing','Turbocharged Engine','Apple CarPlay','Android Auto']), specs: JSON.stringify({ engine:'1.5L VTEC Turbo', power:'193 hp', torque:'243 Nm' }) },
    { name: 'Mitsubishi Pajero Sport',brand: 'Mitsubishi', type: 'SUV',     year: 2023, capacity: 7, transmission: 'Otomatis', fuel: 'Diesel', price_per_day: 650000, driver_cost_per_day: 200000, available: 1, color: 'Merah',        plate_number: 'B 2345 PQR', rating: 4.8, total_reviews: 48,  image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80', description: 'Mitsubishi Pajero Sport adalah SUV tangguh dengan kemampuan off-road mumpuni.', features: JSON.stringify(['Super Select 4WD-II','Multi Around Monitor','Forward Collision Mitigation']), specs: JSON.stringify({ engine:'2.4L MIVEC Diesel', power:'181 hp', torque:'430 Nm' }) },
    { name: 'Toyota Camry',          brand: 'Toyota',     type: 'Sedan',    year: 2023, capacity: 5, transmission: 'Otomatis', fuel: 'Hybrid', price_per_day: 600000, driver_cost_per_day: 200000, available: 1, color: 'Putih',        plate_number: 'B 6789 STU', rating: 4.8, total_reviews: 41,  image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80', description: 'Toyota Camry Hybrid menghadirkan perpaduan sempurna antara kemewahan dan efisiensi.', features: JSON.stringify(['Toyota Safety Sense','JBL 9-Speaker','Head-Up Display','360-Degree Camera']), specs: JSON.stringify({ engine:'2.5L Hybrid', power:'218 hp', torque:'221 Nm' }) },
    { name: 'Honda Brio Satya',      brand: 'Honda',      type: 'City Car', year: 2022, capacity: 5, transmission: 'Manual',   fuel: 'Bensin', price_per_day: 200000, driver_cost_per_day: 120000, available: 1, color: 'Merah',        plate_number: 'B 1122 VWX', rating: 4.5, total_reviews: 198, image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=80', description: 'Honda Brio Satya adalah city car yang lincah dan ekonomis.', features: JSON.stringify(['Dual Airbag','ABS + EBD','Immobilizer','Power Window']), specs: JSON.stringify({ engine:'1.2L i-VTEC', power:'90 hp', torque:'110 Nm' }) },
    { name: 'Daihatsu Xenia',        brand: 'Daihatsu',   type: 'MPV',      year: 2022, capacity: 7, transmission: 'Manual',   fuel: 'Bensin', price_per_day: 270000, driver_cost_per_day: 150000, available: 1, color: 'Silver',       plate_number: 'B 3344 YZA', rating: 4.6, total_reviews: 156, image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80', description: 'Daihatsu Xenia hadir sebagai MPV keluarga yang terjangkau namun tetap nyaman.', features: JSON.stringify(['VSC & TRC','Hill Start Assist','Power Window','LED Headlamp']), specs: JSON.stringify({ engine:'1.5L NR', power:'105 hp', torque:'136 Nm' }) },
    { name: 'Mitsubishi Xpander',    brand: 'Mitsubishi', type: 'MPV',      year: 2023, capacity: 7, transmission: 'Otomatis', fuel: 'Bensin', price_per_day: 380000, driver_cost_per_day: 150000, available: 0, color: 'Putih',        plate_number: 'B 5566 BCD', rating: 4.7, total_reviews: 93,  image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80', description: 'Mitsubishi Xpander Cross hadir dengan desain crossover modern.', features: JSON.stringify(['6-Airbag','Hill Start Assist','Auto AC','Reverse Camera','Android Auto']), specs: JSON.stringify({ engine:'1.5L MIVEC', power:'105 hp', torque:'141 Nm' }) },
    { name: 'Suzuki Ertiga',         brand: 'Suzuki',     type: 'MPV',      year: 2022, capacity: 7, transmission: 'Otomatis', fuel: 'Bensin', price_per_day: 320000, driver_cost_per_day: 150000, available: 1, color: 'Biru',         plate_number: 'B 7788 EFG', rating: 4.6, total_reviews: 112, image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80', description: 'Suzuki Ertiga menggabungkan kenyamanan penumpang dengan efisiensi bahan bakar.', features: JSON.stringify(['Dual Airbag','ABS+EBD','Rear AC','Push Start','Cruise Control']), specs: JSON.stringify({ engine:'1.5L K15B', power:'105 hp', torque:'138 Nm' }) },
    { name: 'Toyota Agya TRD',       brand: 'Toyota',     type: 'City Car', year: 2023, capacity: 4, transmission: 'Otomatis', fuel: 'Bensin', price_per_day: 220000, driver_cost_per_day: 120000, available: 1, color: 'Hitam',        plate_number: 'B 9900 HIJ', rating: 4.5, total_reviews: 87,  image: 'https://images.unsplash.com/photo-1612825173281-9a193378527e?w=800&q=80', description: 'Toyota Agya TRD S hadir dengan tampilan sporty dan agresif.', features: JSON.stringify(['Dual SRS Airbag','ABS','TRC','Smart Entry','Audio Touch Screen']), specs: JSON.stringify({ engine:'1.2L Dual VVT-i', power:'88 hp', torque:'113 Nm' }) },
  ];

  const carIds = {};
  for (const car of CARS) {
    const [res] = await conn.query(
      `INSERT INTO cars (name, brand, type, year, capacity, transmission, fuel, price_per_day,
        driver_cost_per_day, available, description, color, plate_number, image, rating,
        total_reviews, features, specs) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [car.name, car.brand, car.type, car.year, car.capacity, car.transmission, car.fuel,
       car.price_per_day, car.driver_cost_per_day, car.available, car.description,
       car.color, car.plate_number, car.image, car.rating, car.total_reviews,
       car.features, car.specs]
    );
    carIds[car.name] = res.insertId;
    console.log(`   ✓ Car [${res.insertId}]: ${car.name}`);
  }

  // ── BOOKINGS ──────────────────────────────────────────────
  console.log('[SEED] 📋 Menyimpan data peminjaman...');
  const uid = userIds;
  const cid = carIds;

  const BOOKINGS = [
    { id: 'BK-001', user_id: uid['user@test.com'], car_id: cid['Toyota Avanza'],        start_date: '2026-05-10', end_date: '2026-05-13', days: 3, pickup_location: 'Kantor Pusat – Jl. Admin No.1, Jakarta',           with_driver: 0, total_cost: 840000,   notes: 'Tolong siapkan mobil bersih.',  status: 'completed', payment_status: 'paid',   payment_method: 'Transfer Bank', payment_transaction_id: 'TRX-RM-SEED-001' },
    { id: 'BK-002', user_id: uid['sari@test.com'], car_id: cid['Toyota Fortuner'],      start_date: '2026-05-20', end_date: '2026-05-22', days: 2, pickup_location: 'Antar ke Alamat – Jl. Sudirman No.5, Surabaya',  with_driver: 1, total_cost: 1700000,  notes: '',                              status: 'active',    payment_status: 'paid',   payment_method: 'QRIS',          payment_transaction_id: 'TRX-RM-SEED-002' },
    { id: 'BK-003', user_id: uid['rina@test.com'], car_id: cid['Toyota Camry'],         start_date: '2026-05-25', end_date: '2026-05-26', days: 1, pickup_location: 'Kantor Pusat – Jl. Admin No.1, Jakarta',           with_driver: 1, total_cost: 800000,   notes: 'Untuk acara pernikahan.',       status: 'approved',  payment_status: 'unpaid', payment_method: '',              payment_transaction_id: '' },
    { id: 'BK-004', user_id: uid['user@test.com'], car_id: cid['Toyota Innova Reborn'], start_date: '2026-06-01', end_date: '2026-06-04', days: 3, pickup_location: 'Kantor Pusat – Jl. Admin No.1, Jakarta',           with_driver: 0, total_cost: 1350000,  notes: 'Perjalanan wisata ke Bogor.',  status: 'pending',   payment_status: 'unpaid', payment_method: '',              payment_transaction_id: '' },
    { id: 'BK-005', user_id: uid['sari@test.com'], car_id: cid['Honda Brio Satya'],     start_date: '2026-04-15', end_date: '2026-04-17', days: 2, pickup_location: 'Antar ke Alamat – Jl. Sudirman No.5, Surabaya',  with_driver: 0, total_cost: 400000,   notes: '',                              status: 'completed', payment_status: 'paid',   payment_method: 'GoPay',         payment_transaction_id: 'TRX-RM-SEED-005' },
    { id: 'BK-006', user_id: uid['rina@test.com'], car_id: cid['Toyota Alphard'],       start_date: '2026-06-10', end_date: '2026-06-11', days: 1, pickup_location: 'Antar ke Alamat – Jl. Gatot Subroto No.88, Jakarta',with_driver: 1,total_cost: 1500000, notes: 'VIP untuk tamu undangan.',     status: 'pending',   payment_status: 'unpaid', payment_method: '',              payment_transaction_id: '' },
  ];

  for (const b of BOOKINGS) {
    await conn.query(
      `INSERT INTO bookings (id, user_id, car_id, start_date, end_date, days, pickup_location,
        with_driver, total_cost, notes, status, payment_status, payment_method, payment_transaction_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [b.id, b.user_id, b.car_id, b.start_date, b.end_date, b.days, b.pickup_location,
       b.with_driver, b.total_cost, b.notes, b.status, b.payment_status, b.payment_method, b.payment_transaction_id]
    );
    console.log(`   ✓ Booking: ${b.id} (${b.status})`);
  }

  await conn.end();

  console.log('\n[SEED] ✅ Seeding MySQL selesai!');
  console.log('[SEED] 📊 Summary:');
  console.log(`   Users   : ${USERS.length} records`);
  console.log(`   Cars    : ${CARS.length} records`);
  console.log(`   Bookings: ${BOOKINGS.length} records`);
  console.log('\n[SEED] 🔑 Demo Akun:');
  console.log('   Admin : admin@rentalmobil.com / admin123');
  console.log('   User  : user@test.com / user123');
  process.exit(0);
};

run().catch((err) => {
  console.error('[SEED] ❌ Error:', err.message);
  process.exit(1);
});
