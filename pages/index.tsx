import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

/* ── ألوان العلم السوداني ── */
const C = {
  red:        '#D21034',
  redDark:    '#9A0B25',
  redLight:   '#FF1A45',
  black:      '#000000',
  blackSoft:  '#0D0D0D',
  green:      '#007229',
  greenDark:  '#004F1C',
  greenLight: '#00A33C',
}

const categories = [
  { id: 'ppe',           icon: '🧤', nameAr: 'وسائل الوقاية',    desc: 'كمامات، قفازات، أرواب واقية', count: 120 },
  { id: 'surgical',      icon: '✂️',  nameAr: 'مستلزمات جراحية', desc: 'خيوط، شاش، لاصق طبي',       count: 85  },
  { id: 'lab',           icon: '🔬', nameAr: 'مستلزمات مختبرات', desc: 'أنابيب، شرائح، محاليل',      count: 200 },
  { id: 'injection',     icon: '💉', nameAr: 'حقن وتسريب',       desc: 'محاقن، كانيولات، IV',         count: 95  },
  { id: 'wound',         icon: '🩹', nameAr: 'رعاية الجروح',     desc: 'ضمادات، رباطات، جبائر',      count: 60  },
  { id: 'sterilization', icon: '🧴', nameAr: 'تعقيم وتطهير',    desc: 'كحول، بيتادين، معقمات',     count: 45  },
]

const featuredProducts = [
  { id: 1, name: 'كمامة N95 طبية',       price: 850, unit: 'علبة/50 قطعة', badge: 'الأكثر طلباً', stock: true  },
  { id: 2, name: 'قفازات لاتكس معقمة',  price: 450, unit: 'علبة/100 قطعة', badge: 'عرض',         stock: true  },
  { id: 3, name: 'محقنة ستيرايل 5ml',   price: 320, unit: 'علبة/100 قطعة', badge: null,           stock: true  },
  { id: 4, name: 'جهاز IV وتسريب',      price: 180, unit: 'قطعة',          badge: null,           stock: true  },
  { id: 5, name: 'شاش طبي معقم 10x10',  price: 550, unit: 'علبة/50 قطعة', badge: null,           stock: true  },
  { id: 6, name: 'كانيولا وريدية G20',  price: 280, unit: 'علبة/50 قطعة', badge: 'جديد',        stock: true  },
  { id: 7, name: 'بيتادين 10% لتر',     price: 620, unit: 'زجاجة',         badge: null,           stock: false },
  { id: 8, name: 'كحول 70% معقم',       price: 390, unit: 'لتر',           badge: null,           stock: true  },
]

const stats = [
  { value: 500,  suffix: '+',  label: 'منتج طبي'        },
  { value: 1200, suffix: '+',  label: 'عميل موثوق'      },
  { value: 48,   suffix: 'h', label: 'توصيل سريع'      },
  { value: 100,  suffix: '%', label: 'منتجات معتمدة'   },
]

const marqueeMessages = [
  '🚚 توصيل سريع لجميع ولايات السودان خلال 48 ساعة',
  '✅ أكثر من 500 منتج طبي معتمد من وزارة الصحة',
  '📞 خدمة عملاء 24/7 — اتصل الآن: +249 123 456 789',
  '🏥 أسعار خاصة للمستشفيات والعيادات',
  '💳 الدفع بنكك، تحويل بنكي، أو كاش عند الاستلام',
  '🔬 مستلزمات مختبرات معتمدة: CE · ISO · FDA',
  '⚕️ SudanMed — المنصة الطبية الأولى في السودان 🇸🇩',
]

/* ── عداد متحرك ── */
function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        const duration = 1800
        const start = performance.now()
        const tick = (now: number) => {
          const p = Math.min((now - start) / duration, 1)
          const eased = 1 - Math.pow(1 - p, 3)
          setCount(Math.floor(eased * target))
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.3 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [target])

  return <div ref={ref}>{count.toLocaleString('ar')}{suffix}</div>
}

