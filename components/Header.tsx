import Link from 'next/link'
import { useState } from 'react'
import { ShoppingCart, Search, Menu, X, Phone, Package } from 'lucide-react'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartCount] = useState(0)

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-red-700 text-white text-sm py-1.5 px-4 text-center">
        <span>📞 للطوارئ والطلبات العاجلة: </span>
        <a href="tel:+249123456789" className="font-bold hover:underline">+249 123 456 789</a>
        <span className="mx-3">|</span>
        <span>🚚 توصيل سريع لكل السودان</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-lg">S</span>
            </div>
            <div>
              <div className="font-black text-xl text-red-700 leading-none">SudanMed</div>
              <div className="text-xs text-gray-500 leading-none">المستلزمات الطبية</div>
            </div>
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-xl hidden md:block">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="ابحث عن منتج طبي..."
                className="w-full border border-gray-200 rounded-xl py-2.5 pr-10 pl-4 text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link href="/cart" className="relative p-2 hover:bg-red-50 rounded-xl transition-colors">
              <ShoppingCart className="w-6 h-6 text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -left-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link href="/orders" className="p-2 hover:bg-red-50 rounded-xl transition-colors hidden sm:block">
              <Package className="w-6 h-6 text-gray-700" />
            </Link>
            <Link
              href="/auth/login"
              className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors hidden sm:block"
            >
              دخول
            </Link>
            <button
              className="p-2 hover:bg-gray-100 rounded-xl md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-6 mt-3 pt-3 border-t border-gray-100 text-sm font-semibold">
          {[
            { href: '/products', label: 'جميع المنتجات' },
            { href: '/products?cat=ppe', label: 'وسائل الوقاية' },
            { href: '/products?cat=surgical', label: 'مستلزمات جراحية' },
            { href: '/products?cat=lab', label: 'مستلزمات مختبرات' },
            { href: '/products?cat=injection', label: 'حقن وتسريب' },
            { href: '/track', label: '📦 تتبع طلبك' },
          ].map(item => (
            <Link key={item.href} href={item.href} className="text-gray-600 hover:text-red-600 transition-colors">
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-gray-100 flex flex-col gap-2">
            <input
              type="text"
              placeholder="ابحث..."
              className="w-full border border-gray-200 rounded-xl py-2 px-4 text-sm"
            />
            {[
              { href: '/products', label: 'جميع المنتجات' },
              { href: '/cart', label: 'السلة' },
              { href: '/orders', label: 'طلباتي' },
              { href: '/track', label: 'تتبع طلب' },
              { href: '/auth/login', label: 'تسجيل الدخول' },
            ].map(item => (
              <Link key={item.href} href={item.href} className="py-2 px-3 text-gray-700 hover:bg-red-50 rounded-lg font-medium">
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  )
}
