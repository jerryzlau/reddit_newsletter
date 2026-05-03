# Reddit Newsletter

An AI-powered digest service that transforms Reddit communities into clean, summarized email newsletters. Users subscribe to subreddits, configure cadence and depth, and receive Claude-generated digests without the noise of the Reddit feed.

**Target personas:** Busy professionals, information junkies, and minimalists who prefer email-based workflows over social media feeds.

## Architecture

| Layer | Choice |
|---|---|
| Framework | Next.js 15 App Router (TypeScript) |
| Font | Inter via `next/font/google` |
| Auth | Clerk (hosted UI, JWT bridged to Supabase) |
| Database | Supabase (Postgres + RLS) |
| Email | Resend + React Email |
| Background jobs | Trigger.dev v3 (hourly cron, fan-out per user) |
| LLM | Anthropic claude-sonnet-4-6 with prompt caching |
| Hosting | Vercel |

## Dev Commands

```bash
npm run dev          # Next.js dev server (localhost:3000)
npx trigger dev      # Trigger.dev local worker
npx supabase start   # Local Supabase (Docker required)
npx email dev        # React Email preview server (localhost:3001)
```

## Required Env Vars

See `.env.local.example` for all values. Key categories:

```
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Reddit (register at reddit.com/prefs/apps — script type)
REDDIT_CLIENT_ID=
REDDIT_CLIENT_SECRET=

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=

# Anthropic
ANTHROPIC_API_KEY=

# Trigger.dev
TRIGGER_SECRET_KEY=
```

## One-Time Setup

1. Register Reddit app at `reddit.com/prefs/apps` (type: script)
2. Create Clerk project — enable Email + Google social login
3. Create Supabase project — run `supabase/migrations/0001_init.sql`
4. In Supabase: Settings > Auth > JWT Settings — set secret to Clerk's JWKS URL
5. In Clerk: create a "Supabase" JWT template (JWT Templates section)
6. In Clerk: add webhook → `/api/webhooks/clerk`, events: `user.created`, `user.deleted`
7. Create Trigger.dev project, link via `TRIGGER_SECRET_KEY`
8. Verify sending domain in Resend dashboard

## Critical Integration: Clerk + Supabase RLS

All server components and API routes use `createServerSupabaseClient()` from `src/lib/supabase/server.ts`. This exchanges the Clerk session token for a Supabase-compatible JWT, enabling row-level security so users only see their own data.

Trigger.dev worker tasks use the service role key directly (bypasses RLS — intentional, since workers act on behalf of all users).

## Project Structure

```
src/
├── app/
│   ├── (auth)/              # sign-in, sign-up (Clerk hosted UI)
│   ├── (app)/               # authenticated pages (dashboard, subscriptions, settings, archive, invite)
│   ├── invite/[token]/      # public accept-invite landing
│   └── api/                 # REST API routes
├── components/              # React components (layout, subscriptions, newsletter, settings, invite)
├── emails/                  # React Email templates (NewsletterEmail, InviteEmail)
├── lib/                     # Service clients (supabase, reddit, anthropic, resend)
└── trigger/                 # Trigger.dev task definitions
supabase/migrations/         # SQL schema + RLS policies
types/                       # Supabase generated types + shared interfaces
```

## Workstream Execution Order (for parallel agents)

```
Phase 0:  [A: Scaffold]  ──────────────────────────── (gate)
                                                          │
Phase 1:  ┌──[B: DB schema + Supabase clients]           │
          ├──[C: Clerk auth setup]          all parallel ◄┘
          ├──[D: Reddit API client]
          ├──[E: Email templates + Resend]
          └──[H: LLM summarization (Anthropic)]
                                                          │
Phase 2:  ┌──[F: Frontend pages + UI] (needs A+B+C) ◄───┤
          └──[G: Trigger.dev worker]    (needs B+D+E+H) ◄┘
```

## Database Tables

- `users` — Clerk identity mirror (synced via webhook)
- `subscriptions` — user ↔ subreddit mappings
- `newsletter_settings` — cadence, top_posts_count, next_send_at, is_active
- `newsletters` — one row per sent digest (status: pending/sent/failed)
- `newsletter_items` — individual post summaries within a digest
- `invites` — email invitations with accept tokens

## Worker Pipeline (per user)

1. Query users with `next_send_at <= NOW() AND is_active = true`
2. For each subreddit: fetch hot posts via Reddit app-only OAuth
3. For each post: summarize via `claude-sonnet-4-6` (system prompt cached)
4. Insert `newsletters` + `newsletter_items` rows
5. Send email via Resend
6. Update `newsletters.status = 'sent'`, recalculate `next_send_at`
