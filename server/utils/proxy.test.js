const { getProxyConfig, buildProxyUrl, getProxyAgentUrl } = require('./proxy');

describe('proxy utils', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe('getProxyConfig', () => {
    it('parses PROXY_URL with auth', () => {
      process.env.PROXY_URL = 'http://user:pass@proxy.example.com:8080';
      const cfg = getProxyConfig();
      expect(cfg).toEqual({
        host: 'proxy.example.com',
        port: 8080,
        protocol: 'http',
        auth: { username: 'user', password: 'pass' },
      });
    });

    it('parses PROXY_URL without auth', () => {
      process.env.PROXY_URL = 'http://proxy.example.com:80';
      const cfg = getProxyConfig();
      expect(cfg).toEqual({
        host: 'proxy.example.com',
        port: 80,
        protocol: 'http',
        auth: undefined,
      });
    });

    it('uses PROXY_HOST, PROXY_PORT, PROXY_USER, PROXY_PASS', () => {
      delete process.env.PROXY_URL;
      process.env.PROXY_HOST = 'p.webshare.io';
      process.env.PROXY_PORT = '80';
      process.env.PROXY_USER = 'myuser';
      process.env.PROXY_PASS = 'mypass';
      const cfg = getProxyConfig();
      expect(cfg).toEqual({
        host: 'p.webshare.io',
        port: 80,
        protocol: 'http',
        auth: { username: 'myuser', password: 'mypass' },
      });
    });

    it('returns null when PROXY_HOST or PROXY_PORT missing', () => {
      delete process.env.PROXY_URL;
      process.env.PROXY_HOST = 'proxy.com';
      delete process.env.PROXY_PORT;
      expect(getProxyConfig()).toBeNull();
    });

    it('returns null when no proxy env set', () => {
      delete process.env.PROXY_URL;
      delete process.env.PROXY_HOST;
      delete process.env.PROXY_PORT;
      expect(getProxyConfig()).toBeNull();
    });

    it('returns null for invalid PROXY_URL', () => {
      process.env.PROXY_URL = 'not-a-valid-url!!!';
      expect(getProxyConfig()).toBeNull();
    });
  });

  describe('buildProxyUrl', () => {
    it('builds URL with auth', () => {
      const url = buildProxyUrl({
        host: 'proxy.com',
        port: 80,
        protocol: 'http',
        auth: { username: 'u', password: 'p' },
      });
      expect(url).toBe('http://u:p@proxy.com:80');
    });

    it('URL-encodes special chars in auth', () => {
      const url = buildProxyUrl({
        host: 'proxy.com',
        port: 80,
        protocol: 'http',
        auth: { username: 'u@x', password: 'p:y' },
      });
      expect(url).toContain('u%40x');
      expect(url).toContain('p%3Ay');
    });

    it('builds URL without auth', () => {
      const url = buildProxyUrl({
        host: 'proxy.com',
        port: 8080,
        protocol: 'http',
        auth: undefined,
      });
      expect(url).toBe('http://proxy.com:8080');
    });

    it('returns null for null config', () => {
      expect(buildProxyUrl(null)).toBeNull();
    });
  });

  describe('getProxyAgentUrl', () => {
    it('returns PROXY_URL when set (with protocol)', () => {
      process.env.PROXY_URL = 'http://user:pass@proxy.com:80';
      expect(getProxyAgentUrl()).toBe('http://user:pass@proxy.com:80');
    });

    it('prepends http:// when PROXY_URL has no protocol', () => {
      process.env.PROXY_URL = 'proxy.com:8080';
      expect(getProxyAgentUrl()).toBe('http://proxy.com:8080');
    });

    it('returns built URL from PROXY_HOST/PORT when PROXY_URL not set', () => {
      delete process.env.PROXY_URL;
      process.env.PROXY_HOST = 'proxy.com';
      process.env.PROXY_PORT = '80';
      process.env.PROXY_USER = 'u';
      process.env.PROXY_PASS = 'p';
      expect(getProxyAgentUrl()).toBe('http://u:p@proxy.com:80');
    });

    it('returns null when no proxy configured', () => {
      delete process.env.PROXY_URL;
      delete process.env.PROXY_HOST;
      delete process.env.PROXY_PORT;
      expect(getProxyAgentUrl()).toBeNull();
    });

    it('trims whitespace from PROXY_URL', () => {
      process.env.PROXY_URL = '  http://proxy.com:80  ';
      expect(getProxyAgentUrl()).toBe('http://proxy.com:80');
    });
  });
});
