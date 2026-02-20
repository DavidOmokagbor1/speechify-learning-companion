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

module.exports = { getProxyConfig, buildProxyUrl, getProxyAgentUrl };
