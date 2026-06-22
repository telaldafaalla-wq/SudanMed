#!/usr/bin/env node
// Fetch products from Supabase REST and save to data/products.json
// Expects env: SUPABASE_URL, SUPABASE_ANON_KEY

const fs = require('fs').promises;
const path = require('path');
const http = require('http');
const https = require('https');

async function download(url, dest) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    lib.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest).then(resolve, reject);
      }
      if (res.statusCode !== 200) return reject(new Error('Download failed: ' + res.statusCode));
      const folder = path.dirname(dest);
      fs.mkdir(folder, { recursive: true }).then(() => {
        const file = fs.open(dest, 'w');
        const stream = res;
        const chunks = [];
        stream.on('data', c => chunks.push(c));
        stream.on('end', async () => {
          try {
            await fs.writeFile(dest, Buffer.concat(chunks));
            resolve();
          } catch (e) { reject(e); }
        });
        stream.on('error', reject);
      }).catch(reject);
    }).on('error', reject);
  });
}

(async function main(){
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY. Set both env vars and re-run.');
    console.error('Example: SUPABASE_URL="https://your.supabase.co" SUPABASE_ANON_KEY="anon..." node scripts/fetch_products_from_supabase.js');
    process.exit(2);
  }

  const restUrl = SUPABASE_URL.replace(/\/+$/,'') + '/rest/v1/products?select=*';
  console.log('Fetching products from', restUrl);

  try {
    const res = await fetch(restUrl, { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } });
    if (!res.ok) throw new Error(`Supabase returned ${res.status}`);
    const products = await res.json();
    if (!Array.isArray(products)) throw new Error('Unexpected response format');

    // ensure data dir
    await fs.mkdir(path.join(process.cwd(), 'data'), { recursive: true });
    const outPath = path.join(process.cwd(), 'data', 'products.json');

    // download images if present and rewrite image_url to local path
    await fs.mkdir(path.join(process.cwd(), 'public', 'images', 'catalog'), { recursive: true });

    for (const p of products) {
      if (p.image_url && typeof p.image_url === 'string' && p.image_url.startsWith('http')) {
        try {
          const url = p.image_url.replace(/&amp;/g, '&');
          const basename = path.basename(new URL(url).pathname) || `${p.id || p.slug || p.sku}.img`;
          const localRel = `/images/catalog/${basename}`;
          const localPath = path.join(process.cwd(), 'public', 'images', 'catalog', basename);
          if (!await exists(localPath)) {
            console.log('Downloading', url, '->', localRel);
            await download(url, localPath);
          } else {
            // console.log('Already have', localRel);
          }
          p.image_url = localRel;
        } catch (e) {
          console.warn('Failed to download image for product', p.id || p.slug, e.message);
        }
      }
    }

    await fs.writeFile(outPath, JSON.stringify(products, null, 2), 'utf8');
    console.log('Saved', products.length, 'products to', outPath);
  } catch (err) {
    console.error('Error fetching products:', err.message);
    process.exit(1);
  }

  function exists(p) {
    return fs.access(p).then(() => true).catch(() => false);
  }
})();
