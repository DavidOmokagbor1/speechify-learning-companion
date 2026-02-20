const { isYouTubeUrl, getYouTubeVideoId, normalizeUrl } = require('./youtubeUrl');

describe('youtubeUrl utils', () => {
  describe('isYouTubeUrl', () => {
    it('returns true for youtube.com watch URLs', () => {
      expect(isYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true);
      expect(isYouTubeUrl('https://youtube.com/watch?v=abc12345678')).toBe(true);
    });
    it('returns true for youtu.be short URLs', () => {
      expect(isYouTubeUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(true);
      expect(isYouTubeUrl('http://youtu.be/1WQXUliy3rw')).toBe(true);
    });
    it('returns true for embed URLs', () => {
      expect(isYouTubeUrl('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe(true);
    });
    it('returns false for non-YouTube URLs', () => {
      expect(isYouTubeUrl('https://example.com')).toBe(false);
      expect(isYouTubeUrl('https://vimeo.com/123')).toBe(false);
    });
    it('returns false for invalid input', () => {
      expect(isYouTubeUrl('')).toBe(false);
      expect(isYouTubeUrl(null)).toBe(false);
      expect(isYouTubeUrl(undefined)).toBe(false);
      expect(isYouTubeUrl(123)).toBe(false);
    });
  });

  describe('getYouTubeVideoId', () => {
    it('extracts video ID from watch URL', () => {
      expect(getYouTubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    });
    it('extracts video ID from youtu.be URL', () => {
      expect(getYouTubeVideoId('https://youtu.be/1WQXUliy3rw')).toBe('1WQXUliy3rw');
    });
    it('returns null for non-YouTube URL', () => {
      expect(getYouTubeVideoId('https://example.com')).toBe(null);
    });
    it('returns null for invalid input', () => {
      expect(getYouTubeVideoId('')).toBe(null);
      expect(getYouTubeVideoId(null)).toBe(null);
    });
  });

  describe('normalizeUrl', () => {
    it('returns URL as-is when valid', () => {
      expect(normalizeUrl('https://example.com')).toBe('https://example.com');
    });
    it('adds https:// when missing protocol', () => {
      expect(normalizeUrl('example.com')).toBe('https://example.com');
    });
    it('trims whitespace', () => {
      expect(normalizeUrl('  https://example.com  ')).toBe('https://example.com');
    });
    it('returns null for empty input', () => {
      expect(normalizeUrl('')).toBe(null);
      expect(normalizeUrl('   ')).toBe(null);
      expect(normalizeUrl(null)).toBe(null);
      expect(normalizeUrl(undefined)).toBe(null);
    });
    it('returns null for invalid URL', () => {
      expect(normalizeUrl('not a url!!!')).toBe(null);
    });
  });
});
