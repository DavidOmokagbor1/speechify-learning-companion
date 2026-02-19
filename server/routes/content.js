const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const { HttpsProxyAgent } = require('https-proxy-agent');
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

function getProxyConfig() {
  const proxyUrl = process.env.PROXY_URL;
  if (proxyUrl) {
    try {
      const u = new URL(proxyUrl);
      const auth = u.username && u.password
        ? { username: decodeURIComponent(u.username), password: decodeURIComponent(u.password) }
        : undefined;
      return {
        host: u.hostname,
        port: parseInt(u.port || (u.protocol === 'https:' ? '443' : '80'), 10),
        protocol: u.protocol.replace(':', '') || 'http',
        auth,
      };
    } catch {
      return null;
    }
  }
  const host = process.env.PROXY_HOST;
  const port = process.env.PROXY_PORT;
  if (!host || !port) return null;
  const user = process.env.PROXY_USER;
  const pass = process.env.PROXY_PASS;
  const auth = user && pass ? { username: user, password: pass } : undefined;
  return { host, port: parseInt(port, 10), protocol: 'http', auth };
}

function buildProxyUrl(config) {
  if (!config) return null;
  const auth = config.auth
    ? `${encodeURIComponent(config.auth.username)}:${encodeURIComponent(config.auth.password)}@`
    : '';
  return `${config.protocol}://${auth}${config.host}:${config.port}`;
}

function getProxyAgentUrl() {
  let proxyUrl = process.env.PROXY_URL?.trim();
  if (proxyUrl) {
    if (!/^https?:\/\//i.test(proxyUrl)) proxyUrl = 'http://' + proxyUrl;
    return proxyUrl;
  }
  const cfg = getProxyConfig();
  return cfg ? buildProxyUrl(cfg) : null;
}

/** Make HTTP request via proxy if configured; return fetch-like Response for youtube-transcript-plus */
async function proxyFetch(url, { method = 'GET', headers = {}, body } = {}) {
  const proxyUrl = getProxyAgentUrl();
  const options = {
    method,
    url,
    headers: { ...BROWSER_HEADERS, ...headers },
    timeout: 30000,
    maxRedirects: 5,
    validateStatus: () => true,
    proxy: false,
    decompress: true,
  };
  if (body && method === 'POST') options.data = body;
  if (proxyUrl && url.startsWith('https')) {
    options.httpsAgent = new HttpsProxyAgent(proxyUrl);
  }

  const res = await axios(options);
  const data = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
  return {
    ok: res.status >= 200 && res.status < 300,
    status: res.status,
    text: async () => data,
    json: async () => JSON.parse(data),
  };
}

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

function getYouTubeVideoId(url) {
  const m = url.match(YOUTUBE_REGEX);
  return m ? m[1] : null;
}

/** Fallback: TubeText API when direct fetch fails (YouTube blocks cloud IPs) */
async function fetchTranscriptViaTubeText(videoId) {
  try {
    const res = await axios.get(
      `https://tubetext.vercel.app/youtube/transcript?video_id=${encodeURIComponent(videoId)}`,
      { timeout: 20000, validateStatus: () => true }
    );
    const data = res.data?.data || res.data;
    if (res.data?.error) return null;
    const fullText = data?.full_text;
    if (fullText && typeof fullText === 'string' && fullText.trim().length >= 20) {
      return [{ text: fullText.trim(), duration: 0, offset: 0 }];
    }
    const transcript = Array.isArray(data?.transcript) ? data.transcript : [];
    if (transcript.length === 0) return null;
    const text = transcript.map((s) => (typeof s === 'string' ? s : s?.text || '')).join(' ').trim();
    if (text.length < 20) return null;
    return [{ text, duration: 0, offset: 0 }];
  } catch {
    return null;
  }
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
    if (/youtube\.com|youtu\.be/i.test(url)) {
      if (!isYouTubeUrl(url)) {
        return res.status(400).json({
          error: 'Invalid YouTube URL. Paste the full link (e.g. https://youtu.be/VIDEO_ID or https://youtube.com/watch?v=VIDEO_ID)',
        });
      }
      const videoId = getYouTubeVideoId(url);
      if (!videoId) {
        return res.status(400).json({
          error: 'Invalid YouTube URL. Paste the full link (e.g. https://youtu.be/VIDEO_ID or https://youtube.com/watch?v=VIDEO_ID)',
        });
      }

      let segments = null;
      const useProxy = !!getProxyAgentUrl();

      const createFetch = (opts) =>
        useProxy
          ? proxyFetch(opts.url, {
              method: opts.method || 'GET',
              headers: {
                ...(opts.headers || {}),
                ...(opts.lang && { 'Accept-Language': opts.lang }),
                ...(opts.method === 'POST' && { 'Content-Type': 'application/json' }),
              },
              body: opts.body,
            })
          : fetch(opts.url, {
              method: opts.method || 'GET',
              headers: {
                ...BROWSER_HEADERS,
                ...(opts.headers || {}),
                ...(opts.lang && { 'Accept-Language': opts.lang }),
                ...(opts.method === 'POST' && { 'Content-Type': 'application/json' }),
              },
              body: opts.body,
            });

      // Try 1: Direct fetch (local) or proxy fetch (production when PROXY_* set)
      try {
        const { fetchTranscript } = await import('youtube-transcript-plus');
        segments = await fetchTranscript(url, {
          userAgent: BROWSER_HEADERS['User-Agent'],
          videoFetch: async ({ url: fetchUrl, lang }) =>
            createFetch({ url: fetchUrl, lang }),
          playerFetch: async ({ url: fetchUrl, method, body, headers, lang }) =>
            createFetch({ url: fetchUrl, method: method || 'POST', body, headers, lang }),
          transcriptFetch: async ({ url: fetchUrl, lang }) =>
            createFetch({ url: fetchUrl, lang }),
        });
      } catch (ytErr) {
        console.error(
          '[YouTube]',
          useProxy ? 'Proxy fetch failed' : 'Direct fetch failed',
          '-',
          ytErr.message,
          useProxy ? '(proxy configured)' : '',
          '- trying TubeText fallback'
        );
      }

      // Try 2: TubeText API (fallback for production when YouTube blocks cloud IPs)
      if (!segments?.length && videoId) {
        try {
          segments = await fetchTranscriptViaTubeText(videoId);
        } catch (fbErr) {
          console.error('TubeText fallback failed:', fbErr.message);
        }
      }

      if (!segments?.length) {
        return res.status(400).json({
          error: 'Could not get transcript from this YouTube video. Make sure the video has captions enabled.',
        });
      }

      let text = segments.map((s) => (s.text || '')).join(' ').replace(/\s+/g, ' ').trim();
      if (!text || text.length < 20) {
        return res.status(400).json({
          error: 'This video has no captions. Only videos with subtitles/captions can be imported.',
        });
      }
      text = await addPunctuation(text);
      return res.json({ text, title: 'YouTube video' });
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
