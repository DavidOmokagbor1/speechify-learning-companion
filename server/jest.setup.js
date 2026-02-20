afterAll(async () => {
  try {
    const { pool } = require('./db');
    if (pool && typeof pool.end === 'function') {
      await pool.end();
    }
  } catch {
    // ignore
  }
});
