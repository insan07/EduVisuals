-- Drop existing table if needed (since it's a new feature and user might have run it before)
DROP TABLE IF EXISTS uploader_profiles CASCADE;

-- Create the uploader_profiles table to store onboarding data for uploaders
CREATE TABLE IF NOT EXISTS uploader_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  display_name TEXT,
  highest_qualification TEXT,
  subject_areas TEXT[],
  target_audiences TEXT[],
  content_types TEXT[],
  short_bio TEXT,
  portfolio_url TEXT,
  original_content_agreed BOOLEAN DEFAULT false,
  guidelines_agreed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE uploader_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for uploader_profiles
-- Anyone can view uploader profiles (needed for public visual viewing pages)
CREATE POLICY "Anyone can view uploader profiles" ON uploader_profiles 
  FOR SELECT USING (true);

-- Users can insert their own uploader profile
CREATE POLICY "Users can insert their own uploader profile" ON uploader_profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own uploader profile
CREATE POLICY "Users can update their own uploader profile" ON uploader_profiles 
  FOR UPDATE USING (auth.uid() = id);

-- Admins can view all uploader profiles
CREATE POLICY "Admins can view all uploader profiles" ON uploader_profiles 
  FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'::user_role));

-- Trigger to auto-update profile role to team_creator upon onboarding
CREATE OR REPLACE FUNCTION set_uploader_role()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET role = 'team_creator'::user_role
  WHERE id = NEW.id AND role IN ('free_user'::user_role, 'premium_user'::user_role);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_set_uploader_role ON uploader_profiles;

CREATE TRIGGER trigger_set_uploader_role
AFTER INSERT ON uploader_profiles
FOR EACH ROW
EXECUTE FUNCTION set_uploader_role();
