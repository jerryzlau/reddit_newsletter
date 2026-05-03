# Reddit Newsletter — UI Design Requirements

## What This App Does

Reddit Newsletter is an AI-powered digest service that transforms subscribed subreddit content into clean, summarized email newsletters. Users pick the communities they want to follow, choose their delivery cadence (daily or weekly) and depth (3, 5, or 10 posts), and the app does the rest — fetching the top posts, summarizing each one with Claude, and delivering a well-formatted digest straight to their inbox.

The core value: staying informed about the communities you care about without opening Reddit. Every email contains the top posts from each subscribed subreddit, with a short AI-written summary so you can decide in seconds whether a post is worth reading in full.

## Core Value Propositions

- **Curation over Noise** — Only the top posts from selected communities, no algorithm rabbit holes.
- **AI-Powered Summaries** — Claude-generated summaries provide instant context for each post.
- **Customizable Delivery** — Flexible scheduling (Daily/Weekly) and depth (3, 5, or 10 posts per subreddit).
- **Distraction-Free Reading** — A content-first, minimal environment with no feeds, ads, or infinite scroll.

## User Personas

**The Busy Professional**
Wants to stay current with industry communities (e.g. `r/programming`, `r/MachineLearning`) without losing time to Reddit's feed. Checks email during commute; values brevity and signal-to-noise ratio.

**The Information Junkie**
Follows many niche communities and needs a consolidated daily view of the best content across all of them. Likely subscribes to 10+ subreddits and prefers the 10-posts-per-subreddit setting.

**The Minimalist**
Prefers email-based information workflows and actively avoids high-friction social media. Appreciates the clean reading environment and the ability to stay informed passively.

---

## User Journey

### 1. Discovery (landing / invite)
A new user arrives either by:
- Direct discovery (finds the app organically)
- Invite link from an existing user (lands on `/invite/[token]` which explains the app and prompts sign-up)

### 2. Sign Up
User creates an account via Clerk (email or Google). On first login they land on `/dashboard`, which shows an empty state with a clear CTA to subscribe to their first subreddit.

### 3. Subscribe to Subreddits (`/subscriptions`)
User searches for subreddits by name (e.g. "programming", "world news"). Results show the subreddit icon, name, and member count. They click Subscribe on any they want. Their subscriptions are saved immediately and shown in the "Your Subscriptions" section below.

### 4. Configure Preferences (`/settings`)
User sets:
- **Cadence**: Daily or Weekly
- **Top posts per subreddit**: 3, 5, or 10

Saving these preferences calculates when their first digest will be sent (`next_send_at`). A confirmation toast shows the next scheduled send date.

### 5. Receive the Digest (email)
At the scheduled time, the background worker fetches the top posts from each subscribed subreddit, summarizes them with Claude, and sends a formatted email. Each post includes a title (linked to Reddit), upvote score, and a 2–3 sentence AI summary.

### 6. Read Archive (`/archive`)
Users can browse all past digests in the app. Clicking a digest opens a browser-rendered version of the email — useful if the email got buried or they want to search past content.

### 7. Manage & Unsubscribe
- **Pause**: Users can pause delivery from `/settings` without losing their subscriptions.
- **Unsubscribe from a subreddit**: Remove individual subreddits from `/subscriptions`.
- **Unsubscribe from all emails**: One-click unsubscribe link in every email footer (no login required).

### 8. Invite Friends (`/invite`)
Users can invite others by email. The invitee receives a branded email with a personal invite link. Clicking it lands them on a sign-up page. The inviter can track pending and accepted invites in a table on the invite page.

---

## Design Principles

- Clean, minimal, content-first — the reading experience is the product
- Dark mode as default (newsletter readers often browse at night)
- Mobile-responsive (users check archive on phone)
- Accent color: Reddit orange (`#ff4500`)
- Typography: **Inter** (sans-serif) for high readability across all screen sizes
- shadcn/ui component library on top of Tailwind v4

