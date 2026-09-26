# نظام التوحيد للتكييفات وفلاتر المياه

## متطلبات التشغيل
- Node.js (v18+)
- Docker & Docker Compose

## التشغيل المحلي
1. انسخ ملف البيئة: `cp .env.example .env` (تم الإنشاء تلقائياً)
2. تشغيل قاعدة البيانات: `docker-compose up -d`
3. تثبيت الحزم: `npm install`
4. تشغيل الخادم والواجهة معاً: `npm run dev`

- الواجهة تعمل على `http://localhost:5173`
- الخادم يعمل على `http://localhost:8080`
- فحص الصحة: `http://localhost:8080/api/v1/healthz`
