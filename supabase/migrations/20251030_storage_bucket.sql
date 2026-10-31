-- Create private notes bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'notes',
  'notes',
  false,
  104857600,
  ARRAY[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage RLS policies (run as owner via Supabase dashboard with service role context)
DO $$
BEGIN
  -- Enable RLS if not already enabled
  EXECUTE 'ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY';
EXCEPTION
  WHEN insufficient_privilege THEN
    NULL;
END $$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload notes" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own notes" ON storage.objects;
DROP POLICY IF EXISTS "Moderators can view all notes" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own notes" ON storage.objects;

-- Create policies
CREATE POLICY "Authenticated users can upload notes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'notes' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own notes"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'notes' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Moderators can view all notes"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'notes' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('moderator', 'admin')
  )
);

CREATE POLICY "Users can delete their own notes"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'notes' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