## Color Palette

| Token | Value | Usage |
|---|---|---|
| Background | `#0f0f0f` | Page background |
| Surface | `#1a1a1a` | Cards, sidebars |
| Border | `#2a2a2a` | Dividers, card borders |
| Text primary | `#f0f0f0` | Headings, body |
| Text muted | `#888888` | Metadata, labels |
| Accent | `#ff4500` | Buttons, links, badges (Reddit orange) |
| Success | `#22c55e` | Sent status, confirmation toasts |
| Destructive | `#ef4444` | Failed status, delete actions |

## Typography

- **Font family**: Inter (loaded via `next/font/google`)
- **Headings**: Inter 600–700, sizes: 2xl / xl / lg depending on hierarchy
- **Body**: Inter 400, 14–16px, line-height 1.6 for readability
- **Metadata / labels**: Inter 400, 12–13px, muted color
- **Email templates**: System sans-serif stack (Inter unavailable in most email clients)

---

## Layout Shell (authenticated pages)

### Sidebar
- Fixed left sidebar, 240px wide on desktop; collapses to icon-only on mobile
- Top: logo + "Reddit Newsletter" wordmark
- Navigation items (with icon):
  - Dashboard
  - Subscriptions
  - Archive
  - Settings
  - Invite a Friend
- Bottom: Clerk `<UserButton />` with user avatar + display name

### Header
- Top bar visible on mobile (hamburger + logo)
- On desktop: breadcrumb of current page

---

## Pages

### `/dashboard`

**Purpose:** At-a-glance status for the user's newsletter.

**Layout:**
- Stats row (3 cards):
  - "Active Subscriptions" — count with subreddit list tooltip
  - "Next Digest" — date/time or "Paused" if inactive
  - "Newsletters Sent" — total count
- "Recent Digests" section: last 3 newsletters as cards (date, subject, subreddit badges, "View" link)
- Empty state (no subscriptions yet): centered illustration + "Subscribe to your first subreddit to get started" CTA button → `/subscriptions`

---

### `/subscriptions`

**Purpose:** Browse, search, and manage subreddit subscriptions.

**Layout:**
- Search bar at top: placeholder "Search subreddits (e.g. programming, worldnews)"
  - Debounced input (300ms) → calls `/api/subreddits/search`
  - Results appear below as cards: subreddit icon, `r/name`, subscriber count formatted (e.g. "2.3M members"), "Subscribe" button
  - Loading skeleton while searching
- "Your Subscriptions" section below search results:
  - Same card format but with "Remove" button (destructive, with confirmation)
  - Empty state: "No subscriptions yet — search above to add some"
- Toast on subscribe/unsubscribe success

---

### `/settings`

**Purpose:** Configure newsletter delivery preferences.

**Layout:**
- "Newsletter Preferences" section:
  - **Cadence**: Segmented control — `Daily` | `Weekly`
  - **Top posts per subreddit**: Segmented control — `3` | `5` | `10`
  - **Newsletter delivery**: Toggle switch — Active / Paused (pausing sets `is_active = false`, stops future sends)
- "Account" section:
  - Email address (read-only, from Clerk)
  - "Change email" → opens Clerk's user profile modal
- "Save Preferences" button — disabled when unchanged, shows spinner when saving
- Success toast on save: "Preferences saved — next digest on [date]"

---

### `/archive`

**Purpose:** View history of all sent newsletters.

**Layout:**
- Page title "Newsletter Archive"
- Card list (10 per page):
  - Date sent (relative + absolute)
  - Subject line
  - Subreddit badges (e.g. `r/programming`, `r/worldnews`)
  - Status badge: `Sent` (green) | `Failed` (red)
  - "View" link
- Pagination controls at bottom
- Empty state: "No newsletters sent yet. Your first digest will arrive on [date]."

---

### `/archive/[id]`

