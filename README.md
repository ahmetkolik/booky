# Booky

**Online appointment booking for service businesses** — salons, barbers, spas,
trainers and clinics. A shareable booking page, a smart calendar, staff, deposit
payments and reminders, all out of the box. Inspired by [vagaro.com](https://vagaro.com)
and [mindbody.io](https://mindbody.io).

> _"Let clients book you 24/7."_

A production-grade **Next.js 16** starter you can rebrand in five minutes.

## Quick start

```bash
npm install
npm run dev          # → http://localhost:3000  (runs in demo mode, no keys needed)
```

The app boots with realistic demo data — a day of appointments, staff, services
and clients — so you can click through the whole product immediately.

## Make it yours

Open this folder in **Claude Code** and say:

> **"set up this project"**  ·  **"bu projeyi kur"**  (or run **`/setup`**)

It opens the visual guide in `setup-guide/` (or `START-HERE.md`) and interviews
you for your **brand**, **logo**, **colors**, and the **API keys this app needs**,
then writes your `app.config.ts` and `.env.local` and boots it. Prefer to do it by
hand? Follow [`SETUP.md`](./SETUP.md) — every step names the exact file to change.

## What's inside

```
app.config.ts            ← single source of truth (brand, copy, nav, integrations)
app/(marketing)/         ← landing page (hero, interactive demo, pricing, FAQ…)
app/(app)/dashboard/     ← booking cockpit (day schedule, appointments, drawer)
app/(app)/calendar/      ← full staff × time calendar
app/(app)/clients/       ← client list + client card with history
app/(app)/settings/      ← brand + integration status
components/app/          ← sidebar, topbar, inline-SVG charts
components/marketing/    ← interactive booking demo, product preview, marks
lib/demo/data.ts         ← appointments, services, staff, clients (powers demo mode)
.env.example             ← the keys this kit can use (all optional)
SETUP.md                 ← the guided-setup script
```

## Integrations

All optional — without keys the app stays in demo mode.

| Service | Powers |
|---|---|
| **Supabase** | Database & auth (clients, appointments, staff) |
| **Stripe** | Deposits & payments; no-show fees |
| **Google Calendar** | Two-way staff calendar sync |
| **Twilio** | SMS appointment reminders |

## Stack

Next.js 16 (App Router) · React 19 · Tailwind v4 · lucide-react. Bilingual TR/EN
(live toggle). All charts and avatars are **inline SVG** — no chart library, no
photos. No database required to run.
