#!/usr/bin/env node
/**
 * Simple scraper: fetch site root, collect image URLs, try to match keywords,
 * download the best match per keyword, save to public/images/catalog/, and
 * update data/products.json to reference the saved files.
 *
 * Usage: `node scripts/scrape_and_save_images.js`
 */

import fs from 'fs/promises';
import path from 'path';

const SITE = 'https://www.sinjarmedical.com';
const outDir = path.resolve('public/images/catalog');
await fs.mkdir(outDir, { recursive: true });

const productsPath = path.resolve('data/products.json');
let products = [];
try { products = JSON.parse(await fs.readFile(productsPath, 'utf8')); } catch(e){ console.error('No products.json found'); process.exit(1); }

const keywordsFor = {
  'n95-mask': ['n95','mask','كمامة','قناع'],
  'syringe-5ml': ['syringe','syringe 5ml','محقنة','محقنة 5'],
  'iv-cannula-18g': ['cannula','iv cannula','كانيولا','قسطرة'],
  'suture-2-0': ['suture','خيط','خيط جراحي']
};

function absolutize(url, base) {
  try { return new URL(url, base).href; } catch { return null; }
}

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'sudanmed-bot/1.0' } });
  if (!res.ok) throw new Error(`Failed ${res.status}`);
  return res.text();
}

function extFromUrl(u) {
  try { return (new URL(u)).pathname.split('.').pop().toLowerCase(); } catch { return 'jpg'; }
}

async function download(url, dest) {
  const res = await fetch(url, { headers: { 'User-Agent': 'sudanmed-bot/1.0' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = await res.arrayBuffer();
  await fs.writeFile(dest, Buffer.from(buf));
}

// Crawl site BFS up to depth
const maxPages = 200;
const maxDepth = 3;
const visited = new Set();
const toVisit = [{ url: SITE + '/', depth: 0 }];
const foundImgs = new Set();

console.log('Starting crawl of', SITE);
while (toVisit.length && visited.size < maxPages) {
  const { url, depth } = toVisit.shift();
  if (visited.has(url)) continue;
  visited.add(url);
  try {
    const html = await fetchText(url);
    // extract links
    for (const m of html.matchAll(/href=["']([^"'#]+)["']/gi)) {
      const link = absolutize(m[1], url);
      if (!link) continue;
      try {
        const u = new URL(link);
        if (u.host === (new URL(SITE)).host && !visited.has(link) && depth+1 <= maxDepth) {
          toVisit.push({ url: link, depth: depth+1 });
        }
      } catch { }
    }

    // extract images
    for (const m of html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)) {
      let src = m[1];
      // decode common HTML entity
      src = src.replace(/&amp;/g, '&');
      const abs = absolutize(src, url);
      if (!abs) continue;
      foundImgs.add(abs);
    }
    // polite delay
    await new Promise(r => setTimeout(r, 250));
  } catch (e) {
    // ignore errors
  }
}

console.log('Crawl finished.', visited.size, 'pages visited,', foundImgs.size, 'unique images found');

const imgs = Array.from(foundImgs).map(u => ({ src: u, alt: '' }));

// Try to find matches per keyword set from gathered images
for (const [slug, keywords] of Object.entries(keywordsFor)) {
  const lcKeywords = keywords.map(k=>k.toLowerCase());
  let found = null;
  for (const img of imgs) {
    const src = img.src.toLowerCase();
    if (lcKeywords.some(k => src.includes(k))) { found = img.src; break; }
  }

  if (!found) { console.log('No image found for', slug); continue; }

  const abs = found;
  const ext = extFromUrl(abs) || 'jpg';
  const filename = `${slug}.${ext}`;
  const dest = path.join(outDir, filename);
  try {
    console.log(`Downloading ${abs} -> ${filename}`);
    await download(abs, dest);
    for (const p of products) {
      if (p.slug === slug) p.image_url = `/images/catalog/${filename}`;
    }
  } catch (e) {
    console.error('Download failed for', abs, e.message);
  }
}

// Save products.json
await fs.writeFile(productsPath, JSON.stringify(products, null, 2), 'utf8');
console.log('Updated', productsPath);
