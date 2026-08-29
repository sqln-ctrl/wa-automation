# WhatsApp Business Automation System

A production-quality MVP for automating WhatsApp customer communication for a **single local business**. Built with Next.js (App Router), TypeScript, PostgreSQL/Prisma, and the WhatsApp Cloud API.

This is intentionally **not** a SaaS/multi-tenant app — one business, one deployment — but the code is structured (services/lib separation, no hardcoded business data) so it can be adapted for another client later.

## Stack

- Next.js 14 (App Router) + TypeScript
- PostgreSQL + Prisma ORM
- Tailwind CSS + shadcn/ui-style components
- WhatsApp Cloud API
- Optional OpenAI-compatible AI fallback
- Zod + React Hook Form

## Getting started

```bash
npm install
cp .env.example .env      # fill in your values (see below)
npx prisma migrate dev --name init
npm run db:seed           # creates a default admin user + sample FAQs/services
npm run dev
```

Visit `http://localhost:3000` — you'll see a public landing page with a "Log in" button.
Default seeded login: `owner@business.com` / `changeme123` — **change this immediately** from `/settings` → Change password once you're logged in.

## App flow

`/` (public landing page) → `/login` → `/dashboard` (auth-protected). If you're already logged in, visiting `/` redirects straight to `/dashboard`.

## Staff access

From `/settings`, the logged-in admin can:
- **Change their own password** (`Change password` card)
- **Add staff members** who can log in with the same dashboard access — there are no granular roles, consistent with this being a single-business app with no complex user-role system. Any staff account can view/reply to conversations, manage FAQs/services, and add more staff.
- **Remove staff access** — blocked for your own account (log in as someone else first) and for the last remaining admin, so you can never lock yourself out entirely.

## Environment variables

See `.env.example`. Key ones:

- `DATABASE_URL` — your Postgres connection string
- `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET` — from your Meta App / WhatsApp Business Platform setup
- `AI_ENABLED` + `AI_PROVIDER_API_KEY` — optional; leave `AI_ENABLED=false` to run purely rule-based

## Connecting WhatsApp Cloud API

1. In Meta for Developers, set your webhook URL to `https://<your-domain>/api/webhook/whatsapp` and the verify token to match `WHATSAPP_VERIFY_TOKEN`.
2. Subscribe to the `messages` webhook field.
3. Inbound messages hit `POST /api/webhook/whatsapp`, get persisted, and are routed through `src/lib/automation.ts`:
   `Appointment intent → Handoff keywords → Rule-based FAQs/rules → AI fallback (if enabled) → Handoff`.

## Project structure

```
src/
  app/
    (dashboard)/        # Owner-facing admin UI (auth-protected)
    api/                # REST endpoints incl. the WhatsApp webhook
    login/
  components/            # UI (shadcn-style primitives + feature components)
  lib/                    # whatsapp.ts, chatbot.ts, ai.ts, automation.ts, auth.ts
  services/               # DB-facing business logic per entity
  types/                  # WhatsApp Cloud API payload types
prisma/
  schema.prisma
  seed.ts
```

## Training the bot (FAQs, Services, Automation Rules)

Everything that shapes the bot's automated responses is editable from the dashboard — no direct DB/Prisma Studio editing needed:

- **`/faqs`** — add/edit/delete FAQs (question, answer, trigger keywords). Click the Active/Inactive badge to toggle without opening the edit form.
- **`/services`** — add/edit/delete services (name, price, duration, bookable flag). Feeds both the appointment flow and the AI system prompt.
- **`/automation`** — add/edit/delete `AutomationRule`s: `KEYWORD` rules (custom triggers beyond FAQs), a `GREETING` override, and a `FALLBACK` rule used when nothing else matches. `priority` controls check order for keyword rules (higher first).
- **`/settings`** — welcome message, human-handoff keywords, and the AI system prompt/toggle.

## Notes / next steps for production

- Swap the seeded admin password immediately; consider adding a password-change UI.
- Add rate limiting / retries around outbound WhatsApp API calls.
- The appointment flow is intentionally minimal — wire `sendListMessage` (in `lib/whatsapp.ts`) to a stateful "pending booking" flow for a fully automated booking experience.
- Add a UI for managing `AutomationRule` records (structure mirrors the FAQ page).
