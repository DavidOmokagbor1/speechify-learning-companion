const request = require('supertest');
const app = require('../app');

const uniqueEmail = () => `test-${Date.now()}-${Math.random().toString(36).slice(2)}@integration.test`;

async function getAuthToken() {
  const email = uniqueEmail();
  const res = await request(app).post('/api/auth/register').send({ email, password: 'password123' });
  return res.body.token;
}

describe('Sessions API (integration)', () => {
  describe('POST /api/sessions', () => {
    it('creates session when authenticated', async () => {
      const token = await getAuthToken();
      const res = await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          content_text: 'Sample text for listening.',
          content_title: 'Test Session',
          total_duration_seconds: 60,
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.content_title).toBe('Test Session');
      expect(res.body.total_duration_seconds).toBe(60);
    });

    it('rejects without content_text', async () => {
      const token = await getAuthToken();
      const res = await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${token}`)
        .send({ content_title: 'No text' });

      expect(res.status).toBe(400);
    });

    it('returns 401 when not authenticated', async () => {
      const res = await request(app)
        .post('/api/sessions')
        .send({ content_text: 'Some text' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/sessions', () => {
    it('returns sessions for authenticated user', async () => {
      const token = await getAuthToken();
      await request(app)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${token}`)
        .send({ content_text: 'First session', content_title: 'First' });

      const res = await request(app)
        .get('/api/sessions')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('sessions');
      expect(res.body).toHaveProperty('total');
      expect(Array.isArray(res.body.sessions)).toBe(true);
      expect(res.body.sessions.length).toBeGreaterThanOrEqual(1);
    });
  });
});
