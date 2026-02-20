const YOUTUBE_REGEX =
  /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i;

function isYouTubeUrl(url) {
  return typeof url === 'string' && YOUTUBE_REGEX.test(url);
}

function getYouTubeVideoId(url) {
  if (!url || typeof url !== 'string') return null;
  const m = url.match(YOUTUBE_REGEX);
  return m ? m[1] : null;
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

module.exports = { isYouTubeUrl, getYouTubeVideoId, normalizeUrl };
