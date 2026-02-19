const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const OpenAI = require('openai');
const { authMiddleware } = require('../middleware/auth');

// Use youtube-transcript-plus in production. YouTube blocks cloud IPs;
// we pass full browser-like headers via custom fetches to bypass detection.
const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://www.youtube.com/',
};

const router = express.Router();

async function addPunctuation(text) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || !text || text.length < 20) return text;

  try {
    const openai = new OpenAI({ apiKey });
    const chunkSize = 12000;
    const chunks = [];
    let i = 0;
    while (i < text.length) {
      let end = Math.min(i + chunkSize, text.length);
      if (end < text.length) {
        const lastSpace = text.lastIndexOf(' ', end);
        if (lastSpace > i) end = lastSpace + 1;
      }
      chunks.push(text.slice(i, end).trim());
      i = end;
    }

    const systemPrompt = `You are a transcript editor. Add proper punctuation to make this text easy to understand when read aloud or listened to.

Rules:
- Add periods (.) to mark clear sentence endings. This helps listeners know when one thought ends and another begins.
- Add commas (,) for natural pauses and to separate clauses.
- Add question marks (?) for questions, exclamation marks (!) for emphasis.
- Use colons (:) before lists or explanations.
- Preserve the exact wording — do not change, add, or remove any words.
- Return ONLY the punctuated text, nothing else. No explanations or summaries.`;

    const results = await Promise.all(
      chunks.map(async (chunk) => {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: chunk },
          ],
          temperature: 0.2,
        });
        return completion.choices[0]?.message?.content?.trim() || chunk;
      })
    );
    return results.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
  } catch (err) {
    console.error('Punctuation restoration error:', err.message);
    return text;
  }
}

const YOUTUBE_REGEX = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i;

function isYouTubeUrl(url) {
  return YOUTUBE_REGEX.test(url);
}

const ARTICLE_SELECTORS = [
  'article',
  'main',
  '[role="main"]',
  '.article-body',
  '.post-content',
  '.entry-content',
  '.content',
  '.article-content',
  '.post-body',
  '.story-body',
  '.page-content',
];

function extractText(html) {
  const $ = cheerio.load(html);
  $('script, style, nav, header, footer, aside, .ad, .ads, .sidebar').remove();

  for (const sel of ARTICLE_SELECTORS) {
    const el = $(sel).first();
    if (el.length) {
      const text = el.text().trim();
      if (text.length > 200) return text;
    }
  }

  const body = $('body').text().trim();
  return body.length > 100 ? body : '';
}

function normalizeUrl(input) {
  let url = (input || '').trim();
  if (!url) return null;
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  try {
    new URL(url);
    return url;
  } catch {
    return null;
  }
}

// POST /api/content/from-url (protected)
router.post('/from-url', authMiddleware, async (req, res) => {
  try {
    const url = normalizeUrl(req.body?.url);
    if (!url) {
      return res.status(400).json({ error: 'Valid URL required' });
    }

    // YouTube: fetch transcript instead of HTML
    if (isYouTubeUrl(url)) {
      try {
        const { fetchTranscript } = await import('youtube-transcript-plus');
        const segments = await fetchTranscript(url, {
          userAgent: BROWSER_HEADERS['User-Agent'],
          videoFetch: async ({ url: fetchUrl, lang }) => {
            return fetch(fetchUrl, {
              headers: { ...BROWSER_HEADERS, ...(lang && { 'Accept-Language': lang }) },
            });
          },
          playerFetch: async ({ url: fetchUrl, method, body, headers, lang }) => {
            return fetch(fetchUrl, {
              method: method || 'POST',
              headers: {
                ...BROWSER_HEADERS,
                ...(headers || {}),
                ...(lang && { 'Accept-Language': lang }),
                'Content-Type': 'application/json',
              },
              body,
            });
          },
          transcriptFetch: async ({ url: fetchUrl, lang }) => {
            return fetch(fetchUrl, {
              headers: { ...BROWSER_HEADERS, ...(lang && { 'Accept-Language': lang }) },
            });
          },
        });
        if (!segments?.length) {
          return res.status(400).json({
            error: 'This video has no captions. Only videos with subtitles/captions can be imported.',
          });
        }
        let text = segments.map((s) => s.text).join(' ').replace(/\s+/g, ' ').trim();
        if (!text || text.length < 20) {
          return res.status(400).json({
            error: 'Could not extract enough text from this video\'s captions.',
          });
        }
        text = await addPunctuation(text);
        return res.json({ text, title: 'YouTube video' });
      } catch (ytErr) {
        console.error('YouTube transcript error:', ytErr.message);
        const msg = ytErr.message?.includes('Transcript is disabled') ||
          ytErr.message?.includes('disabled') ||
          ytErr.message?.includes('TranscriptsDisabled')
          ? 'This video has captions disabled.'
          : ytErr.message?.includes('not available')
            ? 'No transcript available for this video.'
            : ytErr.message?.includes('too many requests')
              ? 'Too many requests. Please try again later.'
              : 'Could not get transcript from this YouTube video.';
        return res.status(400).json({ error: msg });
      }
    }

    const response = await axios.get(url, {
      timeout: 15000,
      maxRedirects: 5,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SpeechifyLearning/1.0)',
        Accept: 'text/html,application/xhtml+xml',
      },
      validateStatus: (status) => status >= 200 && status < 400,
    });

    const html = response.data;
    if (typeof html !== 'string') {
      return res.status(400).json({ error: 'URL did not return HTML' });
    }

    const text = extractText(html).replace(/\s+/g, ' ').trim();
    if (!text || text.length < 50) {
      return res.status(400).json({
        error: 'Could not extract enough text from this page. Try a different URL.',
      });
    }

    const title = cheerio.load(html)('title').first().text().trim() || 'Imported article';

    res.json({ text, title });
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;
      const msg = status === 403 ? 'Access denied by website' : status === 404 ? 'Page not found' : 'Could not fetch URL';
      return res.status(400).json({ error: msg });
    }
    console.error('Content from-url error:', err.message);
    res.status(500).json({ error: 'Failed to fetch content from URL' });
  }
});

module.exports = router;
