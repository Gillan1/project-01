# ورشة عبادة للحدادة - الموقع الرسمي

موقع إلكتروني لورشة حدادة في الخرطوم، السودان. يعرض المنتجات الجاهزة والطلبات المخصصة، مع حاسبة تكلفة، أسئلة شائعة، ولوحة تحكم للمسؤول.

## ✨ المميزات

- 🌐 **ثنائي اللغة**: عربي / إنجليزي مع تبديل فوري
- 🎨 **4 سمات**: داكن، فاتح، أزرق، أخضر
- 📱 **متجاوب**: يعمل على الجوال والتابلت والكمبيوتر
- 🛒 **متجر**: عرض المنتجات الجاهزة مع الأسعار
- 🛠️ **طلبات**: تصفح عائلات المنتجات (سراير، كراسي، طاولات، إلخ) وأرسل طلب مخصص عبر واتساب
- 🧮 **حاسبة تكلفة**: تقدير سريع لتكلفة المشروع
- 🔐 **لوحة مسؤول**: إضافة/تعديل/حذف المنتجات بشكل آمن
- ☁️ **تخزين سحابي**: عبر Supabase (التعديلات تنعكس فوراً على كل الزوار)

## 🏗️ التقنيات

| التقنية | الاستخدام |
|---|---|
| HTML5 + CSS3 + Vanilla JS | الواجهة الأمامية |
| [Supabase](https://supabase.com) | قاعدة بيانات + مصادقة + تخزين صور |
| GitHub Pages | الاستضافة |
| Google Fonts (Cairo, Tajawal) | الخطوط |

## 🚀 الإعداد السريع

### 1) إنشاء مشروع Supabase (مجاني)

1. سجّل في https://supabase.com
2. أنشئ مشروعاً جديداً (New Project)
3. اختر اسماً وكلمة مرور قوية لقاعدة البيانات
4. اختر المنطقة الأقرب (Europe West / Frankfurt عادةً الأسرع للسودان)

### 2) تشغيل SQL Schema

1. في لوحة Supabase، اذهب إلى **SQL Editor** → **New Query**
2. انسخ والصق محتوى `supabase/schema.sql` ثم **Run**
3. كرّر ذلك مع `supabase/seed.sql` لاستيراد المنتجات الـ 66 الحالية

### 3) إنشاء حساب المسؤول

في لوحة Supabase:
1. اذهب إلى **Authentication** → **Users** → **Add user**
2. أدخل:
   - **Email**: بريدك (مثل: ghilan@example.com)
   - **Password**: كلمة مرور قوية
3. فعّل **Auto Confirm User** ✓ (لتجاهل تأكيد البريد)
4. **Create user**

### 4) ربط الموقع بـ Supabase

افتح `js/supabase-config.js` وعدّل القيمتين:

```js
const SUPABASE_URL = 'https://YOUR-PROJECT-REF.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR-ANON-PUBLIC-KEY';
```

القيم موجودة في: **Project Settings** → **API**
- `Project URL` → `SUPABASE_URL`
- `anon public` → `SUPABASE_ANON_KEY`

### 5) النشر على GitHub Pages

1. ارفع الملفات إلى مستودع GitHub:
   ```bash
   git init
   git add .
   git commit -m "v2.0 - Supabase integration"
   git remote add origin https://github.com/Gillan1/project-01.git
   git push -u origin main --force
   ```
2. في GitHub: **Settings** → **Pages** → اختر `main` branch
3. انتظر دقيقتين، ثم افتح: `https://obadablacksmithworkshop.dpdns.org/`

## 🔐 الأمان

- ✅ **لا كلمات مرور في الكود**: المصادقة كاملة عبر Supabase Auth
- ✅ **Row Level Security**: السياسات في SQL تمنع الزوار من تعديل المنتجات
- ✅ **CSP**: Content Security Policy يمنع XSS
- ✅ **`rel="noopener noreferrer"`**: على كل الروابط الخارجية
- ✅ **`escapeHtml`**: كل النصوص تُهرب قبل العرض
- ✅ **جلسة آمنة**: عبر Supabase Auth مع RLS policies (token في localStorage لكن الصلاحيات تُدار عبر سياسات قاعدة البيانات)
- ✅ **لا GitHub token مكشوف**: تم استبدال نظام GitHub API بـ Supabase

## 📁 بنية المشروع

```
project-01/
├── index.html                 # الصفحة الرئيسية
├── css/
│   └── style.css              # التنسيقات
├── js/
│   ├── app.js                 # منطق التطبيق (ES Module)
│   └── supabase-config.js     # ⚙️ عدّل هذا بالإعدادات
├── data/
│   └── products.json          # المنتجات الأولية (للاستيراد)
├── images/                    # صور المنتجات والشعارات
├── supabase/
│   ├── schema.sql             # SQL: إنشاء الجداول والسياسات
│   └── seed.sql               # SQL: استيراد المنتجات الـ 66
├── scripts/
│   └── json-to-sql.js         # أداة: تحويل products.json إلى SQL
├── CNAME                      # النطاق المخصص
├── robots.txt
├── sitemap.xml
├── .gitignore
└── README.md                  # هذا الملف
```

## 🛠️ الصيانة

### إضافة منتج جديد
1. سجّل الدخول كمسؤول (قسم "المسؤول" في الموقع)
2. اذهب إلى تبويب "إضافة منتج"
3. املأ التفاصيل وارفع الصورة
4. **حفظ** - سينعكس فوراً لكل الزوار

### تعديل/حذف منتج
1. سجّل الدخول كمسؤول
2. في تبويب "إدارة المنتجات"، اضغط **تعديل** أو **حذف**

### إعادة توليد SQL من products.json
```bash
node scripts/json-to-sql.js > supabase/seed.sql
```

## 🔄 التغيير عن الإصدار السابق

| قبل | بعد |
|---|---|
| GitHub API لتخزين المنتجات | Supabase PostgreSQL |
| GitHub token في localStorage | جلسة Supabase Auth آمنة |
| كلمة مرور المسؤول في الكود | مصادقة Supabase Auth حقيقية |
| XSS عبر innerHTML | escapeHtml على كل النصوص |
| لا CSP | CSP + SRI محسّن |
| صور 1.5MB للشعار | صور 130KB (92% تقليل) |
| `escape()`/`unescape()` deprecated | محذوفة (لم تعد ضرورية) |
| لا ARIA | ARIA على النوافذ والأزرار |
| لا favicon | favicon + apple-touch-icon |
| لا og:image | Open Graph كامل + Twitter Card |
| `ar-SA` (تقويم هجري) | `ar-EG` (أرقام لاتينية) |
| FOUC عند التحميل | skeleton cards فوراً |

## 📞 الدعم

- **المالك**: غيلان بن عقبة
- **الورشة**: ورشة عبادة عبد الحفيظ للحدادة، الخرطوم
- **هاتف**: +249 115 192 500
- **واتساب**: [تواصل عبر واتساب](https://wa.me/249115192500)

## 📄 الترخيص

© 2024 ورشة عبادة عبد الحفيظ للحدادة. جميع الحقوق محفوظة.
