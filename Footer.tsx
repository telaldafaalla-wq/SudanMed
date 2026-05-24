import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-black text-lg">S</span>
              </div>
              <div>
                <div className="font-black text-xl text-white">SudanMed</div>
                <div className="text-xs text-gray-400">المستلزمات الطبية</div>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              منصة متخصصة في توفير المستلزمات الطبية عالية الجودة للمستشفيات والعيادات والأفراد في السودان.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-bold mb-4">المنتجات</h4>
            <ul className="space-y-2 text-sm">
              {['وسائل الوقاية', 'مستلزمات جراحية', 'مستلزمات مختبرات', 'حقن وتسريب', 'رعاية الجروح'].map(item => (
                <li key={item}><Link href="/products" className="hover:text-red-400 transition-colors">{item}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">الدعم</h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'تتبع طلبك', href: '/track' },
                { label: 'طلباتي', href: '/orders' },
                { label: 'التواصل معنا', href: '/support' },
                { label: 'سياسة الإرجاع', href: '/returns' },
                { label: 'الشحن والتوصيل', href: '/shipping' },
              ].map(item => (
                <li key={item.href}><Link href={item.href} className="hover:text-red-400 transition-colors">{item.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">تواصل معنا</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <span>📞</span>
                <a href="tel:+249123456789" className="hover:text-red-400">+249 123 456 789</a>
              </li>
              <li className="flex items-center gap-2">
                <span>✉️</span>
                <a href="mailto:info@sudanmed.com" className="hover:text-red-400">info@sudanmed.com</a>
              </li>
              <li className="flex items-center gap-2">
                <span>📍</span>
                <span>الخرطوم، السودان</span>
              </li>
            </ul>
            <div className="mt-4 p-3 bg-emerald-900/50 rounded-xl border border-emerald-800">
              <p className="text-xs text-emerald-400 font-semibold">طرق الدفع المقبولة:</p>
              <p className="text-xs text-gray-400 mt-1">بنكك • تحويل بنكي • كاش عند الاستلام</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© 2024 SudanMed. جميع الحقوق محفوظة.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-red-400">سياسة الخصوصية</Link>
            <Link href="/terms" className="hover:text-red-400">الشروط والأحكام</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
