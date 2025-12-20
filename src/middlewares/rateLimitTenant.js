const redis = require('../config/redis');

// Simple fixed-window rate limiter per tenant+IP. Intended for authenticated, tenant-scoped routes.
// Defaults: 300 req / 15 min unless overridden via env.
const WINDOW_SECONDS = parseInt(process.env.RATE_LIMIT_WINDOW_SECONDS || '900', 10);
const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX || '300', 10);

const getTenantSlug = (req) => {
  const fromTenant = req.tenant?.slug;
  const fromHeader = req.header('x-tenant') || req.header('x-tenant-slug');
  if (fromTenant) return String(fromTenant).toLowerCase();
  if (fromHeader) return String(fromHeader).toLowerCase();
  const host = req.get('host');
  if (host) {
    const hostname = host.split(':')[0];
    const parts = hostname.split('.');
    if (parts.length >= 3 && parts[0].toLowerCase() !== 'www') {
      return parts[0].toLowerCase();
    }
  }
  return 'public';
};

const rateLimitTenant = async (req, res, next) => {
  try {
    const tenantSlug = getTenantSlug(req);
    const key = `rl:${tenantSlug}:${req.ip}`;

    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, WINDOW_SECONDS);
    }

    const ttl = await redis.ttl(key);
    const remaining = Math.max(MAX_REQUESTS - count, 0);

    res.setHeader('X-RateLimit-Limit', MAX_REQUESTS);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', Math.max(ttl, 0));

    if (count > MAX_REQUESTS) {
      res.setHeader('Retry-After', Math.max(ttl, 0));
      return res.status(429).json({ message: 'Límite de peticiones alcanzado para este tenant. Intenta nuevamente más tarde.' });
    }

    next();
  } catch (err) {
    // Fail-open on Redis errors to avoid blocking traffic
    req.log?.warn({ err }, 'Rate limit skipped due to error');
    next();
  }
};

module.exports = rateLimitTenant;
