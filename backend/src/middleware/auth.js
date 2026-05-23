// ============================================================
// AUTH MIDDLEWARE — Verifikasi JWT token dari header Authorization
// ============================================================

const jwt = require('jsonwebtoken');

/**
 * Middleware: authenticate
 * Memverifikasi token JWT dari header "Authorization: Bearer <token>"
 * Jika valid, menyimpan payload ke req.user dan memanggil next()
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak. Token autentikasi tidak ditemukan.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role, name }
    next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError'
      ? 'Token kadaluarsa. Silakan login kembali.'
      : 'Token tidak valid.';
    return res.status(401).json({ success: false, message });
  }
};

/**
 * Middleware: adminOnly
 * Harus digunakan SETELAH authenticate
 * Memastikan user yang login adalah admin
 */
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak. Halaman ini hanya untuk Administrator.',
    });
  }
  next();
};

module.exports = { authenticate, adminOnly };
