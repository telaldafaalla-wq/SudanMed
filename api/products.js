// api/products.js — Secured v2.0
// ✅ Rate Limiting | ✅ Input Sanitization | ✅ Security Headers
// ✅ Safe Error Messages | ✅ SQL Injection Prevention

import {
  checkRateLimit, setSecurityHeaders, safeError,
  sanitizeString, sanitizeInt, sanitizeUUID, getClientIP
} from './_middleware.js';

const SUPABASE_URL = process.env.SUPABASE_URL  || 'https://digfrefpowwigahzogko.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_KEY) {
  console.error('⚠️  SUPABASE_ANON_KEY not set in environment');
}

async function supabase(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      'apikey':        SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type':  'application/json',
      'Prefer':        'return=representation',
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    // لا تكشف تفاصيل Supabase للعميل
    throw new Error(`DB_ERROR_${res.status}`);
  }
  return res.json();
}

// Allowed sort fields — whitelist to prevent injection
const ALLOWED_SORT_FIELDS = new Set(['created_at','price','name_ar','name_en','stock']);
const ALLOWED_SORT_ORDERS = new Set(['asc','desc']);

export default async function handler(req, res) {
  // 1. Security headers
  setSecurityHeaders(res);

  // 2. CORS preflight
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return safeError(res, 405, 'Method not allowed');

  // 3. Rate limiting
  const ip = getClientIP(req);
  const rl = checkRateLimit(ip, '/api/products');
  res.setHeader('X-RateLimit-Limit',     rl.max);
  res.setHeader('X-RateLimit-Remaining', rl.remaining);
  res.setHeader('X-RateLimit-Reset',     Math.ceil(rl.resetAt / 1000));

  if (!rl.allowed) {
    res.setHeader('Retry-After', Math.ceil((rl.resetAt - Date.now()) / 1000));
    return safeError(res, 429, 'طلبات كثيرة — انتظر قليلاً');
  }

  // 4. Input sanitization & validation
  const raw = req.query;

  const search   = sanitizeString(raw.search,   100);
  const category = sanitizeUUID(raw.category);
  const featured = raw.featured === 'true' ? true : null;
  const page     = sanitizeInt(raw.page,  1, 500);
  const limit    = sanitizeInt(raw.limit, 1, 50);   // max 50 per page
  const offset   = (page - 1) * limit;

  // Whitelist sort fields
  const sortBy    = ALLOWED_SORT_FIELDS.has(raw.sortBy)    ? raw.sortBy    : 'created_at';
  const sortOrder = ALLOWED_SORT_ORDERS.has(raw.sortOrder) ? raw.sortOrder : 'desc';

  try {
    // Build safe query — all params are sanitized
    let query = `products?select=*,category:categories(id,name_ar,name_en,slug,icon)&status=eq.ACTIVE`;

    if (search) {
      // Use % only in parameterized-safe ilike
      const safeSearch = search.replace(/[%_]/g, '\\$&');
      query += `&or=(name_ar.ilike.*${safeSearch}*,name_en.ilike.*${safeSearch}*,sku.ilike.*${safeSearch}*)`;
    }
    if (category) query += `&category_id=eq.${category}`;
    if (featured)  query += `&featured=eq.true`;

    query += `&order=${sortBy}.${sortOrder}&limit=${limit}&offset=${offset}`;

    const products = await supabase(query);

    return res.status(200).json({
      success: true,
      data:    products,
      pagination: { page, limit, offset },
    });
  } catch (err) {
    return safeError(res, 500, 'حدث خطأ في جلب المنتجات', err);
  }
}
