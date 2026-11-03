-- Add faculty/department, semester/term, and lecturer filters
ALTER TABLE notes
  ADD COLUMN IF NOT EXISTS faculty TEXT,
  ADD COLUMN IF NOT EXISTS department TEXT,
  ADD COLUMN IF NOT EXISTS semester TEXT,
  ADD COLUMN IF NOT EXISTS term TEXT,
  ADD COLUMN IF NOT EXISTS lecturer TEXT;

CREATE INDEX IF NOT EXISTS idx_notes_faculty ON notes(faculty);
CREATE INDEX IF NOT EXISTS idx_notes_department ON notes(department);
CREATE INDEX IF NOT EXISTS idx_notes_semester ON notes(semester);
CREATE INDEX IF NOT EXISTS idx_notes_term ON notes(term);
CREATE INDEX IF NOT EXISTS idx_notes_lecturer ON notes(lecturer);
