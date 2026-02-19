const express = require('express');
const { pool } = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { calculateStreakFromDates } = require('../utils/streak');

const router = express.Router();
router.use(authMiddleware);

async function getDailyStreak(userId) {
  const result = await pool.query(
    `SELECT DISTINCT DATE(qa.created_at) as quiz_date
     FROM quiz_attempts qa
     JOIN listening_sessions ls ON qa.session_id = ls.id
     WHERE ls.user_id = $1
     ORDER BY quiz_date DESC`,
    [userId]
  );
  const dateStrings = result.rows.map((r) => {
    const d = r.quiz_date;
    return typeof d === 'string' ? d.slice(0, 10) : new Date(d).toISOString().slice(0, 10);
  });
  const todayStr = new Date().toISOString().slice(0, 10);
  return calculateStreakFromDates(dateStrings, todayStr);
}

// GET /api/analytics/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.userId;

    const totalResult = await pool.query(
      `SELECT COUNT(*) as total
       FROM quiz_attempts qa
       JOIN listening_sessions ls ON qa.session_id = ls.id
       WHERE ls.user_id = $1`,
      [userId]
    );
    const total_quizzes_completed = parseInt(totalResult.rows[0].total);

    const avgResult = await pool.query(
      `SELECT ROUND(AVG(CASE WHEN qa.is_correct THEN 100.0 ELSE 0.0 END)::numeric, 2) as avg_score
       FROM quiz_attempts qa
       JOIN listening_sessions ls ON qa.session_id = ls.id
       WHERE ls.user_id = $1`,
      [userId]
    );
    const average_comprehension_score = parseFloat(avgResult.rows[0].avg_score) || 0;

    const daily_streak = await getDailyStreak(userId);

    const sessionsResult = await pool.query(
      `SELECT COUNT(DISTINCT qa.session_id) as count
       FROM quiz_attempts qa
       JOIN listening_sessions ls ON qa.session_id = ls.id
       WHERE ls.user_id = $1`,
      [userId]
    );
    const sessions_with_quizzes = parseInt(sessionsResult.rows[0].count);

    res.json({
      total_quizzes_completed,
      average_comprehension_score,
      daily_streak,
      sessions_with_quizzes,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch dashboard analytics' });
  }
});

// GET /api/analytics/score-trends
router.get('/score-trends', async (req, res) => {
  try {
    const userId = req.userId;

    const result = await pool.query(
      `SELECT
         ls.id as session_id,
         ls.content_title,
         ls.created_at,
         COUNT(qa.id) as attempts,
         ROUND(AVG(CASE WHEN qa.is_correct THEN 100.0 ELSE 0.0 END)::numeric, 2) as score
       FROM listening_sessions ls
       JOIN quiz_attempts qa ON qa.session_id = ls.id
       WHERE ls.user_id = $1
       GROUP BY ls.id, ls.content_title, ls.created_at
       ORDER BY ls.created_at DESC
       LIMIT 7`,
      [userId]
    );

    const score_trends = result.rows.map((row) => ({
      session_id: row.session_id,
      content_title: row.content_title,
      date: row.created_at?.toISOString?.().slice(0, 10) || null,
      score: parseFloat(row.score) || 0,
      attempts: parseInt(row.attempts) || 0,
    }));

    res.json({ score_trends });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch score trends' });
  }
});

// GET /api/analytics/quiz-history — all quiz attempts for CSV export
router.get('/quiz-history', async (req, res) => {
  try {
    const userId = req.userId;

    const result = await pool.query(
      `SELECT qa.id, qa.session_id, ls.content_title, qa.question, qa.options, qa.user_answer, qa.correct_answer, qa.is_correct, qa.created_at
       FROM quiz_attempts qa
       JOIN listening_sessions ls ON qa.session_id = ls.id
       WHERE ls.user_id = $1
       ORDER BY qa.created_at ASC`,
      [userId]
    );

    res.json({ attempts: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch quiz history' });
  }
});

module.exports = router;
