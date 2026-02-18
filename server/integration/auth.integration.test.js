const request = require('supertest');
const app = require('../app');

const uniqueEmail = () => `test-${Date.now()}-${Math.random().toString(36).slice(2)}@integration.test`;

describe('Auth API (integration)', () => {
  describe('POST /api/auth/register', () => {
    it('registers user and returns token', async () => {
      const email = uniqueEmail();
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email, password: 'password123' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user.email).toBe(email.toLowerCase());
      expect(res.body).toHaveProperty('token');
      expect(typeof res.body.token).toBe('string');
    });

    it('rejects missing email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ password: 'password123' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('required');
    });

    it('rejects short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: uniqueEmail(), password: '12345' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('6');
    });

    it('rejects duplicate email', async () => {
      const email = uniqueEmail();
      await request(app).post('/api/auth/register').send({ email, password: 'password123' });
      const res = await request(app).post('/api/auth/register').send({ email, password: 'password123' });

      expect(res.status).toBe(409);
      expect(res.body.error).toContain('already');
    });
  });

  describe('POST /api/auth/login', () => {
    it('logs in with valid credentials', async () => {
      const email = uniqueEmail();
      await request(app).post('/api/auth/register').send({ email, password: 'password123' });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email, password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe(email.toLowerCase());
    });

    it('rejects invalid password', async () => {
      const email = uniqueEmail();
      await request(app).post('/api/auth/register').send({ email, password: 'password123' });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email, password: 'wrongpassword' });

      expect(res.status).toBe(401);
    });

    it('rejects unknown email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@test.com', password: 'password123' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns user when authenticated', async () => {
      const email = uniqueEmail();
      const reg = await request(app).post('/api/auth/register').send({ email, password: 'password123' });
      const token = reg.body.token;

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe(email.toLowerCase());
    });

    it('returns 401 when no token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('returns 401 when invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');
      expect(res.status).toBe(401);
    });
  });
});
