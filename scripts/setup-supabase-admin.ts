#!/usr/bin/env tsx
/**
 * Afyaa – Supabase Database Setup Script
 * ----------------------------------------
 * Run:  npm run db:setup
 *
 * Required env vars (in .env.local):
 *   NEXT_PUBLIC_SUPABASE_URL      – project URL
 *   SUPABASE_SERVICE_ROLE_KEY     – service role key (never exposed to browser)
 *   SUPABASE_DB_URL               – direct PostgreSQL connection string
 *   ADMIN_EMAIL                   – email of the one admin account
 */

import * as dotenv from "dotenv";
import { resolve } from "path";

// Load .env.local before anything else
dotenv.config({ path: resolve(process.cwd(), ".env.local") });
dotenv.config({ path: resolve(process.cwd(), ".env") });

import postgres from "postgres";
import { createClient } from "@supabase/supabase-js";

// ── Env validation ────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DB_URL = process.env.SUPABASE_DB_URL;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

const missing: string[] = [];
if (!SUPABASE_URL) missing.push("NEXT_PUBLIC_SUPABASE_URL");
if (!SERVICE_ROLE_KEY) missing.push("SUPABASE_SERVICE_ROLE_KEY");
if (!DB_URL) missing.push("SUPABASE_DB_URL");
if (!ADMIN_EMAIL) missing.push("ADMIN_EMAIL");

