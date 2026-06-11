-- ============================================================
-- SudanMed — Supabase Schema + Seed Data
-- انسخ هذا الكود في Supabase SQL Editor وشغّله
-- ============================================================

-- ── تفعيل UUID ───────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── جدول الفئات ──────────────────────────────────────────────
create table if not exists categories (
  id          uuid primary key default uuid_generate_v4(),
  name_ar     text not null,
  name_en     text not null,
  slug        text unique not null,
  description text,
  icon        text,
  image_url   text,
  sort_order  int  default 0,
  is_active   bool default true,
  created_at  timestamptz default now()
);

-- ── جدول المنتجات ────────────────────────────────────────────
create table if not exists products (
  id                 uuid primary key default uuid_generate_v4(),
  sku                text unique not null,
  name_ar            text not null,
  name_en            text not null,
  slug               text unique not null,
  description        text,
  short_desc         text,
  price              numeric(10,2) not null,
  compare_price      numeric(10,2),
  stock              int  default 0,
  low_stock_threshold int  default 10,
  brand              text,
  manufacturer       text,
  origin             text,
  ce_marked          bool default false,
  sfd_approved       bool default false,
  fda_approved       bool default false,
  status             text default 'ACTIVE',
  featured           bool default false,
  category_id        uuid references categories(id),
  image_url          text,
  images             jsonb default '[]',
  keywords           text[],
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);

-- ── جدول المستخدمين ──────────────────────────────────────────
create table if not exists users (
  id             uuid primary key default uuid_generate_v4(),
  email          text unique,
  phone          text unique,
  first_name     text,
  last_name      text,
  avatar         text,
  role           text default 'CUSTOMER',
  status         text default 'ACTIVE',
  created_at     timestamptz default now()
);

