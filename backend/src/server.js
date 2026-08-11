// ============================================================
// SERVER.JS — Entry point backend RentalMobil
// Express.js REST API dengan SQLite database
// Port: 5001 (diatur via .env)
// ============================================================

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const express  = require('express');
const cors     = require('cors');
const helmet   = require('helmet');
const morgan   = require('morgan');

// Route files
const authRoutes     = require('./routes/auth.routes');
const carsRoutes     = require('./routes/cars.routes');
const bookingsRoutes = require('./routes/bookings.routes');
const usersRoutes    = require('./routes/users.routes');
const paymentsRoutes = require('./routes/payments.routes');
const chatRoutes     = require('./routes/chat.routes');
const reportRoutes   = require('./routes/reports.routes');
const uploadRoutes   = require('./routes/upload.routes');



// Cron Jobs
require('./cron');

const app  = express();
const PORT = process.env.PORT || 5001;

// ============================================================
// MIDDLEWARE GLOBAL
// ============================================================

// Security headers
app.use(helmet({ crossOriginResourcePolicy: false }));

// CORS - izinkan semua origin untuk kemudahan deployment
app.use(cors());

// Handle preflight requests
app.options('*', cors());

// Parse JSON request body
app.use(express.json({ limit: '10mb' }));

// HTTP request logger (dev mode)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ============================================================
// ROUTES
// ============================================================
app.use('/api/auth',     authRoutes);
app.use('/api/cars',     carsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/users',    usersRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/chat',     chatRoutes);
app.use('/api/reports',  reportRoutes);
app.use('/api/upload',   uploadRoutes);

// ──────────────────────────────────────────────────────────
// Health Check — GET /api/health
// ──────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status:    'ok',
    service:   'RentalMobil API',
    version:   '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ──────────────────────────────────────────────────────────
// Serve Static Files (Uploads & React Frontend)
// ──────────────────────────────────────────────────────────
const path = require('path');
const DIST_PATH = path.join(__dirname, '../../dist');
const UPLOADS_PATH = path.join(__dirname, '../uploads');

app.use('/uploads', express.static(UPLOADS_PATH));
app.use(express.static(DIST_PATH));

app.get('*', (req, res) => {
  const indexFile = path.join(DIST_PATH, 'index.html');
  res.sendFile(indexFile, (err) => {
    if (err) {
      res.status(200).json({ message: 'RentalMobil API berjalan.' });
    }
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} tidak ditemukan.`,
  });
});

// ──────────────────────────────────────────────────────────
// Global Error Handler
// ──────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Terjadi kesalahan pada server.',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// ============================================================
// START SERVER
// ============================================================
if (require.main === module) {
  app.listen(PORT, () => {
    // console.log ...
  });
}

module.exports = app;