/* ── بطاقة منتج ── */
function ProductCard({ product }: { product: typeof featuredProducts[0] }) {
  const [hovered, setHovered] = useState(false)
  const [added,   setAdded]   = useState(false)

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!product.stock || added) return
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <Link href={`/products/${product.id}`}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: hovered ? '#111' : '#0a0a0a',
          border: `1px solid ${hovered ? C.red : 'rgba(210,16,52,0.2)'}`,
          borderRadius: 16,
          overflow: 'hidden',
          transform: hovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
          boxShadow: hovered
            ? `0 24px 60px rgba(210,16,52,0.25), 0 8px 24px rgba(0,0,0,0.7)`
            : `0 4px 16px rgba(0,0,0,0.5)`,
          transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
          cursor: 'pointer',
        }}
      >
        {/* صورة المنتج */}
        <div style={{
          background: `linear-gradient(135deg, #1a0005 0%, #000 50%, #002d0f 100%)`,
          height: 160,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}>
          <span style={{ fontSize: 52, filter: 'drop-shadow(0 0 12px rgba(210,16,52,0.5))' }}>💊</span>

          {product.badge && (
            <span style={{
              position: 'absolute', top: 10, right: 10,
              background: product.badge === 'عرض' ? C.green :
                          product.badge === 'جديد' ? '#1d4ed8' : C.red,
              color: '#fff',
              fontSize: 11, fontWeight: 700,
              padding: '3px 10px', borderRadius: 20,
            }}>
              {product.badge}
            </span>
          )}

          {!product.stock && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.65)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>نفذ المخزون</span>
            </div>
          )}
        </div>

        {/* تفاصيل */}
        <div style={{ padding: '14px 16px' }}>
          <h3 style={{
            color: hovered ? '#fff' : 'rgba(240,237,232,0.9)',
            fontWeight: 700, fontSize: 14,
            lineHeight: 1.4, margin: 0,
            transition: 'color 0.2s',
          }}>{product.name}</h3>

          <p style={{ color: 'rgba(240,237,232,0.4)', fontSize: 12, margin: '4px 0 0' }}>
            {product.unit}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
            <span style={{
              color: C.greenLight,
              fontWeight: 900, fontSize: 18,
              textShadow: hovered ? `0 0 12px rgba(0,163,60,0.6)` : 'none',
              transition: 'text-shadow 0.3s',
            }}>
              {product.price.toLocaleString()} ج.س
            </span>

            <button
              onClick={handleAdd}
              disabled={!product.stock}
              style={{
                background: added ? C.green :
                            !product.stock ? 'rgba(255,255,255,0.08)' :
                            `linear-gradient(90deg, ${C.redDark}, ${C.black}, ${C.greenDark})`,
                color: product.stock ? '#fff' : 'rgba(255,255,255,0.3)',
                border: 'none',
                borderRadius: 8,
                padding: '7px 13px',
                fontSize: 12, fontWeight: 700,
                cursor: product.stock ? 'pointer' : 'not-allowed',
                transform: added ? 'scale(0.95)' : 'scale(1)',
                transition: 'all 0.2s ease',
              }}
            >
              {added ? '✅ أُضيف' : product.stock ? 'أضف للسلة' : 'نفذ'}
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}

/* ── بطاقة فئة ── */
function CategoryCard({ cat }: { cat: typeof categories[0] }) {
  const [hovered, setHovered] = useState(false)
  return (
    <Link href={`/products?cat=${cat.id}`}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: hovered ? '#111' : '#0a0a0a',
          border: `1px solid ${hovered ? C.green : 'rgba(0,114,41,0.25)'}`,
          borderRadius: 16, padding: '20px',
          transform: hovered ? 'translateY(-5px) scale(1.03)' : 'translateY(0) scale(1)',
          boxShadow: hovered
            ? `0 16px 40px rgba(0,114,41,0.2), 0 4px 16px rgba(0,0,0,0.5)`
            : `0 2px 8px rgba(0,0,0,0.3)`,
          transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
          cursor: 'pointer',
        }}
      >
        <div style={{ fontSize: 36, marginBottom: 10 }}>{cat.icon}</div>
        <h3 style={{
          color: hovered ? C.greenLight : 'rgba(240,237,232,0.9)',
          fontWeight: 700, fontSize: 15,
          margin: '0 0 6px', transition: 'color 0.2s',
        }}>{cat.nameAr}</h3>
        <p style={{ color: 'rgba(240,237,232,0.4)', fontSize: 12, margin: '0 0 10px' }}>{cat.desc}</p>
        <div style={{
          color: C.green, fontSize: 12, fontWeight: 700,
          background: 'rgba(0,114,41,0.1)',
          display: 'inline-block', padding: '2px 10px', borderRadius: 12,
        }}>{cat.count} منتج</div>
      </div>
    </Link>
  )
}

