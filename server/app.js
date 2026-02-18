require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Speechify Learning Companion API',
    docs: 'http://localhost:3001/api/health',
    endpoints: ['/api/auth', '/api/sessions', '/api/quiz', '/api/analytics', '/api/content'],
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Speechify Learning Companion API' });
});

app.get('/api/health/db', async (req, res) => {
  try {
    const { pool } = require('./db');
    await pool.query('SELECT 1');
    const tables = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('users', 'listening_sessions', 'quiz_attempts') ORDER BY table_name"
    );
    res.json({
      status: 'ok',
      database: 'connected',
      tables: tables.rows.map((r) => r.table_name),
    });
  } catch (err) {
    res.status(503).json({
      status: 'error',
      database: 'disconnected',
      error: err.message,
    });
  }
});

const authRoutes = require('./routes/auth');
const sessionRoutes = require('./routes/sessions');
const quizRoutes = require('./routes/quiz');
const analyticsRoutes = require('./routes/analytics');
const contentRoutes = require('./routes/content');

app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/content', contentRoutes);

module.exports = app;
