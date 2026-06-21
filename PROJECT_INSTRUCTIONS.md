# PROJECT INSTRUCTIONS v3.0 — SudanMed (ZERO TOLERANCE)

> **آخر تحديث:** 20 يونيو 2026 | المرحلة: MVP v2 | التقدم: 75%

---

## ⚠️ قوانين حمراء — خرق واحد = إيقاف فوري

| # | القانون |
|---|---------|
| 1 | **لا تحذف محتوى أبداً** — فقط أضف أو عدّل |
| 2 | **لا تُخمّن** — إذا لم تكن متأكداً 100% قُل "لا أعرف" |
| 3 | **لا تقول "تم"** بدون دليل مادي (commit hash + رابط) |
| 4 | **لا تُكمل إذا فشل git push** — قُل "فشل" وتوقف |
| 5 | **التطبيق يبقى شغالاً** بعد كل تعديل |
| 6 | **لا API keys في localStorage** — sessionStorage فقط |
| 7 | **RATE LIMITING إلزامي** على كل endpoint |
| 8 | **Server-side Pricing فقط** — لا ثقة في أسعار العميل |

---

## 🏗️ معلومات المشروع

| البند | القيمة |
|-------|--------|
| **الاسم** | SudanMed منصة المستلزمات الطبية |
| **الموقع** | https://sudan-med.vercel.app |
| **Admin** | https://sudan-med.vercel.app/admin |
| **GitHub** | telaldafaalla-wq/SudanMed (main) |
| **Stack** | Vanilla HTML/JS + Vercel Serverless + Supabase |
| **Supabase** | digfrefpowwigahzogko.supabase.co |
| **Vercel Project** | prj_4mT4pfilsfulkLuGncB4ssk7oHtc |
| **Vercel Team** | team_JinWjvyeFgvlCQU5CNHxZchy |

---

## 📁 هيكل الملفات الكامل

```
SudanMed/
├── index.html              ✅ Frontend كامل (RTL + عربي + Fallback Data)
├── admin.html              ✅ Admin Panel (Dashboard + Orders + Products + Payments)
├── vercel.json             ✅ Routes + Security Headers
├── PROJECT_INSTRUCTIONS.md ✅ هذا الملف
│
├── api/
│   ├── _middleware.js      ✅ Security (Rate Limit + Headers + Sanitize)
│   ├── rate-limit.js       ✅ Sliding Window (KV + in-memory fallback)
│   ├── auth.js             ✅ Supabase Auth (register/login/refresh)
│   ├── products.js         ✅ Secured + Paginated + Search
│   ├── categories.js       ✅ Secured + Cache 5 دقائق
│   ├── orders.js           ✅ Server-side Pricing + Full Validation
│   └── payments.js         ✅ Bankak + Admin Auth
│
├── database/
│   └── schema.sql          ✅ 17 جدول + RLS + Indexes + 13 منتج
│
└── tests/
    ├── load-test.js        ✅ k6 (Smoke/Load/Stress/Spike/Soak 10K users)
    └── SECURITY_AUDIT_REPORT.md ✅ 8 CVEs
```

---

## PROTOCOL 1: التحقق الإلزامي

```
🔴 ممنوع: "تم" / "ناجح" / "يعمل" / "يجب أن يعمل"
🟢 إلزامي: "الناتج الفعلي: [لصق كامل]"
```

قبل كل "تم" يجب:
- ناتج الأمر في terminal (نسخ/لصق كامل)
- git: commit hash + رابط GitHub المباشر
- API: ناتج curl/fetch كاملاً
- ملف: حجمه + عدد أسطره

---

## PROTOCOL 2: git push صارم (8 خطوات)

```bash
□ 1. git status              → لصق الناتج
□ 2. git add [ملفات]         → لصق الناتج
□ 3. git diff --cached --stat → لصق الناتج
□ 4. git commit -m "[رسالة]" → لصق commit hash
□ 5. git log --oneline -3    → لصق الناتج
□ 6. git push                → لصق الناتج كاملاً
□ 7. git ls-remote origin main → لصق hash الـ remote
□ 8. مقارنة local == remote  → ✅ MATCH أو ❌ STOP
```

---

## PROTOCOL 3: التعامل مع الأخطاء

```
❌ STOP: [رمز الخطأ]
الأمر:   [الأمر الذي نفّذته]
الخطأ:   [نص الخطأ كاملاً]
السبب:   [تحليلك]
الحل:    [اقتراحك]
```

---

## PROTOCOL 4: صفر تضليل

```
🔴 ممنوع: "أعتقد" / "ربما" / "يبدو" / "من المفترض"
🟢 إلزامي: "الناتج الفعلي: [لصق]"
```

---

## PROTOCOL 5: مرحلة واحدة فقط

