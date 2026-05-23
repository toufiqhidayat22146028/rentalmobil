// ============================================================
// USERS ROUTES — /api/users (MySQL version)
// ============================================================

const router = require('express').Router();
const pool   = require('../db/database');
const { authenticate, adminOnly } = require('../middleware/auth');

const formatUser = ({ password, ...safe }) => safe;

// ── GET /api/users ────────────────────────────────────────
router.get('/', authenticate, adminOnly, async (req, res) => {
  try {
    const { search } = req.query;
    let sql    = "SELECT * FROM users WHERE role = 'user'";
    const params = [];

    if (search) {
      sql += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    sql += ' ORDER BY created_at DESC';

    const [rows] = await pool.query(sql, params);
    res.json({ success: true, data: rows.map(formatUser), total: rows.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/users/:id ────────────────────────────────────
router.get('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const [[user]] = await pool.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (!user) return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
    res.json({ success: true, data: formatUser(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PATCH /api/users/:id/toggle ──────────────────────────
router.patch('/:id/toggle', authenticate, adminOnly, async (req, res) => {
  try {
    const [[user]] = await pool.query('SELECT id, status, role FROM users WHERE id = ?', [req.params.id]);
    if (!user) return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
    if (user.role === 'admin')
      return res.status(400).json({ success: false, message: 'Akun admin tidak bisa diblokir.' });

    const newStatus = user.status === 'active' ? 'blocked' : 'active';
    await pool.query('UPDATE users SET status = ? WHERE id = ?', [newStatus, req.params.id]);

    const [[updated]] = await pool.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    res.json({
      success: true,
      data: formatUser(updated),
      message: `Pengguna berhasil ${newStatus === 'active' ? 'diaktifkan' : 'diblokir'}.`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
