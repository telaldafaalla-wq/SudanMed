import Link from 'next/link'
import { useState } from 'react'
import { ShoppingCart, Search, Menu, X, Package } from 'lucide-react'

const C = {
  red:       '#D21034',
  redDark:   '#9A0B25',
  black:     '#000000',
  green:     '#007229',
  greenDark: '#004F1C',
  greenLight:'#00A33C',
}

export default function Header() {
  const [menuOpen,  setMenuOpen]  = useState(false)
  const [cartCount]               = useState(0)
  const [searchFocus, setSearchFocus] = useState(false)

  return (
    <header style={{
      background: 'rgba(5,5,5,0.97)',
      backdropFilter: 'blur(20px)',
      borderBottom: `1px solid rgba(210,16,52,0.25)`,
      position: 'sticky', top: 0, zIndex: 50,
      fontFamily: "'Cairo', sans-serif",
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>

          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{
              width: 42, height: 42,
              background: `linear-gradient(135deg, ${C.redDark}, ${C.black}, ${C.greenDark})`,
              borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 16px rgba(210,16,52,0.4)`,
            }}>
              <span style={{ color: '#fff', fontWeight: 900, fontSize: 18 }}>S</span>
            </div>
            <div>
              <div style={{
                fontWeight: 900, fontSize: 20, lineHeight: 1,
                background: `linear-gradient(90deg, ${C.red}, #fff, ${C.green})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>SudanMed</div>
              <div style={{ fontSize: 11, color: 'rgba(240,237,232,0.4)', lineHeight: 1, marginTop: 2 }}>
                المستلزمات الطبية
              </div>
            </div>
          </Link>

          {/* Search */}
          <div style={{ flex: 1, maxWidth: 480, display: 'none' }} className="md-search">
            <div style={{ position: 'relative' }}>
              <Search style={{
                position: 'absolute', right: 12, top: '50%',
                transform: 'translateY(-50%)',
                width: 18, height: 18,
                color: searchFocus ? C.red : 'rgba(240,237,232,0.35)',
                transition: 'color .2s',
              }} />
              <input
                type="text"
                placeholder="ابحث عن منتج طبي..."
                onFocus={() => setSearchFocus(true)}
                onBlur={() => setSearchFocus(false)}
                style={{
                  width: '100%',
                  background: '#111',
                  border: `1px solid ${searchFocus ? C.red : 'rgba(210,16,52,0.2)'}`,
                  borderRadius: 10,
                  padding: '10px 40px 10px 14px',
                  fontSize: 14,
                  color: 'rgba(240,237,232,0.9)',
                  outline: 'none',
                  boxShadow: searchFocus ? `0 0 0 3px rgba(210,16,52,0.1)` : 'none',
                  transition: 'all .2s',
                  direction: 'rtl',
                  fontFamily: "'Cairo', sans-serif",
                }}
              />
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>

            {/* Cart */}
            <Link href="/cart" style={{ position: 'relative', textDecoration: 'none' }}>
              <div style={{
                padding: 9, borderRadius: 10,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(210,16,52,0.15)',
                cursor: 'pointer', transition: 'all .2s',
              }}>
                <ShoppingCart style={{ width: 22, height: 22, color: 'rgba(240,237,232,0.8)' }} />
                {cartCount > 0 && (
                  <span style={{
                    position: 'absolute', top: -4, left: -4,
                    background: C.red, color: '#fff',
                    fontSize: 10, fontWeight: 700,
                    width: 18, height: 18, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 0 8px rgba(210,16,52,0.6)`,
                  }}>{cartCount}</span>
                )}
              </div>
            </Link>

            {/* Orders */}
            <Link href="/orders" style={{ textDecoration: 'none' }}>
              <div style={{
                padding: 9, borderRadius: 10,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(0,114,41,0.15)',
                cursor: 'pointer',
              }}>
                <Package style={{ width: 22, height: 22, color: 'rgba(240,237,232,0.8)' }} />
              </div>
            </Link>

            {/* Login */}
            <Link href="/auth/login" style={{ textDecoration: 'none' }}>
              <button style={{
                background: `linear-gradient(90deg, ${C.redDark}, ${C.black}, ${C.greenDark})`,
                color: '#fff', border: 'none',
                padding: '9px 20px', borderRadius: 10,
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                boxShadow: `0 2px 12px rgba(210,16,52,0.3)`,
                transition: 'all .2s',
                fontFamily: "'Cairo', sans-serif",
              }}>
                دخول
              </button>
            </Link>

            {/* Mobile toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                padding: 9, borderRadius: 10,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                cursor: 'pointer', color: 'rgba(240,237,232,0.8)',
              }}
              className="md-hide"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav style={{
          display: 'flex', alignItems: 'center', gap: 24,
          marginTop: 12, paddingTop: 12,
          borderTop: '1px solid rgba(210,16,52,0.12)',
          flexWrap: 'wrap',
        }} className="desktop-nav">
          {[
            { href: '/products',           label: 'جميع المنتجات' },
            { href: '/products?cat=ppe',        label: '🧤 وسائل الوقاية' },
            { href: '/products?cat=surgical',   label: '✂️ مستلزمات جراحية' },
            { href: '/products?cat=lab',        label: '🔬 مستلزمات مختبرات' },
            { href: '/products?cat=injection',  label: '💉 حقن وتسريب' },
            { href: '/track',                   label: '📦 تتبع طلبك' },
          ].map(item => (
            <Link key={item.href} href={item.href} style={{
              color: 'rgba(240,237,232,0.6)',
              fontSize: 13, fontWeight: 600,
              textDecoration: 'none',
              transition: 'color .2s',
              padding: '2px 0',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = C.red)}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(240,237,232,0.6)')}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu */}
        {menuOpen && (
          <div style={{
            marginTop: 12, paddingTop: 12,
            borderTop: '1px solid rgba(210,16,52,0.15)',
            display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            <input
              type="text"
              placeholder="ابحث..."
              style={{
                background: '#111',
                border: `1px solid rgba(210,16,52,0.2)`,
                borderRadius: 10, padding: '10px 14px',
                fontSize: 14, color: 'rgba(240,237,232,0.9)',
                outline: 'none', direction: 'rtl',
                fontFamily: "'Cairo', sans-serif",
              }}
            />
            {[
              { href: '/products',    label: 'جميع المنتجات' },
              { href: '/cart',        label: '🛒 السلة' },
              { href: '/orders',      label: '📋 طلباتي' },
              { href: '/track',       label: '📦 تتبع طلب' },
              { href: '/auth/login',  label: '🔐 تسجيل الدخول' },
            ].map(item => (
              <Link key={item.href} href={item.href} style={{
                padding: '10px 14px',
                color: 'rgba(240,237,232,0.8)',
                fontWeight: 600, fontSize: 14,
                textDecoration: 'none',
                borderRadius: 8,
                transition: 'background .2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(210,16,52,0.1)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @media (min-width: 768px) {
          .md-search { display: block !important; }
          .md-hide   { display: none !important; }
        }
        @media (max-width: 767px) {
          .desktop-nav { display: none !important; }
        }
      `}</style>
    </header>
  )
}
