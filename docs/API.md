# مخطط واجهة برمجة التطبيقات (API.md)

| Endpoint | Method | Permission | الوصف |
|---|---|---|---|
| `/api/v1/healthz` | GET | `public` | فحص صحة النظام |
| `/api/v1/readyz` | GET | `public` | فحص جاهزية النظام للاتصال بقاعدة البيانات |
| `/api/v1/auth/login` | POST | `public` | تسجيل الدخول وبدء الجلسة |
| `/api/v1/auth/logout` | POST | `public` | إنهاء الجلسة وإبطالها |
| `/api/v1/auth/me` | GET | `public` (auth) | جلب بيانات المستخدم الحالي |
| `/api/v1/auth/password` | PUT | `public` (auth) | تغيير كلمة المرور للمستخدم الحالي |
| `/api/v1/users` | GET | `users.view` | جلب قائمة المستخدمين |
| `/api/v1/users` | POST | `users.manage` | إضافة مستخدم جديد |
| `/api/v1/users/:id` | PUT | `users.manage` | تعديل بيانات/حالة مستخدم |
| `/api/v1/roles` | GET | `roles.view` | جلب قائمة الأدوار والصلاحيات |
| `/api/v1/roles/:id` | PUT | `roles.manage` | تعديل صلاحيات دور معين |
| `/api/v1/customers` | GET | `customers.view` | جلب العملاء مع الفلترة والبحث والـ Pagination |
| `/api/v1/customers` | POST | `customers.create` | إضافة عميل جديد |
| `/api/v1/customers/:id` | GET | `customers.view` | جلب بيانات عميل واحد بالتفصيل |
| `/api/v1/customers/:id` | PUT | `customers.update` | تعديل بيانات العميل |
| `/api/v1/customers/:id` | DELETE | `customers.delete` | مسح عميل (Soft Delete) |
| `/api/v1/visits` | GET | `visits.view` | جلب قائمة الزيارات/الصيانات |
| `/api/v1/visits` | POST | `visits.create` | تسجيل صيانة/زيارة جديدة |
| `/api/v1/dashboard/stats` | GET | `reports.view` | إحصائيات لوحة التحكم |
| `/api/v1/reports/:type` | GET | `reports.view` | جلب التقارير (يومي/أسبوعي/شهري/إلخ) |
| `/api/v1/export/excel` | GET | `reports.export` | تصدير البيانات إلى Excel |
| `/api/v1/export/pdf` | GET | `reports.export` | تصدير البيانات إلى PDF |
| `/api/v1/audit-logs` | GET | `audit.view` | استعراض سجل الحركات |
| `/api/v1/events` | GET | `public` (auth) | نقطة اتصال SSE للمزامنة اللحظية |
