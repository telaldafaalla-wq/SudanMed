#!/usr/bin/env node
/**
 * Upload local catalog (data/products.json) and images to Supabase.
 *
 * Usage:
 *   SUPABASE_URL=https://<project>.supabase.co SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/upload_catalog_to_supabase.js
 *
 * The script will:
 *  - upload files from /public/images/catalog/ to storage bucket `product-images` (creates paths)
 *  - insert product rows into `products` via the REST API
 *
 * Warning: requires a Supabase service role key with storage and db write permissions.
 */

import fs from 'fs/promises';
import path from 'path';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY)');
  process.exit(1);
}

const bucket = 'product-images';

async function uploadFile(filePath, destPath) {
  const url = `${SUPABASE_URL}/storage/v1/object/${encodeURIComponent(bucket)}/${encodeURIComponent(destPath)}`;
  const data = await fs.readFile(filePath);
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'apikey': SERVICE_KEY,
      'Content-Type': 'application/octet-stream',
    },
    body: data,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload failed: ${res.status} ${text}`);
  }
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${encodeURIComponent(destPath)}`;
}

async function insertProducts(products) {
  const url = `${SUPABASE_URL}/rest/v1/products`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(products)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Insert failed: ${res.status} ${text}`);
  }
  return res.json();
}

async function main() {
  const dataFile = path.resolve('data/products.json');
  const imagesDir = path.resolve('public/images/catalog');

  const raw = await fs.readFile(dataFile, 'utf8');
  const products = JSON.parse(raw);

  // Upload images and rewrite image_url to public storage URL
  for (const p of products) {
    if (!p.image_url || p.image_url.startsWith('http')) continue;
    const localPath = path.join('.', p.image_url.replace(/^\//, ''));
    const filename = path.basename(localPath);
    try {
      console.log('Uploading', filename);
      const publicUrl = await uploadFile(localPath, filename);
      p.image_url = publicUrl;
    } catch (e) {
      console.error('Failed uploading', filename, e.message);
    }
  }

  // Insert products
  try {
    const inserted = await insertProducts(products.map(p => ({
      sku: p.sku,
      name_ar: p.name_ar,
      name_en: p.name_en,
      slug: p.slug,
      price: p.price,
      compare_price: p.compare_price || null,
      stock: p.stock || 0,
      brand: p.brand || null,
      manufacturer: p.manufacturer || null,
      origin: p.origin || null,
      featured: p.featured || false,
      status: p.status || 'ACTIVE',
      category_id: p.category_id || null,
      image_url: p.image_url || null,
      short_desc: p.short_desc || null,
      description: p.description || null,
    })));
    console.log('Inserted products:', inserted.length || inserted);
  } catch (e) {
    console.error('Insert error', e.message);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
