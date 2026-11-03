-- Add document_type enum and column to notes
CREATE TYPE document_type AS ENUM ('Lecture Notes', 'Past Paper', 'Assignment', 'Tutorial', 'Lab Report', 'Other');

ALTER TABLE notes
  ADD COLUMN IF NOT EXISTS document_type document_type;

CREATE INDEX IF NOT EXISTS idx_notes_document_type ON notes(document_type);
