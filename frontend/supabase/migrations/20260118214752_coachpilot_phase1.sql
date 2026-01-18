-- Coachpilot Phase 1 Migration
-- Creates all tables, indexes, RLS policies, and RPC functions for the MVP

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- ============================================================================
-- TABLES
-- ============================================================================

-- Profiles table (one-to-one with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);

-- Decks table
create table if not exists public.decks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Notes table (source notes for cards, for future AI processing)
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_type text,
  raw_text text not null,
  created_at timestamptz not null default now()
);

-- Cards table
create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  deck_id uuid not null references public.decks(id) on delete cascade,
  note_id uuid references public.notes(id) on delete set null,
  front text not null,
  back text not null,
  tags text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Card state table (spaced repetition state)
create table if not exists public.card_state (
  card_id uuid primary key references public.cards(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  due_at timestamptz not null default now(),
  interval_days int not null default 0,
  ease_factor numeric not null default 2.5,
  reps int not null default 0,
  lapses int not null default 0,
  last_reviewed_at timestamptz
);

-- Reviews table (review history log)
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  card_id uuid not null references public.cards(id) on delete cascade,
  rating int not null check (rating in (0, 1, 2, 3)), -- 0=again, 1=hard, 2=good, 3=easy
  reviewed_at timestamptz not null default now(),
  prev_due_at timestamptz,
  next_due_at timestamptz,
  prev_interval_days int,
  next_interval_days int,
  prev_ease_factor numeric,
  next_ease_factor numeric
);

-- Quiz sessions table
create table if not exists public.quiz_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  deck_id uuid not null references public.decks(id) on delete cascade,
  mode text not null,
  total int not null default 0,
  correct int not null default 0,
  started_at timestamptz not null default now(),
  ended_at timestamptz
);

