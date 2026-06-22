#!/usr/bin/env node
const fs = require('fs').promises;
const fetch = global.fetch;

(async function main(){
  const base = process.env.BASE_URL || 'http://localhost:3000';
  const report = [];

  // read products to test per-product pages
  let products = [];
  try {
    const raw = await fs.readFile('./data/products.json', 'utf8');
    products = JSON.parse(raw);
  } catch (e) {
    console.warn('Could not read data/products.json, continuing with no product pages');
  }

  const pages = [
    '/',
    '/products',
    '/cart',
    '/checkout',
    '/orders',
    '/track',
    '/auth/login',
    '/auth/register'
  ];

  const productPaths = (products || []).map(p => `/products/${p.slug || p.id || p.sku}`);
  const paths = [...pages, ...productPaths];

  // wait for server to be ready
  const waitFor = async (timeoutMs = 30000) => {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      try {
        const r = await fetch(base + '/', { method: 'GET' });
        if (r.ok) return true;
      } catch (e) {}
      await new Promise(r => setTimeout(r, 1000));
    }
    return false;
  };

  const up = await waitFor(30000);
  if (!up) {
    console.error(`Server not responding at ${base} after 30s.`);
    process.exit(2);
  }

  let passed = 0, failed = 0;

  for (const p of paths) {
    const url = base + p;
    try {
      const res = await fetch(url, { method: 'GET' });
      if (!res.ok) {
        console.log(`FAIL: ${p} -> HTTP ${res.status}`);
        report.push({ path: p, ok: false, status: res.status });
        failed++;
        continue;
      }
      const text = await res.text();
      // basic content checks
      let ok = true;
      if (p === '/products') {
        if (!text.includes('/images/catalog') && !text.includes('كمامة') && !text.includes('محقنة')) {
          ok = false;
        }
      }
      // for product pages, check product name exists
      const prod = products.find(x => (`/products/${x.slug || x.id || x.sku}`) === p);
      if (prod) {
        const nameMatch = (prod.name_en && text.includes(prod.name_en)) || (prod.name_ar && text.includes(prod.name_ar));
        if (!nameMatch) ok = false;
      }

      if (ok) {
        console.log(`OK:  ${p} -> ${res.status} (${res.headers.get('content-length') || 'size N/A'})`);
        report.push({ path: p, ok: true, status: res.status });
        passed++;
      } else {
        console.log(`FAIL: ${p} -> content checks failed`);
        report.push({ path: p, ok: false, status: res.status, reason: 'content checks' });
        failed++;
      }
    } catch (err) {
      console.log(`ERROR: ${p} -> ${err.message}`);
      report.push({ path: p, ok: false, status: 'ERR', reason: err.message });
      failed++;
    }
  }

  console.log('\nSUMMARY:');
  console.log(`passed: ${passed}`);
  console.log(`failed: ${failed}`);

  if (failed > 0) process.exit(1);
  process.exit(0);
})();
