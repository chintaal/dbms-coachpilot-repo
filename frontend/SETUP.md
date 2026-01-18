# Coachpilot Setup Guide

## Quick Start

The database migration needs to be applied before the app will work. Follow these steps:

### Step 1: Apply Database Migration

You have two options:

#### Option A: Using Supabase CLI (Recommended)

1. Make sure you're linked to your Supabase project:
   ```bash
   cd frontend
   supabase link --project-ref your-project-ref
   ```

2. Apply the migration:
   ```bash
   supabase db push
   ```

#### Option B: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the migration file: `supabase/migrations/20260118214752_coachpilot_phase1.sql`
4. Copy the entire contents
5. Paste into the SQL Editor
6. Click **Run** to execute

### Step 2: Generate TypeScript Types

After applying the migration, generate the TypeScript types:

```bash
cd frontend
npm run sb:sync
```

This will:
- Pull the latest schema from Supabase
- Generate TypeScript types in `src/types/supabase.ts`

### Step 3: Configure Environment Variables

1. Copy the example env file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

   You can find these in your Supabase Dashboard under **Settings > API**.

### Step 4: Start the Development Server

```bash
npm run dev
```

The app should now work! Navigate to `http://localhost:3000` and sign up to get started.

## Troubleshooting

### "Could not find the table 'public.decks' in the schema cache"

This error means the migration hasn't been applied yet. Follow **Step 1** above to apply the migration.

### Types are out of sync

Run `npm run sb:sync` to regenerate types after applying the migration.

### Authentication errors

Make sure your `.env.local` file has the correct Supabase URL and anon key.

## What Gets Created

The migration creates:

- **8 tables**: profiles, decks, notes, cards, card_state, reviews, quiz_sessions, quiz_items
- **Indexes**: Optimized for fast queries
- **RLS policies**: Row-level security for all tables
- **Triggers**: Auto-create profile and card_state
- **RPC function**: `apply_review()` for atomic review processing

## Verification

After applying the migration, you can verify in Supabase Dashboard:

1. Go to **Table Editor**
2. You should see all 8 tables listed
3. Check **Database > Functions** to see `apply_review` function
4. Check **Authentication > Policies** to see RLS policies
