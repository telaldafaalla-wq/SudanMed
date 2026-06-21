-- ══════════════════════════════════════════════════════════
-- SudanMed Database Schema v3.1 — PRODUCTION READY
-- شغّل هذا في: supabase.com/dashboard/project/digfrefpowwigahzogko/sql
-- ══════════════════════════════════════════════════════════

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- ══════════════════ TABLES ══════════════════

-- 1. Users
create table if not exists public.users (
  id              uuid         primary key default uuid_generate_v4(),
  email           text         unique,
  phone           text         unique,
  first_name      text         not null default '',
  last_name       text         not null default '',
  avatar          text,
  role            text         not null default 'CUSTOMER'
                               check (role in ('SUPER_ADMIN','ADMIN','VENDOR','CUSTOMER','SUPPORT_AGENT')),
  status          text         not null default 'ACTIVE'
                               check (status in ('ACTIVE','INACTIVE','SUSPENDED','PENDING_VERIFICATION')),
  email_verified  boolean      default false,
  phone_verified  boolean      default false,
  loyalty_points  int          default 0,
  loyalty_tier    text         default 'BRONZE'
                               check (loyalty_tier in ('BRONZE','SILVER','GOLD','PLATINUM')),
  last_login_at   timestamptz,
  created_at      timestamptz  default now(),
  updated_at      timestamptz  default now()
);

-- 2. Addresses
create table if not exists public.addresses (
  id          uuid        primary key default uuid_generate_v4(),
  user_id     uuid        not null references public.users(id) on delete cascade,
  label       text        not null default 'المنزل',
  street      text        not null,
  building    text,
  city        text        not null,
  state       text        not null default 'الخرطوم',
  zip_code    text,
  latitude    float8,
  longitude   float8,
  is_default  boolean     default false,
  created_at  timestamptz default now()
);

-- 3. Categories
create table if not exists public.categories (
  id          uuid    primary key default uuid_generate_v4(),
  name_ar     text    not null,
  name_en     text    not null,
  slug        text    unique not null,
  description text,
  icon        text    default '🏥',
  image_url   text,
  parent_id   uuid    references public.categories(id),
  sort_order  int     default 0,
  is_active   boolean default true,
  created_at  timestamptz default now()
);

-- 4. Products
create table if not exists public.products (
  id                  uuid          primary key default uuid_generate_v4(),
  sku                 text          unique not null,
  name_ar             text          not null,
  name_en             text          not null,
  slug                text          unique not null,
  description         text,
  short_desc          text,
  price               numeric(10,2) not null check (price >= 0),
  compare_price       numeric(10,2),
  cost_price          numeric(10,2),
  stock               int           default 0 check (stock >= 0),
  low_stock_threshold int           default 10,
  track_stock         boolean       default true,
  brand               text,
  manufacturer        text,
  origin              text,
  expiry_date         date,
  batch_number        text,
  fda_approved        boolean       default false,
  ce_marked           boolean       default false,
  sfd_approved        boolean       default false,
  meta_title          text,
  meta_desc           text,
  keywords            text[],
  status              text          default 'ACTIVE'
                                    check (status in ('DRAFT','ACTIVE','OUT_OF_STOCK','DISCONTINUED','PENDING_APPROVAL')),
  featured            boolean       default false,
  category_id         uuid          not null references public.categories(id),
  image_url           text,
  rating_avg          numeric(3,2)  default 0,
  rating_count        int           default 0,
  sold_count          int           default 0,
  created_at          timestamptz   default now(),
  updated_at          timestamptz   default now()
);

-- 5. Product Images
create table if not exists public.product_images (
  id          uuid    primary key default uuid_generate_v4(),
  product_id  uuid    not null references public.products(id) on delete cascade,
  url         text    not null,
  alt         text,
  sort_order  int     default 0,
  is_primary  boolean default false,
  created_at  timestamptz default now()
);

-- 6. Cart Items
create table if not exists public.cart_items (
  id          uuid    primary key default uuid_generate_v4(),
  user_id     uuid    not null references public.users(id) on delete cascade,
  product_id  uuid    not null references public.products(id) on delete cascade,
  quantity    int     not null default 1 check (quantity > 0),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  unique (user_id, product_id)
);

