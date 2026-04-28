# Afyaa – Admin Setup Guide

Run this once to create all database tables, RLS policies, storage buckets,
and grant admin access to your chosen email.

---

## Step 1 – Fill in .env.local

Open `.env.local` and add the three missing values:

### 1. SUPABASE_SERVICE_ROLE_KEY
- Go to: **Supabase Dashboard → Project Settings → API**
- Copy the **service_role** key (the long one labeled "secret")
- Paste it as:
  ```
  SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
  ```
  ⚠️ Never use `NEXT_PUBLIC_` prefix for this key.

### 2. SUPABASE_DB_URL
- Go to: **Supabase Dashboard → Project Settings → Database**
- Click **"Connection string"** tab → select **"URI"**
- Copy the full PostgreSQL URI
- Replace `[YOUR-PASSWORD]` with your actual database password
- Paste it as:
  ```
  SUPABASE_DB_URL=postgresql://postgres:[PASSWORD]@db.xxxx.supabase.co:5432/postgres
  ```
  ⚠️ This is ONLY used by the setup script, never by the web app.

### 3. ADMIN_EMAIL
- Set the email you will use to log in as admin:
  ```
  ADMIN_EMAIL=admin@afyaa.com
  ```

---

## Step 2 – Create the admin user in Supabase Auth

1. Go to: **Supabase Dashboard → Authentication → Users**
2. Click **"Add user"** → **"Create new user"**
3. Enter the email matching `ADMIN_EMAIL` and a strong password
4. Click **"Create user"**

---

## Step 3 – Run the setup script

```bash
npm run db:setup
```

This will:
- ✓ Create all required tables (if they don't exist)
- ✓ Enable Row Level Security on all tables
- ✓ Create the `is_admin()` function
- ✓ Set up RLS policies (public read, admin write)
- ✓ Create storage buckets: about, projects, team
- ✓ Set your admin user's profile role to `admin`

Expected output:
```
══════════════════════════════════════════
  Afyaa – Supabase Setup Script
══════════════════════════════════════════

  ✓  PostgreSQL connection established
  ✓  Enable uuid-ossp
  ...
  ✓  Set admin profile role
  ✅  Setup complete!
```

---

## Step 4 – Restart and log in

```bash
npm run dev
```

Then open: **http://localhost:3000/admin/login**

Log in with the email and password you created in Step 2.

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `Missing SUPABASE_DB_URL` | Add it to `.env.local` (see Step 1) |
| `Cannot connect to PostgreSQL` | Check your DB password in the connection string |
| `User not found in Auth` | Create the user in Supabase Auth (Step 2) first |
| `Admin CRUD still fails` | Re-run `npm run db:setup` and restart `npm run dev` |
| `غير مصرح` (Not authorized) | The profiles.role is not 'admin' — re-run `db:setup` |

---

## Security Notes

- `SUPABASE_SERVICE_ROLE_KEY` is only used by the setup script and server-side admin client
- It is never sent to the browser
- RLS policies use `public.is_admin()` which checks `profiles.role = 'admin'`
- Only users explicitly set to `role = 'admin'` can write data
- Public visitors can only read published content
