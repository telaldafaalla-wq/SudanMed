// api/payments.js — Bankak receipt submission + verification
const SUPABASE_URL = process.env.SUPABASE_URL  || 'https://digfrefpowwigahzogko.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpZ2ZyZWZwb3d3aWdhaHpvZ2tvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5ODkwNjMsImV4cCI6MjA5NTU2NTA2M30.Pal6_vz03Uzz3pgM71FH0xoiEwbeN8VIOC-xDc3um6E';
const BANKAK_ACCOUNT = process.env.BANKAK_ACCOUNT || '+249912345678';

async function sb(path, opts = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...opts,
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation', ...(opts.headers || {}) },
  });
  if (!res.ok) throw new Error(await res.text());
  const txt = await res.text();
  return txt ? JSON.parse(txt) : null;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { action } = req.query;

  // GET instructions — تعليمات بنكك
  if (req.method === 'GET' && action === 'bankak-instructions') {
    const { order_id } = req.query;
    const [order] = await sb(`orders?id=eq.${order_id}&select=order_number,total`);
    if (!order) return res.status(404).json({ error: 'الطلب غير موجود' });
    return res.json({
      success: true,
      data: {
        accountNumber: BANKAK_ACCOUNT,
        amount: order.total,
        reference: order.order_number,
        steps: [
          'افتح تطبيق بنكك',
          'اختر "تحويل"',
          `أدخل الرقم: ${BANKAK_ACCOUNT}`,
          `أدخل المبلغ: ${order.total} جنيه`,
          `اكتب في البيان: ${order.order_number}`,
          'أكمل التحويل وارفع صورة الإيصال'
        ]
      }
    });
  }

  // POST — رفع إيصال بنكك
  if (req.method === 'POST' && action === 'bankak-receipt') {
    try {
      const { order_id, receipt_url, bankak_ref } = req.body;
      const [payment] = await sb('payments', {
        method: 'POST',
        body: JSON.stringify({ order_id, method: 'BANKAK', amount: 0, status: 'PENDING', receipt_url, bankak_ref }),
      });
      return res.status(201).json({ success: true, data: payment, message: 'سيتم التحقق خلال 10-60 دقيقة' });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // PATCH — تحقق يدوي من الدفع (إدارة)
  if (req.method === 'PATCH' && action === 'verify') {
    try {
      const { payment_id, approved, admin_id } = req.body;
      const newStatus = approved ? 'PAID' : 'FAILED';
      await sb(`payments?id=eq.${payment_id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus, verified_at: new Date().toISOString(), verified_by: admin_id }),
      });
      const [payment] = await sb(`payments?id=eq.${payment_id}&select=order_id`);
      if (payment && approved) {
        await sb(`orders?id=eq.${payment.order_id}`, {
          method: 'PATCH',
          body: JSON.stringify({ payment_status: 'PAID', status: 'CONFIRMED' }),
        });
      }
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  res.status(400).json({ error: 'action غير معروف' });
}
