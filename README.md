# Expense Tracker

Income and expense tracker with multi-wallet support and shared access. Installable to the home screen as a PWA.

## Stack

- **Next.js 15** — App Router, RSC, Server Actions
- **React 19** — `useActionState`, `useOptimistic`, `useFormStatus`
- **TypeScript** strict
- **Drizzle ORM** + **PostgreSQL** (Neon)
- **Auth.js v5** — Google OAuth, email/password, guest mode
- **Tailwind CSS** + **shadcn/ui**
- Deployment: **Vercel**

## Features

- Transactions: create, edit, delete (expenses / income)
- Multiple wallets with quick switching
- Wallet sharing via invite links
- Balance and stats per currency (RSD, RUB, USD, EUR)
- Sign in with Google, email + password, or as a guest without registration
- Swipe-to-delete on mobile
- PWA — offline fallback served from cache
- **Receipt scanning** — photo → Claude Vision → auto-filled transaction form (HEIC/JPEG/PNG/WebP)

## Getting started

```bash
pnpm install
pnpm dev   # HTTPS is required for the service worker and secure cookies
```

Create `.env.local` (gitignored) and fill in the variables:

| Variable                                | Purpose                                |
| --------------------------------------- | -------------------------------------- |
| `DATABASE_URL`                          | PostgreSQL (Neon)                      |
| `AUTH_SECRET`                           | Auth.js JWT session signing            |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google OAuth                           |
| `EXCHANGERATE_API_KEY`                  | Exchange rates                         |
| `ANTHROPIC_API_KEY`                     | Receipt scanning (Claude Vision)       |
| `RESEND_API_KEY`                        | Email (reserved, not used yet)         |

## Commands

| Command            | Description                    |
| ------------------ | ------------------------------ |
| `pnpm dev`         | Dev server with HTTPS          |
| `pnpm build`       | Migrations + production build  |
| `pnpm test`        | Vitest                         |
| `pnpm db:generate` | Generate a migration           |
| `pnpm db:migrate`  | Apply migrations               |
| `pnpm db:studio`   | Drizzle Studio                 |

## Architecture

```
lib/     — domain logic, pure functions (bot-ready core)
app/     — Next App Router: pages, Server Actions, components
docs/    — documentation
```

- All data logic lives in `lib/`; Server Actions are thin wrappers only
- `userId` always comes from the Auth.js session and is passed explicitly
- Transactions belong to a **wallet** (`wallet_members` with owner/member roles), not to a user → ready for sharing

More details (docs are in Russian):

- [docs/architecture.md](./docs/architecture.md) — code map: layers, data flow, cache tags, data model
- [docs/lib-api.md](./docs/lib-api.md) — public contract of the `lib/` core (for the future bot)
- [docs/decisions.md](./docs/decisions.md) — architecture decision log (the "why")
- [docs/roadmap.md](./docs/roadmap.md) — development plan
