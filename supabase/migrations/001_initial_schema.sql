-- migration: 001_initial_schema.sql
-- Description: Complete initial database schema setup for EduVisuals.lk

-- 1. ENUMS SETUP
CREATE TYPE user_role AS ENUM ('free_user', 'premium_user', 'team_creator', 'moderator', 'admin');
CREATE TYPE subscription_status_type AS ENUM ('free', 'premium', 'institution');
CREATE TYPE image_status AS ENUM ('draft', 'pending_review', 'approved', 'rejected');
CREATE TYPE tag_type_category AS ENUM ('subject', 'grade', 'type', 'syllabus', 'medium', 'topic', 'custom');
CREATE TYPE download_type_category AS ENUM ('free_watermarked', 'premium_hd', 'premium_svg');
CREATE TYPE subscription_plan_type AS ENUM ('student_monthly', 'student_yearly', 'institution_monthly');
CREATE TYPE subscription_status_state AS ENUM ('active', 'cancelled', 'expired', 'paused');

-- 2. TABLES CREATION

-- Profiles Table (extends supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'free_user'::user_role,
  subscription_status subscription_status_type DEFAULT 'free'::subscription_status_type,
  subscription_expires_at TIMESTAMPTZ,
  downloads_today INT DEFAULT 0,
  last_download_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Images Table
CREATE TABLE IF NOT EXISTS images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  alt_text TEXT,
  file_url TEXT NOT NULL, -- Cloudflare R2 URL
  thumbnail_url TEXT NOT NULL,
  watermarked_url TEXT,
  svg_url TEXT,
  file_size_bytes INT,
  width INT,
  height INT,
  is_premium BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  status image_status DEFAULT 'draft'::image_status,
  rejection_reason TEXT,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  download_count INT DEFAULT 0,
  view_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Image Tags Table
CREATE TABLE IF NOT EXISTS image_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_id UUID REFERENCES images(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  tag_type tag_type_category DEFAULT 'custom'::tag_type_category
);

-- Downloads Table
CREATE TABLE IF NOT EXISTS downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  image_id UUID REFERENCES images(id) ON DELETE CASCADE,
  download_type download_type_category NOT NULL,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved Collections Table
CREATE TABLE IF NOT EXISTS saved_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT DEFAULT 'My Collection',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved Items Table
CREATE TABLE IF NOT EXISTS saved_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID REFERENCES saved_collections(id) ON DELETE CASCADE,
  image_id UUID REFERENCES images(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(collection_id, image_id)
);

-- Team Invites Table
CREATE TABLE IF NOT EXISTS team_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  role user_role NOT NULL CHECK (role IN ('team_creator'::user_role, 'moderator'::user_role)),
  invited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  plan subscription_plan_type NOT NULL,
  status subscription_status_state DEFAULT 'active'::subscription_status_state,
  payhere_subscription_id TEXT,
  amount_lkr INT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  cancelled_at TIMESTAMPTZ
);

-- 3. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_images_status_published ON images (status, is_published);
CREATE INDEX IF NOT EXISTS idx_images_is_premium ON images (is_premium);
CREATE INDEX IF NOT EXISTS idx_images_uploaded_by ON images (uploaded_by);
CREATE INDEX IF NOT EXISTS idx_image_tags_image_id ON image_tags (image_id);
CREATE INDEX IF NOT EXISTS idx_image_tags_tag_type ON image_tags (tag, tag_type);
CREATE INDEX IF NOT EXISTS idx_downloads_user_image ON downloads (user_id, image_id);
CREATE INDEX IF NOT EXISTS idx_downloads_created_at ON downloads (created_at);
CREATE INDEX IF NOT EXISTS idx_saved_items_collection ON saved_items (collection_id);

-- 4. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view their own profile." ON profiles 
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles." ON profiles 
  FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'::user_role));
