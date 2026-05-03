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
