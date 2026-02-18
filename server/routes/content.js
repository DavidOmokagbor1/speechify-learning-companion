const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const OpenAI = require('openai');
const { YoutubeTranscript } = require('@danielxceron/youtube-transcript');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

async function addPunctuation(text) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || !text || text.length < 50) return text;

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

    const results = await Promise.all(
      chunks.map(async (chunk) => {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Add proper punctuation (commas, periods, question marks, exclamation marks, colons, semicolons) to this transcript. Preserve the exact wording. Return ONLY the punctuated text, nothing else. Do not add explanations or summaries.',
            },
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
        const segments = await YoutubeTranscript.fetchTranscript(url);
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
        const msg = ytErr.message?.includes('Transcript is disabled')
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
