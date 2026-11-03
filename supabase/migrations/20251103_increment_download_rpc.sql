CREATE OR REPLACE FUNCTION increment_download_count(note_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE notes
  SET download_count = COALESCE(download_count, 0) + 1
  WHERE id = note_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
