-- Add description, semester/term, academic_year to notes
ALTER TABLE notes
  ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE notes
  ADD COLUMN IF NOT EXISTS semester TEXT;

ALTER TABLE notes
  ADD COLUMN IF NOT EXISTS term TEXT;

ALTER TABLE notes
  ADD COLUMN IF NOT EXISTS academic_year TEXT;

CREATE INDEX IF NOT EXISTS idx_notes_academic_year ON notes(academic_year);
CREATE INDEX IF NOT EXISTS idx_notes_semester ON notes(semester);
CREATE INDEX IF NOT EXISTS idx_notes_term ON notes(term);
