// api/products.js — Vercel Serverless Function
// يتصل بـ Supabase ويعيد المنتجات

const SUPABASE_URL  = process.env.SUPABASE_URL  || 'https://digfrefpowwigahzogko.supabase.co';
const SUPABASE_KEY  = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpZ2ZyZWZwb3d3aWdhaHpvZ2tvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5ODkwNjMsImV4cCI6MjA5NTU2NTA2M30.Pal6_vz03Uzz3pgM71FH0xoiEwbeN8VIOC-xDc3um6E';

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
    const err = await res.text();
    throw new Error(`Supabase error ${res.status}: ${err}`);
  }
  return res.json();
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET')     return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { search, category, featured, limit = '20', page = '1', sortBy = 'created_at', sortOrder = 'desc' } = req.query;

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit));
    const offset   = (pageNum - 1) * limitNum;

    // بناء query string
    let query = `products?select=*,category:categories(id,name_ar,name_en,slug,icon)&status=eq.ACTIVE`;
    if (search)   query += `&or=(name_ar.ilike.*${search}*,name_en.ilike.*${search}*,sku.ilike.*${search}*)`;
    if (category) query += `&category_id=eq.${category}`;
    if (featured === 'true') query += `&featured=eq.true`;
    query += `&order=${sortBy}.${sortOrder}&limit=${limitNum}&offset=${offset}`;

    // جلب البيانات والعدد
    const [products, countRes] = await Promise.all([
      supabase(query),
      supabase(`products?select=count&status=eq.ACTIVE${category ? `&category_id=eq.${category}` : ''}${featured === 'true' ? '&featured=eq.true' : ''}`, {
        headers: { 'Prefer': 'count=exact', 'Range-Unit': 'items', 'Range': '0-0' }
      }).catch(() => null),
    ]);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: products.length, // fallback
        hasNext: products.length === limitNum,
        hasPrev: pageNum > 1,
      },
    });
  } catch (err) {
    console.error('Products API error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}
