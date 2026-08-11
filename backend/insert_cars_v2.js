const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'd:\\rentalmobil\\backend\\.env' });

const CARS = [
  {
    name: 'Toyota Avanza 1.5 G',
    brand: 'Toyota',
    type: 'MPV',
    year: 2023,
    capacity: 7,
    transmission: 'Manual',
    fuel: 'Bensin',
    price: 350000,
    desc: 'Generasi terbaru Toyota Avanza dengan penggerak roda depan (FWD) yang memberikan kabin lebih luas dan kenyamanan ekstra. Pilihan standar dan paling bisa diandalkan untuk mobilitas keluarga.',
    img: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&q=80',
    features: ['AC Baris Belakang (Double Blower)', 'Layar Sentuh 8 Inci', 'Kantung Udara Ganda (Airbag)', 'Rem ABS & EBD', 'Kontrol Stabilitas Kendaraan', 'Bantuan Tanjakan (HSA)'],
    specs: { engine: '1.5L 4-Silinder Dual VVT-i', power: '106 PS', torque: '137 Nm', length: '4.395 mm', width: '1.730 mm', height: '1.700 mm' }
  },
  {
    name: 'Daihatsu Xenia 1.5 R',
    brand: 'Daihatsu',
    type: 'MPV',
    year: 2023,
    capacity: 7,
    transmission: 'Otomatis',
    fuel: 'Bensin',
    price: 350000,
    desc: 'MPV 7-penumpang andalan keluarga Indonesia dengan kabin lega dan efisiensi bahan bakar yang sangat baik. Nyaman digunakan untuk perjalanan di dalam maupun luar kota.',
    img: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80',
    features: ['Tombol Start/Stop Mesin', 'Koneksi HP Pintar (Android Auto/CarPlay)', 'Akses Tanpa Kunci (Keyless)', 'Kamera Parkir Belakang', 'Rem ABS & EBD'],
    specs: { engine: '1.5L 4-Silinder Dual VVT-i', power: '106 PS', torque: '138 Nm', length: '4.395 mm', width: '1.730 mm', height: '1.700 mm' }
  },
  {
    name: 'Mitsubishi Xpander Ultimate',
    brand: 'Mitsubishi',
    type: 'MPV',
    year: 2023,
    capacity: 7,
    transmission: 'Otomatis',
    fuel: 'Bensin',
    price: 400000,
    desc: 'Mobil keluarga premium dengan desain Dynamic Shield yang futuristik. Dibekali suspensi paling nyaman di kelasnya, cocok untuk perjalanan jauh tanpa kelelahan.',
    img: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80',
    features: ['Rem Parkir Elektrik', 'Penahan Rem Otomatis', 'Sistem Penjelajah Otomatis (Cruise Control)', 'Kamera Belakang', 'Kontrol Stabilitas Aktif'],
    specs: { engine: '1.5L MIVEC DOHC', power: '105 PS', torque: '141 Nm', length: '4.595 mm', width: '1.750 mm', height: '1.750 mm' }
  },
  {
    name: 'Suzuki Ertiga Hybrid GX',
    brand: 'Suzuki',
    type: 'MPV',
    year: 2023,
    capacity: 7,
    transmission: 'Otomatis',
    fuel: 'Bensin/Hybrid',
    price: 350000,
    desc: 'MPV berteknologi Smart Hybrid yang sangat irit dan ramah lingkungan. Dikenal memiliki bantingan suspensi yang nyaman dan ruang kaki penumpang belakang yang luas.',
    img: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80',
    features: ['Sistem Hibrida Pintar Suzuki', 'Mesin Mati-Nyala Otomatis', 'Sistem Penjelajah Otomatis (Cruise Control)', 'Layar Sentuh 8 Inci', 'Program Stabilitas Elektronik'],
    specs: { engine: '1.5L K15B + ISG', power: '104 PS', torque: '138 Nm', length: '4.395 mm', width: '1.735 mm', height: '1.690 mm' }
  },
  {
    name: 'Honda Mobilio RS',
    brand: 'Honda',
    type: 'MPV',
    year: 2022,
    capacity: 7,
    transmission: 'Otomatis',
    fuel: 'Bensin',
    price: 350000,
    desc: 'Low MPV dengan karakter berkendara paling sporty. Performa mesin Honda yang bertenaga namun tetap irit bahan bakar, dipadukan dengan desain yang aerodinamis.',
    img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80',
    features: ['Bodi Kit Sporty RS', 'Layar Sentuh 8 Inci', 'AC Otomatis', 'Kantung Udara Depan Ganda', 'Bantuan Stabilitas Kendaraan'],
    specs: { engine: '1.5L i-VTEC', power: '118 PS', torque: '145 Nm', length: '4.398 mm', width: '1.683 mm', height: '1.603 mm' }
  },
  {
    name: 'Toyota Calya 1.2 G',
    brand: 'Toyota',
    type: 'LCGC',
    year: 2023,
    capacity: 7,
    transmission: 'Manual',
    fuel: 'Bensin',
    price: 300000,
    desc: 'LCGC 7-penumpang dengan konsumsi BBM yang sangat ekonomis. Pilihan rasional untuk rombongan keluarga kecil yang mengutamakan fungsi dan efisiensi.',
    img: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80',
    features: ['Tombol Audio di Setir', 'Spion Lipat Elektrik', 'Kantung Udara Ganda', 'Rem ABS & EBD', 'Sensor Parkir Belakang'],
    specs: { engine: '1.2L 3NR-VE Dual VVT-i', power: '88 PS', torque: '108 Nm', length: '4.110 mm', width: '1.655 mm', height: '1.600 mm' }
  },
  {
    name: 'Daihatsu Sigra 1.2 R',
    brand: 'Daihatsu',
    type: 'LCGC',
    year: 2023,
    capacity: 7,
    transmission: 'Otomatis',
    fuel: 'Bensin',
    price: 300000,
    desc: 'Kembaran Calya yang sangat populer untuk city tour maupun mobil rental harian. Kepraktisannya menjadikan mobil ini primadona di jalanan perkotaan.',
    img: 'https://images.unsplash.com/photo-1612825173281-9a193378527e?w=800&q=80',
    features: ['Lampu Depan LED', 'Spion Lipat Elektrik', 'Sistem Audio 2-DIN', 'Sirkulasi Udara Kabin Belakang', 'Kantung Udara Ganda'],
    specs: { engine: '1.2L 3NR-VE Dual VVT-i', power: '88 PS', torque: '108 Nm', length: '4.110 mm', width: '1.655 mm', height: '1.600 mm' }
  },
  {
    name: 'Toyota Rush GR Sport',
    brand: 'Toyota',
    type: 'SUV',
    year: 2023,
    capacity: 7,
    transmission: 'Otomatis',
    fuel: 'Bensin',
    price: 450000,
    desc: 'Low SUV berpenampilan gagah dengan ground clearance tinggi (220mm). Tangguh melewati medan berlubang, genangan air, hingga jalanan menanjak.',
    img: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80',
    features: ['6 Kantung Udara', 'Akses Pintar & Tombol Start', 'AC Otomatis', 'Kontrol Stabilitas Kendaraan', 'Bantuan Tanjakan', 'Bodi Kit GR Sport'],
    specs: { engine: '1.5L 2NR-VE Dual VVT-i', power: '104 PS', torque: '136 Nm', length: '4.435 mm', width: '1.695 mm', height: '1.705 mm' }
  },
  {
    name: 'Daihatsu Terios R Custom',
    brand: 'Daihatsu',
    type: 'SUV',
    year: 2023,
    capacity: 7,
    transmission: 'Manual',
    fuel: 'Bensin',
    price: 450000,
    desc: 'SUV dengan penggerak roda belakang (RWD) yang andal menaklukkan jalur pegunungan. Varian tertinggi dengan fitur keselamatan lengkap dan kabin lega.',
    img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
    features: ['Kamera 360 Derajat', 'Akses Tanpa Kunci', 'Kontrol Stabilitas & Bantuan Tanjakan', '6 Kantung Udara', 'Pengisi Daya Nirkabel'],
    specs: { engine: '1.5L 2NR-VE Dual VVT-i', power: '104 PS', torque: '136 Nm', length: '4.455 mm', width: '1.695 mm', height: '1.705 mm' }
  },
  {
    name: 'Suzuki XL7 Alpha',
    brand: 'Suzuki',
    type: 'SUV',
    year: 2023,
    capacity: 7,
    transmission: 'Otomatis',
    fuel: 'Bensin',
    price: 450000,
    desc: 'Crossover gagah dengan Smart e-Mirror pertama di kelasnya. Mewarisi kenyamanan Ertiga namun dengan tampilan dan ketangguhan layaknya sebuah SUV sejati.',
    img: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80',
    features: ['Kaca Spion Pintar (Dashcam)', 'Sistem Penjelajah Otomatis', 'Stabilitas Elektronik & Penahan Tanjakan', 'Tempat Minum Berpendingin'],
    specs: { engine: '1.5L K15B', power: '104 PS', torque: '138 Nm', length: '4.450 mm', width: '1.775 mm', height: '1.710 mm' }
  },
  {
    name: 'Toyota Innova Reborn 2.4 G',
    brand: 'Toyota',
    type: 'MPV',
    year: 2022,
    capacity: 8,
    transmission: 'Otomatis',
    fuel: 'Diesel',
    price: 600000,
    desc: 'Legenda kenyamanan kelas menengah. Mesin diesel turbonya terkenal sangat bertenaga, irit, dan sanggup diajak jalan lintas provinsi dengan muatan penuh tanpa kendala.',
    img: 'https://images.unsplash.com/photo-1571987502654-002297197bea?w=800&q=80',
    features: ['Layar Sentuh 8 Inci', 'Kursi Kain Premium', 'Kontrol Stabilitas & Bantuan Tanjakan', 'Pilihan Mode Berkendara (Eco/Power)', '3 Kantung Udara'],
    specs: { engine: '2.4L 2GD-FTV Turbo Diesel', power: '149 PS', torque: '360 Nm', length: '4.735 mm', width: '1.830 mm', height: '1.795 mm' }
  },
  {
    name: 'Toyota Innova Zenix 2.0 V',
    brand: 'Toyota',
    type: 'MPV',
    year: 2023,
    capacity: 8,
    transmission: 'Otomatis (CVT)',
    fuel: 'Bensin',
    price: 700000,
    desc: 'Generasi evolusi dari Innova dengan sasis monokok (TNGA). Menawarkan bantingan suspensi layaknya sedan premium, kabin lebih senyap, dan fitur hiburan super lengkap.',
    img: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80',
    features: ['Layar Hiburan Belakang 10 Inci Ganda', 'Atap Kaca Panoramik', 'Rem Parkir Elektrik', 'Fitur Keselamatan Canggih (TSS)'],
    specs: { engine: '2.0L M20A-FKS Dynamic Force', power: '174 PS', torque: '205 Nm', length: '4.755 mm', width: '1.850 mm', height: '1.795 mm' }
  },
  {
    name: 'Honda Brio Satya E',
    brand: 'Honda',
    type: 'City Car',
    year: 2023,
    capacity: 5,
    transmission: 'Otomatis (CVT)',
    fuel: 'Bensin',
    price: 300000,
    desc: 'Mobil perkotaan terlaris dengan performa CVT yang halus dan efisiensi BBM luar biasa. Ukurannya ringkas, sangat cocok untuk manuver dan parkir di area sempit.',
    img: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=80',
    features: ['Lampu Siang (DRL) LED', 'Tombol Audio di Setir', 'Rem ABS & EBD', 'Kantung Udara Depan Ganda'],
    specs: { engine: '1.2L i-VTEC 4-Silinder', power: '90 PS', torque: '110 Nm', length: '3.795 mm', width: '1.680 mm', height: '1.485 mm' }
  },
  {
    name: 'Toyota Agya 1.2 G',
    brand: 'Toyota',
    type: 'City Car',
    year: 2023,
    capacity: 5,
    transmission: 'Otomatis (CVT)',
    fuel: 'Bensin',
    price: 300000,
    desc: 'Generasi terbaru Agya dengan desain yang jauh lebih modern dan sporty. Mesin baru memberikan tarikan yang lebih responsif untuk penggunaan harian.',
    img: 'https://images.unsplash.com/photo-1612825173281-9a193378527e?w=800&q=80',
    features: ['Sistem Akses Pintar', 'Tombol Start Mesin', 'Layar Sentuh 8 Inci', 'Kontrol Stabilitas Kendaraan', 'Bantuan Tanjakan'],
    specs: { engine: '1.2L WA-VE 3-Silinder', power: '88 PS', torque: '113 Nm', length: '3.760 mm', width: '1.665 mm', height: '1.505 mm' }
  },
  {
    name: 'Daihatsu Ayla 1.2 R',
    brand: 'Daihatsu',
    type: 'City Car',
    year: 2023,
    capacity: 5,
    transmission: 'Manual',
    fuel: 'Bensin',
    price: 300000,
    desc: 'Pilihan hemat dan lincah untuk menemani aktivitas perkotaan. Biaya operasional rendah dengan ruang kabin yang dimaksimalkan untuk kenyamanan 5 penumpang.',
    img: 'https://images.unsplash.com/photo-1612825173281-9a193378527e?w=800&q=80',
    features: ['Lampu Depan LED', 'AC Digital', 'Akses Tanpa Kunci', 'Kantung Udara Ganda', 'Rem ABS & EBD'],
    specs: { engine: '1.2L WA-VE 3-Silinder', power: '88 PS', torque: '113 Nm', length: '3.760 mm', width: '1.665 mm', height: '1.510 mm' }
  }
];

async function run() {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    
    // Clear out old data properly
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    await conn.query('TRUNCATE TABLE peminjaman');
    await conn.query('TRUNCATE TABLE mobil');
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('Menyimpan 15 data mobil dengan fitur Bahasa Indonesia...');
    for (const car of CARS) {
      await conn.query(
        'INSERT INTO mobil (nama, merek, tipe, tahun, kapasitas, transmisi, bahan_bakar, harga_per_hari, biaya_sopir_per_hari, tersedia, deskripsi, gambar, rating, total_ulasan, fitur, spesifikasi) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          car.name, car.brand, car.type, car.year, car.capacity, car.transmission, car.fuel, 
          car.price, 150000, 1, car.desc, car.img, 4.8, 120, 
          JSON.stringify(car.features), JSON.stringify(car.specs)
        ]
      );
      console.log('✓ Inserted:', car.name);
    }
    
    console.log('Selesai update DB!');
    process.exit(0);
  } catch(err) {
    console.error('Error:', err);
    process.exit(1);
  }
}
run();
