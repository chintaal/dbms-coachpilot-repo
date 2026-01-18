-- Coachpilot Phase 2 Migration
-- Adds rich text support, image support, card templates, and storage bucket

-- ============================================================================
-- CARDS TABLE UPDATES
-- ============================================================================

-- Add rich text HTML columns
alter table public.cards
  add column if not exists front_html text,
  add column if not exists back_html text;

-- Add image URL columns
alter table public.cards
  add column if not exists front_image_url text,
  add column if not exists back_image_url text;

-- Add template reference
alter table public.cards
  add column if not exists template_id uuid;

-- ============================================================================
-- CARD TEMPLATES TABLE
-- ============================================================================

create table if not exists public.card_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  front_template text not null,
  back_template text not null,
  default_tags text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add foreign key constraint for template_id in cards
alter table public.cards
  add constraint cards_template_id_fkey
  foreign key (template_id)
  references public.card_templates(id)
  on delete set null;

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Card templates indexes
create index if not exists idx_card_templates_user_id on public.card_templates(user_id);
create index if not exists idx_cards_template_id on public.cards(template_id);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Enable RLS on card_templates
alter table public.card_templates enable row level security;

-- Card templates policies
create policy "Users can view own templates"
  on public.card_templates for select
  using (auth.uid() = user_id);

create policy "Users can insert own templates"
  on public.card_templates for insert
  with check (auth.uid() = user_id);

create policy "Users can update own templates"
  on public.card_templates for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own templates"
  on public.card_templates for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp for card_templates
create or replace function public.update_card_templates_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_card_templates_updated_at
  before update on public.card_templates
  for each row
  execute function public.update_card_templates_updated_at();

-- ============================================================================
-- STORAGE BUCKET (Note: This must be created via Supabase Dashboard or CLI)
-- ============================================================================

-- Storage bucket creation is done via Supabase Dashboard or CLI:
-- supabase storage create card-images --public
--
-- RLS policies for storage are set via Supabase Dashboard:
-- 1. Public read access for all files
-- 2. Authenticated users can upload to their own folder: {user_id}/*
-- 3. Users can delete their own files

-- Example RLS policy for storage (set via Dashboard):
-- Policy name: "Public read access"
-- Policy definition: true
-- Policy command: SELECT
--
-- Policy name: "Users can upload to own folder"
-- Policy definition: bucket_id = 'card-images' AND (storage.foldername(name))[1] = auth.uid()::text
-- Policy command: INSERT
--
-- Policy name: "Users can delete own files"
-- Policy definition: bucket_id = 'card-images' AND (storage.foldername(name))[1] = auth.uid()::text
-- Policy command: DELETE
