# EduLink

Digital notes sharing platform for South African students. Web-first (Next.js) with iOS/Android planned (Expo), using Supabase for Auth, Postgres, and Storage.

## Tech Stack

- **Web**: Next.js 15 (App Router, TypeScript), React 19, Tailwind CSS 4, shadcn/ui
- **Backend/Auth/Storage**: Supabase (Auth, Postgres, Storage)
- **Mobile (planned)**: Expo (React Native, TypeScript, Expo Router, NativeWind)

## Project Structure

- `web/` - Next.js 15 app (App Router, TypeScript, Tailwind, shadcn/ui)
- `supabase/migrations/` - Database migrations (schema, profiles/roles/RLS, storage)
- `packages/shared/` - Shared types/utilities
- `docs/` - PRD, App Concept Document, Stitch prompts

## Features Implemented

- **Auth**: Email/password sign up/login with Supabase Auth; profiles auto-created via trigger; `.ac.za` emails flagged
- **Roles/RBAC**: `user`, `moderator`, `admin` roles with RLS policies
- **Notes**: Upload notes to private `notes` bucket (user-scoped paths); notes created with `pending` status requiring moderation
- **Browse**: Browse approved notes
- **Favorites**: User favorites
- **My Uploads**: View/manage user's uploads
- **Moderation**: Moderator/admin queue to approve/reject notes
- **Note Detail & Download**: View notes and download via signed URLs

## Getting Started

### Prerequisites
- Node.js (compatible with Next.js 15)
- Supabase project (Auth, Postgres, Storage)

### Setup

1. Copy environment variables:
   ```bash
   cp web/.env.example web/.env.local
   ```
   Fill in your Supabase credentials (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, etc.).

2. Apply migrations to your Supabase project (from `supabase/migrations/`):
   - `20251030_init_schema.sql` - Core schema
   - `20251030_profiles_trigger_rls.sql` - Profiles trigger, `.ac.za` flagging, RLS
   - `20251030_storage_bucket.sql` - Private `notes` storage bucket setup

3. Install dependencies and run dev server:
   ```bash
   cd web
   npm install
   npm run dev
   ```

### Development

- **Dev server**: `npm run dev` (Next.js dev server)
- **Build**: `npm run build`
- **Start**: `npm run start`
- **Type check**: `npx tsc --noEmit` (from `web/`)

## API

- API routes are versioned under `/api/v1` (per project policy). Breaking changes go to `/api/v2`.
- Example: `GET /api/notes/[id]/download` - Generates signed download URLs for notes.