```
ممنوع: تنفيذ أكثر من مرحلة في رسالة واحدة
إلزامي: نهاية المرحلة = تحقق + "هل أنتقل للتالية؟"
```

---

## PROTOCOL 6: Rate Limiting (إلزامي على كل endpoint)

| Endpoint | الحد / دقيقة / IP |
|----------|------------------|
| `/api/products` | 60 |
| `/api/categories` | 60 |
| `/api/orders` | 20 |
| `/api/payments` | 10 |
| `/api/auth` | 5 |
| Global | 200 |

**Response عند التجاوز:** `429 Too Many Requests` + `Retry-After` header

---

## PROTOCOL 7: الأمان (OWASP Top 10)

| المتطلب | الحالة |
|---------|--------|
| Rate Limiting | ✅ api/rate-limit.js |
| Input Sanitization | ✅ sanitizeString() |
| SQL Injection | ✅ Supabase Parameterized |
| XSS Prevention | ✅ sanitizeString() |
| CORS Restricted | ✅ whitelist |
| Security Headers | ✅ X-Frame, CSP, HSTS |
| Safe Errors | ✅ safeError() |
| Admin Auth | ✅ X-Admin-Key |
| Server-side Pricing | ✅ orders.js |
| JWT Storage | ✅ sessionStorage |

---

## PROTOCOL 8: SESSION_LOG إلزامي

في نهاية كل جلسة:
- `SESSION_LOG.md` في root الـ repo
- يحتوي: تاريخ + منجزات + commits + المتبقي

---

## ✅ المنجز حتى الآن

- [x] Frontend كامل (12 صفحة، RTL، Fallback Data)
- [x] Admin Panel كامل (Orders/Products/Payments/Reports)
- [x] 7 APIs مؤمّنة (Rate Limit + Sanitize + Auth)
- [x] Schema 17 جدول + RLS + Indexes + Seed
- [x] k6 Load Test (10K concurrent users)
- [x] Security Audit (8 CVEs محللة ومُصلحة)
- [x] Rate Limiting Engine (KV + in-memory)
- [x] Supabase Auth Integration

---

## ❌ المتبقي (بالأولوية)

### P1 — عاجل جداً:
- [ ] **تشغيل database/schema.sql في Supabase SQL Editor**
- [ ] **تغيير Supabase Anon Key** (مسرّب في GitHub — غيّره فوراً)
- [ ] **تغيير GitHub Token** (مسرّب في SESSION_LOG)
- [ ] إعداد Environment Variables في Vercel

### P2 — عاجل:
- [ ] ربط Supabase Auth بالـ Frontend (استبدال Demo Login)
- [ ] Cloudinary — رفع صور المنتجات
- [ ] SendGrid — إيميلات تأكيد الطلبات
- [ ] PWA — Service Worker + manifest.json

### P3 — لاحقاً:
- [ ] Firebase FCM — Push Notifications
- [ ] Stripe — بطاقة ائتمانية
- [ ] SEO — sitemap.xml + robots.txt + meta tags
- [ ] Algolia — بحث متقدم
- [ ] تطبيق موبايل React Native

---

## 🔑 Environment Variables المطلوبة في Vercel

```env
SUPABASE_URL=https://digfrefpowwigahzogko.supabase.co
SUPABASE_ANON_KEY=[جديد بعد التغيير]
ADMIN_API_KEY=[32 حرف عشوائي — أنشئه الآن]
ALLOWED_ORIGINS=https://sudan-med.vercel.app
BANKAK_ACCOUNT=+249912345678
NODE_ENV=production
```

لإنشاء ADMIN_API_KEY:
```bash
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

---

## 🚀 خطوات تشغيل Supabase (الأهم الآن)

```
1. افتح: https://supabase.com/dashboard/project/digfrefpowwigahzogko/sql
2. اضغط "New Query"
3. انسخ كامل محتوى database/schema.sql
4. اضغط "Run"
5. النتيجة المتوقعة:
   categories | 6
   products   | 13
   coupons    | 5
   users      | 2
```

---

## 📊 التقدم الكلي: 75%

```
إعداد البيئة      ████████████████ 100%
قاعدة البيانات    ██████████████░░  90%  (تحتاج تشغيل SQL)
API Backend       ████████████████  95%  (يحتاج Cloudinary)
Frontend Web      █████████████░░░  85%  (يحتاج Supabase Auth)
أنظمة الدفع       ██████████░░░░░░  60%  (Bankak ✅ | Stripe ❌)
الأمان            ████████████████  90%  (OWASP ✅ | RLS ✅)
التوصيل           ████████░░░░░░░░  50%  (Schema ✅ | OTP ❌)
نظام الولاء       ██████░░░░░░░░░░  40%  (Schema ✅ | API ❌)
النشر والإطلاق    ████████████░░░░  75%  (Vercel ✅ | Domain ❌)
```