**Purpose:** Read a past newsletter in the browser (same look as the email).

**Layout:**
- Back link "← Archive"
- Header: digest date, list of subreddits covered
- For each subreddit:
  - Section header: `r/subreddit` in accent color with horizontal rule
  - Post cards (N per subreddit based on settings):
    - Post title as external link
    - Upvote score badge (gray pill)
    - Summary paragraph (1-3 sentences from Claude)
- Footer: "Manage preferences" link | "Unsubscribe" link

---

### `/invite`

**Purpose:** Invite others to create their own Reddit Newsletter account.

**Layout:**
- Page title "Invite a Friend"
- Subtitle: "Send someone an invite to set up their own Reddit newsletter"
- Email input + "Send Invite" button
- Success state below input: "Invite sent to [email]" (green)
- "Sent Invites" table:
  - Columns: Email, Sent, Status (`Pending` / `Accepted`)
  - Empty state: "No invites sent yet"

---

### `/invite/[token]` (public — no auth required)

**Purpose:** Accept an invitation and sign up.

**Layout:**
- Centered card (max-width 400px):
  - App logo at top
  - "[Inviter Name] invited you to Reddit Newsletter"
  - 2-sentence description: "Get AI-powered summaries of your favorite subreddits delivered to your inbox. Subscribe to any community and choose your own delivery cadence."
  - "Create your account" CTA button → `/sign-up`
- Footer: "If you didn't expect this invite, you can ignore this page."

---

## Email Templates

### `NewsletterEmail.tsx`

Structure (cross-client compatible via React Email):

```
┌─────────────────────────────────────┐
│  [Logo]  Your Daily Reddit Digest   │
│          May 2, 2026                │
├─────────────────────────────────────┤
│  r/programming                      │
│  ───────────────────────────────── │
│  [Post title as link]    ▲ 4.2k     │
│  Summary text here in 2-3 sentences │
│  covering what the post is about.   │
│                                     │
│  [Post title as link]    ▲ 1.8k     │
│  Summary text...                    │
│                                     │
│  r/worldnews                        │
│  ───────────────────────────────── │
│  [Post title]            ▲ 9.1k     │
│  Summary...                         │
├─────────────────────────────────────┤
│  Manage preferences  |  Unsubscribe │
│  Reddit Newsletter · jerryzlau@...  │
└─────────────────────────────────────┘
```

- Background: white (email clients handle dark mode poorly)
- Accent: `#ff4500`
- Font: system sans-serif stack
- Unsubscribe link: signed token URL, works without login

### `InviteEmail.tsx`

```
┌─────────────────────────────────────┐
│  [Logo]  Reddit Newsletter          │
├─────────────────────────────────────┤
│  Jerry Lau invited you to           │
│  Reddit Newsletter                  │
│                                     │
│  Get AI-summarized digests from     │
│  your favorite subreddits,          │
│  delivered to your inbox.           │
│                                     │
│  [  Accept Invitation  ]            │
├─────────────────────────────────────┤
│  If you didn't expect this,         │
│  you can ignore this email.         │
└─────────────────────────────────────┘
```

---

## shadcn/ui Components Needed

`button`, `card`, `input`, `badge`, `skeleton`, `toast` (Sonner), `tabs`, `avatar`, `dialog`, `select`, `switch`, `separator`, `table`, `pagination`

---

## Success Metrics

These metrics should inform design decisions — surfaces that increase engagement and retention deserve more prominent placement.

| Metric | Signal | Design implication |
|---|---|---|
| **Email open rate** | Are digests compelling enough to open? | Subject line format, preview text, send-time UX in settings |
| **Active subscriptions per user over time** | Are users finding lasting value? | Easy subreddit discovery, surfacing recommendations, subscription health on dashboard |
| **Invite conversion rate** | Is the referral system driving growth? | Prominent but non-pushy invite CTA on dashboard; clean invite landing page |
