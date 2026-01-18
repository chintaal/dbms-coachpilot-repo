# Phase 1: Coachpilot MVP

## Overview

Phase 1 implements a production-ready MVP of Coachpilot, an Anki++ style flashcard application with spaced repetition scheduling. This phase includes authentication, deck and card management, spaced repetition reviews, quiz sessions, note importing, and voice-to-text card creation.

## Architecture

### Technology Stack

- **Frontend**: Next.js 16 App Router with TypeScript and Tailwind CSS
- **Backend**: Supabase Cloud (PostgreSQL database with Row Level Security)
- **Authentication**: Supabase Auth (email/password)
- **State Management**: React Server Components + Server Actions

### Key Architectural Decisions

1. **Server Components by Default**: All data fetching happens in Server Components for zero client-side JS overhead
2. **Server Actions**: Mutations use Server Actions instead of API routes for better performance
3. **Database RPC Functions**: Complex operations (like review application) use PostgreSQL functions for atomicity
4. **Optimistic Updates**: UI updates instantly using `useOptimistic` hook for better perceived performance
5. **RLS-First**: All database access uses Row Level Security with `anon` key - no `service_role` on client

## Database Schema

### Tables

- `profiles` - User profiles (one-to-one with auth.users)
- `decks` - Flashcard decks
- `notes` - Source notes for cards (for future AI processing)
- `cards` - Flashcard content (front/back)
- `card_state` - Spaced repetition state (due_at, interval, ease_factor, reps, lapses)
- `reviews` - Review history log
- `quiz_sessions` - Quiz session metadata
- `quiz_items` - Individual quiz answers

### Key Features

- **Automatic card_state creation**: Trigger creates card_state when card is created
- **Automatic profile creation**: Trigger creates profile when user signs up
- **RLS policies**: All tables have RLS enabled with user_id-based policies
- **Indexes**: Optimized indexes for common queries (user_id, due_at, etc.)

### Database Function

- `apply_review(card_id, rating)` - Atomically applies a review rating, updates card_state, and logs to reviews table

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- Supabase Cloud account and project
- Supabase CLI installed and linked to your project

### Initial Setup

1. **Clone and install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.local.example .env.local
   ```
   Edit `.env.local` and add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Apply database migration**:
   ```bash
   # Make sure you're linked to your Supabase project
   supabase link --project-ref your-project-ref
   
   # Apply the migration
   supabase db push
   ```
   Or apply manually via Supabase Dashboard SQL Editor:
   - Copy contents of `supabase/migrations/20260118214752_coachpilot_phase1.sql`
   - Paste into SQL Editor and run

4. **Generate TypeScript types**:
   ```bash
   npm run sb:sync
   ```
   This pulls the schema and generates types in `src/types/supabase.ts`

5. **Start development server**:
   ```bash
   npm run dev
   ```

6. **Open in browser**:
   Navigate to `http://localhost:3000`

## Usage

### Authentication

1. Navigate to `/auth`
2. Sign up with email/password or sign in if you already have an account
3. You'll be redirected to `/app` dashboard

### Creating Decks and Cards

1. From the dashboard (`/app`), click "Create Deck"
2. Enter a title and optional description
3. Click on a deck to view/add cards
4. Use the form to create cards with front/back text and optional tags

### Spaced Repetition Review

1. Navigate to `/app/review`
2. Cards due for review will appear
3. Click "Reveal Answer" to see the back of the card
4. Rate your performance: Again, Hard, Good, or Easy
5. The system automatically updates the card's next due date based on the SM-2 algorithm

### Quiz Mode

1. Navigate to `/app/quiz`
2. Select a deck
3. Go through cards one by one
4. Reveal answers and mark as correct/incorrect
5. View your score at the end

### Import Notes

1. Navigate to `/app/import`
2. Paste your notes into the textarea
3. Click "Create Note"
4. Create cards manually from notes using the form below each note

### Voice Card Creation

1. Navigate to `/app/voice`
2. Select a deck
3. Click the microphone button next to "Front" or "Back"
4. Speak your text (requires browser microphone permission)
5. Edit the transcribed text if needed
6. Click "Create Card"

## Database Sync Workflow

### After Making Schema Changes in Supabase Dashboard

1. Pull the latest schema:
   ```bash
   npm run sb:pull
   ```

2. Generate types:
   ```bash
   npm run sb:types
   ```

   Or do both at once:
   ```bash
   npm run sb:sync
   ```

3. Commit the new migration file that was created in `supabase/migrations/`

## RLS (Row Level Security)

All tables have RLS enabled. Users can only access their own data. Policies check `auth.uid() = user_id` for all operations.

See `docs/RLS.md` for detailed RLS policy patterns.

## Performance Optimizations

1. **Database RPC for reviews**: Single transaction instead of 3+ queries
2. **Server Components**: Zero client-side JS for data fetching
3. **Server Actions**: No API route overhead
4. **Optimistic updates**: Instant UI feedback
5. **Proper indexes**: Fast queries on user_id and due_at
6. **Request deduplication**: React cache() for same-request deduplication
7. **Streaming SSR**: Progressive rendering with Suspense
8. **Selective revalidation**: Only invalidate what changed

## File Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── actions/          # Server Actions
│   │   ├── auth/              # Auth page
│   │   ├── app/               # Protected app routes
│   │   │   ├── decks/        # Deck management
│   │   │   ├── review/        # Spaced repetition review
│   │   │   ├── quiz/          # Quiz mode
│   │   │   ├── import/        # Note import
│   │   │   └── voice/         # Voice card creation
│   │   └── layout.tsx         # Root layout
│   ├── components/
│   │   └── branding/         # Logo components
│   ├── lib/
│   │   ├── auth/              # Auth helpers
│   │   ├── db/                # Data access layer
│   │   ├── srs/               # Spaced repetition scheduler
│   │   └── supabase/          # Supabase clients
│   └── types/
│       └── supabase.ts        # Generated types
├── supabase/
│   └── migrations/           # Database migrations
└── docs/                      # Documentation
```

## Troubleshooting

### Types are out of sync

Run `npm run sb:sync` to regenerate types after schema changes.

### RLS blocking queries

Make sure you're authenticated and using the `anon` key (not `service_role`). Check that RLS policies are correctly set up in the migration.

### Migration fails

Check that:
- You're linked to the correct Supabase project
- All required extensions are enabled (uuid-ossp)
- No conflicting migrations exist

## Next Steps

After Phase 1, potential enhancements:

- AI-powered card generation from notes
- Card templates
- Shared/public decks
- Mobile app
- Advanced analytics
- Export/import decks
- Rich text editor for cards
- Image support for cards
