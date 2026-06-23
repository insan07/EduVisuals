CREATE OR REPLACE FUNCTION increment_view_count(image_id UUID)
RETURNS void AS $$
  UPDATE images SET view_count = view_count + 1 WHERE id = image_id;
$$ LANGUAGE sql SECURITY DEFINER;
