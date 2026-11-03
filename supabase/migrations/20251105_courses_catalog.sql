-- Courses catalog
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution TEXT NOT NULL,
  faculty TEXT,
  course_code TEXT NOT NULL,
  course_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(institution, course_code)
);

CREATE INDEX IF NOT EXISTS idx_courses_institution ON courses(institution);
CREATE INDEX IF NOT EXISTS idx_courses_course_code ON courses(course_code);
CREATE INDEX IF NOT EXISTS idx_courses_faculty ON courses(faculty);

-- Link notes to courses optionally
ALTER TABLE notes
  ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES courses(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_notes_course_id ON notes(course_id);
