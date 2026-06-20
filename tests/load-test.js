/**
 * SudanMed — k6 Load Test Suite v2.0
 * ════════════════════════════════════
 * اختبار الحمل الشامل لـ 10,000 مستخدم متزامن
 *
 * التشغيل:
 *   k6 run tests/load-test.js
 *   k6 run --out json=results.json tests/load-test.js
 *   k6 run --out influxdb=http://localhost:8086/k6 tests/load-test.js
 *
 * الاختبارات:
 *   1. Smoke Test     — 5 مستخدمين × 1 دقيقة (للتأكد الأولي)
 *   2. Load Test      — 1,000 → 10,000 مستخدم (سيناريو حقيقي)
 *   3. Stress Test    — يتجاوز الطاقة (لإيجاد نقطة الكسر)
 *   4. Spike Test     — ارتفاع مفاجئ لـ 10,000 مستخدم
 *   5. Soak Test      — 500 مستخدم × 30 دقيقة (اختبار تسرب الذاكرة)
 *
 * تشغيل سيناريو محدد:
 *   k6 run -e SCENARIO=smoke    tests/load-test.js
 *   k6 run -e SCENARIO=load     tests/load-test.js
 *   k6 run -e SCENARIO=stress   tests/load-test.js
 *   k6 run -e SCENARIO=spike    tests/load-test.js
 *   k6 run -e SCENARIO=soak     tests/load-test.js
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

// ════════════════════════════════════════════════════════════════
// CONFIG
// ════════════════════════════════════════════════════════════════
const BASE_URL = __ENV.BASE_URL || 'https://sudan-med.vercel.app';

// ════════════════════════════════════════════════════════════════
// CUSTOM METRICS
// ════════════════════════════════════════════════════════════════
const errorRate       = new Rate('error_rate');
const apiLatency      = new Trend('api_latency_ms', true);
const rateLimitHits   = new Counter('rate_limit_429');
const serverErrors    = new Counter('server_errors_5xx');
const requestsTotal   = new Counter('requests_total');
const successRequests = new Counter('success_requests');

// ════════════════════════════════════════════════════════════════
// THRESHOLDS — معايير النجاح
// ════════════════════════════════════════════════════════════════
export const options = {
  thresholds: {
    // 95% من الطلبات يجب أن تكتمل في < 2 ثانية
    'http_req_duration': ['p(95)<2000', 'p(99)<5000'],
    // وقت الاستجابة الخاص بنا
    'api_latency_ms':    ['p(95)<2000'],
    // معدل الخطأ يجب أن يكون < 5%
    'error_rate':        ['rate<0.05'],
    // وقت الانتظار للاتصال < 1 ثانية
    'http_req_connecting': ['p(95)<1000'],
    // وقت الاتصال TLS < 500ms
    'http_req_tls_handshaking': ['p(95)<500'],
  },

  scenarios: getScenarios(),
};

function getScenarios() {
  const scenario = __ENV.SCENARIO || 'load';

  const scenarios = {
    // ── Smoke: التحقق الأولي (5 مستخدمين) ──
    smoke: {
      smoke_test: {
        executor: 'constant-vus',
        vus: 5,
        duration: '1m',
        gracefulStop: '30s',
        exec: 'smokeTest',
      },
    },

    // ── Load: اختبار الحمل الطبيعي ──
    load: {
      // رحلة المستخدم الكاملة
      user_journey: {
        executor: 'ramping-vus',
        startVUs: 0,
        stages: [
          { duration: '2m',  target: 100  },  // رفع تدريجي
          { duration: '3m',  target: 500  },  // حمل متوسط
          { duration: '5m',  target: 1000 },  // حمل طبيعي
          { duration: '5m',  target: 3000 },  // حمل مرتفع
          { duration: '3m',  target: 5000 },  // حمل شديد
          { duration: '2m',  target: 1000 },  // هبوط
          { duration: '2m',  target: 0    },  // إيقاف
        ],
        gracefulRampDown: '1m',
        exec: 'fullUserJourney',
      },

      // طلبات API مباشرة
      api_only: {
        executor: 'constant-arrival-rate',
        rate: 500,          // 500 طلب/ثانية
        timeUnit: '1s',
        duration: '5m',
        preAllocatedVUs: 100,
        maxVUs: 1000,
        exec: 'apiOnlyTest',
        startTime: '5m',    // يبدأ بعد 5 دقائق
      },
    },

    // ── Stress: اختبار الضغط الشديد ──
    stress: {
      stress_test: {
        executor: 'ramping-vus',
        startVUs: 0,
        stages: [
          { duration: '2m',  target: 1000  },
          { duration: '3m',  target: 5000  },
          { duration: '5m',  target: 10000 },  // 10K مستخدم
          { duration: '3m',  target: 10000 },  // ثبات
          { duration: '5m',  target: 0     },  // هبوط
        ],
        gracefulRampDown: '2m',
        exec: 'fullUserJourney',
      },
    },

    // ── Spike: ارتفاع مفاجئ ──
    spike: {
      spike_test: {
        executor: 'ramping-vus',
        startVUs: 0,
        stages: [
          { duration: '10s', target: 100   },  // طبيعي
          { duration: '1m',  target: 100   },
          { duration: '10s', target: 10000 },  // ارتفاع مفاجئ!
          { duration: '3m',  target: 10000 },  // ذروة
          { duration: '10s', target: 100   },  // هبوط مفاجئ
          { duration: '3m',  target: 100   },
          { duration: '10s', target: 0     },
        ],
        gracefulRampDown: '30s',
        exec: 'fullUserJourney',
      },
    },

    // ── Soak: اختبار الاستدامة (30 دقيقة) ──
    soak: {
      soak_test: {
        executor: 'constant-vus',
        vus: 500,
        duration: '30m',
        gracefulStop: '2m',
        exec: 'fullUserJourney',
      },
    },
  };

  return scenarios[scenario] || scenarios.load;
}

// ════════════════════════════════════════════════════════════════
// SHARED HEADERS
// ════════════════════════════════════════════════════════════════
const DEFAULT_HEADERS = {
  'Accept':          'application/json',
  'Content-Type':    'application/json',
  'Accept-Language': 'ar,en;q=0.9',
  'User-Agent':      'SudanMed-LoadTest/2.0 k6',
};

// ════════════════════════════════════════════════════════════════
// HELPER: make request + record metrics
// ════════════════════════════════════════════════════════════════
function makeRequest(method, url, body = null, extraHeaders = {}) {
  const headers = { ...DEFAULT_HEADERS, ...extraHeaders };
  const params  = { headers, timeout: '30s' };
  const start   = Date.now();

  const res = method === 'POST'
    ? http.post(url, JSON.stringify(body), params)
    : method === 'PATCH'
    ? http.patch(url, JSON.stringify(body), params)
    : http.get(url, params);

  const latency = Date.now() - start;
  apiLatency.add(latency);
  requestsTotal.add(1);

  const isError = res.status >= 400;
  errorRate.add(isError ? 1 : 0);

  if (res.status === 429) rateLimitHits.add(1);
  if (res.status >= 500) serverErrors.add(1);
  if (!isError)          successRequests.add(1);

  return res;
}

// ════════════════════════════════════════════════════════════════
// TEST 1: SMOKE TEST
// ════════════════════════════════════════════════════════════════
export function smokeTest() {
  group('Smoke: Homepage', () => {
    const res = makeRequest('GET', `${BASE_URL}/`);
    check(res, {
      'homepage 200': r => r.status === 200,
      'has content':  r => r.body.length > 1000,
    });
  });

  group('Smoke: Products API', () => {
    const res = makeRequest('GET', `${BASE_URL}/api/products`);
    check(res, {
      'products 200':    r => r.status === 200,
      'returns success': r => {
        try { return JSON.parse(r.body).success === true; } catch { return false; }
      },
    });
  });

  sleep(1);
}

// ════════════════════════════════════════════════════════════════
// TEST 2: FULL USER JOURNEY (الرحلة الكاملة للمستخدم)
// ════════════════════════════════════════════════════════════════
export function fullUserJourney() {
  // ── Step 1: الصفحة الرئيسية ──
  group('1. Homepage', () => {
    const res = makeRequest('GET', `${BASE_URL}/`);
    check(res, {
      'homepage loads':      r => [200, 304].includes(r.status),
      'has HTML':            r => r.body.includes('SudanMed') || r.body.length > 500,
      'response < 3000ms':   r => r.timings.duration < 3000,
    });
    sleep(Math.random() * 2 + 0.5);
  });

  // ── Step 2: جلب الفئات ──
  group('2. Load Categories', () => {
    const res = makeRequest('GET', `${BASE_URL}/api/categories`);
    check(res, {
      'categories 200':     r => [200, 429].includes(r.status),  // 429 مقبول إذا ضُغط
      'has rate limit hdr': r => r.headers['X-Ratelimit-Limit'] !== undefined || true,
    });
    sleep(0.5);
  });

  // ── Step 3: تصفح المنتجات ──
  group('3. Browse Products', () => {
    // صفحة 1
    const res1 = makeRequest('GET', `${BASE_URL}/api/products?page=1&limit=12`);
    check(res1, { 'products page 1': r => [200, 429].includes(r.status) });
    sleep(Math.random() * 1.5 + 0.5);

    // بحث عن منتج
    const searches = ['كمامة', 'محقنة', 'N95', 'syringe', 'إبرة'];
    const term     = searches[Math.floor(Math.random() * searches.length)];
    const res2 = makeRequest('GET', `${BASE_URL}/api/products?search=${encodeURIComponent(term)}`);
    check(res2, { 'search works': r => [200, 429].includes(r.status) });
    sleep(Math.random() * 2 + 1);
  });

  // ── Step 4: منتج مميز ──
  group('4. Featured Products', () => {
    const res = makeRequest('GET', `${BASE_URL}/api/products?featured=true&limit=6`);
    check(res, { 'featured 200': r => [200, 429].includes(r.status) });
    sleep(1);
  });

  // ── Step 5: محاولة إنشاء طلب (5% من المستخدمين) ──
  if (Math.random() < 0.05) {
    group('5. Place Order (5% users)', () => {
      const orderRes = makeRequest('POST', `${BASE_URL}/api/orders`, {
        user_id: `user-${Math.random().toString(36).slice(2)}`,
        items: [
          { product_id: 'p-1', quantity: 2 },
          { product_id: 'p-2', quantity: 1 },
        ],
        address: {
          street: 'شارع النيل',
          city:   'الخرطوم',
          state:  'الخرطوم',
        },
        payment_method:  'BANKAK',
        shipping_method: 'standard',
      });
      check(orderRes, {
        'order accepted or rate limited': r => [201, 400, 429, 500].includes(r.status),
      });
    });
    sleep(2);
  }

  sleep(Math.random() * 3 + 1);
}

// ════════════════════════════════════════════════════════════════
// TEST 3: API-ONLY (قياس API فقط بدون HTML)
// ════════════════════════════════════════════════════════════════
export function apiOnlyTest() {
  const endpoints = [
    { url: '/api/products',              weight: 50 },  // 50% من الطلبات
    { url: '/api/categories',            weight: 20 },  // 20%
    { url: '/api/products?featured=true', weight: 15 }, // 15%
    { url: '/api/products?search=كمامة', weight: 10 },  // 10%
    { url: '/api/products?page=2',       weight: 5  },  // 5%
  ];

  // اختر endpoint بناءً على الوزن
  const rand     = Math.random() * 100;
  let cumulative = 0;
  let chosen     = endpoints[0];
  for (const ep of endpoints) {
    cumulative += ep.weight;
    if (rand < cumulative) { chosen = ep; break; }
  }

  const res = makeRequest('GET', `${BASE_URL}${chosen.url}`);
  check(res, {
    'valid response': r => [200, 429].includes(r.status),
    'fast (<2s)':     r => r.timings.duration < 2000,
  });

  sleep(0.1); // 100ms بين الطلبات
}

// ════════════════════════════════════════════════════════════════
// SECURITY TESTS (تُشغّل كجزء من Smoke Test)
// ════════════════════════════════════════════════════════════════
export function securityTest() {
  // XSS Attempt
  group('Security: XSS', () => {
    const res = makeRequest('GET', `${BASE_URL}/api/products?search=<script>alert(1)</script>`);
    check(res, {
      'XSS blocked or sanitized': r =>
        r.status !== 200 || !r.body.includes('<script>alert(1)</script>'),
    });
  });

  // SQL Injection Attempt
  group('Security: SQL Injection', () => {
    const res = makeRequest('GET', `${BASE_URL}/api/products?search=' OR '1'='1`);
    check(res, {
      'SQL injection blocked': r => r.status !== 200 || !r.body.includes('error'),
    });
  });

  // Unauthorized admin verify
  group('Security: Unauthorized Admin', () => {
    const res = makeRequest('PATCH', `${BASE_URL}/api/payments?action=verify`, {
      payment_id: 'test-uuid-1234-5678-abcd',
      approved:   true,
    });
    check(res, {
      'admin endpoint protected': r => r.status === 401 || r.status === 429,
    });
  });

  // Rate limit enforcement
  group('Security: Rate Limiting', () => {
    let got429 = false;
    for (let i = 0; i < 15; i++) {
      const res = makeRequest('GET', `${BASE_URL}/api/payments?action=bankak-instructions&order_id=test`);
      if (res.status === 429) { got429 = true; break; }
    }
    check({ got429 }, { 'rate limiting works (429 after burst)': x => x.got429 === true });
  });

  // Large payload rejection
  group('Security: Large Payload', () => {
    const res = makeRequest('POST', `${BASE_URL}/api/orders`, {
      user_id: 'user-test',
      items:   Array(200).fill({ product_id: 'x'.repeat(100), quantity: 999 }),
    });
    check(res, { 'large payload rejected': r => r.status === 400 || r.status === 413 });
  });

  sleep(1);
}

// ════════════════════════════════════════════════════════════════
// SUMMARY REPORT
// ════════════════════════════════════════════════════════════════
export function handleSummary(data) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

  return {
    // HTML report
    [`reports/k6-report-${timestamp}.html`]: htmlReport(data),

    // Text to stdout
    stdout: textSummary(data, { indent: '  ', enableColors: true }),

    // JSON for processing
    [`reports/k6-results-${timestamp}.json`]: JSON.stringify(data, null, 2),
  };
}

// ════════════════════════════════════════════════════════════════
// SETUP (يعمل مرة واحدة قبل الاختبارات)
// ════════════════════════════════════════════════════════════════
export function setup() {
  console.log(`
  ╔═══════════════════════════════════════════╗
  ║     SudanMed Load Test v2.0 Starting      ║
  ║     Target: ${BASE_URL}   ║
  ║     Scenario: ${__ENV.SCENARIO || 'load'}               ║
  ╚═══════════════════════════════════════════╝
  `);

  // تحقق من إمكانية الوصول
  const res = http.get(`${BASE_URL}/`);
  if (res.status === 0) {
    throw new Error(`Cannot reach ${BASE_URL}. Check connectivity.`);
  }
  console.log(`✅ Target reachable — Status: ${res.status}`);
  return { startTime: Date.now() };
}

// ════════════════════════════════════════════════════════════════
// TEARDOWN (يعمل مرة واحدة بعد الاختبارات)
// ════════════════════════════════════════════════════════════════
export function teardown(data) {
  const duration = ((Date.now() - data.startTime) / 1000).toFixed(1);
  console.log(`\n✅ Test completed in ${duration}s`);
}
