// ============================================================
// USERS ROUTES — /api/users (MySQL version)
// ============================================================

const router = require('express').Router();
const pool   = require('../db/database');
const { authenticate, adminOnly } = require('../middleware/auth');

const mapUser = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    name: row.nama,
    email: row.email,
    password: row.kata_sandi,
    phone: row.telepon,
    address: row.alamat,
    sim: row.sim,
    ktp: row.ktp,
    avatar: row.avatar,
    role: row.peran,
    status: row.status === 'aktif' ? 'active' : 'blocked',
    createdAt: row.dibuat_pada,
  };
};

const formatUser = ({ password, ...safe }) => safe;

// ── GET /api/users ────────────────────────────────────────
router.get('/', authenticate, adminOnly, async (req, res) => {
  try {
    const { search } = req.query;
    let sql    = "SELECT * FROM pengguna WHERE peran = 'user'";
    const params = [];

    if (search) {
      sql += ' AND (nama LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    sql += ' ORDER BY dibuat_pada DESC';

    const [rows] = await pool.query(sql, params);
    const mapped = rows.map(mapUser).map(formatUser);
    res.json({ success: true, data: mapped, total: rows.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/users/:id ────────────────────────────────────
router.get('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const [[row]] = await pool.query('SELECT * FROM pengguna WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
    res.json({ success: true, data: formatUser(mapUser(row)) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PATCH /api/users/:id/toggle ──────────────────────────
router.patch('/:id/toggle', authenticate, adminOnly, async (req, res) => {
  try {
    const [[row]] = await pool.query('SELECT id, status, peran FROM pengguna WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
    if (row.peran === 'admin')
      return res.status(400).json({ success: false, message: 'Akun admin tidak bisa diblokir.' });

    const newStatus = row.status === 'aktif' ? 'diblokir' : 'aktif';
    await pool.query('UPDATE pengguna SET status = ? WHERE id = ?', [newStatus, req.params.id]);

    const [[updatedRow]] = await pool.query('SELECT * FROM pengguna WHERE id = ?', [req.params.id]);
    const updated = mapUser(updatedRow);
    res.json({
      success: true,
      data: formatUser(updated),
      message: `Pengguna berhasil ${newStatus === 'aktif' ? 'diaktifkan' : 'diblokir'}.`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
