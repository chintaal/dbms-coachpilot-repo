# Row Level Security (RLS) Policies

## Overview

Row Level Security (RLS) is enabled by default on all tables. This ensures that users can only access data they're authorized to see, even if they have the `anon` key.

## Default Policy Pattern

### User-Owned Tables

For tables where each row belongs to a specific user:

```sql
-- Example: profiles table
create table profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  name text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table profiles enable row level security;

-- SELECT: Users can only see their own rows
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = user_id);

-- INSERT: Users can only insert rows with their own user_id
create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = user_id);

-- UPDATE: Users can only update their own rows
create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- DELETE: Users can only delete their own rows
create policy "Users can delete own profile"
  on profiles for delete
  using (auth.uid() = user_id);
```

### Public Read, Authenticated Write

For tables that are publicly readable but only writable by authenticated users:

```sql
create table posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  title text not null,
  content text,
  created_at timestamptz default now()
);

alter table posts enable row level security;

-- Anyone can read
create policy "Posts are viewable by everyone"
  on posts for select
  using (true);

-- Only authenticated users can insert
create policy "Authenticated users can create posts"
  on posts for insert
  with check (auth.role() = 'authenticated');

-- Only the author can update/delete
create policy "Users can update own posts"
  on posts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own posts"
  on posts for delete
  using (auth.uid() = user_id);
```

## Best Practices

1. **Always enable RLS** on tables containing user data
2. **Use `auth.uid()`** to get the current user's ID in policies
3. **Use `auth.role()`** to check if user is authenticated (`'authenticated'`) or anonymous (`'anon'`)
4. **Test policies** by switching between authenticated and anonymous contexts
5. **Never bypass RLS** by using `service_role` key on the client

## Testing RLS Policies

In Supabase Dashboard:
1. Go to Authentication > Policies
2. Test queries as different users
3. Verify that users can only see/modify their own data

In your application:
- Test with authenticated users
- Test with anonymous users
- Verify that unauthorized access is blocked

## Common Patterns

### User Profile (One-to-One)
- One row per user
- `user_id` is unique
- User can only access their own row

### User Collections (One-to-Many)
- Multiple rows per user
- `user_id` is not unique
- User can only access rows where `auth.uid() = user_id`

### Public Data with Ownership
- All users can read
- Only owners can write
- Use `auth.uid() = user_id` for write policies
