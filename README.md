# EduLink

Digital notes sharing platform for South African students. Web-first (Next.js) with iOS/Android planned (Expo), using Supabase for Auth, Postgres, and Storage.

## Structure
- `web/` - Next.js 15 app (App Router, TypeScript, Tailwind, shadcn/ui)
- `supabase/migrations/` - Database migrations
- `docs/` - PRD, App Concept Document, Stitch prompts

## Getting Started
1. Copy `web/.env.example` to `web/.env.local` and fill Supabase credentials
2. Run migrations in Supabase
3. `cd web && npm run dev`
