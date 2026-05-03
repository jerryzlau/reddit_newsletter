# Reddit Newsletter

An AI-powered digest service that transforms Reddit communities into clean, summarized email newsletters.

## Setup

1. Copy the example env file and fill in your keys:
   ```bash
   cp .env.local.example .env.local
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running Services

Each service runs in a separate terminal.

### Next.js (required)
```bash
npm run dev
```
Opens at http://localhost:3000

### Supabase — local database (requires Docker Desktop)
```bash
npx supabase start
```
Starts a local Postgres instance with the schema from `supabase/migrations/`. On first run, also apply the migration:
```bash
npx supabase db push
```
After starting, regenerate TypeScript types:
```bash
npx supabase gen types typescript --local > src/types/supabase.ts
```

### React Email — email template preview
```bash
npm install @react-email/ui   # first time only
npx email dev
```
Opens at http://localhost:3001

### Trigger.dev — background job worker
```bash
npm install @trigger.dev/cli@v3   # first time only
npx trigger dev
```
Connects to Trigger.dev cloud and runs the newsletter worker locally against your `.env.local` secrets.

## External Services Required

| Service | Purpose | Where to get keys |
|---|---|---|
| [Clerk](https://clerk.com) | Auth | Dashboard → API Keys |
| [Supabase](https://supabase.com) | Database | Project Settings → API |
| [Resend](https://resend.com) | Email sending | API Keys |
| [Anthropic](https://console.anthropic.com) | AI summaries | API Keys |
| [Trigger.dev](https://trigger.dev) | Background jobs | Project → API Keys |

## One-time Clerk + Supabase setup

1. In Clerk: create a **JWT Template** named `supabase`
2. In Supabase: **Project Settings → Auth → JWT Settings** — set the JWKS URL to your Clerk frontend API URL
3. In Clerk: add a webhook pointing to `/api/webhooks/clerk` with events `user.created` and `user.deleted`
