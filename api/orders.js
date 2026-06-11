// api/orders.js
const SUPABASE_URL = process.env.SUPABASE_URL  || 'https://digfrefpowwigahzogko.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpZ2ZyZWZwb3d3aWdhaHpvZ2tvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5ODkwNjMsImV4cCI6MjA5NTU2NTA2M30.Pal6_vz03Uzz3pgM71FH0xoiEwbeN8VIOC-xDc3um6E';

async function sb(path, opts = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...opts,
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) throw new Error(await res.text());
  const txt = await res.text();
  return txt ? JSON.parse(txt) : null;
}

function genOrderNumber() {
  return 'SM-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2,5).toUpperCase();
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET — جلب طلبات المستخدم
  if (req.method === 'GET') {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ error: 'user_id مطلوب' });
    try {
      const orders = await sb(
        `orders?select=*,order_items(*)&user_id=eq.${user_id}&order=created_at.desc`
      );
      return res.status(200).json({ success: true, data: orders });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // POST — إنشاء طلب جديد
  if (req.method === 'POST') {
    try {
      const { user_id, items, address, payment_method, shipping_method, customer_notes, coupon_code } = req.body;
      if (!items?.length) return res.status(400).json({ error: 'السلة فارغة' });

      // جلب أسعار المنتجات من Supabase
      const ids = items.map(i => i.product_id).join(',');
      const products = await sb(`products?id=in.(${ids})&select=id,price,name_ar,sku,stock,track_stock`);

      let subtotal = 0;
      const orderItems = items.map(item => {
        const p = products.find(x => x.id === item.product_id);
        if (!p) throw new Error(`منتج غير موجود: ${item.product_id}`);
        if (p.track_stock && p.stock < item.quantity) throw new Error(`مخزون غير كافٍ: ${p.name_ar}`);
        const total = Number(p.price) * item.quantity;
        subtotal += total;
        return { product_id: p.id, product_name: p.name_ar, sku: p.sku, price: p.price, quantity: item.quantity, total };
      });

      const shippingCost = shipping_method === 'express' ? 100 : shipping_method === 'same_day' ? 200 : 50;
      const total = subtotal + shippingCost;
      const orderNumber = genOrderNumber();

      // إنشاء الطلب
      const [order] = await sb('orders', {
        method: 'POST',
        body: JSON.stringify({
          order_number: orderNumber,
          user_id, address, subtotal,
          shipping_cost: shippingCost,
          discount_amount: 0,
          total,
          status: 'PENDING',
          payment_status: 'PENDING',
          payment_method,
          shipping_method,
          customer_notes,
          coupon_code,
        }),
      });

      // إنشاء عناصر الطلب
      await sb('order_items', {
        method: 'POST',
        body: JSON.stringify(orderItems.map(i => ({ ...i, order_id: order.id }))),
      });

      // تخفيض المخزون
      for (const item of orderItems) {
        const p = products.find(x => x.sku === item.sku);
        if (p?.track_stock) {
          await sb(`products?id=eq.${p.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ stock: p.stock - item.quantity }),
          });
        }
      }

      return res.status(201).json({ success: true, data: { ...order, orderNumber } });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
