CREATE OR REPLACE FUNCTION increment_download_count(image_id UUID)
RETURNS void AS $$
  UPDATE images SET download_count = download_count + 1 WHERE id = image_id;
$$ LANGUAGE sql SECURITY DEFINER;
