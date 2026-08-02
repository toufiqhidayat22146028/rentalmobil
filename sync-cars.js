const pool = require('./backend/src/db/database');

async function sync() {
  try {
    const [result] = await pool.query(
      `UPDATE mobil m 
       JOIN peminjaman p ON m.id = p.mobil_id 
       SET m.tersedia = 0 
       WHERE p.status IN ('pending', 'approved', 'active')`
    );
    console.log('Sync successful:', result.affectedRows, 'cars updated to unavailable.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

sync();
