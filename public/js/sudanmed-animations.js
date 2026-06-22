/**
 * SudanMed — نظام الأنيميشن الكامل
 * الفنان | SudanMed Animations Engine v1.0
 *
 * يشمل:
 * 1. Marquee Bar (شريط الإشعارات)
 * 2. Medical Particles (جزيئات طبية)
 * 3. Stats Counter (عداد الإحصائيات)
 * 4. Cart Fly Animation (طيران للسلة)
 * 5. Scroll Reveal (ظهور عند التمرير)
 * 6. Page Transitions (انتقالات الصفحة)
 * 7. Background Pattern (خلفية طبية)
 */

(function SudanMedAnimations() {
  'use strict';

  /* ────────────────────────────────────────
     § A — المتغيرات العامة
  ──────────────────────────────────────── */
  const COLORS = {
    red:   '#D21034',
    black: '#000000',
    white: '#FFFFFF',
    green: '#007229',
    redLight:   '#FF1A45',
    greenLight: '#00A33C',
    redDark:   '#9A0B25',
    greenDark: '#004F1C',
  };

  const MEDICAL_SYMBOLS = ['+', '💊', '🩺', '🏥', '💉', '🩹', '⚕️', '🔬', '+', '+'];
  const IS_MOBILE = window.innerWidth < 768;
  const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ────────────────────────────────────────
     § B — شريط الإشعارات المتحرك
  ──────────────────────────────────────── */
  function initMarqueeBar() {
    // حذف الشريط القديم لو موجود
    const existing = document.getElementById('sudanmed-marquee-container');
    if (existing) existing.remove();

    const messages = [
      { text: '🚚 توصيل سريع لجميع ولايات السودان خلال 48 ساعة',   dotClass: 'dot' },
      { text: '✅ أكثر من 500 منتج طبي معتمد من وزارة الصحة',       dotClass: 'dot-green' },
      { text: '📞 خدمة عملاء على مدار الساعة: +249 123 456 789',     dotClass: 'dot' },
      { text: '🏥 أسعار خاصة للمستشفيات والعيادات — تواصل معنا',    dotClass: 'dot-green' },
      { text: '💳 الدفع بنكك، تحويل بنكي، أو كاش عند الاستلام',     dotClass: 'dot' },
      { text: '🔬 مستلزمات مختبرات معتمدة دولياً CE, ISO, FDA',      dotClass: 'dot-green' },
      { text: '🩺 شحن مجاني للطلبات فوق 2000 جنيه سوداني',          dotClass: 'dot' },
      { text: '⚕️ SudanMed — المنصة الطبية الأولى في السودان',       dotClass: 'dot-green' },
    ];

    const bar = document.createElement('div');
    bar.id = 'sudanmed-marquee-container';
    bar.className = 'sudanmed-marquee-bar';
    bar.setAttribute('aria-label', 'إشعارات SudanMed');

    // بناء المحتوى مرتين لحلقة سلسة
    const track = document.createElement('div');
    track.className = 'sudanmed-marquee-track';
    track.id = 'sudanmed-marquee-track';

    const buildItems = () => messages.map(m => {
      const item = document.createElement('span');
      item.className = 'sudanmed-marquee-item';
      item.innerHTML = `
        <span class="dot ${m.dotClass}"></span>
        ${m.text}
        <span class="sudanmed-marquee-sep">|</span>
      `;
      return item;
    });

    // ضاعف لـ loop سلس
    [...buildItems(), ...buildItems()].forEach(el => track.appendChild(el));
    bar.appendChild(track);

    // أدخله قبل أول عنصر في body
    const target = document.body.firstChild;
    document.body.insertBefore(bar, target);

    // Hover: أوقف الحركة
    bar.addEventListener('mouseenter', () => {
      track.style.animationPlayState = 'paused';
    });
    bar.addEventListener('mouseleave', () => {
      track.style.animationPlayState = 'running';
    });
  }

  /* ────────────────────────────────────────
     § C — الجزيئات الطبية المتحركة
  ──────────────────────────────────────── */
  function initMedicalParticles() {
    if (REDUCED_MOTION) return;

    // جد أو اصنع Hero container
    const hero = document.querySelector(
      '[class*="hero"], [class*="Hero"], main > section:first-child, main > div:first-child'
    );
    if (!hero) return;

    hero.style.position = 'relative';
    hero.style.overflow = 'hidden';

    // أزل القديمة
    const old = document.getElementById('sudanmed-particles-container');
    if (old) old.remove();

    const container = document.createElement('div');
    container.id = 'sudanmed-particles-container';
    container.style.cssText = `
      position:absolute; inset:0; pointer-events:none; z-index:0; overflow:hidden;
    `;

    const count = IS_MOBILE ? 12 : 22;

    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'particle-medical';

      const symbol = MEDICAL_SYMBOLS[Math.floor(Math.random() * MEDICAL_SYMBOLS.length)];
      p.textContent = symbol;

      const size     = Math.random() * 18 + 10;
      const x        = Math.random() * 90 + 5;
      const y        = Math.random() * 80 + 5;
      const dur      = (Math.random() * 5 + 4).toFixed(1);
      const delay    = (Math.random() * 4).toFixed(1);
      const isRed    = Math.random() > 0.5;
      const color    = isRed ? COLORS.red : COLORS.green;
      const opacity  = (Math.random() * 0.4 + 0.2).toFixed(2);

      p.style.cssText = `
        left: ${x}%; top: ${y}%;
        font-size: ${size}px;
        --dur: ${dur}s; --delay: ${delay}s;
        animation-duration: ${dur}s;
        animation-delay: ${delay}s;
        color: ${color};
        opacity: ${opacity};
        filter: drop-shadow(0 0 6px ${color}80);
        will-change: transform;
      `;

      container.appendChild(p);
    }

    hero.insertBefore(container, hero.firstChild);
  }

  /* ────────────────────────────────────────
     § D — عداد الإحصائيات
  ──────────────────────────────────────── */
  function initStatsCounter() {
    // ابحث عن عناصر الإحصائيات
    const statContainers = document.querySelectorAll(
      '[class*="stat"], [class*="Stat"], [class*="counter"], [class*="Counter"]'
    );

    if (!statContainers.length) return;

    // تعريف القيم المستهدفة بناءً على النص
    const targets = {
      '500':  { end: 500,  suffix: '+',  label: 'منتج طبي'      },
      '1200': { end: 1200, suffix: '+',  label: 'عميل موثوق'    },
      '1,200':{ end: 1200, suffix: '+',  label: 'عميل موثوق'    },
      '48':   { end: 48,   suffix: 'h',  label: 'توصيل سريع'    },
      '100':  { end: 100,  suffix: '%',  label: 'منتجات معتمدة' },
      '5000': { end: 5000, suffix: '+',  label: 'عميل سعيد'     },
    };

    const animateCount = (el, start, end, suffix, duration) => {
      if (REDUCED_MOTION) { el.textContent = end.toLocaleString('ar') + suffix; return; }

      const startTime = performance.now();
      const update = (currentTime) => {
        const elapsed  = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased    = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
        const current  = Math.floor(start + (end - start) * eased);
        el.textContent = current.toLocaleString('ar') + suffix;
        if (progress < 1) requestAnimationFrame(update);
      };
      requestAnimationFrame(update);
    };

    // Intersection Observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        if (el.dataset.counted === 'true') return;
        el.dataset.counted = 'true';

        // جد الرقم داخل العنصر
        const numEl = el.querySelector('[class*="number"], [class*="Number"], strong, h2, h3, h4, span') || el;
        const rawText = numEl.textContent.replace(/[,،\s]/g, '').replace(/\+|%|h/g, '');
        const num = parseInt(rawText, 10);

        if (!isNaN(num)) {
          let suffix = '';
          if (numEl.textContent.includes('+'))  suffix = '+';
          if (numEl.textContent.includes('%'))  suffix = '%';
          if (numEl.textContent.includes('h'))  suffix = 'h';

          numEl.classList.add('sudanmed-stat-number');
          el.classList.add('sudanmed-stat');
          animateCount(numEl, 0, num, suffix, 1800);
        }

        observer.unobserve(el);
      });
    }, { threshold: 0.3 });

    statContainers.forEach(el => observer.observe(el));

    // أيضاً ابحث عن div يحتوي أرقام كبيرة في الهيرو
    document.querySelectorAll('h2, h3, .text-4xl, .text-5xl, .text-3xl').forEach(el => {
      const text = el.textContent.trim();
      if (/^\d[\d,،]*[+%h]?$/.test(text) && !el.dataset.counted) {
        observer.observe(el.parentElement || el);
      }
    });
  }

  /* ────────────────────────────────────────
     § E — طيران المنتج للسلة
  ──────────────────────────────────────── */
  function initCartFlyAnimation() {
    if (REDUCED_MOTION) return;

    // جد أيقونة السلة في الـ navbar
    const getCartIcon = () =>
      document.querySelector('[href*="cart"], [class*="cart"] svg, [class*="Cart"] svg, a[href="/cart"] *') ||
      document.querySelector('[class*="cart"], [class*="Cart"]');

    function flyToCart(buttonEl, productIcon) {
      const cartEl   = getCartIcon();
      if (!cartEl) return;

      const btnRect  = buttonEl.getBoundingClientRect();
      const cartRect = cartEl.getBoundingClientRect();

      const dx = cartRect.left + cartRect.width / 2  - (btnRect.left + btnRect.width / 2);
      const dy = cartRect.top  + cartRect.height / 2 - (btnRect.top  + btnRect.height / 2);

      const flyEl = document.createElement('div');
      flyEl.className = 'cart-fly-particle';
      flyEl.textContent = productIcon || '💊';
      flyEl.style.cssText = `
        left: ${btnRect.left + btnRect.width  / 2 - 20}px;
        top:  ${btnRect.top  + btnRect.height / 2 - 20}px;
        --dx: ${dx}px;
        --dy: ${dy}px;
      `;

      document.body.appendChild(flyEl);

      flyEl.addEventListener('animationend', () => {
        flyEl.remove();
        // ارتداد السلة
        const cart = getCartIcon();
        if (cart) {
          cart.classList.add('cart-icon-bounce');
          cart.addEventListener('animationend', () => {
            cart.classList.remove('cart-icon-bounce');
          }, { once: true });
        }
        // موجة
        addCartRipple(cartEl);
      }, { once: true });
    }

    function addCartRipple(el) {
      const ripple = document.createElement('div');
      ripple.className = 'cart-ripple';
      el.style.position = 'relative';
      el.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
    }

    // ربط أزرار "إضافة للسلة"
    function attachCartButtons() {
      document.querySelectorAll(
        'button[class*="add"], button[class*="Add"], button[class*="cart"], [data-action="add-to-cart"]'
      ).forEach(btn => {
        if (btn.dataset.flyBound === 'true') return;
        btn.dataset.flyBound = 'true';

        btn.addEventListener('click', () => {
          const card  = btn.closest('[class*="card"], [class*="Card"], li, article');
          const emoji = card ? (card.querySelector('span')?.textContent?.trim()[0] || '💊') : '💊';

          btn.classList.add('adding');
          setTimeout(() => btn.classList.remove('adding'), 1200);

          flyToCart(btn, emoji);
        });
      });
    }

    attachCartButtons();

    // مراقبة إضافة أزرار جديدة (Next.js dynamic)
    const mo = new MutationObserver(() => attachCartButtons());
    mo.observe(document.body, { childList: true, subtree: true });
  }

  /* ────────────────────────────────────────
     § F — Scroll Reveal
  ──────────────────────────────────────── */
  function initScrollReveal() {
    if (REDUCED_MOTION) return;

    // أضف class للعناصر المستهدفة
    const selectors = [
      '[class*="card"]',
      '[class*="Card"]',
      '[class*="category"]',
      '[class*="feature"]',
      '[class*="Feature"]',
      'section > div > *',
    ];

    const elements = document.querySelectorAll(selectors.join(','));
    elements.forEach(el => {
      if (!el.classList.contains('reveal-on-scroll') &&
          !el.closest('#sudanmed-marquee-container') &&
          !el.closest('#sudanmed-particles-container')) {
        el.classList.add('reveal-on-scroll');
      }
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px',
    });

    document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));
  }

  /* ────────────────────────────────────────
     § G — خلفية الباترن الطبي
  ──────────────────────────────────────── */
  function initMedicalBackground() {
    if (REDUCED_MOTION || IS_MOBILE) return;

    const existing = document.getElementById('sudanmed-bg-pattern');
    if (existing) return;

    const bg = document.createElement('div');
    bg.id = 'sudanmed-bg-pattern';
    bg.className = 'medical-bg-pattern';

    // صلبان طبية خلفية
    const positions = [
      [5,  10], [25, 40], [70, 15], [90, 60],
      [15, 75], [55, 85], [80, 35], [40, 60],
    ];

    positions.forEach(([x, y], i) => {
      const cross = document.createElement('span');
      cross.className = 'medical-bg-cross';
      cross.textContent = '+';
      cross.style.cssText = `
        left: ${x}%; top: ${y}%;
        --delay: ${i * 1.1}s;
        font-size: ${Math.random() * 30 + 20}px;
      `;
      bg.appendChild(cross);
    });

    document.body.insertBefore(bg, document.body.firstChild);
    document.body.style.position = 'relative';
  }

  /* ────────────────────────────────────────
     § H — Page Transitions
  ──────────────────────────────────────── */
  function initPageTransitions() {
    if (REDUCED_MOTION) return;

    let progressBar = null;

    const showProgress = () => {
      if (progressBar) progressBar.remove();
      progressBar = document.createElement('div');
      progressBar.className = 'page-progress-bar';
      progressBar.style.width = '0%';
      document.body.appendChild(progressBar);
      requestAnimationFrame(() => {
        progressBar.style.transition = 'width 0.3s ease-out';
        progressBar.style.width = '85%';
      });
    };

    const completeProgress = () => {
      if (!progressBar) return;
      progressBar.style.width = '100%';
      setTimeout(() => { progressBar?.remove(); progressBar = null; }, 300);
    };

    // مراقبة تغيير URL في Next.js
    const originalPushState = history.pushState.bind(history);
    history.pushState = function(...args) {
      showProgress();
      originalPushState(...args);
      setTimeout(() => {
        completeProgress();
        // أعد تهيئة الأنيميشن للصفحة الجديدة
        setTimeout(reinitAll, 200);
      }, 350);
    };

    window.addEventListener('popstate', () => {
      showProgress();
      setTimeout(() => {
        completeProgress();
        setTimeout(reinitAll, 200);
      }, 350);
    });

    // تأثير على main
    const main = document.querySelector('main');
    if (main) {
      main.classList.add('page-transition-in');
      main.addEventListener('animationend', () => {
        main.classList.remove('page-transition-in');
      }, { once: true });
    }
  }

  /* ────────────────────────────────────────
     § I — إعادة تهيئة بعد التنقل
  ──────────────────────────────────────── */
  function reinitAll() {
    initMedicalParticles();
    initStatsCounter();
    initCartFlyAnimation();
    initScrollReveal();
  }

  /* ────────────────────────────────────────
     § J — Skeleton Loader للمنتجات
  ──────────────────────────────────────── */
  function injectSkeletonStyles() {
    // الـ CSS موجود في animations.css
    // هنا فقط نضيف الـ skeletons بشكل ديناميكي إذا احتجنا
  }

  /* ────────────────────────────────────────
     § K — لمسات نهائية على الـ UI
  ──────────────────────────────────────── */
  function applyThemeOverrides() {
    // أضف class للـ body
    document.documentElement.classList.add('sudanmed-themed');
    document.body.classList.add('sudanmed-themed');

    // Add to cart buttons
    document.querySelectorAll(
      'button[class*="add"], button[class*="cart"], [class*="AddToCart"]'
    ).forEach(btn => btn.classList.add('add-to-cart-btn'));

    // Product cards
    document.querySelectorAll(
      '[class*="ProductCard"], [class*="product-card"]'
    ).forEach(card => card.classList.add('product-card-animated'));

    // Category cards
    document.querySelectorAll(
      '[class*="CategoryCard"], [class*="category-card"]'
    ).forEach(card => card.classList.add('category-card-animated'));

    // Prices
    document.querySelectorAll(
      '[class*="price"], [class*="Price"]'
    ).forEach(el => el.classList.add('price-animated'));
  }

  /* ────────────────────────────────────────
     § L — التشغيل الرئيسي
  ──────────────────────────────────────── */
  function init() {
    console.log('%c الفنان — SudanMed Animations v1.0 🇸🇩', [
      'background: linear-gradient(90deg, #9A0B25, #000, #004F1C)',
      'color: #fff',
      'padding: 6px 16px',
      'border-radius: 4px',
      'font-size: 14px',
      'font-weight: bold',
    ].join(';'));

    initMarqueeBar();
    initMedicalBackground();
    initMedicalParticles();
    initStatsCounter();
    initCartFlyAnimation();
    initScrollReveal();
    initPageTransitions();
    applyThemeOverrides();
  }

  // تشغيل عند جاهزية DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Next.js: أعد التهيئة عند تغيير الصفحة
  if (typeof window !== 'undefined') {
    window.__sudanmedAnimations = { reinit: reinitAll, init };
  }

  // Export a few small helper functions as globals for legacy pages
  // so inline `onclick` handlers like `scrollToCats()` still work.
  window.scrollToCats = function scrollToCats() {
    const el = document.querySelector('#categories') || document.querySelector('.categories') || document.querySelector('[data-categories]');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  window.openTracking = function openTracking() {
    const panel = document.querySelector('#tracking') || document.querySelector('[data-tracking]');
    if (panel) {
      panel.style.display = '';
      panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (typeof window.__sudanmedAnimations?.openTracking === 'function') {
      try { window.__sudanmedAnimations.openTracking(); } catch (e) { /* ignore */ }
    }
  };

  window.showAll = function showAll(selector) {
    const root = selector ? document.querySelector(selector) : document;
    if (!root) return;
    root.querySelectorAll('.hidden, [hidden]').forEach(el => {
      el.classList.remove('hidden');
      el.removeAttribute('hidden');
    });
  };

})();