if (missing.length) {
  console.error("\n❌  Missing required env variables:");
  missing.forEach((v) => console.error(`    ${v}`));
  console.error("\nSee SETUP_ADMIN.md for instructions.\n");
  process.exit(1);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function ok(msg: string) { console.log(`  ✓  ${msg}`); }
function info(msg: string) { console.log(`  →  ${msg}`); }
function warn(msg: string) { console.warn(`  ⚠  ${msg}`); }
function fail(msg: string, err?: unknown) {
  console.error(`  ✗  ${msg}`);
  if (err) console.error("     ", err);
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n══════════════════════════════════════════");
  console.log("  Afyaa – Supabase Setup Script");
  console.log("══════════════════════════════════════════\n");

  // ── 1. Direct PostgreSQL connection (for DDL) ─────────────────────────────
  info("Connecting to PostgreSQL…");
  const sql = postgres(DB_URL!, { max: 1, onnotice: () => {} });
  try {
    await sql`SELECT 1`;
    ok("PostgreSQL connection established");
  } catch (e) {
    fail("Cannot connect to PostgreSQL – check SUPABASE_DB_URL", e);
    process.exit(1);
  }

  // ── 2. Supabase admin client (service role, for storage + auth queries) ───
  const supabase = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log("\n── Step 1: Extensions & helper functions ────────────────────\n");
  await runSQL(sql, "Enable uuid-ossp", `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
  await runSQL(sql, "Enable pgcrypto",  `CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

  // ── updated_at trigger function ────────────────────────────────────────────
  await runSQL(sql, "Create update_updated_at() trigger function", `
    CREATE OR REPLACE FUNCTION public.update_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  console.log("\n── Step 2: Profiles table & admin role functions ─────────────\n");

  // profiles table (linked to auth.users)
  await runSQL(sql, "Create profiles table", `
    CREATE TABLE IF NOT EXISTS public.profiles (
      id        UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      email     TEXT,
      role      TEXT NOT NULL DEFAULT 'user',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // Auto-create profile on signup
  await runSQL(sql, "Create handle_new_user() function", `
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO public.profiles (id, email, role)
      VALUES (NEW.id, NEW.email, 'user')
      ON CONFLICT (id) DO NOTHING;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `);

  await runSQL(sql, "Create on_auth_user_created trigger", `
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
      ) THEN
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
      END IF;
    END;
    $$;
  `);

  // is_admin() function – used inside RLS policies
  await runSQL(sql, "Create is_admin() function", `
    CREATE OR REPLACE FUNCTION public.is_admin()
    RETURNS boolean AS $$
      SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
      );
    $$ LANGUAGE sql SECURITY DEFINER STABLE;
  `);

  console.log("\n── Step 3: Application tables ───────────────────────────────\n");

  await runSQL(sql, "Create about_content table", `
    CREATE TABLE IF NOT EXISTS public.about_content (
      id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      main_title        TEXT NOT NULL DEFAULT 'عن شركة أفياء',
      short_description TEXT NOT NULL DEFAULT '',
      full_text         TEXT NOT NULL DEFAULT '',
      values            JSONB NOT NULL DEFAULT '[]',
      image_url         TEXT,
      created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await ensureTrigger(sql, "about_content_updated_at", "about_content");

  await runSQL(sql, "Create vision_content table", `
    CREATE TABLE IF NOT EXISTS public.vision_content (
      id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      vision_text    TEXT NOT NULL DEFAULT '',
      mission_text   TEXT NOT NULL DEFAULT '',
      goals          JSONB NOT NULL DEFAULT '[]',
      stat_projects  INTEGER NOT NULL DEFAULT 0,
      stat_years     INTEGER NOT NULL DEFAULT 0,
      stat_clients   INTEGER NOT NULL DEFAULT 0,
      stat_green_areas INTEGER NOT NULL DEFAULT 0,
      created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await ensureTrigger(sql, "vision_content_updated_at", "vision_content");

  await runSQL(sql, "Create projects table", `
    CREATE TABLE IF NOT EXISTS public.projects (
      id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title           TEXT NOT NULL,
      description     TEXT NOT NULL DEFAULT '',
      location        TEXT NOT NULL DEFAULT '',
      category        TEXT NOT NULL DEFAULT '',
      project_date    DATE,
      cover_image_url TEXT,
      is_published    BOOLEAN NOT NULL DEFAULT FALSE,
      display_order   INTEGER NOT NULL DEFAULT 0,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await ensureTrigger(sql, "projects_updated_at", "projects");

  await runSQL(sql, "Create project_images table", `
    CREATE TABLE IF NOT EXISTS public.project_images (
      id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      project_id    UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
      image_url     TEXT NOT NULL,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await runSQL(sql, "Create team_members table", `
    CREATE TABLE IF NOT EXISTS public.team_members (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name          TEXT NOT NULL,
      job_title     TEXT NOT NULL,
      image_url     TEXT,
      display_order INTEGER NOT NULL DEFAULT 0,
      is_published  BOOLEAN NOT NULL DEFAULT TRUE,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await ensureTrigger(sql, "team_members_updated_at", "team_members");

  await runSQL(sql, "Create contact_content table", `
    CREATE TABLE IF NOT EXISTS public.contact_content (
      id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      phone            TEXT NOT NULL DEFAULT '',
      whatsapp         TEXT NOT NULL DEFAULT '',
      email            TEXT NOT NULL DEFAULT '',
      address          TEXT NOT NULL DEFAULT '',
      maps_link        TEXT NOT NULL DEFAULT '',
      facebook         TEXT NOT NULL DEFAULT '',
      instagram        TEXT NOT NULL DEFAULT '',
      twitter          TEXT NOT NULL DEFAULT '',
      linkedin         TEXT NOT NULL DEFAULT '',
      receiving_email  TEXT NOT NULL DEFAULT '',
      created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await ensureTrigger(sql, "contact_content_updated_at", "contact_content");

  console.log("\n── Step 4: Seed singleton rows if empty ─────────────────────\n");

  await runSQL(sql, "Seed about_content", `
    INSERT INTO public.about_content (main_title, short_description, full_text, values)
    SELECT 'عن شركة أفياء', '', '', '[]'
    WHERE NOT EXISTS (SELECT 1 FROM public.about_content);
  `);

  await runSQL(sql, "Seed vision_content", `
    INSERT INTO public.vision_content (vision_text, mission_text, goals)
    SELECT '', '', '[]'
    WHERE NOT EXISTS (SELECT 1 FROM public.vision_content);
  `);

  await runSQL(sql, "Seed contact_content", `
    INSERT INTO public.contact_content (phone, whatsapp, email, address, receiving_email)
    SELECT '', '', '', '', ''
    WHERE NOT EXISTS (SELECT 1 FROM public.contact_content);
  `);

  console.log("\n── Step 5: Row Level Security ───────────────────────────────\n");

  const tables = ["profiles", "about_content", "vision_content", "projects", "project_images", "team_members", "contact_content"];
  for (const table of tables) {
    await runSQL(sql, `Enable RLS on ${table}`, `ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`);
  }

  // Drop all existing policies cleanly and recreate
  await dropAndCreatePolicies(sql);

  console.log("\n── Step 6: Storage buckets ──────────────────────────────────\n");

  await ensureBucket(supabase, "about");
  await ensureBucket(supabase, "projects");
  await ensureBucket(supabase, "team");

  await setupStoragePolicies(sql);

  console.log("\n── Step 7: Admin user setup ─────────────────────────────────\n");

  await setupAdminUser(sql, supabase, ADMIN_EMAIL!);

  console.log("\n══════════════════════════════════════════");
  console.log("  ✅  Setup complete!");
  console.log("══════════════════════════════════════════\n");
  console.log("  Next steps:");
  console.log(`  1. Make sure ${ADMIN_EMAIL} exists in Supabase Auth`);
  console.log("     (Authentication → Users → Add user)\n");
  console.log("  2. Restart your dev server:  npm run dev\n");
  console.log("  3. Login at:  /admin/login\n");

  await sql.end();
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function runSQL(sql: postgres.Sql, label: string, query: string) {
  try {
    await sql.unsafe(query);
    ok(label);
  } catch (e: unknown) {
    // Ignore "already exists" type errors
    const msg = (e as Error).message ?? "";
    if (msg.includes("already exists") || msg.includes("duplicate")) {
      ok(`${label} (already exists)`);
    } else {
      fail(label, msg);
    }
  }
}

async function ensureTrigger(sql: postgres.Sql, triggerName: string, tableName: string) {
  await runSQL(
    sql,
    `Trigger ${triggerName}`,
    `
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = '${triggerName}'
      ) THEN
        CREATE TRIGGER ${triggerName}
          BEFORE UPDATE ON public.${tableName}
          FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
      END IF;
    END;
    $$;
    `
  );
}

async function dropAndCreatePolicies(sql: postgres.Sql) {
  // Drop all existing app policies to avoid conflicts
  const policies = [
    // profiles
    ["profiles", "Admin manage profiles"],
    ["profiles", "Users read own profile"],
    // about_content
    ["about_content", "Public read about_content"],
    ["about_content", "Admin manage about_content"],
    // vision_content
    ["vision_content", "Public read vision_content"],
    ["vision_content", "Admin manage vision_content"],
    // projects
    ["projects", "Public read published projects"],
    ["projects", "Admin manage projects"],
    ["projects", "Admin read all projects"],
    // project_images
    ["project_images", "Public read project_images"],
    ["project_images", "Admin manage project_images"],
    // team_members
    ["team_members", "Public read published team_members"],
    ["team_members", "Admin manage team_members"],
    // contact_content
    ["contact_content", "Public read contact_content"],
    ["contact_content", "Admin manage contact_content"],
    // legacy policies
    ["projects", "Admin all projects"],
    ["project_images", "Admin all project_images"],
    ["about_content", "Admin all about_content"],
    ["vision_content", "Admin all vision_content"],
    ["contact_content", "Admin all contact_content"],
    ["team_members", "Admin all team_members"],
    ["projects", "Public read published projects"],
  ];

  for (const [table, name] of policies) {
    try {
      await sql.unsafe(`DROP POLICY IF EXISTS "${name}" ON public.${table};`);
    } catch {
      // ignore
    }
  }
  ok("Dropped old policies");

  const policySQL = `
    -- profiles: users see own, admin sees all
    CREATE POLICY "Users read own profile"
      ON public.profiles FOR SELECT
      USING (id = auth.uid());

    CREATE POLICY "Admin manage profiles"
      ON public.profiles FOR ALL
      USING (public.is_admin())
      WITH CHECK (public.is_admin());

    -- about_content: public read, admin write
    CREATE POLICY "Public read about_content"
      ON public.about_content FOR SELECT USING (TRUE);

    CREATE POLICY "Admin manage about_content"
      ON public.about_content FOR ALL
      USING (public.is_admin())
      WITH CHECK (public.is_admin());

    -- vision_content: public read, admin write
    CREATE POLICY "Public read vision_content"
      ON public.vision_content FOR SELECT USING (TRUE);

    CREATE POLICY "Admin manage vision_content"
      ON public.vision_content FOR ALL
      USING (public.is_admin())
      WITH CHECK (public.is_admin());

    -- projects: public sees published only, admin sees & manages all
    CREATE POLICY "Public read published projects"
      ON public.projects FOR SELECT
      USING (is_published = TRUE);

    CREATE POLICY "Admin read all projects"
      ON public.projects FOR SELECT
      USING (public.is_admin());

    CREATE POLICY "Admin manage projects"
      ON public.projects FOR ALL
      USING (public.is_admin())
      WITH CHECK (public.is_admin());

    -- project_images: public sees images for published projects
    CREATE POLICY "Public read project_images"
      ON public.project_images FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.projects
          WHERE projects.id = project_images.project_id
            AND projects.is_published = TRUE
        )
      );

    CREATE POLICY "Admin manage project_images"
      ON public.project_images FOR ALL
      USING (public.is_admin())
      WITH CHECK (public.is_admin());

    -- team_members: public sees published, admin manages all
    CREATE POLICY "Public read published team_members"
      ON public.team_members FOR SELECT
      USING (is_published = TRUE);

    CREATE POLICY "Admin manage team_members"
      ON public.team_members FOR ALL
      USING (public.is_admin())
      WITH CHECK (public.is_admin());

    -- contact_content: public read, admin write
    CREATE POLICY "Public read contact_content"
      ON public.contact_content FOR SELECT USING (TRUE);

    CREATE POLICY "Admin manage contact_content"
      ON public.contact_content FOR ALL
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  `;

  await runSQL(sql, "Create all RLS policies", policySQL);
}

async function setupStoragePolicies(sql: postgres.Sql) {
  const buckets = ["about", "projects", "team"];
  const actions = ["SELECT", "INSERT", "UPDATE", "DELETE"] as const;

  for (const bucket of buckets) {
    // Drop old policies
    for (const action of actions) {
      try {
        await sql.unsafe(
          `DROP POLICY IF EXISTS "${bucket}_${action.toLowerCase()}" ON storage.objects;`
        );
      } catch { /* ignore */ }
    }

    // Public read
    await runSQL(sql, `Storage: public read ${bucket}`, `
      CREATE POLICY "${bucket}_select"
        ON storage.objects FOR SELECT
        USING (bucket_id = '${bucket}');
    `);

    // Admin write (INSERT, UPDATE, DELETE) via is_admin()
    for (const action of ["INSERT", "UPDATE", "DELETE"] as const) {
      const clause = action === "INSERT" ? "WITH CHECK" : "USING";
      await runSQL(sql, `Storage: admin ${action.toLowerCase()} ${bucket}`, `
        CREATE POLICY "${bucket}_${action.toLowerCase()}"
          ON storage.objects FOR ${action}
          TO authenticated
          ${clause} (bucket_id = '${bucket}' AND public.is_admin());
      `);
    }
  }
}

async function ensureBucket(supabase: ReturnType<typeof createClient>, name: string) {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = buckets?.some((b) => b.name === name);
    if (exists) {
      ok(`Bucket "${name}" already exists`);
      return;
    }
    const { error } = await supabase.storage.createBucket(name, { public: true });
    if (error) fail(`Create bucket "${name}"`, error.message);
    else ok(`Created bucket "${name}"`);
  } catch (e) {
    fail(`Bucket "${name}"`, e);
  }
}

async function setupAdminUser(
  sql: postgres.Sql,
  supabase: ReturnType<typeof createClient>,
  adminEmail: string
) {
  info(`Looking up admin user: ${adminEmail}`);

  // Find user in auth.users via service role client
  const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });

  if (error) {
    fail("Could not list users – is SUPABASE_SERVICE_ROLE_KEY correct?", error.message);
    return;
  }

  const adminUser = data.users.find((u) => u.email === adminEmail);

  if (!adminUser) {
    warn(`User "${adminEmail}" not found in Auth.`);
    warn(`Create it in Supabase → Authentication → Users → Add user, then re-run.`);
    return;
  }

  ok(`Found user: ${adminUser.email} (${adminUser.id})`);

  // Upsert profile with role = 'admin'
  await runSQL(sql, "Set admin profile role", `
    INSERT INTO public.profiles (id, email, role)
    VALUES ('${adminUser.id}', '${adminEmail}', 'admin')
    ON CONFLICT (id) DO UPDATE SET role = 'admin', email = '${adminEmail}';
  `);

  ok(`Profile role set to 'admin' for ${adminEmail}`);
}

// ── Run ───────────────────────────────────────────────────────────────────────
main().catch((e) => {
  console.error("\n❌  Unexpected error:", e);
  process.exit(1);
});
