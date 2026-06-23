-- Run this in your Supabase SQL Editor to fix the missing profiles and the infinite loop bug!

-- 1. Fix the infinite loop bug
DROP POLICY IF EXISTS "Admins can view all profiles." ON profiles;

-- 2. Create the missing profiles for users who logged in before the trigger was set up
INSERT INTO public.profiles (id, full_name, avatar_url, role, subscription_status)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1)),
  COALESCE(raw_user_meta_data->>'avatar_url', ''),
  'free_user'::user_role,
  'free'::subscription_status_type
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);
