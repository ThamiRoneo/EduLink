ALTER TABLE notes
  ADD COLUMN IF NOT EXISTS download_count INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_notes_download_count ON notes(download_count DESC);
