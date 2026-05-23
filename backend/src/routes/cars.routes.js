// ============================================================
// CARS ROUTES — /api/cars (MySQL version)
// ============================================================

const router = require('express').Router();
const pool   = require('../db/database');
const { authenticate, adminOnly } = require('../middleware/auth');

// Helper: parse JSON fields yang disimpan di MySQL
const parseCar = (car) => {
  if (!car) return null;
  return {
    ...car,
    available:         Boolean(car.available),
    features:          typeof car.features === 'string' ? JSON.parse(car.features) : (car.features || []),
    specs:             typeof car.specs    === 'string' ? JSON.parse(car.specs)    : (car.specs    || {}),
    pricePerDay:       Number(car.price_per_day),
    driverCostPerDay:  Number(car.driver_cost_per_day),
    totalReviews:      car.total_reviews,
    plateNumber:       car.plate_number,
    createdAt:         car.created_at,
  };
};

// ── GET /api/cars ─────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { type, brand, transmission, available, maxPrice, sort, search } = req.query;

    let sql    = 'SELECT * FROM cars WHERE 1=1';
    const params = [];

    if (type)         { sql += ' AND type = ?';         params.push(type); }
    if (brand)        { sql += ' AND brand = ?';        params.push(brand); }
    if (transmission) { sql += ' AND transmission = ?'; params.push(transmission); }
    if (available !== undefined && available !== '') {
      sql += ' AND available = ?';
      params.push(available === 'true' ? 1 : 0);
    }
    if (maxPrice) { sql += ' AND price_per_day <= ?'; params.push(Number(maxPrice)); }
    if (search)   { sql += ' AND (name LIKE ? OR brand LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

    const sortMap = {
      price_asc:  'price_per_day ASC',
      price_desc: 'price_per_day DESC',
      rating:     'rating DESC',
      default:    'id ASC',
    };
    sql += ` ORDER BY ${sortMap[sort] || 'id ASC'}`;

    const [rows] = await pool.query(sql, params);
    res.json({ success: true, data: rows.map(parseCar), total: rows.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/cars/meta/options ────────────────────────────
router.get('/meta/options', async (req, res) => {
  try {
    const [[types], [brands]] = await Promise.all([
      pool.query('SELECT DISTINCT type  FROM cars ORDER BY type'),
      pool.query('SELECT DISTINCT brand FROM cars ORDER BY brand'),
    ]);
    res.json({ success: true, types: types.map(r => r.type), brands: brands.map(r => r.brand) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/cars/:id ─────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const [[car]] = await pool.query('SELECT * FROM cars WHERE id = ?', [req.params.id]);
    if (!car) return res.status(404).json({ success: false, message: 'Kendaraan tidak ditemukan.' });
    res.json({ success: true, data: parseCar(car) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/cars ────────────────────────────────────────
router.post('/', authenticate, adminOnly, async (req, res) => {
  try {
    const { name, brand, type, year, capacity, transmission, fuel, pricePerDay,
            driverCostPerDay, available, description, color, plateNumber, image,
            features = [], specs = {} } = req.body;

    if (!name || !brand || !pricePerDay)
      return res.status(400).json({ success: false, message: 'Nama, merek, dan harga wajib diisi.' });

    const [result] = await pool.query(
      `INSERT INTO cars (name, brand, type, year, capacity, transmission, fuel,
        price_per_day, driver_cost_per_day, available, description, color,
        plate_number, image, features, specs)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, brand, type || 'MPV', year || 2023, capacity || 5,
       transmission || 'Manual', fuel || 'Bensin', pricePerDay,
       driverCostPerDay || 150000, available ? 1 : 0,
       description || '', color || '', plateNumber || '', image || '',
       JSON.stringify(features), JSON.stringify(specs)]
    );

    const [[newCar]] = await pool.query('SELECT * FROM cars WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: parseCar(newCar), message: 'Kendaraan berhasil ditambahkan.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PUT /api/cars/:id ─────────────────────────────────────
router.put('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const [[car]] = await pool.query('SELECT id FROM cars WHERE id = ?', [req.params.id]);
    if (!car) return res.status(404).json({ success: false, message: 'Kendaraan tidak ditemukan.' });

    const { name, brand, type, year, capacity, transmission, fuel, pricePerDay,
            driverCostPerDay, available, description, color, plateNumber, image,
            features, specs } = req.body;

    await pool.query(
      `UPDATE cars SET name=?, brand=?, type=?, year=?, capacity=?, transmission=?,
        fuel=?, price_per_day=?, driver_cost_per_day=?, available=?,
        description=?, color=?, plate_number=?, image=?, features=?, specs=?
       WHERE id=?`,
      [name, brand, type, year, capacity, transmission, fuel,
       pricePerDay, driverCostPerDay, available ? 1 : 0,
       description, color, plateNumber, image,
       JSON.stringify(features || []), JSON.stringify(specs || {}),
       req.params.id]
    );

    const [[updated]] = await pool.query('SELECT * FROM cars WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: parseCar(updated), message: 'Data kendaraan berhasil diperbarui.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── DELETE /api/cars/:id ──────────────────────────────────
router.delete('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const [[car]] = await pool.query('SELECT id FROM cars WHERE id = ?', [req.params.id]);
    if (!car) return res.status(404).json({ success: false, message: 'Kendaraan tidak ditemukan.' });

    await pool.query('DELETE FROM cars WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Kendaraan berhasil dihapus.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PATCH /api/cars/:id/toggle ────────────────────────────
router.patch('/:id/toggle', authenticate, adminOnly, async (req, res) => {
  try {
    const [[car]] = await pool.query('SELECT id, available FROM cars WHERE id = ?', [req.params.id]);
    if (!car) return res.status(404).json({ success: false, message: 'Kendaraan tidak ditemukan.' });

    const newStatus = car.available ? 0 : 1;
    await pool.query('UPDATE cars SET available = ? WHERE id = ?', [newStatus, req.params.id]);
    res.json({
      success: true,
      available: Boolean(newStatus),
      message: `Kendaraan berhasil ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}.`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
