-- Add description column if missing
ALTER TABLE notes
  ADD COLUMN IF NOT EXISTS description TEXT;

-- Add tsvector column for full-text search
ALTER TABLE notes
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english',
      coalesce(title, '') || ' ' ||
      coalesce(course_name, '') || ' ' ||
      coalesce(description, '')
    )
  ) STORED;

-- Create GIN index for full-text search
CREATE INDEX IF NOT EXISTS idx_notes_search_vector ON notes USING GIN (search_vector);
