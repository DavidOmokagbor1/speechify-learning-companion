const request = require('supertest');
const app = require('../app');

const uniqueEmail = () => `test-${Date.now()}-${Math.random().toString(36).slice(2)}@integration.test`;

async function getAuthToken() {
  const email = uniqueEmail();
  const res = await request(app).post('/api/auth/register').send({ email, password: 'password123' });
  return res.body.token;
}

describe('Analytics API (integration)', () => {
  describe('GET /api/analytics/dashboard', () => {
    it('returns dashboard stats for authenticated user', async () => {
      const token = await getAuthToken();
      const res = await request(app)
        .get('/api/analytics/dashboard')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('total_quizzes_completed');
      expect(res.body).toHaveProperty('average_comprehension_score');
      expect(res.body).toHaveProperty('daily_streak');
      expect(res.body).toHaveProperty('sessions_with_quizzes');
      expect(typeof res.body.total_quizzes_completed).toBe('number');
      expect(typeof res.body.daily_streak).toBe('number');
    });

    it('returns 401 when not authenticated', async () => {
      const res = await request(app).get('/api/analytics/dashboard');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/analytics/score-trends', () => {
    it('returns score trends for authenticated user', async () => {
      const token = await getAuthToken();
      const res = await request(app)
        .get('/api/analytics/score-trends')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('score_trends');
      expect(Array.isArray(res.body.score_trends)).toBe(true);
    });
  });

  describe('GET /api/analytics/quiz-history', () => {
    it('returns quiz history for authenticated user', async () => {
      const token = await getAuthToken();
      const res = await request(app)
        .get('/api/analytics/quiz-history')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('attempts');
      expect(Array.isArray(res.body.attempts)).toBe(true);
    });
  });
});