-- 7. Orders
create table if not exists public.orders (
  id              uuid          primary key default uuid_generate_v4(),
  order_number    text          unique not null,
  user_id         uuid          references public.users(id),
  address         jsonb         not null default '{}',
  subtotal        numeric(10,2) not null default 0,
  shipping_cost   numeric(10,2) not null default 0,
  discount_amount numeric(10,2) not null default 0,
  tax_amount      numeric(10,2) not null default 0,
  total           numeric(10,2) not null default 0,
  status          text          not null default 'PENDING'
                                check (status in ('PENDING','CONFIRMED','PROCESSING','READY_TO_SHIP',
                                                  'SHIPPED','OUT_FOR_DELIVERY','DELIVERED','CANCELLED','REFUNDED')),
  payment_status  text          not null default 'PENDING'
                                check (payment_status in ('PENDING','PAID','FAILED','REFUNDED','PARTIALLY_REFUNDED')),
  payment_method  text          not null default 'BANKAK',
  shipping_method text          not null default 'standard',
  tracking_number text,
  customer_notes  text,
  internal_notes  text,
  coupon_code     text,
  shipped_at      timestamptz,
  delivered_at    timestamptz,
  cancelled_at    timestamptz,
  created_at      timestamptz   default now(),
  updated_at      timestamptz   default now()
);

-- 8. Order Items
create table if not exists public.order_items (
  id           uuid          primary key default uuid_generate_v4(),
  order_id     uuid          not null references public.orders(id) on delete cascade,
  product_id   uuid          references public.products(id),
  product_name text          not null,
  sku          text          not null,
  price        numeric(10,2) not null,
  quantity     int           not null check (quantity > 0),
  total        numeric(10,2) not null,
  created_at   timestamptz   default now()
);

-- 9. Payments
create table if not exists public.payments (
  id              uuid          primary key default uuid_generate_v4(),
  order_id        uuid          not null references public.orders(id) on delete cascade,
  method          text          not null default 'BANKAK'
                                check (method in ('BANKAK','STRIPE','PAYPAL','CASH_ON_DELIVERY','BANK_TRANSFER','WALLET')),
  amount          numeric(10,2) not null,
  currency        text          not null default 'SDG',
  status          text          not null default 'PENDING'
                                check (status in ('PENDING','PAID','FAILED','REFUNDED')),
  bankak_ref      text,
  bankak_account  text,
  stripe_ref      text,
  paypal_ref      text,
  receipt_url     text,
  verified_at     timestamptz,
  verified_by     text,
  metadata        jsonb,
  created_at      timestamptz   default now(),
  updated_at      timestamptz   default now()
);

-- 10. Loyalty Points
create table if not exists public.loyalty_points (
  id          uuid    primary key default uuid_generate_v4(),
  user_id     uuid    not null references public.users(id) on delete cascade,
  points      int     not null,
  type        text    not null check (type in ('EARNED','REDEEMED','BONUS','REFERRAL','EXPIRED')),
  description text,
  order_id    uuid    references public.orders(id),
  expires_at  timestamptz,
  created_at  timestamptz default now()
);

-- 11. Coupons
create table if not exists public.coupons (
  id              uuid          primary key default uuid_generate_v4(),
  code            text          unique not null,
  description     text,
  discount_type   text          not null check (discount_type in ('PERCENTAGE','FIXED_AMOUNT','FREE_SHIPPING')),
  discount_value  numeric(10,2) not null,
  min_order       numeric(10,2),
  max_discount    numeric(10,2),
  usage_limit     int,
  usage_count     int           default 0,
  per_user_limit  int           default 1,
  start_date      timestamptz   not null default now(),
  end_date        timestamptz,
  is_active       boolean       default true,
  created_at      timestamptz   default now()
);

-- 12. Support Tickets
create table if not exists public.support_tickets (
  id              uuid    primary key default uuid_generate_v4(),
  ticket_number   text    unique not null,
  user_id         uuid    references public.users(id),
  subject         text    not null,
  category        text    not null check (category in ('ORDER_ISSUE','PAYMENT_ISSUE','PRODUCT_INQUIRY',
                                                        'SHIPPING_ISSUE','RETURN_REQUEST','ACCOUNT_ISSUE','GENERAL')),
  priority        text    not null default 'MEDIUM' check (priority in ('LOW','MEDIUM','HIGH','URGENT')),
  status          text    not null default 'OPEN' check (status in ('OPEN','IN_PROGRESS','WAITING_CUSTOMER','RESOLVED','CLOSED')),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  resolved_at     timestamptz
);

-- 13. Support Messages
create table if not exists public.support_messages (
  id          uuid    primary key default uuid_generate_v4(),
  ticket_id   uuid    not null references public.support_tickets(id) on delete cascade,
  sender_id   uuid    references public.users(id),
  is_staff    boolean default false,
  body        text    not null,
  attachments text[],
  created_at  timestamptz default now()
);

