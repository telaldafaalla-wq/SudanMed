import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const initialCart = [
  { id: 1, name: 'كمامة N95 طبية', price: 850, quantity: 2, unit: 'علبة/50 قطعة' },
  { id: 3, name: 'محقنة ستيرايل 5ml', price: 320, quantity: 1, unit: 'علبة/100 قطعة' },
]

export default function CartPage() {
  const [cart, setCart] = useState(initialCart)

  const updateQty = (id: number, delta: number) => {
    setCart(prev => prev.map(item =>
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ))
  }

  const removeItem = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id))
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 0 ? 150 : 0
  const total = subtotal + shipping

  return (
    <>
      <Head><title>السلة - SudanMed</title></Head>
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-black text-gray-900 mb-6">سلة التسوق</h1>

        {cart.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">سلتك فارغة</h2>
            <p className="text-gray-500 mb-6">أضف منتجات لبدء التسوق</p>
            <Link href="/products" className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition-colors">
              تسوق الآن
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Items */}
            <div className="md:col-span-2 space-y-3">
              {cart.map(item => (
                <div key={item.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">💊</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm">{item.name}</h3>
                    <p className="text-xs text-gray-400">{item.unit}</p>
                    <p className="text-red-600 font-black mt-1">{item.price.toLocaleString()} ج.س</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-100">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-100">
                      <Plus className="w-3 h-3" />
                    </button>
                    <button onClick={() => removeItem(item.id)} className="mr-2 p-1.5 text-red-400 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 h-fit sticky top-24">
              <h2 className="font-bold text-gray-900 mb-4">ملخص الطلب</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>المجموع الجزئي</span>
                  <span>{subtotal.toLocaleString()} ج.س</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>الشحن</span>
                  <span>{shipping > 0 ? `${shipping} ج.س` : 'مجاني'}</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold text-gray-900 text-base">
                  <span>الإجمالي</span>
                  <span className="text-red-600">{total.toLocaleString()} ج.س</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full bg-red-600 text-white py-3 rounded-xl font-bold mt-5 flex items-center justify-center hover:bg-red-700 transition-colors"
              >
                متابعة الدفع
              </Link>

              <Link href="/products" className="w-full border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold mt-3 flex items-center justify-center hover:bg-gray-50 transition-colors text-sm">
                مواصلة التسوق
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </>
  )
}
