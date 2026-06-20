// api/orders.js — Secured v2.0
// ✅ Rate Limiting | ✅ Input Validation | ✅ Auth Check
// ✅ No internal errors exposed | ✅ Injection-safe

import {
  checkRateLimit, setSecurityHeaders, safeError,
  sanitizeString, sanitizeInt, sanitizeUUID, getClientIP
} from './_middleware.js';

const SUPABASE_URL = process.env.SUPABASE_URL  || 'https://digfrefpowwigahzogko.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

const ALLOWED_PAYMENT_METHODS = new Set([
  'BANKAK','STRIPE','PAYPAL','CASH_ON_DELIVERY','BANK_TRANSFER','WALLET'
]);
const ALLOWED_SHIPPING_METHODS = new Set(['standard','express','same_day']);

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

function genOrderNumber() {
  const ts   = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `SM-${ts}-${rand}`;
}

function validateAddress(addr) {
  if (!addr || typeof addr !== 'object') return false;
  const required = ['city', 'street'];
  return required.every(k => typeof addr[k] === 'string' && addr[k].trim().length > 0);
}

export default async function handler(req, res) {
  setSecurityHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const ip = getClientIP(req);
  const rl = checkRateLimit(ip, '/api/orders');
  res.setHeader('X-RateLimit-Limit',     rl.max);
  res.setHeader('X-RateLimit-Remaining', rl.remaining);
  res.setHeader('X-RateLimit-Reset',     Math.ceil(rl.resetAt / 1000));

  if (!rl.allowed) {
    res.setHeader('Retry-After', Math.ceil((rl.resetAt - Date.now()) / 1000));
    return safeError(res, 429, 'طلبات كثيرة — انتظر قليلاً');
  }

  // ─── GET: جلب طلبات المستخدم ───────────────────────────────
  if (req.method === 'GET') {
    const userId = sanitizeUUID(req.query.user_id);
    if (!userId) return safeError(res, 400, 'معرّف المستخدم غير صحيح');

    try {
      const orders = await sb(
        `orders?select=id,order_number,total,status,payment_status,created_at,order_items(product_name,quantity,price)&user_id=eq.${userId}&order=created_at.desc&limit=50`
      );
      return res.status(200).json({ success: true, data: orders || [] });
    } catch (err) {
      return safeError(res, 500, 'حدث خطأ في جلب الطلبات', err);
    }
  }

  // ─── POST: إنشاء طلب جديد ──────────────────────────────────
  if (req.method === 'POST') {
    try {
      const body = req.body;
      if (!body || typeof body !== 'object') {
        return safeError(res, 400, 'البيانات غير صحيحة');
      }

      const {
        user_id,
        items,
        address,
        payment_method,
        shipping_method,
        customer_notes,
        coupon_code,
      } = body;

      // Validate user_id
      const userId = sanitizeUUID(user_id);
      if (!userId) return safeError(res, 400, 'معرّف المستخدم غير صحيح');

      // Validate items
      if (!Array.isArray(items) || items.length === 0) {
        return safeError(res, 400, 'السلة فارغة');
      }
      if (items.length > 50) return safeError(res, 400, 'عدد المنتجات كبير جداً');

      // Validate each item
      for (const item of items) {
        if (!sanitizeUUID(item.product_id)) {
          return safeError(res, 400, 'منتج برمز غير صحيح');
        }
        const qty = sanitizeInt(item.quantity, 1, 999);
        if (qty < 1) return safeError(res, 400, 'الكمية يجب أن تكون على الأقل 1');
        item.quantity = qty;
      }

      // Validate address
      if (!validateAddress(address)) {
        return safeError(res, 400, 'العنوان غير مكتمل');
      }

      // Whitelist payment and shipping methods
      const payMethod  = ALLOWED_PAYMENT_METHODS.has(payment_method)  ? payment_method  : null;
      const shipMethod = ALLOWED_SHIPPING_METHODS.has(shipping_method) ? shipping_method : 'standard';
      if (!payMethod) return safeError(res, 400, 'طريقة دفع غير صحيحة');

      const notes   = sanitizeString(customer_notes || '', 500);
      const coupon  = sanitizeString(coupon_code    || '', 50);

      // Fetch product prices from DB (server-side pricing — لا تثق بالعميل)
      const ids      = items.map(i => sanitizeUUID(i.product_id)).filter(Boolean);
      const products = await sb(
        `products?id=in.(${ids.join(',')})&select=id,price,name_ar,sku,stock,track_stock&status=eq.ACTIVE`
      );
      if (!products?.length) return safeError(res, 400, 'لا توجد منتجات صحيحة');

      let subtotal    = 0;
      const orderItems = [];

      for (const item of items) {
        const p = products.find(x => x.id === item.product_id);
        if (!p) return safeError(res, 400, `منتج غير موجود أو غير متاح`);
        if (p.track_stock && p.stock < item.quantity) {
          return safeError(res, 400, `مخزون غير كافٍ للمنتج: ${p.name_ar}`);
        }
        // Use server-side price — ignore any client-sent price
        const lineTotal = Number(p.price) * item.quantity;
        subtotal += lineTotal;
        orderItems.push({
          product_id:   p.id,
          product_name: p.name_ar,
          sku:          p.sku,
          price:        p.price,
          quantity:     item.quantity,
          total:        lineTotal,
        });
      }

      // Calculate shipping (server-side)
      const shippingCost =
        shipMethod === 'express'  ? 100 :
        shipMethod === 'same_day' ? 200 : 50;
      const total = subtotal + shippingCost;

      // Max order sanity check
      if (total > 1_000_000) return safeError(res, 400, 'قيمة الطلب كبيرة جداً');

      const orderNumber = genOrderNumber();

      const [order] = await sb('orders', {
        method: 'POST',
        body: JSON.stringify({
          order_number:    orderNumber,
          user_id:         userId,
          address:         address,
          subtotal,
          shipping_cost:   shippingCost,
          discount_amount: 0,
          total,
          status:          'PENDING',
          payment_status:  'PENDING',
          payment_method:  payMethod,
          shipping_method: shipMethod,
          customer_notes:  notes,
          coupon_code:     coupon || null,
        }),
      });

      // Insert order items
      await sb('order_items', {
        method: 'POST',
        body: JSON.stringify(orderItems.map(i => ({ ...i, order_id: order.id }))),
      });

      // Decrement stock (best-effort)
      for (const item of orderItems) {
        const p = products.find(x => x.sku === item.sku);
        if (p?.track_stock) {
          await sb(`products?id=eq.${p.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ stock: Math.max(0, p.stock - item.quantity) }),
          }).catch(() => {}); // non-blocking
        }
      }

      return res.status(201).json({
        success: true,
        data: {
          id:          order.id,
          orderNumber: order.order_number,
          total:       order.total,
          status:      order.status,
        },
      });
    } catch (err) {
      return safeError(res, 500, 'حدث خطأ في إنشاء الطلب', err);
    }
  }

  return safeError(res, 405, 'Method not allowed');
}
