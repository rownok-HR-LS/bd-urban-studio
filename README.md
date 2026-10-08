# BD-urban Studio

**Snap your balcony. Get a garden. We do the rest.**

An AI-powered balcony garden service for Dhaka and Chittagong, built by LofiStack. A customer photographs their balcony. AI returns a render of their own balcony as a garden and a priced plant list from our catalog. Then our crew installs it and keeps it healthy on a care subscription.

The app works in English and Bangla, in light and dark themes, on Android and on the web.

## What's in this repo

| Folder | What it is |
|---|---|
| `apps/mobile` | Customer app and crew app ([Expo](https://expo.dev), runs on Android and in the browser) |
| `apps/admin` | Ops console and supplier portal ([Vite](https://vite.dev) + React + Tailwind) |
| `packages/core` | Shared code: data types, the seed catalog, English/Bangla text, colours, illustrations, business rules |
| `supabase` | Database schema, security rules, storage buckets and seed data |
| `tools/db` | Generates the catalog seed and tests the schema and security rules without Docker |

## Running it locally

You need [Node.js](https://nodejs.org) 24 or newer.

```bash
npm install
```

Customer app in the browser (http://localhost:8081):

```bash
npm run web
```

Ops console (http://localhost:5173):

```bash
npm run admin
```

Without a Supabase project, both apps run in **demo mode** on the sample catalog. That covers 117 products, 12 sample suppliers and 8 bundles.

## Checks

```bash
npm run typecheck
```

```bash
npm test
```

```bash
npm run db:check
```

`db:check` loads every migration and seed into an in-memory Postgres. It then checks what each role can see and change: guest, customer, crew, supplier and admin. For example, a customer can't see another customer's address, crew can't reassign jobs, and suppliers can't see our cost prices.

## Connecting the real backend

1. Create a free project at [supabase.com](https://supabase.com).
2. Apply `supabase/migrations` and the seeds in `supabase/seed`, with the Supabase CLI (`supabase db push`) or by pasting them into the SQL editor in order.
3. Copy `apps/mobile/.env.example` to `apps/mobile/.env.local` and `apps/admin/.env.example` to `apps/admin/.env.local`. Fill in the project URL and publishable key.
4. Phone OTP login needs an SMS provider in Supabase → Authentication → Phone (Twilio, or a Bangladeshi gateway).
5. The OpenAI key is stored as a Supabase secret for the AI design function. It never goes into the apps.

## Build phases

| Phase | Scope | Status |
|---|---|---|
| 1. Foundation | Monorepo, full database schema + security rules, seeded catalog, bilingual design system, shop, admin catalog | ✅ Done |
| 2. Customer journey | Intake wizard, compass sunlight check, photo upload, AI render + bill of materials, item swaps, cart, checkout (bKash/Nagad/card sandbox), install booking | Next |
| 3. Admin | Orders, AI review queue, design audit log, subscriptions, revenue and margin | |
| 4. Crew and suppliers | Job cards, routes, photos, signatures; supplier stock and purchase orders | |
| 5. After-care and growth | Plant doctor, weather alerts, care calendar, health score, gallery, referrals, building bundles, sharing | |
| 6. Ops intelligence and launch | Churn warnings, stock forecast, route map, Android build, go-live | |

Based on the *Lofi-urban Studio scope document v0.1* (LofiStack internal).
