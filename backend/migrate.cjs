const pool = require('./src/db/database');

async function migrate() {
  try {
    await pool.query('ALTER TABLE mobil ADD COLUMN sedang_perbaikan TINYINT(1) DEFAULT 0');
    console.log('Migration successful: added sedang_perbaikan column.');
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('Column sedang_perbaikan already exists.');
    } else {
      console.error('Migration failed:', err);
    }
  } finally {
    process.exit(0);
  }
}

migrate();