CREATE POLICY "Users can update their own profile." ON profiles 
  FOR UPDATE USING (auth.uid() = id);

-- Images Policies
CREATE POLICY "Anyone can view published images." ON images 
  FOR SELECT USING (is_published = true AND status = 'approved'::image_status);
CREATE POLICY "Creators can view their own uploaded images." ON images 
  FOR SELECT USING (uploaded_by = auth.uid());
CREATE POLICY "Admins/Moderators can view all images." ON images 
  FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin'::user_role, 'moderator'::user_role)));
CREATE POLICY "Admins/Creators can manage images." ON images 
  FOR ALL USING (uploaded_by = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'::user_role));

-- Saved Collections Policies
CREATE POLICY "Users can manage their own collections." ON saved_collections 
  FOR ALL USING (user_id = auth.uid());

-- Saved Items Policies
CREATE POLICY "Users can manage items in their own collections." ON saved_items 
  FOR ALL USING (EXISTS (SELECT 1 FROM saved_collections WHERE id = collection_id AND user_id = auth.uid()));

-- Downloads Policies
CREATE POLICY "Users can view own download history." ON downloads 
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can log their own download." ON downloads 
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Team Invites Policies
CREATE POLICY "Only admins can see invites." ON team_invites 
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'::user_role));

-- 5. PROCEDURES & DB FUNCTIONS

-- Atomic increment download count
CREATE OR REPLACE FUNCTION increment_download_count(target_image_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE images 
  SET download_count = download_count + 1
  WHERE id = target_image_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check download limit function
CREATE OR REPLACE FUNCTION check_download_limit(target_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_role user_role;
  current_downloads INT;
  last_download DATE;
BEGIN
  SELECT role, downloads_today, last_download_date INTO current_role, current_downloads, last_download
  FROM profiles WHERE id = target_user_id;

  -- Premium users have unlimited downloads
  IF current_role IN ('premium_user'::user_role, 'admin'::user_role, 'moderator'::user_role) THEN
    RETURN TRUE;
  END IF;

  -- Reset downloads if it's a new day
  IF last_download < CURRENT_DATE THEN
    UPDATE profiles 
    SET downloads_today = 0, last_download_date = CURRENT_DATE
    WHERE id = target_user_id;
    RETURN TRUE;
  END IF;

  -- Free users are capped at 5 downloads per day
  IF current_downloads < 5 THEN
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Daily downloads count reset cron helper
CREATE OR REPLACE FUNCTION reset_daily_downloads()
RETURNS VOID AS $$
BEGIN
  UPDATE profiles 
  SET downloads_today = 0, last_download_date = CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. FULL TEXT SEARCH SETUP
ALTER TABLE images ADD COLUMN IF NOT EXISTS search_vector tsvector;
CREATE INDEX IF NOT EXISTS idx_images_search_vector ON images USING GIN (search_vector);

CREATE OR REPLACE FUNCTION images_search_trigger()
RETURNS TRIGGER AS $$
DECLARE
  tags_string TEXT := '';
BEGIN
  SELECT COALESCE(string_agg(tag, ' '), '') INTO tags_string
  FROM image_tags
  WHERE image_id = NEW.id;

  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', tags_string), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_images_search_update
  BEFORE INSERT OR UPDATE ON images
  FOR EACH ROW EXECUTE FUNCTION images_search_trigger();

-- 7. PROFILE AUTO-CREATION TRIGGER
-- Automatically creates a public profile row when a new user registers in auth.users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role, subscription_status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    CASE 
      WHEN NEW.raw_user_meta_data->>'role' = 'Teacher' THEN 'team_creator'::user_role
      WHEN NEW.raw_user_meta_data->>'role' = 'Institution' THEN 'team_creator'::user_role
      WHEN NEW.raw_user_meta_data->>'role' = 'admin' THEN 'admin'::user_role
      ELSE 'free_user'::user_role
    END,
    'free'::subscription_status_type
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
