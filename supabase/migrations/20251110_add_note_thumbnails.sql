-- Add thumbnail_path for note card cover previews.
-- thumbnail_path stores the storage object path in the note-thumbnails bucket.
-- NULL means the UI should render a placeholder cover.
ALTER TABLE notes ADD COLUMN IF NOT EXISTS thumbnail_path TEXT;

-- Create public bucket for MVP note cover previews (approved/public note cards).
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'note-thumbnails',
  'note-thumbnails',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Ensure storage RLS is enabled (safe when privileges are insufficient).
DO $$
BEGIN
  EXECUTE 'ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY';
EXCEPTION
  WHEN insufficient_privilege THEN NULL;
END $$;

-- Recreate policies idempotently.
DROP POLICY IF EXISTS "Note thumbnail images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own note thumbnail" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own note thumbnail" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own note thumbnail" ON storage.objects;

-- Public read for MVP cover previews.
CREATE POLICY "Note thumbnail images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'note-thumbnails');

-- Authenticated users manage only objects under their own folder prefix {auth.uid()}/...
CREATE POLICY "Users can upload their own note thumbnail"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'note-thumbnails' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own note thumbnail"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'note-thumbnails' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own note thumbnail"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'note-thumbnails' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
