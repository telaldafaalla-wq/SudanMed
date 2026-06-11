// api/categories.js
const SUPABASE_URL = process.env.SUPABASE_URL  || 'https://digfrefpowwigahzogko.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpZ2ZyZWZwb3d3aWdhaHpvZ2tvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5ODkwNjMsImV4cCI6MjA5NTU2NTA2M30.Pal6_vz03Uzz3pgM71FH0xoiEwbeN8VIOC-xDc3um6E';

async function supabase(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
    },
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}`);
  return res.json();
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const cats = await supabase(
      'categories?select=*,products(count)&is_active=eq.true&order=sort_order.asc'
    );
    res.status(200).json({ success: true, data: cats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
