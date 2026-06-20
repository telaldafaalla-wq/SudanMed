// api/categories.js — Secured v2.0
import {
  checkRateLimit, setSecurityHeaders, safeError, getClientIP
} from './_middleware.js';

const SUPABASE_URL = process.env.SUPABASE_URL  || 'https://digfrefpowwigahzogko.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

async function supabase(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      'apikey':        SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
    },
  });
  if (!res.ok) throw new Error(`DB_ERROR_${res.status}`);
  return res.json();
}

export default async function handler(req, res) {
  setSecurityHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return safeError(res, 405, 'Method not allowed');

  // Rate limit: categories endpoint (higher since it's cached)
  const ip = getClientIP(req);
  const rl = checkRateLimit(ip, '/api/categories');
  res.setHeader('X-RateLimit-Limit',     rl.max);
  res.setHeader('X-RateLimit-Remaining', rl.remaining);
  res.setHeader('X-RateLimit-Reset',     Math.ceil(rl.resetAt / 1000));

  if (!rl.allowed) {
    res.setHeader('Retry-After', Math.ceil((rl.resetAt - Date.now()) / 1000));
    return safeError(res, 429, 'طلبات كثيرة — انتظر قليلاً');
  }

  // Cache categories — they rarely change
  res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');

  try {
    const cats = await supabase(
      'categories?select=id,name_ar,name_en,slug,icon,sort_order&is_active=eq.true&order=sort_order.asc'
    );
    return res.status(200).json({ success: true, data: cats });
  } catch (err) {
    return safeError(res, 500, 'حدث خطأ في جلب الفئات', err);
  }
}
