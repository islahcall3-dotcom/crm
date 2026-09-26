# الهيكلية المعمارية (ARCHITECTURE.md)

## 1. النمط المعماري (L-01)
**Modular Monolith**: خدمة Node.js (Fastify) واحدة.
تخدم الـ REST API على مسار `/api/v1/*` وتقوم بخدمة ملفات الـ Frontend المبنية (Vite Build) من نفس الـ Origin لتجنب مشاكل CORS وتحقيق أمان أعلى لملفات الارتباط (Cookies).

## 2. مخطط الطبقات في Backend (L-02)
- **Routes:** تعريف مسارات الشبكة (Endpoints)، التحقق من صحة البيانات (Validation) باستخدام Zod، وفحص الصلاحيات (RBAC).
- **Controllers:** استقبال الطلبات وإرجاع الردود (HTTP status codes)، وتنسيق البيانات للعميل.
- **Services:** احتواء منطق العمل (Business Logic)، مثل خوارزمية حساب الموعد القادم، مزامنة البيانات، والتحقق من قواعد التكرار.
- **Repositories (DAL):** التفاعل المباشر مع قاعدة البيانات (PostgreSQL) باستخدام Drizzle ORM.

## 3. هيكل المجلدات الفعلي
```text
/
├── frontend/               # تطبيق React (Vite)
│   ├── src/
│   │   ├── components/     # مجمعات مشتركة (UI) مبنية بـ Radix و Tailwind
│   │   ├── features/       # تقسيم حسب الميزة (Customers, Visits, Auth...)
│   │   ├── hooks/          # React Query وغيرها
│   │   ├── lib/            # Utilities (Zod schemas, API clients)
│   │   ├── pages/          # شاشات التطبيق الرئيسية
│   │   └── App.tsx
├── server/                 # تطبيق Node.js (Fastify)
│   ├── src/
│   │   ├── config/         # إدارة متغيرات البيئة
│   │   ├── db/             # مخططات Drizzle وملفات الـ Migrations
│   │   ├── modules/        # تقسيم حسب النطاق (Domain)
│   │   │   └── {domain}/
│   │   │       ├── route.ts
│   │   │       ├── controller.ts
│   │   │       ├── service.ts
│   │   │       └── schema.ts (Zod)
│   │   ├── plugins/        # Fastify plugins (Auth, RBAC)
│   │   └── server.ts
├── docs/                   # وثائق التصميم وخطة التنفيذ وتقارير المراحل
└── shared/                 # الأنواع (Types) المشتركة بين الخادم والواجهة (إن وجدت)
```

## 4. تدفق طلب كامل (Request Flow)
1. يرسل العميل طلب `POST /api/v1/customers`.
2. يمر الطلب بـ **Middleware (Auth)** للتحقق من الجلسة (Session Cookie) و CSRF Token.
3. يمر بـ **Middleware (RBAC)** للتأكد من امتلاك المستخدم صلاحية `customers.create`.
4. يقوم **Fastify+Zod** بالتحقق من صحة المدخلات (Validation).
5. يستدعي **Controller** الـ **CustomerService**.
6. الـ **Service** تتحقق من قواعد العمل (مثل عدم تكرار الهاتف) وتستدعي **Repository** للإدراج.
7. الـ **Repository** ينفذ `INSERT` ويكتب سجلاً في `audit_logs` ضمن Database Transaction واحدة.
8. يتم بث حدث إبطال (Invalidation) عبر **SSE** لتحديث واجهات المستخدمين الآخرين.
9. يعود الرد للعميل بحالة `201 Created`.

## 5. تدفق الـ Realtime (L-08)
- يتم إنشاء اتصال دائم SSE (Server-Sent Events) على مسار `/api/v1/events`.
- عند أي تعديل أو إضافة في قاعدة البيانات، يتم استخدام Postgres `LISTEN/NOTIFY`.
- يرسل الخادم رسالة خفيفة: `{"entity": "customer", "id": "123", "action": "update", "version": 2}`.
- تقوم مكتبة React Query في الـ Frontend بـ Invalidate للحالة وجلب البيانات الجديدة، مما يضمن ألا تُرسل أي بيانات شخصية أو حساسة عبر قناة SSE المفتوحة.
- في حالة انقطاع اتصال SSE، يسقط النظام (Fallback) إلى Polling لتحديث البيانات.

## 6. مخطط النشر (Deployment L-19)
- **Container:** Docker image واحد متعدد المراحل (Multi-stage) يجمع الـ Backend ونسخة الـ Frontend المبنية كأصول ثابتة (Static Assets).
- **Compute:** خدمة Google Cloud Run (Serverless) قابلة للتوسع التلقائي.
- **Database:** خدمة Google Cloud SQL لـ PostgreSQL.
- **Secrets:** تخزين آمن باستخدام Google Secret Manager.
- **Jobs:** استخدام Cloud Scheduler لاستدعاء نقطة النهاية (Endpoint) الخاصة بإرسال الإشعارات وحساب حالات المواعيد يومياً.
