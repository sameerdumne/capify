-- Supabase schema for Capify

-- Enable uuid-ossp extension if needed
-- create extension if not exists "uuid-ossp";

-- songs table
create table if not exists songs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist text not null,
  language text not null,
  genre text not null,
  mood text not null,
  youtube_url text not null,
  youtube_video_id text not null,
  thumbnail_url text,
  duration int,
  created_at timestamptz default now()
);

-- saved songs
create table if not exists saved_songs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  song_id uuid references songs(id) on delete cascade,
  created_at timestamptz default now()
);

-- Basic roles table (optional)
create table if not exists roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  role text not null,
  created_at timestamptz default now()
);

-- Recently played songs history
create table if not exists song_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  song_id uuid not null references songs(id) on delete cascade,
  played_at timestamptz default now()
);

-- Create index for faster queries
create index if not exists idx_song_history_user_id on song_history(user_id);
create index if not exists idx_song_history_played_at on song_history(played_at);

-- Keep listening history scoped to the signed-in account
alter table song_history enable row level security;

drop policy if exists "Users can view their own song history" on song_history;
create policy "Users can view their own song history"
  on song_history for select
  using (auth.uid() = user_id);

drop policy if exists "Users can add their own song history" on song_history;
create policy "Users can add their own song history"
  on song_history for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can clear their own song history" on song_history;
create policy "Users can clear their own song history"
  on song_history for delete
  using (auth.uid() = user_id);
