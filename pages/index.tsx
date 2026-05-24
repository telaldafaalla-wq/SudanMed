import Head from 'next/head'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const categories = [
  { id: 'ppe', icon: '🧤', nameAr: 'وسائل الوقاية', desc: 'كمامات، قفازات، أرواب واقية', count: 120 },
  { id: 'surgical', icon: '✂️', nameAr: 'مستلزمات جراحية', desc: 'خيوط، شاش، لاصق طبي', count: 85 },
  { id: 'lab', icon: '🔬', nameAr: 'مستلزمات مختبرات', desc: 'أنابيب، شرائح، محاليل', count: 200 },
  { id: 'injection', icon: '💉', nameAr: 'حقن وتسريب', desc: 'محاقن، كانيولات، IV', count: 95 },
  { id: 'wound', icon: '🩹', nameAr: 'رعاية الجروح', desc: 'ضمادات، رباطات، جبائر', count: 60 },
  { id: 'sterilization', icon: '🧴', nameAr: 'تعقيم وتطهير', desc: 'كحول، بيتادين، معقمات', count: 45 },
]

const featuredProducts = [
  { id: 1, name: 'كمامة N95 طبية', price: 850, unit: 'علبة/50 قطعة', badge: 'الأكثر طلباً', stock: true },
  { id: 2, name: 'قفازات لاتكس معقمة', price: 450, unit: 'علبة/100 قطعة', badge: 'عرض', stock: true },
  { id: 3, name: 'محقنة ستيرايل 5ml', price: 320, unit: 'علبة/100 قطعة', badge: null, stock: true },
  { id: 4, name: 'جهاز IV وتسريب', price: 180, unit: 'قطعة', badge: null, stock: true },
  { id: 5, name: 'شاش طبي معقم 10x10', price: 550, unit: 'علبة/50 قطعة', badge: null, stock: true },
  { id: 6, name: 'كانيولا وريدية G20', price: 280, unit: 'علبة/50 قطعة', badge: 'جديد', stock: true },
  { id: 7, name: 'بيتادين 10% لتر', price: 620, unit: 'زجاجة', badge: null, stock: false },
  { id: 8, name: 'كحول 70% معقم', price: 390, unit: 'لتر', badge: null, stock: true },
]

const stats = [
  { value: '500+', label: 'منتج طبي' },
  { value: '1,200+', label: 'عميل موثوق' },
  { value: '48h', label: 'توصيل سريع' },
  { value: '100%', label: 'منتجات معتمدة' },
]

export default function Home() {
  return (
    <>
      <Head>
        <title>SudanMed - المستلزمات الطبية في السودان</title>
      </Head>
      <Header />

      <main>
        {/* Hero */}
        <section className="bg-gradient-to-br from-red-700 via-red-600 to-red-800 text-white py-16 px-4 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-white blur-3xl" />
            <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full bg-white blur-3xl" />
          </div>
          <div className="max-w-7xl mx-auto relative">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                منصة المستلزمات الطبية الأولى في السودان
              </div>
              <h1 className="text-4xl md:text-5xl font-black leading-tight mb-4">
                مستلزمات طبية عالية الجودة
                <br />
                <span className="text-yellow-300">لكل مرفق صحي</span>
              </h1>
              <p className="text-lg text-red-100 mb-8 leading-relaxed">
                نوفر أكثر من 500 منتج طبي معتمد من أفضل الموردين العالميين.
                توصيل سريع لجميع ولايات السودان.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/products"
                  className="bg-white text-red-700 px-8 py-3 rounded-xl font-bold hover:bg-red-50 transition-colors"
                >
                  تسوق الآن
                </Link>
                <Link
                  href="/track"
                  className="bg-white/20 backdrop-blur border border-white/30 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-colors"
                >
                  📦 تتبع طلبك
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map(stat => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-black text-red-600">{stat.value}</div>
                  <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-gray-900">تصفح حسب الفئة</h2>
              <p className="text-gray-500 mt-1">جميع احتياجاتك الطبية في مكان واحد</p>
            </div>
            <Link href="/products" className="text-red-600 font-semibold hover:underline text-sm">
              عرض الكل ←
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map(cat => (
              <Link
                key={cat.id}
                href={`/products?cat=${cat.id}`}
                className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:border-red-200 transition-all group"
              >
                <div className="text-4xl mb-3">{cat.icon}</div>
                <h3 className="font-bold text-gray-900 group-hover:text-red-600 transition-colors">{cat.nameAr}</h3>
                <p className="text-sm text-gray-500 mt-1">{cat.desc}</p>
                <div className="mt-3 text-xs text-red-600 font-semibold">{cat.count} منتج</div>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section className="bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-gray-900">المنتجات الأكثر طلباً</h2>
                <p className="text-gray-500 mt-1">اختارها الأطباء والمستشفيات</p>
              </div>
              <Link href="/products" className="text-red-600 font-semibold hover:underline text-sm">عرض الكل ←</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featuredProducts.map(product => (
                <Link key={product.id} href={`/products/${product.id}`} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all group">
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 h-40 flex items-center justify-center relative">
                    <span className="text-5xl">💊</span>
                    {product.badge && (
                      <span className={`absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-full ${
                        product.badge === 'عرض' ? 'bg-emerald-500 text-white' :
                        product.badge === 'جديد' ? 'bg-blue-500 text-white' :
                        'bg-red-500 text-white'
                      }`}>
                        {product.badge}
                      </span>
                    )}
                    {!product.stock && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-white text-sm font-bold">نفذ المخزون</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 text-sm group-hover:text-red-600 transition-colors leading-snug">{product.name}</h3>
                    <p className="text-xs text-gray-400 mt-1">{product.unit}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-red-600 font-black text-lg">{product.price.toLocaleString()} ج.س</span>
                      <button
                        className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                          product.stock
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                        disabled={!product.stock}
                      >
                        {product.stock ? 'أضف للسلة' : 'نفذ'}
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Why Us */}
        <section className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-black text-gray-900 text-center mb-10">لماذا SudanMed؟</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '✅', title: 'منتجات معتمدة', desc: 'جميع منتجاتنا معتمدة من وزارة الصحة السودانية وتحمل شهادات جودة دولية (CE, ISO, FDA)' },
              { icon: '🚚', title: 'توصيل سريع وموثوق', desc: 'نوصل لجميع ولايات السودان مع إثبات التوصيل بالصور والتوقيع الإلكتروني' },
              { icon: '💳', title: 'دفع آمن ومرن', desc: 'بنكك، تحويل بنكي، أو كاش عند الاستلام. نضمن أمان معاملاتك المالية' },
            ].map(item => (
              <div key={item.title} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-all">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="bg-slate-900 py-12 px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-3xl font-black mb-4">هل أنت مستشفى أو عيادة؟</h2>
            <p className="text-gray-400 mb-8 text-lg">نوفر أسعاراً خاصة للمشتريات بالجملة مع خدمة توصيل أولوية</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contact" className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition-colors">
                تواصل معنا
              </Link>
              <a href="tel:+249123456789" className="bg-white/10 border border-white/20 text-white px-8 py-3 rounded-xl font-bold hover:bg-white/20 transition-colors">
                📞 اتصل بنا الآن
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
