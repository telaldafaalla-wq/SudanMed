import fs from 'fs/promises'
import path from 'path'
import Head from 'next/head'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { imageFallbackMap, defaultFallbackImage } from '@/data/categoryMeta'

export async function getStaticPaths() {
  const filePath = path.join(process.cwd(), 'data', 'products.json')
  const fileContents = await fs.readFile(filePath, 'utf8')
  const products = JSON.parse(fileContents)

  const paths = products.map((product: any) => ({
    params: { id: product.id || product.sku?.toString() || product.slug?.toString() || '' },
  })).filter((p: any) => p.params.id)

  return { paths, fallback: 'blocking' }
}

export async function getStaticProps({ params }: { params: { id: string } }) {
  const filePath = path.join(process.cwd(), 'data', 'products.json')
  const fileContents = await fs.readFile(filePath, 'utf8')
  const products = JSON.parse(fileContents)
  const product = products.find((item: any) => item.slug === params.id || item.id === params.id || item.sku === params.id)

  if (!product) {
    return { notFound: true }
  }

  return { props: { product } }
}

export default function ProductPage({ product }: { product: any }) {
  return (
    <>
      <Head>
        <title>{product.name_ar || product.name_en} - SudanMed</title>
      </Head>
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-sm text-gray-500 mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-red-600">الرئيسية</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-red-600">المنتجات</Link>
          <span>/</span>
          <span className="text-gray-900 font-semibold">{product.name_ar || product.name_en}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-8 bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm p-6">
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl h-[360px] flex items-center justify-center overflow-hidden">
            {product.image_url ? (
              <img
                src={product.image_url.startsWith('http') ? product.image_url : product.image_url}
                alt={product.name_ar || product.name_en}
                loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                onError={(event) => {
                  const target = event.currentTarget as HTMLImageElement
                  const fallback = imageFallbackMap[product.slug] || defaultFallbackImage
                  if (target.src !== fallback) target.src = fallback
                }}
              />
            ) : (
              <div className="text-6xl">💊</div>
            )}
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-2">{product.category_name || product.category?.name_ar || ''}</p>
            <h1 className="text-3xl font-black text-gray-900 mb-4">{product.name_ar || product.name_en}</h1>
            <p className="text-sm text-gray-500 mb-6">{product.short_desc || product.description}</p>
            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl font-black text-red-600">{product.price?.toLocaleString() || 0} ج.س</span>
              {product.compare_price && (
                <span className="text-sm text-gray-400 line-through">{product.compare_price.toLocaleString()} ج.س</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 mb-8">
              <div className="rounded-2xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500">الرقم التسلسلي</p>
                <p className="font-semibold mt-1">{product.sku || product.id}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500">المخزون</p>
                <p className="font-semibold mt-1">{product.stock ? 'متوفر' : 'غير متوفر'}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="bg-red-600 text-white rounded-2xl px-6 py-3 font-semibold hover:bg-red-700 transition">أضف للسلة</button>
              <Link href="/products" className="border border-gray-200 rounded-2xl px-6 py-3 text-gray-700 hover:bg-gray-50 transition">عودة للمنتجات</Link>
            </div>
          </div>
        </div>

        <section className="mt-12 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4">الوصف</h2>
          <p className="text-gray-600 leading-relaxed whitespace-pre-line">{product.description || 'لا يوجد وصف لهذا المنتج بعد.'}</p>
        </section>
      </main>
      <Footer />
    </>
  )
}
