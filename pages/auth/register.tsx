import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import Header from '@/components/Header'

export default function RegisterPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', password: '' })

  return (
    <>
      <Head><title>إنشاء حساب - SudanMed</title></Head>
      <Header />

      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-black text-3xl">S</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900">إنشاء حساب جديد</h1>
            <p className="text-gray-500 mt-2">انضم لآلاف المستخدمين في SudanMed</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { key: 'firstName', label: 'الاسم الأول', placeholder: 'محمد' },
                { key: 'lastName', label: 'اسم الأخير', placeholder: 'أحمد' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">{f.label}</label>
                  <input
                    placeholder={f.placeholder}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-400"
                  />
                </div>
              ))}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">رقم الهاتف</label>
              <input
                type="tel"
                placeholder="+249 9xxxxxxxx"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-400"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">كلمة المرور</label>
              <input
                type="password"
                placeholder="8 أحرف على الأقل"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-400"
              />
            </div>

            <button className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-colors">
              إنشاء الحساب
            </button>

            <div className="text-center mt-4 text-sm text-gray-500">
              لديك حساب؟{' '}
              <Link href="/auth/login" className="text-red-600 font-bold hover:underline">تسجيل الدخول</Link>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