-- 14. Notifications
create table if not exists public.notifications (
  id          uuid    primary key default uuid_generate_v4(),
  user_id     uuid    not null references public.users(id) on delete cascade,
  type        text    not null check (type in ('ORDER_UPDATE','PAYMENT_CONFIRMED','SHIPPING_UPDATE',
                                               'PROMOTION','STOCK_ALERT','SYSTEM','SUPPORT_REPLY')),
  title       text    not null,
  body        text    not null,
  data        jsonb,
  read        boolean default false,
  read_at     timestamptz,
  created_at  timestamptz default now()
);

-- 15. Reviews
create table if not exists public.reviews (
  id          uuid    primary key default uuid_generate_v4(),
  user_id     uuid    not null references public.users(id) on delete cascade,
  product_id  uuid    not null references public.products(id) on delete cascade,
  order_id    uuid    references public.orders(id),
  rating      int     not null check (rating between 1 and 5),
  title       text,
  body        text,
  images      text[],
  verified    boolean default false,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  unique (user_id, product_id)
);

-- 16. Delivery Proofs
create table if not exists public.delivery_proofs (
  id          uuid    primary key default uuid_generate_v4(),
  order_id    uuid    unique not null references public.orders(id) on delete cascade,
  signature   text,
  photo_url   text,
  otp_code    text,
  gps_lat     float8,
  gps_lng     float8,
  notes       text,
  created_at  timestamptz default now()
);

-- 17. Order Status History
create table if not exists public.order_status_history (
  id          uuid    primary key default uuid_generate_v4(),
  order_id    uuid    not null references public.orders(id) on delete cascade,
  status      text    not null,
  notes       text,
  changed_by  text,
  created_at  timestamptz default now()
);

-- ══════════════════ INDEXES ══════════════════

create index if not exists idx_products_category  on public.products(category_id);
create index if not exists idx_products_status    on public.products(status);
create index if not exists idx_products_featured  on public.products(featured) where featured = true;
create index if not exists idx_products_slug      on public.products(slug);
create index if not exists idx_products_sku       on public.products(sku);
create index if not exists idx_products_trgm_ar   on public.products using gin (name_ar gin_trgm_ops);
create index if not exists idx_products_trgm_en   on public.products using gin (name_en gin_trgm_ops);
create index if not exists idx_orders_user        on public.orders(user_id);
create index if not exists idx_orders_status      on public.orders(status);
create index if not exists idx_orders_payment     on public.orders(payment_status);
create index if not exists idx_orders_created     on public.orders(created_at desc);
create index if not exists idx_payments_order     on public.payments(order_id);
create index if not exists idx_payments_status    on public.payments(status);
create index if not exists idx_cart_user          on public.cart_items(user_id);
create index if not exists idx_loyalty_user       on public.loyalty_points(user_id);
create index if not exists idx_notif_user         on public.notifications(user_id, read);

-- ══════════════════ TRIGGERS ══════════════════

create or replace function public.handle_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create or replace trigger trg_products_updated
  before update on public.products
  for each row execute function public.handle_updated_at();

create or replace trigger trg_orders_updated
  before update on public.orders
  for each row execute function public.handle_updated_at();

create or replace trigger trg_payments_updated
  before update on public.payments
  for each row execute function public.handle_updated_at();

-- ══════════════════ ROW LEVEL SECURITY ══════════════════

alter table public.users              enable row level security;
alter table public.addresses          enable row level security;
alter table public.cart_items         enable row level security;
alter table public.orders             enable row level security;
alter table public.order_items        enable row level security;
alter table public.payments           enable row level security;
alter table public.loyalty_points     enable row level security;
alter table public.notifications      enable row level security;
alter table public.reviews            enable row level security;
alter table public.support_tickets    enable row level security;
alter table public.support_messages   enable row level security;
alter table public.products           enable row level security;
alter table public.categories         enable row level security;
alter table public.product_images     enable row level security;
alter table public.coupons            enable row level security;
alter table public.delivery_proofs    enable row level security;
alter table public.order_status_history enable row level security;

-- Public read policies
create policy "public_read_products"   on public.products   for select using (status = 'ACTIVE');
create policy "public_read_categories" on public.categories for select using (is_active = true);
create policy "public_read_images"     on public.product_images for select using (true);
create policy "public_read_coupons"    on public.coupons    for select using (is_active = true);

