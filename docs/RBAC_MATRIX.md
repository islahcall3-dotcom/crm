# مصفوفة الصلاحيات (RBAC_MATRIX.md)

النظام مبني على مبدأ **Deny-by-default**، أي أن المستخدم لا يمكنه الوصول إلى أي شيء ما لم يمتلك الصلاحية بشكل صريح. الصلاحيات تعرّف كقيم نصية.

## 1. قائمة الصلاحيات المتاحة
| الصلاحية | الوصف |
|---|---|
| `users.view` | عرض قائمة المستخدمين |
| `users.manage` | إضافة وتعديل وتعطيل المستخدمين |
| `roles.view` | عرض الأدوار |
| `roles.manage` | تعديل صلاحيات الأدوار |
| `customers.view` | عرض العملاء وملفاتهم |
| `customers.create` | إضافة عميل جديد |
| `customers.update` | تعديل بيانات عميل |
| `customers.delete` | مسح عميل |
| `customers.import` | استيراد العملاء من Excel/CSV |
| `visits.view` | استعراض سجلات الصيانة |
| `visits.create` | إضافة صيانة جديدة |
| `reports.view` | عرض الداشبورد والتقارير |
| `reports.export` | تصدير التقارير إلى PDF/Excel/CSV |
| `settings.update` | تعديل إعدادات النظام (الأنواع، المدد، الجغرافيا) |
| `audit.view` | عرض سجل حركات النظام (Audit Log) |

## 2. مصفوفة الأدوار الافتراضية
| الصلاحية | `ADMIN` (مدير نظام) | `MANAGER` (مدير صيانة) | `TECHNICIAN` (فني) | `DATA_ENTRY` (مدخل بيانات) |
|---|:---:|:---:|:---:|:---:|
| `users.view` | ✅ | ❌ | ❌ | ❌ |
| `users.manage` | ✅ | ❌ | ❌ | ❌ |
| `roles.view` | ✅ | ❌ | ❌ | ❌ |
| `roles.manage` | ✅ | ❌ | ❌ | ❌ |
| `customers.view` | ✅ | ✅ | ✅ | ✅ |
| `customers.create` | ✅ | ✅ | ❌ | ✅ |
| `customers.update` | ✅ | ✅ | ❌ | ✅ |
| `customers.delete` | ✅ | ❌ | ❌ | ❌ |
| `customers.import` | ✅ | ❌ | ❌ | ❌ |
| `visits.view` | ✅ | ✅ | ✅ | ✅ |
| `visits.create` | ✅ | ✅ | ✅ | ✅ |
| `reports.view` | ✅ | ✅ | ❌ | ❌ |
| `reports.export` | ✅ | ✅ | ❌ | ❌ |
| `settings.update` | ✅ | ❌ | ❌ | ❌ |
| `audit.view` | ✅ | ❌ | ❌ | ❌ |

> **ملاحظة:** يمكن إضافة أدوار جديدة أو تعديل صلاحياتها من واجهة النظام من قبل الـ Admin.