-- ── جدول الطلبات ─────────────────────────────────────────────
create table if not exists orders (
  id              uuid primary key default uuid_generate_v4(),
  order_number    text unique not null,
  user_id         uuid references users(id),
  address         jsonb,
  subtotal        numeric(10,2),
  shipping_cost   numeric(10,2),
  discount_amount numeric(10,2) default 0,
  total           numeric(10,2),
  status          text default 'PENDING',
  payment_status  text default 'PENDING',
  payment_method  text,
  shipping_method text,
  tracking_number text,
  customer_notes  text,
  coupon_code     text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── جدول عناصر الطلب ─────────────────────────────────────────
create table if not exists order_items (
  id           uuid primary key default uuid_generate_v4(),
  order_id     uuid references orders(id) on delete cascade,
  product_id   uuid references products(id),
  product_name text,
  sku          text,
  price        numeric(10,2),
  quantity     int,
  total        numeric(10,2),
  created_at   timestamptz default now()
);

-- ── جدول المدفوعات ───────────────────────────────────────────
create table if not exists payments (
  id           uuid primary key default uuid_generate_v4(),
  order_id     uuid references orders(id),
  method       text,
  amount       numeric(10,2),
  status       text default 'PENDING',
  receipt_url  text,
  bankak_ref   text,
  verified_at  timestamptz,
  verified_by  uuid,
  created_at   timestamptz default now()
);

-- ── جدول سلة التسوق ──────────────────────────────────────────
create table if not exists cart_items (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references users(id) on delete cascade,
  product_id uuid references products(id),
  quantity   int default 1,
  created_at timestamptz default now(),
  unique(user_id, product_id)
);

-- ── جدول نقاط الولاء ─────────────────────────────────────────
create table if not exists loyalty_points (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references users(id) on delete cascade,
  points      int,
  type        text,
  description text,
  order_id    uuid,
  expires_at  timestamptz,
  created_at  timestamptz default now()
);

-- ── جدول الإشعارات ───────────────────────────────────────────
create table if not exists notifications (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references users(id) on delete cascade,
  type       text,
  title      text,
  body       text,
  data       jsonb,
  read       bool default false,
  created_at timestamptz default now()
);

-- ── جدول الكوبونات ───────────────────────────────────────────
create table if not exists coupons (
  id              uuid primary key default uuid_generate_v4(),
  code            text unique not null,
  discount_type   text,
  discount_value  numeric(10,2),
  min_order       numeric(10,2),
  usage_limit     int,
  usage_count     int default 0,
  start_date      timestamptz default now(),
  end_date        timestamptz,
  is_active       bool default true,
  created_at      timestamptz default now()
);

-- ── جدول تذاكر الدعم ─────────────────────────────────────────
create table if not exists support_tickets (
  id             uuid primary key default uuid_generate_v4(),
  ticket_number  text unique,
  user_id        uuid references users(id),
  subject        text,
  category       text default 'GENERAL',
  status         text default 'OPEN',
  priority       text default 'MEDIUM',
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

create table if not exists support_messages (
  id         uuid primary key default uuid_generate_v4(),
  ticket_id  uuid references support_tickets(id) on delete cascade,
  sender_id  uuid,
  is_staff   bool default false,
  body       text,
  created_at timestamptz default now()
);

-- ── RLS Policies ─────────────────────────────────────────────
alter table categories     enable row level security;
alter table products       enable row level security;
alter table orders         enable row level security;
alter table order_items    enable row level security;
alter table payments       enable row level security;
alter table cart_items     enable row level security;
alter table loyalty_points enable row level security;
alter table notifications  enable row level security;
alter table coupons        enable row level security;
alter table support_tickets enable row level security;
alter table support_messages enable row level security;

-- فئات ومنتجات: قراءة عامة
create policy "categories_public_read" on categories for select using (is_active = true);
create policy "products_public_read"   on products   for select using (status = 'ACTIVE');
create policy "coupons_public_read"    on coupons    for select using (is_active = true);

-- ── Indexes ──────────────────────────────────────────────────
create index if not exists idx_products_category  on products(category_id);
create index if not exists idx_products_featured  on products(featured) where featured = true;
create index if not exists idx_products_status    on products(status);
create index if not exists idx_orders_user        on orders(user_id);
create index if not exists idx_order_items_order  on order_items(order_id);

-- ════════════════════════════════════════════════════════════
-- SEED DATA — الفئات
-- ════════════════════════════════════════════════════════════
insert into categories (name_ar, name_en, slug, icon, sort_order) values
  ('مستلزمات الوقاية الشخصية', 'Personal Protective Equipment', 'ppe',        '😷', 1),
  ('الحقن والتسريب',            'Injection & Infusion',          'injection',   '💉', 2),
  ('مستلزمات جراحية',           'Surgical Supplies',              'surgical',    '🔬', 3),
  ('التعقيم والتطهير',           'Sterilization',                  'sterilize',   '🧴', 4),
  ('مستلزمات المختبرات',        'Laboratory Supplies',            'laboratory',  '🧪', 5),
  ('العناية بالجروح',           'Wound Care',                     'wound-care',  '🩹', 6)
on conflict (slug) do nothing;

-- ════════════════════════════════════════════════════════════
-- SEED DATA — المنتجات
-- ════════════════════════════════════════════════════════════
with cats as (
  select id, slug from categories
)
insert into products (sku, name_ar, name_en, slug, short_desc, price, compare_price, stock, brand, ce_marked, featured, image_url, category_id) values
  ('KN95-001', 'كمامة KN95 الواقية', 'KN95 Protective Mask', 'kn95-mask',
   'كمامة مخصصة للاستخدام الطبي توفر حماية 95% من الجسيمات',
   150, 200, 500, '3M', true, true,
   'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
   (select id from cats where slug='ppe')),

  ('SYR-5ML', 'محقنة 5مل معقمة', '5ml Sterile Syringe', 'syringe-5ml',
   'محقنة معقمة للاستخدام الواحد مع إبرة حادة',
   25, null, 2000, 'BD', true, true,
   'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400',
   (select id from cats where slug='injection')),

  ('IV-SET-001', 'جهاز تسريب IV', 'IV Infusion Set', 'iv-set',
   'جهاز تسريب وريدي معقم ومعبأ — مع فلتر 15 ميكرون',
   45, 60, 800, 'Baxter', true, false,
   'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=400',
   (select id from cats where slug='injection')),

  ('GLOVE-L', 'قفازات لاتكس طبية (L)', 'Latex Medical Gloves L', 'gloves-latex-l',
   'قفازات طبية معقمة بدون بودرة — 100 قفاز في العبوة',
   120, 150, 300, 'Ansell', true, true,
   'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400',
   (select id from cats where slug='ppe')),

  ('BET-500', 'بيتادين محلول 500مل', 'Betadine Solution 500ml', 'betadine-500ml',
   'محلول مطهر يحتوي على بوفيدون أيوديد 10% — للاستخدام الخارجي',
   200, 250, 150, 'Meda', false, true,
   'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400',
   (select id from cats where slug='sterilize')),

  ('BND-10', 'رباط شاش 10 سم × 5 م', 'Gauze Bandage 10cm', 'bandage-10cm',
   'رباط شاش معقم للاستخدام الجراحي وتضميد الجروح',
   30, null, 1200, 'Hartmann', false, false,
   'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
   (select id from cats where slug='wound-care')),

  ('ALC-70-1L', 'كحول طبي 70% — 1 لتر', 'Medical Alcohol 70% 1L', 'alcohol-70-1l',
   'محلول كحول إيثيلي 70% للتعقيم والتطهير السطحي',
   180, 220, 400, 'Sigma', false, true,
   'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
   (select id from cats where slug='sterilize')),

  ('EDTA-4ML', 'أنابيب EDTA 4مل (100 أنبوب)', 'EDTA Test Tubes 4ml', 'edta-tubes-4ml',
   'أنابيب تحليل الدم بمادة EDTA — للاستخدام المختبري',
   85, null, 600, 'Vacuette', true, false,
   'https://images.unsplash.com/photo-1587491439149-bd2ff295d450?w=400',
   (select id from cats where slug='laboratory')),

  ('VCR-2-0', 'خيط جراحي Vicryl 2-0', 'Vicryl Suture 2-0', 'vicryl-2-0',
   'خيط جراحي قابل للامتصاص — مناسب للأنسجة الرخوة',
   320, 400, 80, 'Ethicon', true, true,
   'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=400',
   (select id from cats where slug='surgical')),

  ('MASK-3L-50', 'كمامة جراحية 3 طبقات (50 كمامة)', 'Surgical Mask 3-Layer 50pcs', 'surgical-mask-50',
   'كمامات جراحية BFE ≥99% — معقمة ومعبأة بشكل فردي',
   75, 100, 5000, 'Kimberly', true, false,
   'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
   (select id from cats where slug='ppe')),

  ('CAN-20G', 'كانيولا وريدية 20G', 'IV Cannula 20G', 'cannula-20g',
   'كانيولا وريدية معقمة للاستخدام الواحد مع غطاء واقٍ',
   15, null, 3000, 'B.Braun', true, false,
   'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400',
   (select id from cats where slug='injection')),

  ('GAUZE-5X5', 'شاش جراحي 5×5 سم (100 قطعة)', 'Surgical Gauze 5x5cm', 'surgical-gauze-5x5',
   'شاش جراحي معقم لتضميد الجروح الجراحية',
   60, 80, 900, 'Hartmann', false, false,
   'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400',
   (select id from cats where slug='wound-care'))
on conflict (slug) do nothing;

-- ── كوبون ترحيبي ─────────────────────────────────────────────
insert into coupons (code, discount_type, discount_value, min_order, usage_limit, end_date) values
  ('SUDAN10',  'PERCENTAGE',  10, 200,  1000, now() + interval '1 year'),
  ('WELCOME',  'FIXED_AMOUNT', 50, 300,  500, now() + interval '6 months'),
  ('FREESHIP', 'FREE_SHIPPING', 0, 150, 2000, now() + interval '1 year')
on conflict (code) do nothing;

-- تحقق من النتيجة
select 'categories' as table_name, count(*) from categories
union all
select 'products', count(*) from products
union all
select 'coupons', count(*) from coupons;
