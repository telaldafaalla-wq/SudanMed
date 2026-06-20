// api/_middleware.js — Security Middleware
// Rate Limiting + Security Headers + Input Sanitization
// SudanMed © 2026 — OWASP Top 10 Compliant

// ════════════════════════════════════════════════════════════════
// IN-MEMORY RATE LIMITER (Vercel Edge-compatible)
// ════════════════════════════════════════════════════════════════
const ipStore = new Map(); // { ip+endpoint → { count, resetAt } }

const RATE_LIMITS = {
  '/api/products':   { windowMs: 60_000, max: 60  },
  '/api/categories': { windowMs: 60_000, max: 60  },
  '/api/orders':     { windowMs: 60_000, max: 20  },
  '/api/payments':   { windowMs: 60_000, max: 10  },
  default:           { windowMs: 60_000, max: 100 },
};

// Cleanup old entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, val] of ipStore.entries()) {
      if (val.resetAt < now) ipStore.delete(key);
    }
  }, 300_000);
}

/**
 * checkRateLimit — returns { allowed, remaining, resetAt }
 */
export function checkRateLimit(ip, endpoint) {
  const config = RATE_LIMITS[endpoint] || RATE_LIMITS.default;
  const key    = `${ip}:${endpoint}`;
  const now    = Date.now();

  let entry = ipStore.get(key);
  if (!entry || entry.resetAt < now) {
    entry = { count: 0, resetAt: now + config.windowMs };
    ipStore.set(key, entry);
  }

  entry.count += 1;
  const remaining = Math.max(0, config.max - entry.count);
  const allowed   = entry.count <= config.max;

  return { allowed, remaining, resetAt: entry.resetAt, max: config.max };
}

// ════════════════════════════════════════════════════════════════
// SECURITY HEADERS
// ════════════════════════════════════════════════════════════════
export function setSecurityHeaders(res, { allowOrigins = null } = {}) {
  const origin = allowOrigins || process.env.ALLOWED_ORIGINS || 'https://sudan-med.vercel.app';

  // CORS — لا تفتح على * في الإنتاج
  res.setHeader('Access-Control-Allow-Origin',  origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID');
  res.setHeader('Access-Control-Max-Age',       '86400');

  // Security headers
  res.setHeader('X-Content-Type-Options',    'nosniff');
  res.setHeader('X-Frame-Options',           'DENY');
  res.setHeader('X-XSS-Protection',          '1; mode=block');
  res.setHeader('Referrer-Policy',           'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy',        'camera=(), microphone=(), geolocation=()');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src https://fonts.gstatic.com; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https://digfrefpowwigahzogko.supabase.co;"
  );

  // Cache control — لا تخزن البيانات الحساسة
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma',        'no-cache');

  // Request ID للتتبع
  const reqId = Math.random().toString(36).slice(2, 10).toUpperCase();
  res.setHeader('X-Request-ID', reqId);
  return reqId;
}

// ════════════════════════════════════════════════════════════════
// INPUT SANITIZATION — منع SQL Injection & XSS
// ════════════════════════════════════════════════════════════════
const DANGEROUS_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|FROM|WHERE)\b)/gi,
  /[<>'"`;\\]/g,
  /(\%27|'|--|(%23)|#)/gi,
  /(\%3B|;)/gi,
];

export function sanitizeString(input, maxLen = 200) {
  if (typeof input !== 'string') return '';
  let s = input.trim().slice(0, maxLen);
  for (const pat of DANGEROUS_PATTERNS) {
    if (pat.test(s)) {
      s = s.replace(pat, '');
      pat.lastIndex = 0; // Reset regex state
    }
  }
  return s;
}

export function sanitizeInt(input, min = 1, max = 1000) {
  const n = parseInt(input, 10);
  if (isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}

export function sanitizeUUID(input) {
  if (typeof input !== 'string') return null;
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return UUID_REGEX.test(input.trim()) ? input.trim() : null;
}

// ════════════════════════════════════════════════════════════════
// SAFE ERROR RESPONSE — لا تكشف تفاصيل الخادم
// ════════════════════════════════════════════════════════════════
export function safeError(res, statusCode, publicMessage, internalError = null) {
  if (internalError && process.env.NODE_ENV !== 'production') {
    console.error('[SudanMed Error]', internalError);
  }
  return res.status(statusCode).json({
    success: false,
    error:   publicMessage,
    code:    statusCode,
  });
}

// ════════════════════════════════════════════════════════════════
// IP EXTRACTION
// ════════════════════════════════════════════════════════════════
export function getClientIP(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

// ════════════════════════════════════════════════════════════════
// SIMPLE ADMIN AUTH CHECK
// ════════════════════════════════════════════════════════════════
export function verifyAdminKey(req) {
  const key = req.headers['x-admin-key'] || req.query.admin_key;
  const validKey = process.env.ADMIN_API_KEY;
  if (!validKey) return false; // لا تسمح بدون مفتاح
  return key === validKey;
}
