const request = require('supertest');

const mockQuizResponse = {
  question: 'What is the main topic of this text?',
  options: { A: 'Option A', B: 'Option B', C: 'Option C', D: 'Option D' },
  correct_answer: 'A',
  explanation: 'The text discusses option A.',
};

jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content: JSON.stringify(mockQuizResponse) } }],
        }),
      },
    },
  }));
});

const app = require('../app');

const uniqueEmail = () => `quiz-${Date.now()}-${Math.random().toString(36).slice(2)}@integration.test`;

async function getAuthToken() {
  const email = uniqueEmail();
  const res = await request(app).post('/api/auth/register').send({ email, password: 'password123' });
  if (res.status !== 201) throw new Error('Failed to register');
  return res.body.token;
}

async function createSession(token) {
  const res = await request(app)
    .post('/api/sessions')
    .set('Authorization', `Bearer ${token}`)
    .send({
      content_text: 'Sample text for quiz testing.',
      content_title: 'Quiz Test Session',
      total_duration_seconds: 120,
    });
  if (res.status !== 201) throw new Error('Failed to create session');
  return res.body.id;
}

describe('Quiz API (integration)', () => {
  const originalOpenAIKey = process.env.OPENAI_API_KEY;

  afterEach(() => {
    process.env.OPENAI_API_KEY = originalOpenAIKey;
    jest.restoreAllMocks();
  });

  describe('POST /api/quiz/generate', () => {
    it('returns 401 when not authenticated', async () => {
      const res = await request(app)
        .post('/api/quiz/generate')
        .send({ content: 'Some text content' });

      expect(res.status).toBe(401);
    });

    it('returns 400 when content is missing', async () => {
      const token = await getAuthToken();
      const res = await request(app)
        .post('/api/quiz/generate')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/content|required/i);
    });

    it('returns 503 when OPENAI_API_KEY is not set', async () => {
      delete process.env.OPENAI_API_KEY;
      const token = await getAuthToken();
      const res = await request(app)
        .post('/api/quiz/generate')
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'Some text to quiz on' });

      expect(res.status).toBe(503);
      expect(res.body.error).toMatch(/openai|configured/i);
    });

    it('returns quiz when OpenAI is configured (mocked)', async () => {
      process.env.OPENAI_API_KEY = 'sk-test-key';
      const token = await getAuthToken();
      const res = await request(app)
        .post('/api/quiz/generate')
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'Sample text for quiz testing.' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('question');
      expect(res.body).toHaveProperty('options');
      expect(res.body).toHaveProperty('correct_answer');
      expect(['A', 'B', 'C', 'D']).toContain(res.body.correct_answer);
      expect(res.body.question).toBe(mockQuizResponse.question);
    });
  });

  describe('POST /api/quiz/attempt', () => {
    it('returns 401 when not authenticated', async () => {
      const res = await request(app)
        .post('/api/quiz/attempt')
        .send({
          session_id: 'fake-id',
          question: 'Q?',
          options: { A: 'a', B: 'b' },
          user_answer: 'A',
          correct_answer: 'A',
          is_correct: true,
        });

      expect(res.status).toBe(401);
    });

    it('returns 400 when required fields are missing', async () => {
      const token = await getAuthToken();
      const res = await request(app)
        .post('/api/quiz/attempt')
        .set('Authorization', `Bearer ${token}`)
        .send({ session_id: 'fake-id' });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/required/i);
    });

    it('saves attempt and returns 201 when session exists', async () => {
      const token = await getAuthToken();
      const sessionId = await createSession(token);

      const res = await request(app)
        .post('/api/quiz/attempt')
        .set('Authorization', `Bearer ${token}`)
        .send({
          session_id: sessionId,
          question: 'What is the main topic?',
          options: { A: 'A', B: 'B', C: 'C', D: 'D' },
          user_answer: 'A',
          correct_answer: 'A',
          is_correct: true,
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.session_id).toBe(sessionId);
      expect(res.body.user_answer).toBe('A');
      expect(res.body.correct_answer).toBe('A');
      expect(res.body.is_correct).toBe(true);
    });

    it('returns 404 when session does not belong to user', async () => {
      const token1 = await getAuthToken();
      const token2 = await getAuthToken();
      const sessionId = await createSession(token1);

      const res = await request(app)
        .post('/api/quiz/attempt')
        .set('Authorization', `Bearer ${token2}`)
        .send({
          session_id: sessionId,
          question: 'Q?',
          options: { A: 'a', B: 'b' },
          user_answer: 'A',
          correct_answer: 'A',
          is_correct: true,
        });

      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/session|not found/i);
    });
  });

  describe('GET /api/quiz/attempts/:sessionId', () => {
    it('returns 401 when not authenticated', async () => {
      const res = await request(app).get('/api/quiz/attempts/some-id');
      expect(res.status).toBe(401);
    });

    it('returns attempts for session belonging to user', async () => {
      const token = await getAuthToken();
      const sessionId = await createSession(token);

      await request(app)
        .post('/api/quiz/attempt')
        .set('Authorization', `Bearer ${token}`)
        .send({
          session_id: sessionId,
          question: 'Q?',
          options: { A: 'a', B: 'b' },
          user_answer: 'A',
          correct_answer: 'A',
          is_correct: true,
        });

      const res = await request(app)
        .get(`/api/quiz/attempts/${sessionId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('attempts');
      expect(Array.isArray(res.body.attempts)).toBe(true);
      expect(res.body.attempts.length).toBeGreaterThanOrEqual(1);
    });

    it('returns 404 when session does not belong to user', async () => {
      const token1 = await getAuthToken();
      const token2 = await getAuthToken();
      const sessionId = await createSession(token1);

      const res = await request(app)
        .get(`/api/quiz/attempts/${sessionId}`)
        .set('Authorization', `Bearer ${token2}`);

      expect(res.status).toBe(404);
    });
  });
});
