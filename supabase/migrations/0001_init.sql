-- Users table (Clerk identity mirror, synced via webhook)
create table public.users (
  id          text primary key,
  email       text not null unique,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz default now()
);

-- Subscriptions (user <-> subreddit mappings)
create table public.subscriptions (
  id           uuid primary key default gen_random_uuid(),
  user_id      text not null references public.users(id) on delete cascade,
  subreddit    text not null,
  display_name text,
  icon_url     text,
  subscribers  bigint,
  created_at   timestamptz default now(),
  unique(user_id, subreddit)
);

-- Newsletter settings (one row per user, created on sign-up)
create table public.newsletter_settings (
  user_id         text primary key references public.users(id) on delete cascade,
  cadence         text not null default 'daily' check (cadence in ('daily', 'weekly')),
  top_posts_count int  not null default 5 check (top_posts_count in (3, 5, 10)),
  is_active       boolean not null default true,
  next_send_at    timestamptz,
  updated_at      timestamptz default now()
);

-- Newsletters (one row per sent digest attempt)
create table public.newsletters (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null references public.users(id) on delete cascade,
  status      text not null default 'pending' check (status in ('pending', 'sent', 'failed')),
  subject     text,
  sent_at     timestamptz,
  created_at  timestamptz default now()
);

-- Newsletter items (individual post summaries within a digest)
create table public.newsletter_items (
  id             uuid primary key default gen_random_uuid(),
  newsletter_id  uuid not null references public.newsletters(id) on delete cascade,
  subreddit      text not null,
  post_id        text not null,
  post_title     text not null,
  post_url       text not null,
  post_permalink text not null,
  upvotes        int,
  summary        text not null,
  position       int not null,
  created_at     timestamptz default now()
);

-- Invites (email invitations with accept tokens)
create table public.invites (
  id            uuid primary key default gen_random_uuid(),
  inviter_id    text not null references public.users(id) on delete cascade,
  invitee_email text not null,
  token         text not null unique default encode(gen_random_bytes(32), 'hex'),
  accepted_at   timestamptz,
  created_at    timestamptz default now()
);

-- Indexes
create index on public.subscriptions(user_id);
create index on public.newsletters(user_id, created_at desc);
create index on public.newsletter_items(newsletter_id, subreddit, position);
create index on public.newsletter_settings(next_send_at) where is_active = true;
create index on public.invites(token);

-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.subscriptions enable row level security;
alter table public.newsletter_settings enable row level security;
alter table public.newsletters enable row level security;
alter table public.newsletter_items enable row level security;
alter table public.invites enable row level security;

-- RLS policies
-- Users can only see/edit their own row
create policy "users_self" on public.users
  for all using (auth.jwt() ->> 'sub' = id);

-- Users can only access their own subscriptions
create policy "subscriptions_own" on public.subscriptions
  for all using (auth.jwt() ->> 'sub' = user_id);

-- Users can only access their own newsletter settings
create policy "settings_own" on public.newsletter_settings
  for all using (auth.jwt() ->> 'sub' = user_id);

-- Users can only access their own newsletters
create policy "newsletters_own" on public.newsletters
  for all using (auth.jwt() ->> 'sub' = user_id);

-- Users can only access items belonging to their own newsletters
create policy "items_own" on public.newsletter_items
  for all using (
    exists (
      select 1 from public.newsletters n
      where n.id = newsletter_id
        and auth.jwt() ->> 'sub' = n.user_id
    )
  );

-- Users can only see invites they sent
create policy "invites_own" on public.invites
  for all using (auth.jwt() ->> 'sub' = inviter_id);
