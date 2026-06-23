-- migration: 002_storage_and_fixes.sql
-- Description: Supabase Storage bucket setup, storage policies, and schema fixes

-- 1. Make thumbnail_url nullable (thumbnail is optional during upload)
ALTER TABLE images ALTER COLUMN thumbnail_url DROP NOT NULL;

-- 2. Add image_tags INSERT policy for authorized uploaders
-- (Creators can only manage tags for images they own)
CREATE POLICY "Creators can insert tags for their own images." ON image_tags
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM images
      WHERE images.id = image_id AND images.uploaded_by = auth.uid()
    )
  );

CREATE POLICY "Anyone can read image tags." ON image_tags
  FOR SELECT USING (true);

CREATE POLICY "Admins/Moderators can manage all image tags." ON image_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin'::user_role, 'moderator'::user_role)
    )
  );

-- 3. Subscriptions policy
CREATE POLICY "Users can view their own subscription." ON subscriptions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all subscriptions." ON subscriptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'::user_role
    )
  );

-- 4. Insert a team_creator insert policy for images
-- Contributors (team_creator, moderator, admin) can submit images for review
CREATE POLICY "Contributors can insert new images." ON images
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role IN ('team_creator'::user_role, 'moderator'::user_role, 'admin'::user_role)
    )
  );

-- 5. STORAGE: Create visuals bucket (run this from Supabase Dashboard > Storage if
--    the bucket doesn't already exist, since DDL for storage isn't available in pure SQL)
-- NOTE: Storage buckets must be created via Supabase Dashboard or using the JS client.
-- The following INSERT is for reference and works if using supabase_admin context:
INSERT INTO storage.buckets (id, name, public)
VALUES ('visuals', 'visuals', true)
ON CONFLICT (id) DO NOTHING;

-- 6. STORAGE POLICIES for "visuals" bucket
-- Allow anyone to read published files
CREATE POLICY "Public read access for visuals."
  ON storage.objects FOR SELECT
  USING (bucket_id = 'visuals');

-- Allow authenticated contributors (team_creator, moderator, admin) to upload
CREATE POLICY "Contributors can upload visuals."
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'visuals'
    AND auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('team_creator'::user_role, 'moderator'::user_role, 'admin'::user_role)
    )
  );

-- Allow uploader or admin to delete
CREATE POLICY "Contributors and admins can delete their own uploads."
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'visuals'
    AND auth.uid() IS NOT NULL
    AND (
      (storage.foldername(name))[1] = auth.uid()::TEXT
      OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'::user_role
      )
    )
  );
