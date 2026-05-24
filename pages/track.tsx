import Head from 'next/head'
import { useState } from 'react'
import { Search, Package, CheckCircle, Truck, MapPin, Clock } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const mockOrder = {
  number: 'SM-20240001',
  date: '24 مايو 2024',
  status: 'shipped',
  total: 2020,
  items: [
    { name: 'كمامة N95 طبية', qty: 2, price: 850 },
    { name: 'محقنة ستيرايل 5ml', qty: 1, price: 320 },
  ],
  timeline: [
    { status: 'pending', label: 'تم استلام الطلب', desc: 'تم استلام طلبك وبدأ المعالجة', time: '24/05 10:30', done: true },
    { status: 'paid', label: 'تم تأكيد الدفع', desc: 'تم التحقق من الدفع وتأكيده', time: '24/05 11:15', done: true },
    { status: 'processing', label: 'جاري التجهيز', desc: 'يتم تجهيز طلبك في المستودع', time: '24/05 12:00', done: true },
    { status: 'shipped', label: 'في طريقه إليك', desc: 'تم تسليم الطلب لشركة الشحن', time: '24/05 15:30', done: true },
    { status: 'delivered', label: 'تم التوصيل', desc: 'سيتم التوصيل قريباً', time: 'قريباً', done: false },
  ]
}

export default function TrackPage() {
  const [orderNum, setOrderNum] = useState('')
  const [order, setOrder] = useState<typeof mockOrder | null>(null)
  const [notFound, setNotFound] = useState(false)

  const search = () => {
    if (orderNum.trim() === 'SM-20240001' || orderNum.trim() === '') {
      setOrder(mockOrder)
      setNotFound(false)
    } else {
      setOrder(null)
      setNotFound(true)
    }
  }

  return (
    <>
      <Head><title>تتبع الطلب - SudanMed</title></Head>
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-black text-gray-900 mb-2">تتبع طلبك</h1>
        <p className="text-gray-500 mb-8">أدخل رقم الطلب لمعرفة حالته</p>

        {/* Search */}
        <div className="flex gap-3 mb-8">
          <div className="flex-1 relative">
            <Package className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              value={orderNum}
              onChange={e => setOrderNum(e.target.value)}
              placeholder="SM-20240001"
              className="w-full border border-gray-200 rounded-xl py-3 pr-10 pl-4 font-mono text-sm focus:outline-none focus:border-red-400"
              onKeyDown={e => e.key === 'Enter' && search()}
            />
          </div>
          <button
            onClick={search}
            className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            بحث
          </button>
        </div>

        {/* Demo tip */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-6 text-sm text-blue-700">
          💡 للتجربة: اكتب <strong>SM-20240001</strong> أو اضغط بحث بدون رقم
        </div>

        {notFound && (
          <div className="text-center py-12 bg-white border border-gray-100 rounded-2xl">
            <div className="text-5xl mb-4">🔍</div>
            <p className="font-bold text-gray-900">الطلب غير موجود</p>
            <p className="text-sm text-gray-500 mt-2">تأكد من رقم الطلب وحاول مرة أخرى</p>
          </div>
        )}

        {order && (
          <div className="space-y-4">
            {/* Header */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">رقم الطلب</p>
                  <p className="font-black text-gray-900 font-mono text-lg">{order.number}</p>
                  <p className="text-sm text-gray-500 mt-1">📅 {order.date}</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-sm font-bold px-3 py-1 rounded-full">
                    <Truck className="w-4 h-4" />
                    في الطريق
                  </span>
                  <p className="text-sm text-gray-500 mt-2 font-bold">{order.total.toLocaleString()} ج.س</p>
                </div>
              </div>

              {/* Items */}
              <div className="border-t mt-4 pt-4 space-y-2">
                {order.items.map(item => (
                  <div key={item.name} className="flex justify-between text-sm">
                    <span className="text-gray-700">{item.name} × {item.qty}</span>
                    <span className="font-semibold text-gray-900">{(item.price * item.qty).toLocaleString()} ج.س</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                <Clock className="w-5 h-5 text-red-600" />
                مراحل الطلب
              </h2>
              <div className="space-y-0">
                {order.timeline.map((step, i) => (
                  <div key={step.status} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        step.done ? 'bg-emerald-500' : 'bg-gray-200'
                      }`}>
                        {step.done ? <CheckCircle className="w-5 h-5 text-white" /> : <div className="w-3 h-3 rounded-full bg-gray-400" />}
                      </div>
                      {i < order.timeline.length - 1 && (
                        <div className={`w-0.5 h-10 ${step.done ? 'bg-emerald-300' : 'bg-gray-200'}`} />
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className={`font-bold text-sm ${step.done ? 'text-gray-900' : 'text-gray-400'}`}>
                            {step.label}
                          </p>
                          <p className={`text-xs mt-0.5 ${step.done ? 'text-gray-500' : 'text-gray-300'}`}>
                            {step.desc}
                          </p>
                        </div>
                        <span className={`text-xs font-mono ${step.done ? 'text-gray-500' : 'text-gray-300'}`}>
                          {step.time}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </>
  )
}