/* ── Particles Hero ── */
function HeroParticles() {
  const symbols = ['+', '💊', '🩺', '💉', '🔬', '🩹', '⚕️', '+', '+', '💊']
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      <style>{`
        @keyframes float-p {
          0%,100% { transform: translateY(0) rotate(0deg) scale(1); opacity: .6; }
          33%      { transform: translateY(-28px) rotate(120deg) scale(1.1); opacity: .9; }
          66%      { transform: translateY(-12px) rotate(240deg) scale(.9); opacity: .7; }
        }
        @keyframes hero-up {
          from { opacity:0; transform: translateY(40px) scale(.97); }
          to   { opacity:1; transform: translateY(0) scale(1); }
        }
        @keyframes shimmer {
          0%   { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes marquee-move {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0%); }
        }
        @keyframes count-pop {
          0%   { transform: scale(.5); opacity: 0; }
          70%  { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes pulse-red {
          0%,100% { box-shadow: 0 0 0 0 rgba(210,16,52,.6); }
          50%      { box-shadow: 0 0 0 10px rgba(210,16,52,0); }
        }
        @keyframes glow-green {
          0%,100% { text-shadow: 0 0 8px rgba(0,163,60,.3); }
          50%      { text-shadow: 0 0 20px rgba(0,163,60,.8); }
        }
        @keyframes bg-pulse {
          0%,100% { opacity: .04; transform: scale(1); }
          50%      { opacity: .09; transform: scale(1.05); }
        }
        @keyframes slide-btn {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
      {symbols.map((s, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${8 + (i * 9) % 85}%`,
          top:  `${10 + (i * 13) % 75}%`,
          fontSize: 14 + (i % 3) * 6,
          color: i % 2 === 0 ? C.red : C.green,
          opacity: 0.3 + (i % 3) * 0.15,
          filter: `drop-shadow(0 0 6px ${i % 2 === 0 ? C.red : C.green}80)`,
          animation: `float-p ${4 + (i % 3)}s ${i * 0.4}s ease-in-out infinite`,
        }}>{s}</div>
      ))}
    </div>
  )
}

