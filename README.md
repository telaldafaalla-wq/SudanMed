# 🏥 SudanMed — منصة التجارة الإلكترونية الطبية

منصة تجارة إلكترونية متكاملة للمستلزمات الطبية في السودان.

## Stack التقني

| الطبقة | التقنية |
|--------|---------|
| Frontend | Next.js 14 + TypeScript + Tailwind |
| Mobile | Expo + React Native + NativeWind |
| Backend | Express + TypeScript + Prisma |
| Database | PostgreSQL (Railway) + Redis (Upstash) |
| Hosting | Vercel + Railway |

## البدء السريع

```bash
# 1. استنساخ المشروع
git clone https://github.com/sudanmed/sudanmed-ecommerce.git
cd sudanmed-ecommerce

# 2. الإعداد التلقائي
bash scripts/setup.sh

# 3. تعديل .env
cp .env.example .env
# أضف DATABASE_URL وباقي المتغيرات

# 4. إعداد قاعدة البيانات
pnpm db:migrate
pnpm db:seed

# 5. تشغيل المشروع
pnpm dev
```

## هيكل المشروع

```
sudanmed-ecommerce/
├── apps/
│   ├── web/          # Next.js 14 — الموقع
│   └── mobile/       # Expo — التطبيق
├── services/
│   └── api/          # Express API
├── packages/
│   ├── shared/       # Types مشتركة
│   ├── ui/           # Components مشتركة
│   └── config/       # إعدادات مشتركة
├── database/         # Prisma Schema + Seeds
└── scripts/          # سكريبتات مساعدة
```

## المراحل

- [x] المرحلة 1: إعداد البيئة
- [ ] المرحلة 2: قاعدة البيانات
- [ ] المرحلة 3: API Backend
- [ ] المرحلة 4: Frontend Web
- [ ] المرحلة 5: Mobile App
- [ ] المرحلة 6: أنظمة الدفع
- [ ] المرحلة 7: التوصيل والإثبات
- [ ] المرحلة 8: نظام الولاء
- [ ] المرحلة 9: التسويق والتقارير
- [ ] المرحلة 10: النشر والإطلاق

## الأمان

- لا ترفع `.env` إلى GitHub أبداً
- لا تشارك API keys أو tokens في أي مكان
- راجع `PROJECT_INSTRUCTIONS.md` للبروتوكولات الكاملة
