#!/bin/bash
# SudanMed — سكريبت الإعداد التلقائي
# التشغيل: bash scripts/setup.sh

set -e

echo "🚀 بدء إعداد مشروع SudanMed..."

# التحقق من المتطلبات
echo "📋 التحقق من المتطلبات..."

if ! command -v node &> /dev/null; then
  echo "❌ Node.js غير مثبت — https://nodejs.org (v20+)"
  exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  echo "❌ Node.js v20+ مطلوب — الإصدار الحالي: $(node -v)"
  exit 1
fi

if ! command -v pnpm &> /dev/null; then
  echo "📦 تثبيت pnpm..."
  npm install -g pnpm
fi

echo "✅ Node.js: $(node -v)"
echo "✅ pnpm: $(pnpm -v)"

# تثبيت الحزم
echo ""
echo "📦 تثبيت الحزم..."
pnpm install

# إنشاء ملف .env
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ تم إنشاء .env من .env.example"
  echo "⚠️  عدّل .env وأضف القيم الحقيقية قبل المتابعة"
else
  echo "✅ .env موجود بالفعل"
fi

echo ""
echo "✅ الإعداد مكتمل!"
echo ""
echo "الخطوات التالية:"
echo "  1. عدّل .env وأضف DATABASE_URL وباقي المتغيرات"
echo "  2. شغّل: pnpm db:migrate"
echo "  3. شغّل: pnpm db:seed"
echo "  4. شغّل: pnpm dev"
echo ""
echo "🏥 SudanMed — منصة طبية للسودان"
