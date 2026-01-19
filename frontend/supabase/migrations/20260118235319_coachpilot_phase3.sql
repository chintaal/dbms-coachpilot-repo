-- Coachpilot Phase 3 Migration
-- Adds statistics tracking, daily reviews, and analytics support

-- ============================================================================
-- USER STATISTICS TABLE
-- ============================================================================

create table if not exists public.user_stats (
  user_id uuid primary key references auth.users(id) on delete cascade,
  total_cards_reviewed int not null default 0,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  last_review_date date,
  total_study_time_minutes int not null default 0,
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- DAILY REVIEWS TABLE (for heatmap)
-- ============================================================================

create table if not exists public.daily_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  review_date date not null,
  cards_reviewed int not null default 0,
  unique(user_id, review_date)
);

-- ============================================================================
-- UPDATE REVIEWS TABLE
-- ============================================================================

-- Add review_duration_seconds column to reviews table
alter table public.reviews
  add column if not exists review_duration_seconds int;

-- ============================================================================
-- INDEXES
-- ============================================================================

-- User stats indexes
create index if not exists idx_user_stats_user_id on public.user_stats(user_id);

-- Daily reviews indexes
create index if not exists idx_daily_reviews_user_id on public.daily_reviews(user_id);
create index if not exists idx_daily_reviews_review_date on public.daily_reviews(review_date);
create index if not exists idx_daily_reviews_user_date on public.daily_reviews(user_id, review_date desc);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Enable RLS on new tables
alter table public.user_stats enable row level security;
alter table public.daily_reviews enable row level security;

-- User stats policies
create policy "Users can view own stats"
  on public.user_stats for select
  using (auth.uid() = user_id);

create policy "Users can update own stats"
  on public.user_stats for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can insert own stats"
  on public.user_stats for insert
  with check (auth.uid() = user_id);

-- Daily reviews policies
create policy "Users can view own daily reviews"
  on public.daily_reviews for select
  using (auth.uid() = user_id);

create policy "Users can insert own daily reviews"
  on public.daily_reviews for insert
  with check (auth.uid() = user_id);

create policy "Users can update own daily reviews"
  on public.daily_reviews for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update user stats after a review
create or replace function public.update_user_stats_after_review()
returns trigger as $$
declare
  v_user_id uuid;
  v_review_date date;
  v_existing_streak int;
  v_new_streak int;
  v_last_review_date date;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    return new;
  end if;

  v_review_date := date(new.reviewed_at);

  -- Get or create user stats
  insert into public.user_stats (user_id, total_cards_reviewed, last_review_date)
  values (v_user_id, 1, v_review_date)
  on conflict (user_id) do update
  set
    total_cards_reviewed = user_stats.total_cards_reviewed + 1,
    last_review_date = v_review_date,
    updated_at = now();

  -- Update daily reviews
  insert into public.daily_reviews (user_id, review_date, cards_reviewed)
  values (v_user_id, v_review_date, 1)
  on conflict (user_id, review_date) do update
  set cards_reviewed = daily_reviews.cards_reviewed + 1;

  -- Calculate streak
  select last_review_date, current_streak
  into v_last_review_date, v_existing_streak
  from public.user_stats
  where user_id = v_user_id;

  if v_last_review_date is null then
    -- First review
    v_new_streak := 1;
  elsif v_review_date = v_last_review_date then
    -- Same day, keep streak
    v_new_streak := v_existing_streak;
  elsif v_review_date = v_last_review_date + interval '1 day' then
    -- Consecutive day, increment streak
    v_new_streak := v_existing_streak + 1;
  else
    -- Streak broken, reset to 1
    v_new_streak := 1;
  end if;

  -- Update streak
  update public.user_stats
  set
    current_streak = v_new_streak,
    longest_streak = greatest(longest_streak, v_new_streak),
    last_review_date = v_review_date
  where user_id = v_user_id;

  return new;
end;
$$ language plpgsql security definer;

-- Trigger to update stats after review
drop trigger if exists trigger_update_user_stats_after_review on public.reviews;
create trigger trigger_update_user_stats_after_review
  after insert on public.reviews
  for each row
  execute function public.update_user_stats_after_review();

-- Function to get user statistics
create or replace function public.get_user_statistics(p_user_id uuid default auth.uid())
returns jsonb as $$
declare
  v_stats jsonb;
  v_recent_activity jsonb;
begin
  -- Get user stats
  select jsonb_build_object(
    'total_cards_reviewed', coalesce(us.total_cards_reviewed, 0),
    'current_streak', coalesce(us.current_streak, 0),
    'longest_streak', coalesce(us.longest_streak, 0),
    'total_study_time_minutes', coalesce(us.total_study_time_minutes, 0),
    'last_review_date', us.last_review_date
  )
  into v_stats
  from public.user_stats us
  where us.user_id = p_user_id;

  -- Get recent activity (last 30 days)
  select jsonb_agg(
    jsonb_build_object(
      'date', dr.review_date,
      'cards_reviewed', dr.cards_reviewed
    ) order by dr.review_date desc
  )
  into v_recent_activity
  from public.daily_reviews dr
  where dr.user_id = p_user_id
    and dr.review_date >= current_date - interval '30 days';

  return jsonb_build_object(
    'stats', coalesce(v_stats, '{}'::jsonb),
    'recent_activity', coalesce(v_recent_activity, '[]'::jsonb)
  );
end;
$$ language plpgsql security definer;

-- Grant execute permission
grant execute on function public.get_user_statistics(uuid) to authenticated;
