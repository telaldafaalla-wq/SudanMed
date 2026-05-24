import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import Header from '@/components/Header'

export default function LoginPage() {
  const [form, setForm] = useState({ phone: '', password: '' })

  return (
    <>
      <Head><title>تسجيل الدخول - SudanMed</title></Head>
      <Header />

      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-black text-3xl">S</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900">أهلاً بك في SudanMed</h1>
            <p className="text-gray-500 mt-2">سجل دخولك لمتابعة طلباتك</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">رقم الهاتف</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+249 9xxxxxxxx"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200"
              />
            </div>
            <div className="mb-6">
              <div className="flex justify-between mb-1.5">
                <label className="text-sm font-semibold text-gray-700">كلمة المرور</label>
                <Link href="/auth/forgot" className="text-sm text-red-600 hover:underline">نسيت كلمة المرور؟</Link>
              </div>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200"
              />
            </div>

            <button className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-colors">
              تسجيل الدخول
            </button>

            <div className="text-center mt-4 text-sm text-gray-500">
              ليس لديك حساب؟{' '}
              <Link href="/auth/register" className="text-red-600 font-bold hover:underline">إنشاء حساب</Link>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