-- User policies
create policy "users_own"        on public.users        for all using (auth.uid() = id);
create policy "addresses_own"    on public.addresses    for all using (auth.uid() = user_id);
create policy "cart_own"         on public.cart_items   for all using (auth.uid() = user_id);
create policy "loyalty_own"      on public.loyalty_points for select using (auth.uid() = user_id);
create policy "notif_own"        on public.notifications  for all using (auth.uid() = user_id);
create policy "reviews_read"     on public.reviews      for select using (true);
create policy "reviews_write"    on public.reviews      for insert with check (auth.uid() = user_id);
create policy "tickets_own"      on public.support_tickets for all using (auth.uid() = user_id);
create policy "messages_read"    on public.support_messages for select using (
  exists (select 1 from public.support_tickets where id = ticket_id and user_id = auth.uid()));
create policy "orders_own"       on public.orders       for select using (auth.uid() = user_id);
create policy "orders_create"    on public.orders       for insert with check (true);
create policy "order_items_read" on public.order_items  for select using (
  exists (select 1 from public.orders where id = order_id and user_id = auth.uid()));
create policy "payments_own"     on public.payments     for select using (
  exists (select 1 from public.orders where id = order_id and user_id = auth.uid()));
create policy "payments_create"  on public.payments     for insert with check (true);
create policy "proofs_own"       on public.delivery_proofs for select using (
  exists (select 1 from public.orders where id = order_id and user_id = auth.uid()));
create policy "history_own"      on public.order_status_history for select using (
  exists (select 1 from public.orders where id = order_id and user_id = auth.uid()));

-- ══════════════════ SEED DATA ══════════════════

-- Categories
insert into public.categories (name_ar, name_en, slug, description, icon, sort_order, is_active) values
  ('مستلزمات الوقاية الشخصية', 'Personal Protective Equipment', 'ppe',           'كمامات وقفازات وأرواب واقية',           '🥼', 1, true),
  ('مستلزمات الحقن والتسريب',  'Injection & Infusion Supplies', 'injection-supplies', 'محاقن وكانيولات وأجهزة IV',          '💉', 2, true),
  ('مستلزمات الجراحة',         'Surgical Supplies',             'surgical-supplies',  'خيوط جراحية وشاش ومشارط',           '🔪', 3, true),
  ('مستلزمات التعقيم',         'Sterilization Supplies',        'sterilization',      'كحول وبيتادين ومعقمات',             '🧴', 4, true),
  ('مستلزمات المختبرات',       'Laboratory Supplies',           'lab-supplies',       'أنابيب وشرائح ومحاليل تشخيصية',    '🧪', 5, true),
  ('مستلزمات العناية بالجروح', 'Wound Care Supplies',           'wound-care',         'ضمادات ورباطات وجبائر',             '🩹', 6, true)
on conflict (slug) do update set name_ar=excluded.name_ar, name_en=excluded.name_en, updated_at=now() where false;

