Upload catalog and images
=========================

1) Prepare environment variables (your Supabase project):

```bash
export SUPABASE_URL=https://<your-project>.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

2) Inspect local catalog and images:

- `data/products.json` — local catalog entries (names, descriptions, image paths)
- `public/images/catalog/` — SVG placeholders used for images

3) Upload (will push images to bucket `product-images` and insert rows into `products` table):

```bash
node scripts/upload_catalog_to_supabase.js
```

Notes:
- The script requires a Supabase service role key with storage and database write permissions.
- If you prefer not to use Supabase, you can copy `public/images/catalog/*` into your hosting/static assets and point `image_url` fields to `/images/catalog/<file>`.
