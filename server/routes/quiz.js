const express = require('express');
const { pool } = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// POST /api/quiz/attempt
router.post('/attempt', async (req, res) => {
  try {
    const { session_id, question, options, user_answer, correct_answer, is_correct } = req.body;
    if (!session_id || !question || !options || user_answer == null || correct_answer == null || is_correct == null) {
      return res.status(400).json({ error: 'session_id, question, options, user_answer, correct_answer, is_correct required' });
    }

    // Verify session belongs to user
    const sessionCheck = await pool.query(
      'SELECT id FROM listening_sessions WHERE id = $1 AND user_id = $2',
      [session_id, req.userId]
    );
    if (sessionCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const result = await pool.query(
      `INSERT INTO quiz_attempts (session_id, question, options, user_answer, correct_answer, is_correct)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, session_id, question, user_answer, correct_answer, is_correct, created_at`,
      [session_id, question, JSON.stringify(options), user_answer, correct_answer, is_correct]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save quiz attempt' });
  }
});

// GET /api/quiz/attempts/:sessionId
router.get('/attempts/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const sessionCheck = await pool.query(
      'SELECT id FROM listening_sessions WHERE id = $1 AND user_id = $2',
      [sessionId, req.userId]
    );
    if (sessionCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const result = await pool.query(
      `SELECT id, session_id, question, options, user_answer, correct_answer, is_correct, timestamp, created_at
       FROM quiz_attempts
       WHERE session_id = $1
       ORDER BY created_at ASC`,
      [sessionId]
    );
    res.json({ attempts: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch quiz attempts' });
  }
});

module.exports = router;
