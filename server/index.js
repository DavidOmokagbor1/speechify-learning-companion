require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Speechify Learning Companion API',
    docs: 'http://localhost:3001/api/health',
    endpoints: ['/api/auth', '/api/sessions', '/api/quiz', '/api/analytics'],
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Speechify Learning Companion API' });
});

const authRoutes = require('./routes/auth');
const sessionRoutes = require('./routes/sessions');
const quizRoutes = require('./routes/quiz');
const analyticsRoutes = require('./routes/analytics');

app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/analytics', analyticsRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
