-- Allow anyone to view profiles (so users can see who uploaded a visual, their avatar, and display name)
CREATE POLICY "Anyone can view profiles." ON profiles 
  FOR SELECT USING (true);
