const express = require('express');
const OpenAI = require('openai');
const { pool } = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// POST /api/quiz/generate (auth required)
router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const { content, difficulty } = req.body;
    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'content (text chunk) required' });
    }

    const diff = ['easy', 'medium', 'hard'].includes(difficulty) ? difficulty : 'medium';
    const diffGuidance = {
      easy: 'Use simple vocabulary and test basic recall of explicit facts.',
      medium: 'Test understanding of main ideas and moderate inference.',
      hard: 'Require deeper analysis, inference, and synthesis of concepts.',
    }[diff];

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: 'OpenAI API not configured' });
    }

    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a comprehension quiz generator. Given a text chunk, create ONE multiple-choice question that tests understanding of the content. Return ONLY valid JSON in this exact format, no other text:
{"question":"Your question here?","options":{"A":"First option","B":"Second option","C":"Third option","D":"Fourth option"},"correct_answer":"A","explanation":"Brief 1-2 sentence explanation of why the correct answer is right."}

The correct_answer must be one of A, B, C, or D. Make questions clear and based on key facts or concepts from the text. The explanation should briefly clarify why the correct answer is correct (and optionally why wrong choices are wrong). Difficulty: ${diffGuidance}`,
        },
        {
          role: 'user',
          content: content.slice(0, 4000),
        },
      ],
      temperature: 0.7,
    });

    const text = completion.choices[0]?.message?.content?.trim();
    if (!text) {
      return res.status(500).json({ error: 'Failed to generate quiz' });
    }

    const parsed = JSON.parse(text);
    if (!parsed.question || !parsed.options || !parsed.correct_answer) {
      return res.status(500).json({ error: 'Invalid quiz format from AI' });
    }

    // Shuffle options so correct answer isn't always A
    const letters = ['A', 'B', 'C', 'D'];
    const values = letters.map((k) => parsed.options[k]).filter(Boolean);
    for (let i = values.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [values[i], values[j]] = [values[j], values[i]];
    }
    const shuffledOptions = Object.fromEntries(letters.slice(0, values.length).map((k, i) => [k, values[i]]));
    const correctValue = parsed.options[parsed.correct_answer];
    const newCorrectKey = letters[values.indexOf(correctValue)];

    res.json({
      question: parsed.question,
      options: shuffledOptions,
      correct_answer: newCorrectKey,
      explanation: parsed.explanation || null,
    });
  } catch (err) {
    if (err.code === 'invalid_api_key') {
      return res.status(503).json({ error: 'Invalid OpenAI API key' });
    }
    console.error('Quiz generate error:', err.message);
    res.status(500).json({ error: 'Failed to generate quiz', detail: process.env.NODE_ENV !== 'production' ? err.message : undefined });
  }
});

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
