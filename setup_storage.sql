-- Create the images storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true);
  
-- Allow public to view images
CREATE POLICY "Public can view images" ON storage.objects
FOR SELECT USING (bucket_id = 'images');
  
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');
