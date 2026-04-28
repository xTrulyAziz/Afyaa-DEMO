-- ============================================================
-- Afyaa Agricultural Company - Supabase Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

-- About Content
CREATE TABLE IF NOT EXISTS about_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  main_title TEXT NOT NULL DEFAULT 'عن شركة أفياء',
  short_description TEXT NOT NULL DEFAULT '',
  full_text TEXT NOT NULL DEFAULT '',
  values JSONB NOT NULL DEFAULT '[]',
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Vision Content
CREATE TABLE IF NOT EXISTS vision_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vision_text TEXT NOT NULL DEFAULT '',
  mission_text TEXT NOT NULL DEFAULT '',
  goals JSONB NOT NULL DEFAULT '[]',
  stat_projects INTEGER NOT NULL DEFAULT 0,
  stat_years INTEGER NOT NULL DEFAULT 0,
  stat_clients INTEGER NOT NULL DEFAULT 0,
  stat_green_areas INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  project_date DATE,
  cover_image_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Project Images (gallery)
CREATE TABLE IF NOT EXISTS project_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Team Members
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  image_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Contact Content
CREATE TABLE IF NOT EXISTS contact_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone TEXT NOT NULL DEFAULT '',
  whatsapp TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  maps_link TEXT NOT NULL DEFAULT '',
  facebook TEXT NOT NULL DEFAULT '',
  instagram TEXT NOT NULL DEFAULT '',
  twitter TEXT NOT NULL DEFAULT '',
  linkedin TEXT NOT NULL DEFAULT '',
  receiving_email TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER about_content_updated_at
  BEFORE UPDATE ON about_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER vision_content_updated_at
  BEFORE UPDATE ON vision_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER contact_content_updated_at
  BEFORE UPDATE ON contact_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- SEED INITIAL ROWS (one row per singleton table)
-- ============================================================

INSERT INTO about_content (main_title, short_description, full_text, values)
VALUES (
  'عن شركة أفياء',
  'شركة أفياء للزراعة والتشجير - رواد في مجال التطوير الزراعي بالمملكة العربية السعودية',
  'شركة أفياء هي شركة زراعية متخصصة تأسست بهدف تطوير القطاع الزراعي في المملكة العربية السعودية.',
  '[{"title": "الاستدامة", "description": "نلتزم بممارسات زراعية مستدامة تحافظ على البيئة."}, {"title": "الجودة", "description": "نسعى دائماً لتقديم أعلى معايير الجودة في مشاريعنا."}, {"title": "الابتكار", "description": "نتبنى أحدث التقنيات الزراعية لتحقيق أفضل النتائج."}]'
) ON CONFLICT DO NOTHING;

INSERT INTO vision_content (vision_text, mission_text, goals, stat_projects, stat_years, stat_clients, stat_green_areas)
VALUES (
  'أن نكون الشريك الزراعي الأول والأكثر موثوقية في المملكة العربية السعودية.',
  'تطوير القطاع الزراعي من خلال تقديم حلول مبتكرة ومستدامة تسهم في تحقيق رؤية 2030.',
  '[{"text": "توسيع المساحات الخضراء في المناطق الحضرية"}, {"text": "تطوير مشاريع زراعية متكاملة"}, {"text": "دعم الاستدامة البيئية والاقتصادية"}]',
  0, 0, 0, 0
) ON CONFLICT DO NOTHING;

INSERT INTO contact_content (phone, whatsapp, email, address, receiving_email)
VALUES (
  '+966 XX XXX XXXX',
  '+966 XX XXX XXXX',
  'info@afyaa.com',
  'المملكة العربية السعودية',
  'info@afyaa.com'
) ON CONFLICT DO NOTHING;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE about_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE vision_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read about_content"
  ON about_content FOR SELECT USING (TRUE);

CREATE POLICY "Public read vision_content"
  ON vision_content FOR SELECT USING (TRUE);

CREATE POLICY "Public read published projects"
  ON projects FOR SELECT USING (is_published = TRUE);

CREATE POLICY "Public read project_images"
  ON project_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_images.project_id
      AND projects.is_published = TRUE
    )
  );

CREATE POLICY "Public read contact_content"
  ON contact_content FOR SELECT USING (TRUE);

-- Admin full access policies (service role bypasses RLS, but for anon/authenticated roles):
-- These policies allow authenticated admin to do everything
CREATE POLICY "Admin all about_content"
  ON about_content FOR ALL
  TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Admin all vision_content"
  ON vision_content FOR ALL
  TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Admin all projects"
  ON projects FOR ALL
  TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Admin all project_images"
  ON project_images FOR ALL
  TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Admin all contact_content"
  ON contact_content FOR ALL
  TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Public read published team_members"
  ON team_members FOR SELECT USING (is_published = TRUE);

CREATE POLICY "Admin all team_members"
  ON team_members FOR ALL
  TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
-- Run these in the Supabase Dashboard > Storage > New Bucket
-- OR via the SQL editor using storage schema:

INSERT INTO storage.buckets (id, name, public)
VALUES ('about', 'about', TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('projects', 'projects', TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('team', 'team', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
CREATE POLICY "Public read about bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'about');

CREATE POLICY "Admin upload about bucket"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'about');

CREATE POLICY "Admin update about bucket"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'about');

CREATE POLICY "Admin delete about bucket"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'about');

CREATE POLICY "Public read projects bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'projects');

CREATE POLICY "Admin upload projects bucket"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'projects');

CREATE POLICY "Admin update projects bucket"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'projects');

CREATE POLICY "Admin delete projects bucket"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'projects');

CREATE POLICY "Public read team bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'team');

CREATE POLICY "Admin upload team bucket"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'team');

CREATE POLICY "Admin update team bucket"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'team');

CREATE POLICY "Admin delete team bucket"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'team');
