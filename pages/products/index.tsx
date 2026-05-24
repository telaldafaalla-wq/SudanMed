import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import { Filter, Search } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const products = [
  { id: 1, name: 'كمامة N95 طبية', price: 850, unit: 'علبة/50 قطعة', cat: 'ppe', stock: true, badge: 'الأكثر طلباً' },
  { id: 2, name: 'قفازات لاتكس معقمة', price: 450, unit: 'علبة/100 قطعة', cat: 'ppe', stock: true, badge: null },
  { id: 3, name: 'محقنة ستيرايل 5ml', price: 320, unit: 'علبة/100 قطعة', cat: 'injection', stock: true, badge: null },
  { id: 4, name: 'جهاز IV وتسريب', price: 180, unit: 'قطعة', cat: 'injection', stock: true, badge: null },
  { id: 5, name: 'شاش طبي معقم 10x10', price: 550, unit: 'علبة/50 قطعة', cat: 'wound', stock: true, badge: null },
  { id: 6, name: 'كانيولا وريدية G20', price: 280, unit: 'علبة/50 قطعة', cat: 'injection', stock: true, badge: 'جديد' },
  { id: 7, name: 'بيتادين 10% لتر', price: 620, unit: 'زجاجة', cat: 'sterilization', stock: false, badge: null },
  { id: 8, name: 'كحول 70% معقم', price: 390, unit: 'لتر', cat: 'sterilization', stock: true, badge: null },
  { id: 9, name: 'روب طبي واقٍ', price: 1200, unit: 'قطعة', cat: 'ppe', stock: true, badge: null },
  { id: 10, name: 'أنابيب اختبار EDTA', price: 450, unit: 'علبة/100 قطعة', cat: 'lab', stock: true, badge: null },
  { id: 11, name: 'خيط جراحي Vicryl 2-0', price: 280, unit: 'قطعة', cat: 'surgical', stock: true, badge: null },
  { id: 12, name: 'ضمادة هيدروكولويد', price: 350, unit: 'علبة/10 قطع', cat: 'wound', stock: true, badge: null },
]

const categories = [
  { id: 'all', label: 'الكل' },
  { id: 'ppe', label: 'وقاية شخصية' },
  { id: 'surgical', label: 'جراحية' },
  { id: 'lab', label: 'مختبرات' },
  { id: 'injection', label: 'حقن وتسريب' },
  { id: 'wound', label: 'رعاية الجروح' },
  { id: 'sterilization', label: 'تعقيم' },
]

export default function ProductsPage() {
  const [selectedCat, setSelectedCat] = useState('all')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('default')

  const filtered = products
    .filter(p => selectedCat === 'all' || p.cat === selectedCat)
    .filter(p => !search || p.name.includes(search))
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price
      if (sortBy === 'price-desc') return b.price - a.price
      return 0
    })

  return (
    <>
      <Head>
        <title>جميع المنتجات - SudanMed</title>
      </Head>
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-red-600">الرئيسية</Link>
          <span>/</span>
          <span className="text-gray-900 font-semibold">المنتجات</span>
        </div>

        <h1 className="text-2xl font-black text-gray-900 mb-6">جميع المنتجات</h1>

        {/* Search + Sort */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ابحث عن منتج..."
              className="w-full border border-gray-200 rounded-xl py-2.5 pr-10 pl-4 text-sm focus:outline-none focus:border-red-400"
            />
          </div>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-red-400"
          >
            <option value="default">الترتيب الافتراضي</option>
            <option value="price-asc">السعر: من الأقل</option>
            <option value="price-desc">السعر: من الأعلى</option>
          </select>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 flex-wrap mb-8">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                selectedCat === cat.id
                  ? 'bg-red-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-red-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(product => (
            <Link key={product.id} href={`/products/${product.id}`} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all group">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 h-40 flex items-center justify-center relative">
                <span className="text-5xl">💊</span>
                {product.badge && (
                  <span className={`absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-full ${
                    product.badge === 'جديد' ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'
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
                  <span className="text-red-600 font-black">{product.price.toLocaleString()} ج.س</span>
                  <button
                    className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                      product.stock ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                    disabled={!product.stock}
                  >
                    {product.stock ? 'أضف' : 'نفذ'}
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <div className="text-5xl mb-4">🔍</div>
            <p className="font-semibold">لا توجد نتائج</p>
            <p className="text-sm mt-1">جرب كلمة بحث مختلفة</p>
          </div>
        )}
      </main>

      <Footer />
    </>
  )
}
