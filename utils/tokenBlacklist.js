export const _blacklistedTokens = new Map(); // token -> exp (epoch seconds)

export function isTokenBlacklisted(token) {
  const exp = _blacklistedTokens.get(token);
  if (!exp) return false;
  const now = Math.floor(Date.now() / 1000);
  if (exp <= now) {
    _blacklistedTokens.delete(token);
    return false;
  }
  return true;
}

export function blacklistToken(token, exp) {
  // exp is JWT exp in epoch seconds; fallback to +7d
  const fallbackExp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
  _blacklistedTokens.set(token, exp || fallbackExp);
}

// Optional periodic cleanup
setInterval(() => {
  const now = Math.floor(Date.now() / 1000);
  for (const [token, exp] of _blacklistedTokens.entries()) {
    if (exp <= now) _blacklistedTokens.delete(token);
  }
}, 60 * 1000).unref();
