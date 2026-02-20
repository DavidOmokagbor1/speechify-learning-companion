const request = require('supertest');

const mockTranscriptText = 'Hello world this is a sample transcript with enough words for testing.';

jest.mock('axios', () => {
  const actual = jest.requireActual('axios');
  return {
    ...actual,
    get: jest.fn((url) => {
      if (url && url.includes('tubetext.vercel.app')) {
        return Promise.resolve({
          data: {
            data: { full_text: mockTranscriptText },
            transcript: [{ text: mockTranscriptText }],
          },
        });
      }
      return actual.get(url);
    }),
  };
});

const app = require('../app');

const uniqueEmail = () => `content-${Date.now()}-${Math.random().toString(36).slice(2)}@integration.test`;

async function getAuthToken() {
  const email = uniqueEmail();
  const res = await request(app).post('/api/auth/register').send({ email, password: 'password123' });
  if (res.status !== 201) throw new Error('Failed to register');
  return res.body.token;
}

describe('Content API (integration)', () => {
  describe('POST /api/content/from-url', () => {
    it('returns 401 when no auth token', async () => {
      const res = await request(app)
        .post('/api/content/from-url')
        .send({ url: 'https://example.com' });

      expect(res.status).toBe(401);
    });

    it('returns 400 when URL is missing', async () => {
      const token = await getAuthToken();
      const res = await request(app)
        .post('/api/content/from-url')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/valid url|required/i);
    });

    it('returns 400 when URL is invalid', async () => {
      const token = await getAuthToken();
      const res = await request(app)
        .post('/api/content/from-url')
        .set('Authorization', `Bearer ${token}`)
        .send({ url: 'not-a-valid-url' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('returns 400 for invalid YouTube URL format', async () => {
      const token = await getAuthToken();
      const res = await request(app)
        .post('/api/content/from-url')
        .set('Authorization', `Bearer ${token}`)
        .send({ url: 'https://youtube.com/watch' }); // no video id

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/invalid|youtube|url/i);
    });

    it('returns text and title for valid YouTube URL via TubeText fallback (mocked)', async () => {
      const token = await getAuthToken();
      const res = await request(app)
        .post('/api/content/from-url')
        .set('Authorization', `Bearer ${token}`)
        .send({ url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('text');
      expect(res.body).toHaveProperty('title');
      expect(res.body.title).toBe('YouTube video');
      expect(typeof res.body.text).toBe('string');
      expect(res.body.text.length).toBeGreaterThanOrEqual(20);
    }, 15000);
  });
});
