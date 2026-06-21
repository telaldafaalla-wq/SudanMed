// api/auth.js — Authentication v2.0
// Supabase Auth | Rate Limiting | Input Validation | Safe Errors

import { setSecurityHeaders, safeError, sanitizeString, getClientIP } from './_middleware.js';
import { applyRateLimit } from './rate-limit.js';

const SB_URL = process.env.SUPABASE_URL || 'https://digfrefpowwigahzogko.supabase.co';
const SB_KEY = process.env.SUPABASE_ANON_KEY;

async function sbAuth(endpoint, body) {
  const res = await fetch(`${SB_URL}/auth/v1/${endpoint}`, {
    method: 'POST',
    headers: { 'apikey': SB_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || data.message || 'AUTH_ERROR');
  return data;
}

async function sb(path, opts = {}) {
  const res = await fetch(`${SB_URL}/rest/v1/${path}`, {
    ...opts,
    headers: {
      'apikey': SB_KEY, 'Authorization': `Bearer ${SB_KEY}`,
      'Content-Type': 'application/json', 'Prefer': 'return=representation',
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`DB_ERROR_${res.status}`);
  const txt = await res.text();
  return txt ? JSON.parse(txt) : null;
}

function isValidEmail(e) { return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e) && e.length <= 254; }

export default async function handler(req, res) {
  setSecurityHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!(await applyRateLimit(req, res, '/api/auth'))) return;

  const { action } = req.query;

  // ── تسجيل مستخدم جديد ──────────────────────────────────────
  if (req.method === 'POST' && action === 'register') {
    try {
      const { email, password, first_name, last_name, phone } = req.body || {};
      const emailClean  = sanitizeString(email || '', 254);
      const firstName   = sanitizeString(first_name || '', 50);
      const lastName    = sanitizeString(last_name  || '', 50);
      const phoneClean  = sanitizeString(phone      || '', 20);

      if (!isValidEmail(emailClean))   return safeError(res, 400, 'البريد الإلكتروني غير صحيح');
      if (!password || password.length < 8) return safeError(res, 400, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      if (!firstName)                  return safeError(res, 400, 'الاسم الأول مطلوب');

      const authData = await sbAuth('signup', {
        email: emailClean, password,
        data:  { first_name: firstName, last_name: lastName, phone: phoneClean },
      });

      // Create profile (ignore if trigger already created it)
      try {
        await sb('users', {
          method: 'POST',
          body: JSON.stringify({
            id: authData.user?.id, email: emailClean,
            phone: phoneClean || null, first_name: firstName,
            last_name: lastName, role: 'CUSTOMER', status: 'ACTIVE',
          }),
        });
      } catch { /* trigger may have created it */ }

      return res.status(201).json({
        success: true,
        message: 'تم إنشاء الحساب — تحقق من بريدك الإلكتروني',
        user: { id: authData.user?.id, email: emailClean, first_name: firstName },
      });
    } catch (err) {
      if (err.message?.includes('already registered')) return safeError(res, 409, 'البريد مسجل بالفعل');
      return safeError(res, 500, 'حدث خطأ في إنشاء الحساب', err);
    }
  }

  // ── تسجيل الدخول ────────────────────────────────────────────
  if (req.method === 'POST' && action === 'login') {
    try {
      const { email, password } = req.body || {};
      const emailClean = sanitizeString(email || '', 254);
      if (!isValidEmail(emailClean)) return safeError(res, 400, 'البريد غير صحيح');
      if (!password)                 return safeError(res, 400, 'كلمة المرور مطلوبة');

      const authData = await sbAuth('token?grant_type=password', { email: emailClean, password });

      let profile = null;
      try {
        const p = await sb(`users?id=eq.${authData.user.id}&select=first_name,last_name,role,loyalty_points,loyalty_tier`);
        profile = p?.[0] || null;
      } catch { /* optional */ }

      return res.json({
        success:       true,
        access_token:  authData.access_token,
        refresh_token: authData.refresh_token,
        expires_in:    authData.expires_in,
        user: {
          id:             authData.user.id,
          email:          authData.user.email,
          first_name:     profile?.first_name || authData.user.user_metadata?.first_name || '',
          last_name:      profile?.last_name  || authData.user.user_metadata?.last_name  || '',
          role:           profile?.role || 'CUSTOMER',
          loyalty_points: profile?.loyalty_points || 0,
          loyalty_tier:   profile?.loyalty_tier   || 'BRONZE',
        },
      });
    } catch (err) {
      if (err.message?.includes('Invalid login')) return safeError(res, 401, 'البريد أو كلمة المرور غير صحيحة');
      return safeError(res, 500, 'حدث خطأ في تسجيل الدخول', err);
    }
  }

  // ── تجديد الـ Token ──────────────────────────────────────────
  if (req.method === 'POST' && action === 'refresh') {
    try {
      const { refresh_token } = req.body || {};
      if (!refresh_token) return safeError(res, 400, 'Refresh token مطلوب');
      const d = await sbAuth('token?grant_type=refresh_token', { refresh_token });
      return res.json({ success: true, access_token: d.access_token, refresh_token: d.refresh_token, expires_in: d.expires_in });
    } catch (err) {
      return safeError(res, 401, 'الجلسة منتهية — يرجى تسجيل الدخول مجدداً', err);
    }
  }

  // ── نسيت كلمة المرور ────────────────────────────────────────
  if (req.method === 'POST' && action === 'forgot-password') {
    const { email } = req.body || {};
    const emailClean = sanitizeString(email || '', 254);
    if (!isValidEmail(emailClean)) return safeError(res, 400, 'البريد غير صحيح');
    try { await sbAuth('recover', { email: emailClean }); } catch { /* prevent enumeration */ }
    return res.json({ success: true, message: 'إذا كان البريد مسجلاً ستصل رسالة إعادة التعيين' });
  }

  // ── تسجيل الخروج ────────────────────────────────────────────
  if (req.method === 'POST' && action === 'logout') {
    return res.json({ success: true, message: 'تم تسجيل الخروج' });
  }

  return safeError(res, 400, 'action غير معروف');
}
