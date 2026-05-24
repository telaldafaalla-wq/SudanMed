import Head from 'next/head'
import Link from 'next/link'
import { Package } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const orders = [
  { id: 'SM-20240001', date: '24 مايو 2024', status: 'shipped', statusLabel: 'في الطريق', total: 2020, items: 2 },
  { id: 'SM-20240002', date: '20 مايو 2024', status: 'delivered', statusLabel: 'تم التوصيل', total: 850, items: 1 },
  { id: 'SM-20240003', date: '15 مايو 2024', status: 'delivered', statusLabel: 'تم التوصيل', total: 1560, items: 3 },
]

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  shipped: 'bg-blue-100 text-blue-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function OrdersPage() {
  return (
    <>
      <Head><title>طلباتي - SudanMed</title></Head>
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-black text-gray-900 mb-6">طلباتي</h1>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="font-bold text-gray-900">لا توجد طلبات</h2>
            <Link href="/products" className="mt-4 inline-block bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700">تسوق الآن</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-white border border-gray-100 rounded-2xl p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-black font-mono text-gray-900">{order.id}</p>
                    <p className="text-sm text-gray-500 mt-0.5">📅 {order.date} • {order.items} منتج</p>
                  </div>
                  <div className="text-left">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColors[order.status]}`}>
                      {order.statusLabel}
                    </span>
                    <p className="text-red-600 font-black mt-2 text-lg">{order.total.toLocaleString()} ج.س</p>
                  </div>
                </div>
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <Link href={`/track?order=${order.id}`} className="flex-1 border border-gray-200 text-gray-700 py-2 rounded-xl text-sm font-semibold text-center hover:bg-gray-50">
                    تتبع الطلب
                  </Link>
                  {order.status !== 'delivered' && (
                    <button className="text-red-600 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-red-50">
                      إلغاء
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </>
  )
}
