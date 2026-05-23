// ============================================================
// AUTH ROUTES — /api/auth (MySQL version)
// ============================================================

const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const pool   = require('../db/database');
const { authenticate } = require('../middleware/auth');

const createToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

const formatUser = ({ password, ...safe }) => safe;

// ── POST /api/auth/login ──────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email dan password wajib diisi.' });

    const [[user]] = await pool.query('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (!user)
      return res.status(401).json({ success: false, message: 'Email atau password salah.' });
    if (user.status === 'blocked')
      return res.status(403).json({ success: false, message: 'Akun Anda telah diblokir. Hubungi admin.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: 'Email atau password salah.' });

    const token = createToken(user);
    res.json({ success: true, token, user: formatUser(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.', detail: err.message });
  }
});

// ── POST /api/auth/register ───────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone = '' } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Nama, email, dan password wajib diisi.' });
    if (password.length < 6)
      return res.status(400).json({ success: false, message: 'Password minimal 6 karakter.' });

    const [[exists]] = await pool.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (exists)
      return res.status(409).json({ success: false, message: 'Email sudah terdaftar.' });

    const hashed   = await bcrypt.hash(password, 10);
    const nameParts = name.trim().split(' ');
    const avatar   = (nameParts[0]?.[0] || '').toUpperCase() + (nameParts[1]?.[0] || '').toUpperCase();

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, phone, avatar, role, status) VALUES (?, ?, ?, ?, ?, "user", "active")',
      [name.trim(), email.toLowerCase().trim(), hashed, phone, avatar]
    );

    const [[newUser]] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
    const token = createToken(newUser);
    res.status(201).json({ success: true, token, user: formatUser(newUser) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.', detail: err.message });
  }
});

// ── GET /api/auth/me ──────────────────────────────────────
router.get('/me', authenticate, async (req, res) => {
  try {
    const [[user]] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (!user) return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    res.json({ success: true, user: formatUser(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PUT /api/auth/profile ─────────────────────────────────
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    if (!name?.trim())
      return res.status(400).json({ success: false, message: 'Nama tidak boleh kosong.' });

    await pool.query('UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?',
      [name.trim(), phone || '', address || '', req.user.id]);

    const [[updated]] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    res.json({ success: true, user: formatUser(updated), message: 'Profil berhasil diperbarui.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PUT /api/auth/password ────────────────────────────────
router.put('/password', authenticate, async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6)
      return res.status(400).json({ success: false, message: 'Password baru minimal 6 karakter.' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);
    res.json({ success: true, message: 'Password berhasil diubah.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
