ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS institution TEXT,
  ADD COLUMN IF NOT EXISTS faculty TEXT,
  ADD COLUMN IF NOT EXISTS year_of_study TEXT;

UPDATE profiles
SET institution = COALESCE(institution, institution_affiliation)
WHERE institution IS NULL AND institution_affiliation IS NOT NULL;
