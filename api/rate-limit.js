// api/rate-limit.js
// SudanMed — Rate Limiting Engine v2.0
// Primary:  Vercel KV (Redis-based, cross-instance)
// Fallback: In-memory Map (single instance)
// Algorithm: Sliding Window Counter

const memStore = new Map();

// Cleanup every 2 min — prevent memory leaks
let _cleanupStarted = false;
function ensureCleanup() {
  if (_cleanupStarted || typeof setInterval === 'undefined') return;
  _cleanupStarted = true;
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of memStore.entries())
      if (v.resetAt < now) memStore.delete(k);
  }, 120_000);
}

const CONFIGS = {
  '/api/products':   { windowMs: 60_000, max: 60  },
  '/api/categories': { windowMs: 60_000, max: 60  },
  '/api/orders':     { windowMs: 60_000, max: 20  },
  '/api/payments':   { windowMs: 60_000, max: 10  },
  '/api/auth':       { windowMs: 60_000, max: 5   },
  'global':          { windowMs: 60_000, max: 200 },
};

function slidingWindowMem(key, config) {
  ensureCleanup();
  const now   = Date.now();
  let entry   = memStore.get(key);
  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt: now + config.windowMs };
    memStore.set(key, entry);
  }
  entry.count += 1;
  return {
    allowed:   entry.count <= config.max,
    remaining: Math.max(0, config.max - entry.count),
    resetAt:   entry.resetAt,
    count:     entry.count,
    max:       config.max,
  };
}

async function slidingWindowKV(key, config) {
  try {
    const { kv } = await import('@vercel/kv');
    const window  = Math.floor(config.windowMs / 1000);
    const kvKey   = `rl:${key}`;
    const [count] = await kv.pipeline().incr(kvKey).expire(kvKey, window).exec();
    return {
      allowed:   count <= config.max,
      remaining: Math.max(0, config.max - count),
      resetAt:   Date.now() + config.windowMs,
      count,
      max: config.max,
    };
  } catch {
    return slidingWindowMem(key, config);
  }
}

export function getClientIP(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (fwd) {
    const first = fwd.split(',')[0].trim();
    if (/^[\d.]{7,15}$|^[0-9a-f:]+$/i.test(first)) return first;
  }
  return req.headers['x-real-ip']
    || req.connection?.remoteAddress
    || req.socket?.remoteAddress
    || 'unknown';
}

export async function checkRateLimit(ip, endpoint) {
  const config    = CONFIGS[endpoint] || CONFIGS['global'];
  const globalCfg = CONFIGS['global'];
  const normalIP  = ip === '::1' ? '127.0.0.1' : ip;
  const useKV     = !!process.env.KV_URL;
  const fn        = useKV ? slidingWindowKV : slidingWindowMem;

  const [ep, global] = await Promise.all([
    fn(`${normalIP}:${endpoint}`, config),
    fn(`${normalIP}:global`,      globalCfg),
  ]);

  const allowed = ep.allowed && global.allowed;
  return {
    allowed,
    remaining: Math.min(ep.remaining, global.remaining),
    resetAt:   Math.max(ep.resetAt,   global.resetAt),
    count:     ep.count,
    max:       config.max,
    reason:    !ep.allowed ? 'endpoint_limit' : !global.allowed ? 'global_limit' : null,
  };
}

export async function applyRateLimit(req, res, endpoint) {
  const ip = getClientIP(req);
  const rl = await checkRateLimit(ip, endpoint);

  res.setHeader('X-RateLimit-Limit',     rl.max);
  res.setHeader('X-RateLimit-Remaining', rl.remaining);
  res.setHeader('X-RateLimit-Reset',     Math.ceil(rl.resetAt / 1000));
  res.setHeader('X-RateLimit-Policy',    `${rl.max};w=60`);

  if (!rl.allowed) {
    const retryAfter = Math.ceil((rl.resetAt - Date.now()) / 1000);
    res.setHeader('Retry-After', retryAfter);
    res.status(429).json({
      success:    false,
      error:      'طلبات كثيرة جداً — انتظر قليلاً',
      retryAfter,
      reason:     rl.reason,
    });
    return false;
  }
  return true;
}