-- Products (via CTE to resolve category IDs)
with cat as (select id, slug from public.categories)
insert into public.products (sku,name_ar,name_en,slug,price,compare_price,stock,brand,manufacturer,origin,ce_marked,sfd_approved,featured,status,category_id,image_url,short_desc)
select p.sku,p.name_ar,p.name_en,p.slug,p.price,p.compare_price,p.stock,p.brand,p.manufacturer,p.origin,p.ce_marked,p.sfd_approved,p.featured,'ACTIVE',cat.id,p.image_url,p.short_desc
from (values
  ('PPE-001','كمامة N95 طبية معتمدة','N95 Medical Mask','n95-mask',                         150.00,200.00,500, '3M','3M USA','USA',              true, true, true,'ppe',
   'https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=400&q=80','كمامة N95 معتمدة FDA وCE — حماية 95%'),
  ('PPE-002','قفازات لاتكس معقمة 50 قطعة','Sterile Latex Gloves 50pc','latex-gloves-50',   95.00,120.00,200, 'Sempermed','Semperit','Austria',   true,false,false,'ppe',
   'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80','قفازات معقمة للجراحة S/M/L/XL'),
  ('INJ-001','محقنة 5 مل مع إبرة 21G','Syringe 5ml 21G','syringe-5ml',                     25.00,null,  2000,'Terumo','Terumo Japan','Japan',     true,false, true,'injection-supplies',
   'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&q=80','محقنة معقمة 5 مل مع إبرة 21G'),
  ('INJ-002','كانيولا وريدية 18G','IV Cannula 18G','iv-cannula-18g',                        45.00, 60.00,1000,'BD','BD Medical','USA',            true, true, true,'injection-supplies',
   'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&q=80','كانيولا وريدية 18G بغطاء مرمّز'),
  ('INJ-003','جهاز تسريب IV كامل','IV Infusion Set','iv-infusion-set',                      30.00,null,  2500,'B.Braun','B.Braun','Germany',      true, true, true,'injection-supplies',
   'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&q=80','جهاز IV معقم مع فلتر وعجلة تحكم'),
  ('SRG-001','خيط جراحي مضفور 2-0','Braided Suture 2-0','suture-2-0',                       280.00,null,  300,'Ethicon','Ethicon J&J','USA',      true, true,false,'surgical-supplies',
   'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80','خيط قابل للامتصاص للجراحات العامة'),
  ('SRG-002','شاش طبي معقم 10×10 سم','Sterile Gauze 10x10cm','gauze-10x10',                 15.00, 20.00,10000,'MedLine','MedLine','USA',         true, true,false,'surgical-supplies',
   'https://images.unsplash.com/photo-1583947581924-860bda6a26df?w=400&q=80','شاش معقم 8 طبقات 10×10 سم'),
  ('STR-001','بيتادين 10% — 500 مل','Povidone Iodine 10% 500ml','betadine-500ml',           120.00,150.00, 800,'Betadine','Mundipharma','Netherlands',false,true, true,'sterilization',
   'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&q=80','محلول بيتادين للتعقيم الجراحي'),
  ('STR-002','كحول إيثيلي 70% — لتر','Ethyl Alcohol 70% 1L','ethanol-70-1l',                85.00,null,  1500,'SudanChem','SudanChem','Sudan',    false,true,false,'sterilization',
   'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400&q=80','كحول 70% للتطهير الطبي'),
  ('LAB-001','أنبوب EDTA 3 مل','EDTA Blood Tube 3ml','edta-tube-3ml',                       18.00, 25.00,5000,'BD Vacutainer','BD','USA',         true,false, true,'lab-supplies',
   'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80','أنبوب تجميع دم EDTA للفحوصات الهيماتولوجية'),
  ('LAB-002','اختبار كوفيد سريع 25 قطعة','COVID Rapid Test 25pc','covid-rapid-test-25',     250.00,350.00, 500,'Abbott','Abbott','USA',           true, true, true,'lab-supplies',
   'https://images.unsplash.com/photo-1605289982774-9a6fef564df8?w=400&q=80','اختبار COVID-19 خلال 15 دقيقة'),
  ('WND-001','ضمادة لاصقة 10×10 سم','Medical Adhesive Bandage 10x10cm','bandage-10x10',      35.00, 45.00,3000,'Hartmann','Hartmann AG','Germany', true, true,false,'wound-care',
   'https://images.unsplash.com/photo-1583947581924-860bda6a26df?w=400&q=80','ضمادة معقمة لامتصاص الإفرازات')
) as p(sku,name_ar,name_en,slug,price,compare_price,stock,brand,manufacturer,origin,ce_marked,sfd_approved,featured,cat_slug,image_url,short_desc)
join cat on cat.slug = p.cat_slug
on conflict (sku) do update set price=excluded.price, stock=excluded.stock, updated_at=now();

-- Coupons
insert into public.coupons (code,description,discount_type,discount_value,min_order,usage_limit,start_date) values
  ('SUDAN10',   'خصم 10% على الطلبات',         'PERCENTAGE',  10.00,100.00,1000,now()),
  ('WELCOME',   'خصم 50 ج.س للعملاء الجدد',    'FIXED_AMOUNT',50.00, 50.00, 500,now()),
  ('FREESHIP',  'شحن مجاني',                    'FREE_SHIPPING', 0.00,50.00, 200,now()),
  ('MEDICAL20', 'خصم 20% للمستشفيات',          'PERCENTAGE',  20.00,500.00, 100,now()),
  ('FIRST5',    'خصم 5% على أول طلب',           'PERCENTAGE',   5.00,  0.00,9999,now())
on conflict (code) do nothing;

-- Admin users
insert into public.users (email,phone,first_name,last_name,role,status,email_verified) values
  ('admin@sudanmed.com',  '+249912000000','مدير','النظام',  'SUPER_ADMIN',   'ACTIVE',true),
  ('support@sudanmed.com','+249912000001','دعم', 'فني',     'SUPPORT_AGENT', 'ACTIVE',true)
on conflict (email) do nothing;

-- ══════════════════ VERIFY ══════════════════
select table_name as "الجدول", count as "السجلات" from (
  select 'categories'::text as table_name, count(*)::bigint as count from public.categories union all
  select 'products',  count(*) from public.products  union all
  select 'coupons',   count(*) from public.coupons   union all
  select 'users',     count(*) from public.users
) t order by table_name;