/* ══════════════════════════════════════
   الصفحة الرئيسية
══════════════════════════════════════ */
export default function Home() {
  return (
    <>
      <Head>
        <title>SudanMed — المستلزمات الطبية الأولى في السودان 🇸🇩</title>
        <meta name="description" content="منصة المستلزمات الطبية الأولى في السودان. أكثر من 500 منتج طبي معتمد." />
      </Head>

      {/* ── خلفية عامة ── */}
      <div style={{
        minHeight: '100vh',
        background: '#050505',
        color: 'rgba(240,237,232,0.9)',
        fontFamily: "'Cairo', sans-serif",
      }}>

        {/* ── شريط الإشعارات المتحرك ── */}
        <div style={{
          background: `linear-gradient(90deg, ${C.redDark}, ${C.black}, ${C.greenDark})`,
          height: 38, overflow: 'hidden', position: 'relative',
          borderBottom: `1px solid rgba(210,16,52,0.4)`,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', height: '100%',
            width: 'max-content',
            animation: 'marquee-move 30s linear infinite',
          }}>
            {[...marqueeMessages, ...marqueeMessages].map((msg, i) => (
              <span key={i} style={{
                padding: '0 40px', whiteSpace: 'nowrap',
                fontSize: 13, fontWeight: 600, color: '#fff',
                display: 'inline-flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: i % 2 === 0 ? C.red : C.green,
                  display: 'inline-block', flexShrink: 0,
                }} />
                {msg}
                <span style={{ color: 'rgba(255,255,255,0.3)', padding: '0 12px', fontSize: 18 }}>|</span>
              </span>
            ))}
          </div>
        </div>

        <Header />

        <main>
          {/* ══ Hero ══ */}
          <section style={{
            background: `linear-gradient(135deg, #1a0005 0%, #000 45%, #002d0f 100%)`,
            padding: '72px 16px 80px',
            position: 'relative', overflow: 'hidden',
          }}>
            <HeroParticles />

            {/* توهجات خلفية */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
              <div style={{
                position: 'absolute', top: '10%', right: '5%',
                width: 300, height: 300, borderRadius: '50%',
                background: `radial-gradient(circle, rgba(210,16,52,0.12) 0%, transparent 70%)`,
                animation: 'bg-pulse 7s ease-in-out infinite',
              }} />
              <div style={{
                position: 'absolute', bottom: '10%', left: '5%',
                width: 250, height: 250, borderRadius: '50%',
                background: `radial-gradient(circle, rgba(0,114,41,0.12) 0%, transparent 70%)`,
                animation: 'bg-pulse 9s ease-in-out 2s infinite',
              }} />
            </div>

            <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 1 }}>
              <div style={{ maxWidth: 640 }}>
                {/* Badge */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'rgba(210,16,52,0.15)',
                  border: `1px solid rgba(210,16,52,0.35)`,
                  backdropFilter: 'blur(8px)',
                  padding: '6px 18px', borderRadius: 50,
                  fontSize: 13, fontWeight: 700, color: '#fff',
                  marginBottom: 24,
                  animation: 'hero-up .7s ease both',
                }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: C.greenLight,
                    animation: 'pulse-red 2s ease-in-out infinite',
                  }} />
                  منصة المستلزمات الطبية الأولى في السودان 🇸🇩
                </div>

                {/* العنوان */}
                <h1 style={{
                  fontSize: 'clamp(2rem, 5vw, 3.2rem)',
                  fontWeight: 900, lineHeight: 1.25,
                  color: '#fff', margin: '0 0 16px',
                  animation: 'hero-up .8s .1s ease both',
                }}>
                  مستلزمات طبية عالية الجودة
                  <br />
                  <span style={{
                    background: `linear-gradient(90deg, ${C.red}, ${C.greenLight})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}>لكل مرفق صحي</span>
                </h1>

                {/* وصف */}
                <p style={{
                  fontSize: 17, lineHeight: 1.7,
                  color: 'rgba(255,255,255,0.7)',
                  margin: '0 0 32px',
                  animation: 'hero-up .8s .2s ease both',
                }}>
                  نوفر أكثر من 500 منتج طبي معتمد من أفضل الموردين العالميين.
                  توصيل سريع لجميع ولايات السودان خلال 48 ساعة.
                </p>

                {/* أزرار */}
                <div style={{
                  display: 'flex', flexWrap: 'wrap', gap: 12,
                  animation: 'hero-up .8s .3s ease both',
                }}>
                  <Link href="/products">
                    <button style={{
                      background: `linear-gradient(90deg, ${C.redDark}, ${C.black}, ${C.greenDark})`,
                      color: '#fff', border: 'none',
                      padding: '14px 32px', borderRadius: 12,
                      fontSize: 15, fontWeight: 700, cursor: 'pointer',
                      boxShadow: `0 4px 20px rgba(210,16,52,0.4)`,
                      transition: 'all .25s ease',
                    }}>
                      🛒 تسوق الآن
                    </button>
                  </Link>
                  <Link href="/track">
                    <button style={{
                      background: 'rgba(255,255,255,0.08)',
                      color: '#fff',
                      border: `1.5px solid rgba(0,114,41,0.5)`,
                      padding: '13px 28px', borderRadius: 12,
                      fontSize: 15, fontWeight: 600, cursor: 'pointer',
                      backdropFilter: 'blur(8px)',
                      transition: 'all .25s ease',
                    }}>
                      📦 تتبع طلبك
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* ══ إحصائيات ══ */}
          <section style={{
            background: '#080808',
            borderBottom: `1px solid rgba(210,16,52,0.2)`,
            borderTop: `1px solid rgba(210,16,52,0.2)`,
          }}>
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
                {stats.map((s, i) => (
                  <div key={s.label} style={{
                    textAlign: 'center',
                    padding: '8px 4px',
                    animation: `count-pop .7s ${i * 0.12}s ease both`,
                  }}>
                    <div style={{
                      fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
                      fontWeight: 900, lineHeight: 1,
                      background: `linear-gradient(135deg, ${C.red}, #fff, ${C.green})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      animation: 'glow-green 3s ease-in-out infinite',
                    }}>
                      <AnimatedCounter target={s.value} suffix={s.suffix} />
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(240,237,232,0.5)', marginTop: 4 }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ══ الفئات ══ */}
          <section style={{ maxWidth: 1280, margin: '0 auto', padding: '56px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 900, color: '#fff', margin: '0 0 6px' }}>
                  تصفح حسب الفئة
                </h2>
                <p style={{ fontSize: 14, color: 'rgba(240,237,232,0.4)', margin: 0 }}>
                  جميع احتياجاتك الطبية في مكان واحد
                </p>
              </div>
              <Link href="/products" style={{ color: C.greenLight, fontWeight: 600, fontSize: 14 }}>
                عرض الكل ←
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
              {categories.map(cat => <CategoryCard key={cat.id} cat={cat} />)}
            </div>
          </section>

          {/* ══ المنتجات المميزة ══ */}
          <section style={{
            background: '#050505',
            padding: '56px 16px',
            borderTop: `1px solid rgba(210,16,52,0.15)`,
          }}>
            <div style={{ maxWidth: 1280, margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
                <div>
                  <h2 style={{ fontSize: 24, fontWeight: 900, color: '#fff', margin: '0 0 6px' }}>
                    المنتجات الأكثر طلباً
                  </h2>
                  <p style={{ fontSize: 14, color: 'rgba(240,237,232,0.4)', margin: 0 }}>
                    اختارها الأطباء والمستشفيات
                  </p>
                </div>
                <Link href="/products" style={{ color: C.redLight, fontWeight: 600, fontSize: 14 }}>
                  عرض الكل ←
                </Link>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 16 }}>
                {featuredProducts.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            </div>
          </section>

          {/* ══ لماذا SudanMed ══ */}
          <section style={{ maxWidth: 1280, margin: '0 auto', padding: '56px 16px' }}>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: '#fff', textAlign: 'center', marginBottom: 40 }}>
              لماذا SudanMed؟
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {[
                { icon: '✅', title: 'منتجات معتمدة', desc: 'جميع منتجاتنا معتمدة من وزارة الصحة السودانية وتحمل شهادات جودة دولية (CE, ISO, FDA)', color: C.green },
                { icon: '🚚', title: 'توصيل سريع وموثوق', desc: 'نوصل لجميع ولايات السودان مع إثبات التوصيل بالصور والتوقيع الإلكتروني', color: C.red },
                { icon: '💳', title: 'دفع آمن ومرن', desc: 'بنكك، تحويل بنكي، أو كاش عند الاستلام. نضمن أمان معاملاتك المالية', color: C.greenLight },
              ].map((item, i) => (
                <FeatureCard key={i} item={item} />
              ))}
            </div>
          </section>

          {/* ══ CTA ══ */}
          <section style={{
            background: `linear-gradient(135deg, ${C.redDark} 0%, ${C.black} 50%, ${C.greenDark} 100%)`,
            padding: '64px 16px',
          }}>
            <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
              <h2 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: '0 0 12px' }}>
                هل أنت مستشفى أو عيادة؟
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 16, margin: '0 0 32px' }}>
                نوفر أسعاراً خاصة للمشتريات بالجملة مع خدمة توصيل أولوية
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 12 }}>
                <Link href="/contact">
                  <button style={{
                    background: '#fff', color: C.redDark,
                    border: 'none', padding: '14px 32px',
                    borderRadius: 12, fontSize: 15, fontWeight: 700,
                    cursor: 'pointer', transition: 'all .2s',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                  }}>
                    تواصل معنا
                  </button>
                </Link>
                <a href="tel:+249123456789">
                  <button style={{
                    background: 'rgba(255,255,255,0.1)',
                    color: '#fff',
                    border: '1.5px solid rgba(255,255,255,0.3)',
                    padding: '13px 28px', borderRadius: 12,
                    fontSize: 15, fontWeight: 600, cursor: 'pointer',
                    backdropFilter: 'blur(8px)',
                  }}>
                    📞 اتصل الآن
                  </button>
                </a>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  )
}

function FeatureCard({ item }: { item: { icon: string; title: string; desc: string; color: string } }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? '#111' : '#0a0a0a',
        border: `1px solid ${hovered ? item.color : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 16, padding: '28px 24px',
        transform: hovered ? 'translateY(-5px)' : 'translateY(0)',
        boxShadow: hovered ? `0 16px 40px ${item.color}30` : '0 2px 8px rgba(0,0,0,0.3)',
        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      <div style={{ fontSize: 40, marginBottom: 16 }}>{item.icon}</div>
      <h3 style={{ fontSize: 17, fontWeight: 700, color: '#fff', margin: '0 0 10px' }}>
        {item.title}
      </h3>
      <p style={{ fontSize: 14, color: 'rgba(240,237,232,0.5)', lineHeight: 1.7, margin: 0 }}>
        {item.desc}
      </p>
    </div>
  )
}
