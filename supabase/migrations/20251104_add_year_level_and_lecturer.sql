-- Add year_level to notes
ALTER TABLE notes
  ADD COLUMN IF NOT EXISTS year_level TEXT;

-- Ensure lecturer exists (defensive)
ALTER TABLE notes
  ADD COLUMN IF NOT EXISTS lecturer TEXT;

CREATE INDEX IF NOT EXISTS idx_notes_year_level ON notes(year_level);
CREATE INDEX IF NOT EXISTS idx_notes_lecturer ON notes(lecturer);
