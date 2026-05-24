import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import { CheckCircle, Upload, Copy } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const BANKAK_ACCOUNT = '+249912345678'
const ORDER_TOTAL = 2020

type Step = 'details' | 'payment' | 'confirm'

export default function CheckoutPage() {
  const [step, setStep] = useState<Step>('details')
  const [payMethod, setPayMethod] = useState<'bankak' | 'cash' | 'transfer'>('bankak')
  const [copied, setCopied] = useState(false)

  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', city: '', address: '', notes: ''
  })

  const copyAccount = () => {
    navigator.clipboard.writeText(BANKAK_ACCOUNT)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <Head><title>إتمام الطلب - SudanMed</title></Head>
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {(['details', 'payment', 'confirm'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                step === s ? 'bg-red-600 text-white' :
                (i < ['details','payment','confirm'].indexOf(step)) ? 'bg-emerald-500 text-white' :
                'bg-gray-200 text-gray-500'
              }`}>
                {i < ['details','payment','confirm'].indexOf(step) ? <CheckCircle className="w-5 h-5" /> : i + 1}
              </div>
              <span className={`text-sm font-semibold hidden sm:block ${step === s ? 'text-gray-900' : 'text-gray-400'}`}>
                {s === 'details' ? 'بياناتك' : s === 'payment' ? 'الدفع' : 'تأكيد'}
              </span>
              {i < 2 && <div className="w-12 h-0.5 bg-gray-200" />}
            </div>
          ))}
        </div>

        {/* Step 1: Details */}
        {step === 'details' && (
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <h2 className="text-xl font-black mb-6">بيانات التوصيل</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'firstName', label: 'الاسم الأول', placeholder: 'محمد' },
                { key: 'lastName', label: 'اسم الأخير', placeholder: 'أحمد' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">{f.label}</label>
                  <input
                    value={form[f.key as keyof typeof form]}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400"
                  />
                </div>
              ))}
            </div>
            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">رقم الهاتف</label>
              <input
                value={form.phone}
                onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+249 9xxxxxxxx"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400"
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">المدينة / الولاية</label>
              <select
                value={form.city}
                onChange={e => setForm(prev => ({ ...prev, city: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400 bg-white"
              >
                <option value="">اختر المدينة</option>
                {['الخرطوم', 'أم درمان', 'بحري', 'مدني', 'بورتسودان', 'كسلا', 'عطبرة', 'الأبيض'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">العنوان التفصيلي</label>
              <textarea
                value={form.address}
                onChange={e => setForm(prev => ({ ...prev, address: e.target.value }))}
                placeholder="الشارع، المبنى، الدور، الشقة..."
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400 resize-none"
              />
            </div>

            <button
              onClick={() => setStep('payment')}
              className="w-full bg-red-600 text-white py-3 rounded-xl font-bold mt-6 hover:bg-red-700 transition-colors"
            >
              التالي: الدفع
            </button>
          </div>
        )}

        {/* Step 2: Payment */}
        {step === 'payment' && (
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <h2 className="text-xl font-black mb-6">طريقة الدفع</h2>

            <div className="space-y-3 mb-6">
              {[
                { id: 'bankak', label: 'بنكك (تحويل فوري)', desc: 'ادفع عبر تطبيق بنكك', icon: '📱' },
                { id: 'cash', label: 'كاش عند الاستلام', desc: 'ادفع عند وصول الطلب', icon: '💵' },
                { id: 'transfer', label: 'تحويل بنكي', desc: 'حوّل مباشرة للحساب البنكي', icon: '🏦' },
              ].map(method => (
                <label
                  key={method.id}
                  className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                    payMethod === method.id ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method.id}
                    checked={payMethod === method.id as typeof payMethod}
                    onChange={() => setPayMethod(method.id as typeof payMethod)}
                    className="accent-red-600"
                  />
                  <span className="text-2xl">{method.icon}</span>
                  <div>
                    <div className="font-bold text-gray-900">{method.label}</div>
                    <div className="text-sm text-gray-500">{method.desc}</div>
                  </div>
                </label>
              ))}
            </div>

            {/* Bankak Instructions */}
            {payMethod === 'bankak' && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 mb-6">
                <h3 className="font-bold text-emerald-900 mb-3 flex items-center gap-2">
                  <span>📱</span> خطوات الدفع عبر بنكك
                </h3>
                <ol className="space-y-2 text-sm text-emerald-800">
                  <li className="flex items-start gap-2">
                    <span className="font-bold">1.</span>
                    <span>افتح تطبيق بنكك على هاتفك</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">2.</span>
                    <span>اختر &ldquo;تحويل&rdquo;</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">3.</span>
                    <div>
                      <span>أدخل الرقم: </span>
                      <span className="font-black text-emerald-900 text-base font-mono">{BANKAK_ACCOUNT}</span>
                      <button onClick={copyAccount} className="mr-2 text-emerald-700 hover:text-emerald-900">
                        {copied ? <CheckCircle className="w-4 h-4 inline" /> : <Copy className="w-4 h-4 inline" />}
                      </button>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">4.</span>
                    <span>المبلغ: <strong>{ORDER_TOTAL.toLocaleString()} جنيه سوداني</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">5.</span>
                    <span>اكتب في البيان رقم طلبك</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">6.</span>
                    <span>ارفع صورة الإيصال هنا بعد التحويل</span>
                  </li>
                </ol>

                <div className="mt-4 border-2 border-dashed border-emerald-300 rounded-xl p-4 text-center cursor-pointer hover:bg-emerald-100 transition-colors">
                  <Upload className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm text-emerald-700 font-semibold">ارفع صورة الإيصال</p>
                  <p className="text-xs text-emerald-500 mt-1">سيتم التحقق خلال 10-60 دقيقة</p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep('details')}
                className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50"
              >
                رجوع
              </button>
              <button
                onClick={() => setStep('confirm')}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-colors"
              >
                تأكيد الطلب
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 'confirm' && (
          <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">تم استلام طلبك! 🎉</h2>
            <p className="text-gray-500 mb-2">رقم الطلب: <strong className="text-gray-900 font-mono">SM-20240001</strong></p>
            <p className="text-gray-500 mb-8">سيتم تأكيد طلبك بعد التحقق من الدفع</p>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-right">
              <p className="text-sm text-amber-800">
                <strong>⏰ سيتم التحقق من الدفع خلال 10-60 دقيقة</strong>
                <br />
                وسيتم إرسال رسالة SMS لتأكيد الطلب على رقمك المسجل
              </p>
            </div>

            <div className="flex gap-3">
              <Link href="/orders" className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-colors text-center">
                متابعة طلباتي
              </Link>
              <Link href="/products" className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 text-center">
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
