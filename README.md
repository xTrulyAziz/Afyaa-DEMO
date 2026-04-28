# أفياء - موقع الشركة الزراعية

موقع ويب احترافي عربي RTL لشركة أفياء للزراعة والتشجير.

## التقنيات المستخدمة

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (قاعدة البيانات + المصادقة + التخزين)
- **Arabic RTL First**

---

## إعداد المشروع

### 1. إعداد Supabase

1. اذهب إلى [supabase.com](https://supabase.com) وأنشئ مشروعاً جديداً
2. في **SQL Editor** الصق محتوى `supabase/schema.sql` ونفّذه
3. في **Authentication → Users** أنشئ مستخدماً بالبريد `admin@afyaa.com`

### 2. إعداد البيئة

```bash
cp .env.example .env.local
```

عدّل `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
ADMIN_EMAIL=admin@afyaa.com
NEXT_PUBLIC_ADMIN_EMAIL=admin@afyaa.com
```

### 3. تشغيل المشروع

```bash
npm install
npm run dev
```

افتح: http://localhost:3000

---

## الروابط

| الصفحة | الرابط |
|--------|--------|
| الموقع العام | `/` |
| تسجيل دخول | `/admin/login` |
| لوحة التحكم | `/admin/dashboard` |
| من نحن | `/admin/about` |
| رؤيتنا | `/admin/vision` |
| المشاريع | `/admin/projects` |
| تواصل معنا | `/admin/contact` |

---

## بناء للإنتاج

```bash
npm run build
npm start
```

---

## هيكل المشروع

```
src/
├── app/
│   ├── layout.tsx           # Root layout (Arabic RTL + Cairo font)
│   ├── page.tsx             # Homepage (all sections)
│   ├── globals.css          # CSS variables + brand colors
│   ├── api/contact/         # Contact form API route
│   └── admin/               # Admin dashboard routes
├── components/
│   ├── public/              # Public website sections
│   ├── admin/               # Admin UI
│   └── ui/                  # Reusable components
├── lib/
│   ├── supabase/            # Browser + server clients
│   ├── queries/             # DB query functions
│   └── storage/             # Image upload helpers
├── types/database.ts        # TypeScript types
└── middleware.ts            # Auth route protection
supabase/
└── schema.sql               # Full DB schema + RLS + Storage buckets
```

---

## الألوان

| المتغير | القيمة | الاستخدام |
|---------|--------|-----------|
| `--primary` | `#2D6A4F` | أخضر رئيسي |
| `--primary-light` | `#52B788` | أخضر فاتح |
| `--primary-dark` | `#1B3A2D` | أخضر داكن |
| `--accent` | `#B7935E` | ذهبي/ترابي |
| `--background` | `#F9F6F2` | خلفية دافئة |
