const express = require('express');
const { pool } = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// POST /api/sessions
router.post('/', async (req, res) => {
  try {
    const { content_text, content_title, total_duration_seconds } = req.body;
    if (!content_text) {
      return res.status(400).json({ error: 'content_text required' });
    }

    const result = await pool.query(
      `INSERT INTO listening_sessions (user_id, content_text, content_title, total_duration_seconds)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id, content_title, total_duration_seconds, created_at`,
      [req.userId, content_text, content_title || null, total_duration_seconds || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// GET /api/sessions (paginated)
router.get('/', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = parseInt(req.query.offset) || 0;

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM listening_sessions WHERE user_id = $1',
      [req.userId]
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT id, content_title, total_duration_seconds, created_at
       FROM listening_sessions
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.userId, limit, offset]
    );

    res.json({ sessions: result.rows, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// GET /api/sessions/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, user_id, content_text, content_title, total_duration_seconds, created_at
       FROM listening_sessions
       WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.userId]
    );
    const session = result.rows[0];
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

module.exports = router;
