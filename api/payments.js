// api/payments.js — Secured v2.0
// ✅ Rate Limiting | ✅ Admin Auth for verify | ✅ Input Validation
// ✅ Safe Errors | ✅ Security Headers

import {
  checkRateLimit, setSecurityHeaders, safeError,
  sanitizeString, sanitizeUUID, verifyAdminKey, getClientIP
} from './_middleware.js';

const SUPABASE_URL    = process.env.SUPABASE_URL        || 'https://digfrefpowwigahzogko.supabase.co';
const SUPABASE_KEY    = process.env.SUPABASE_ANON_KEY;
const BANKAK_ACCOUNT  = process.env.BANKAK_ACCOUNT      || '+249912345678';

async function sb(path, opts = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...opts,
    headers: {
      'apikey':        SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type':  'application/json',
      'Prefer':        'return=representation',
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`DB_ERROR_${res.status}`);
  const txt = await res.text();
  return txt ? JSON.parse(txt) : null;
}

// Validate receipt URL — only allow https image URLs
function isValidReceiptUrl(url) {
  if (typeof url !== 'string' || !url.startsWith('https://')) return false;
  try {
    const parsed = new URL(url);
    // Allow only known cloud storage providers
    const allowedHosts = [
      'res.cloudinary.com',
      'storage.googleapis.com',
      'firebasestorage.googleapis.com',
      'amazonaws.com',
    ];
    return allowedHosts.some(h => parsed.hostname.endsWith(h));
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  setSecurityHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const ip = getClientIP(req);
  const rl = checkRateLimit(ip, '/api/payments');
  res.setHeader('X-RateLimit-Limit',     rl.max);
  res.setHeader('X-RateLimit-Remaining', rl.remaining);
  res.setHeader('X-RateLimit-Reset',     Math.ceil(rl.resetAt / 1000));

  if (!rl.allowed) {
    res.setHeader('Retry-After', Math.ceil((rl.resetAt - Date.now()) / 1000));
    return safeError(res, 429, 'طلبات كثيرة — انتظر قليلاً');
  }

  const { action } = req.query;

  // ─── GET: تعليمات بنكك ─────────────────────────────────────
  if (req.method === 'GET' && action === 'bankak-instructions') {
    const orderId = sanitizeUUID(req.query.order_id);
    if (!orderId) return safeError(res, 400, 'معرّف الطلب غير صحيح');

    try {
      const orders = await sb(`orders?id=eq.${orderId}&select=order_number,total&status=eq.PENDING`);
      const order  = orders?.[0];
      if (!order) return safeError(res, 404, 'الطلب غير موجود أو مكتمل بالفعل');

      return res.json({
        success: true,
        data: {
          accountNumber: BANKAK_ACCOUNT,
          amount:        order.total,
          reference:     order.order_number,
          steps: [
            'افتح تطبيق بنكك',
            'اختر "تحويل"',
            `أدخل الرقم: ${BANKAK_ACCOUNT}`,
            `أدخل المبلغ: ${order.total} جنيه`,
            `اكتب في البيان: ${order.order_number}`,
            'أكمل التحويل وارفع صورة الإيصال',
          ],
        },
      });
    } catch (err) {
      return safeError(res, 500, 'حدث خطأ', err);
    }
  }

  // ─── POST: رفع إيصال بنكك ──────────────────────────────────
  if (req.method === 'POST' && action === 'bankak-receipt') {
    try {
      const { order_id, receipt_url, bankak_ref } = req.body || {};

      const orderId    = sanitizeUUID(order_id);
      const bankakRef  = sanitizeString(bankak_ref || '', 100);

      if (!orderId) return safeError(res, 400, 'معرّف الطلب غير صحيح');

      // Validate receipt URL
      if (!isValidReceiptUrl(receipt_url)) {
        return safeError(res, 400, 'رابط الإيصال غير صحيح — يجب رفع الصورة عبر Cloudinary');
      }

      // Check order exists and is PENDING
      const orders = await sb(`orders?id=eq.${orderId}&select=id,total&payment_status=eq.PENDING`);
      if (!orders?.length) {
        return safeError(res, 404, 'الطلب غير موجود أو تم الدفع مسبقاً');
      }

      const order = orders[0];

      const [payment] = await sb('payments', {
        method: 'POST',
        body: JSON.stringify({
          order_id:    orderId,
          method:      'BANKAK',
          amount:      order.total,
          status:      'PENDING',
          receipt_url: receipt_url,
          bankak_ref:  bankakRef || null,
        }),
      });

      return res.status(201).json({
        success: true,
        data:    { id: payment.id, status: payment.status },
        message: 'سيتم التحقق خلال 10-60 دقيقة',
      });
    } catch (err) {
      return safeError(res, 500, 'حدث خطأ في رفع الإيصال', err);
    }
  }

  // ─── PATCH: تحقق يدوي (إدارة فقط) ─────────────────────────
  if (req.method === 'PATCH' && action === 'verify') {
    // 🔐 يتطلب Admin API Key
    if (!verifyAdminKey(req)) {
      return safeError(res, 401, 'غير مصرح — مطلوب مفتاح الإدارة');
    }

    try {
      const { payment_id, approved } = req.body || {};

      const paymentId = sanitizeUUID(payment_id);
      if (!paymentId) return safeError(res, 400, 'معرّف الدفع غير صحيح');
      if (typeof approved !== 'boolean') return safeError(res, 400, 'يجب تحديد approved: true/false');

      const newStatus = approved ? 'PAID' : 'FAILED';

      await sb(`payments?id=eq.${paymentId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status:      newStatus,
          verified_at: new Date().toISOString(),
        }),
      });

      if (approved) {
        const payments = await sb(`payments?id=eq.${paymentId}&select=order_id`);
        const orderId  = payments?.[0]?.order_id;
        if (orderId) {
          await sb(`orders?id=eq.${orderId}`, {
            method: 'PATCH',
            body: JSON.stringify({
              payment_status: 'PAID',
              status:         'CONFIRMED',
            }),
          });
        }
      }

      return res.json({ success: true, status: newStatus });
    } catch (err) {
      return safeError(res, 500, 'حدث خطأ في التحقق', err);
    }
  }

  return safeError(res, 400, 'action غير معروف');
}