-- Quiz items table
create table if not exists public.quiz_items (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.quiz_sessions(id) on delete cascade,
  card_id uuid not null references public.cards(id) on delete cascade,
  is_correct boolean,
  answered_at timestamptz
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Decks indexes
create index if not exists idx_decks_user_id on public.decks(user_id);

-- Cards indexes
create index if not exists idx_cards_user_id on public.cards(user_id);
create index if not exists idx_cards_deck_id on public.cards(deck_id);
create index if not exists idx_cards_user_deck on public.cards(user_id, deck_id);

-- Card state indexes (critical for review queue performance)
create index if not exists idx_card_state_user_id on public.card_state(user_id);
create index if not exists idx_card_state_due_at on public.card_state(due_at);
-- Composite index for review queue queries (user_id, due_at)
-- This efficiently supports: WHERE user_id = $1 AND due_at <= now() ORDER BY due_at
create index if not exists idx_card_state_user_dueat
  on public.card_state(user_id, due_at);

-- Reviews indexes
create index if not exists idx_reviews_user_id on public.reviews(user_id);
create index if not exists idx_reviews_card_id on public.reviews(card_id);
create index if not exists idx_reviews_user_card_reviewed 
  on public.reviews(user_id, card_id, reviewed_at desc);

-- Quiz indexes
create index if not exists idx_quiz_sessions_user_id on public.quiz_sessions(user_id);
create index if not exists idx_quiz_sessions_deck_id on public.quiz_sessions(deck_id);
create index if not exists idx_quiz_items_session_id on public.quiz_items(session_id);

-- Notes indexes
create index if not exists idx_notes_user_id on public.notes(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.decks enable row level security;
alter table public.notes enable row level security;
alter table public.cards enable row level security;
alter table public.card_state enable row level security;
alter table public.reviews enable row level security;
alter table public.quiz_sessions enable row level security;
alter table public.quiz_items enable row level security;

-- Profiles policies (one-to-one with auth.users)
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can delete own profile"
  on public.profiles for delete
  using (auth.uid() = id);

-- Decks policies
create policy "Users can view own decks"
  on public.decks for select
  using (auth.uid() = user_id);

create policy "Users can insert own decks"
  on public.decks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own decks"
  on public.decks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own decks"
  on public.decks for delete
  using (auth.uid() = user_id);

-- Notes policies
create policy "Users can view own notes"
  on public.notes for select
  using (auth.uid() = user_id);

create policy "Users can insert own notes"
  on public.notes for insert
  with check (auth.uid() = user_id);

create policy "Users can update own notes"
  on public.notes for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own notes"
  on public.notes for delete
  using (auth.uid() = user_id);

-- Cards policies
create policy "Users can view own cards"
  on public.cards for select
  using (auth.uid() = user_id);

create policy "Users can insert own cards"
  on public.cards for insert
  with check (auth.uid() = user_id);

create policy "Users can update own cards"
  on public.cards for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own cards"
  on public.cards for delete
  using (auth.uid() = user_id);

-- Card state policies
create policy "Users can view own card state"
  on public.card_state for select
  using (auth.uid() = user_id);

create policy "Users can insert own card state"
  on public.card_state for insert
  with check (auth.uid() = user_id);

create policy "Users can update own card state"
  on public.card_state for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own card state"
  on public.card_state for delete
  using (auth.uid() = user_id);

-- Reviews policies
create policy "Users can view own reviews"
  on public.reviews for select
  using (auth.uid() = user_id);

create policy "Users can insert own reviews"
  on public.reviews for insert
  with check (auth.uid() = user_id);

create policy "Users can update own reviews"
  on public.reviews for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own reviews"
  on public.reviews for delete
  using (auth.uid() = user_id);

-- Quiz sessions policies
create policy "Users can view own quiz sessions"
  on public.quiz_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own quiz sessions"
  on public.quiz_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own quiz sessions"
  on public.quiz_sessions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own quiz sessions"
  on public.quiz_sessions for delete
  using (auth.uid() = user_id);

-- Quiz items policies
create policy "Users can view own quiz items"
  on public.quiz_items for select
  using (
    exists (
      select 1 from public.quiz_sessions
      where quiz_sessions.id = quiz_items.session_id
      and quiz_sessions.user_id = auth.uid()
    )
  );

create policy "Users can insert own quiz items"
  on public.quiz_items for insert
  with check (
    exists (
      select 1 from public.quiz_sessions
      where quiz_sessions.id = quiz_items.session_id
      and quiz_sessions.user_id = auth.uid()
    )
  );

create policy "Users can update own quiz items"
  on public.quiz_items for update
  using (
    exists (
      select 1 from public.quiz_sessions
      where quiz_sessions.id = quiz_items.session_id
      and quiz_sessions.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.quiz_sessions
      where quiz_sessions.id = quiz_items.session_id
      and quiz_sessions.user_id = auth.uid()
    )
  );

create policy "Users can delete own quiz items"
  on public.quiz_items for delete
  using (
    exists (
      select 1 from public.quiz_sessions
      where quiz_sessions.id = quiz_items.session_id
      and quiz_sessions.user_id = auth.uid()
    )
  );

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_decks_updated_at
  before update on public.decks
  for each row execute procedure public.update_updated_at_column();

create trigger update_cards_updated_at
  before update on public.cards
  for each row execute procedure public.update_updated_at_column();

-- Auto-create card_state when card is created
create or replace function public.handle_new_card()
returns trigger as $$
begin
  insert into public.card_state (card_id, user_id, due_at)
  values (new.id, new.user_id, now());
  return new;
end;
$$ language plpgsql security definer;

create trigger on_card_created
  after insert on public.cards
  for each row execute procedure public.handle_new_card();

-- ============================================================================
-- RPC FUNCTION: apply_review
-- ============================================================================
-- This function applies a review rating and updates card state atomically.
-- Rating: 0=again, 1=hard, 2=good, 3=easy

create or replace function public.apply_review(
  p_card_id uuid,
  p_rating int
)
returns jsonb as $$
declare
  v_user_id uuid;
  v_current_state record;
  v_new_interval_days int;
  v_new_ease_factor numeric;
  v_new_reps int;
  v_new_lapses int;
  v_new_due_at timestamptz;
  v_prev_due_at timestamptz;
  v_prev_interval_days int;
  v_prev_ease_factor numeric;
begin
  -- Get current user
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'User must be authenticated';
  end if;

  -- Validate rating
  if p_rating not in (0, 1, 2, 3) then
    raise exception 'Rating must be 0, 1, 2, or 3';
  end if;

  -- Get current card state
  select 
    cs.due_at,
    cs.interval_days,
    cs.ease_factor,
    cs.reps,
    cs.lapses
  into v_current_state
  from public.card_state cs
  where cs.card_id = p_card_id and cs.user_id = v_user_id;

  if not found then
    raise exception 'Card state not found';
  end if;

  -- Store previous values for review log
  v_prev_due_at := v_current_state.due_at;
  v_prev_interval_days := v_current_state.interval_days;
  v_prev_ease_factor := v_current_state.ease_factor;

  -- Apply SM-2-like algorithm
  if p_rating = 0 then
    -- Again: reset or penalize
    v_new_lapses := v_current_state.lapses + 1;
    v_new_reps := 0; -- Reset reps on again
    v_new_interval_days := 0;
    v_new_ease_factor := greatest(1.3, v_current_state.ease_factor - 0.2);
    v_new_due_at := now() + interval '1 hour'; -- For MVP, use 1 hour instead of 10 minutes
  elsif p_rating = 1 then
    -- Hard: reduce interval and ease
    v_new_lapses := v_current_state.lapses;
    v_new_reps := v_current_state.reps + 1;
    v_new_interval_days := greatest(1, round(v_current_state.interval_days * 1.2));
    v_new_ease_factor := greatest(1.3, v_current_state.ease_factor - 0.15);
    v_new_due_at := now() + (v_new_interval_days || ' days')::interval;
  elsif p_rating = 2 then
    -- Good: normal progression
    v_new_lapses := v_current_state.lapses;
    v_new_reps := v_current_state.reps + 1;
    if v_current_state.reps = 0 then
      v_new_interval_days := 1;
    else
      v_new_interval_days := greatest(1, round(v_current_state.interval_days * v_current_state.ease_factor));
    end if;
    v_new_ease_factor := v_current_state.ease_factor; -- Unchanged
    v_new_due_at := now() + (v_new_interval_days || ' days')::interval;
  else -- p_rating = 3
    -- Easy: increase interval and ease
    v_new_lapses := v_current_state.lapses;
    v_new_reps := v_current_state.reps + 1;
    v_new_interval_days := greatest(1, round(v_current_state.interval_days * (v_current_state.ease_factor + 0.15)));
    v_new_ease_factor := v_current_state.ease_factor + 0.15;
    v_new_due_at := now() + (v_new_interval_days || ' days')::interval;
  end if;

  -- Update card state
  update public.card_state
  set
    due_at = v_new_due_at,
    interval_days = v_new_interval_days,
    ease_factor = v_new_ease_factor,
    reps = v_new_reps,
    lapses = v_new_lapses,
    last_reviewed_at = now()
  where card_id = p_card_id and user_id = v_user_id;

  -- Insert review log
  insert into public.reviews (
    user_id,
    card_id,
    rating,
    prev_due_at,
    next_due_at,
    prev_interval_days,
    next_interval_days,
    prev_ease_factor,
    next_ease_factor
  ) values (
    v_user_id,
    p_card_id,
    p_rating,
    v_prev_due_at,
    v_new_due_at,
    v_prev_interval_days,
    v_new_interval_days,
    v_prev_ease_factor,
    v_new_ease_factor
  );

  -- Return updated state
  return jsonb_build_object(
    'success', true,
    'card_id', p_card_id,
    'interval_days', v_new_interval_days,
    'ease_factor', v_new_ease_factor,
    'reps', v_new_reps,
    'lapses', v_new_lapses,
    'due_at', v_new_due_at
  );
end;
$$ language plpgsql security definer;

-- Grant execute permission to authenticated users
grant execute on function public.apply_review(uuid, int) to authenticated;
