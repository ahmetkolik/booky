# Booky — Online Appointment Booking for Service Businesses (PRD)

## Overview
Booky is a B2B SaaS appointment-booking product for service businesses (salons, barbers, spas, trainers, clinics), modeled on vagaro.com and mindbody.io. It ships as a Next.js 16 (App Router, React 19, Tailwind v4) starter kit. The UI is bilingual (Turkish default, English toggle) and uses a light, warm design with a coral-pink primary color.

In demo mode (no API keys configured), all data renders from a built-in demo dataset (`lib/demo/data.ts`) and authentication is a demo bypass: submitting the login/signup form or clicking "Continue with demo" enters the dashboard directly. Mutations are local state only and do not persist across reloads.

## Target users
- Business owners/managers of appointment-based service businesses (primary, dashboard users)
- Their customers (public booking page visitors)

## Core features

### 1. Marketing landing page (/)
- Scroll-driven cinematic hero, feature sections, pricing cards, an interactive booking-widget demo, and a TR/EN language toggle in the navbar.
- Pricing CTAs call POST /api/stripe/checkout (disabled without Stripe keys).
- Navbar links to /login and /signup.

### 2. Authentication (/login, /signup, /onboarding)
- Real screens with email/password fields and a "Continue with demo" button.
- Demo bypass: any submit enters the dashboard at /dashboard without validation.
- Onboarding flow collects business info after signup.
- TR/EN toggle available on auth pages.

### 3. Dashboard — booking cockpit (/dashboard)
- Stat row (appointments today, revenue, occupancy, no-shows).
- Day schedule grid: staff columns × time rows, appointment blocks colored by service.
- Appointments list; clicking an appointment opens a right detail drawer with client, service, time, price and status actions (confirm / cancel / no-show).
- Revenue area chart, upcoming/no-show panel.
- Grouped sidebar (Workspace / Setup) navigates to Calendar, Clients, Services, Staff, Booking page, Settings.
- TR/EN toggle in the topbar.

### 4. Calendar (/calendar)
- Day/week schedule of appointments per staff member; date switching; clicking a block shows details.

### 5. Clients (/clients)
- Client list with search, contact info, and visit history detail view.

### 6. Services management (/services)
- List of services with duration, price, color; add and edit via form.

### 7. Staff management (/staff)
- Staff list; add/edit staff members and working hours.

### 8. Public booking page (/book/demo)
- Customer-facing flow: choose service → choose staff (or any) → pick date and available time slot → enter name/phone → confirm; a confirmation screen follows.

### 9. Booking page preview (/booking)
- Dashboard panel that previews the public booking page and exposes the public link.

### 10. Settings (/settings)
- Business profile fields, plan display/enforcement, integration status for Supabase, Stripe, Google Calendar, Twilio.

### 11. AI search (dashboard)
- AI-powered search/chat box calling POST /api/ai/chat.

### 12. Backend endpoints
- POST /api/reminders/send, GET /api/reminders/cron — Twilio SMS reminders (no-op without keys).
- POST /api/stripe/checkout, POST /api/stripe/webhook — subscription billing (error without keys).

## Known limitations (demo mode)
- No persistence: created/edited data resets on reload.
- Auth accepts anything (demo bypass), no error states.
- Stripe/Twilio endpoints fail or no-op without keys.
- Default language is Turkish; tests must match Turkish labels or switch to EN first.

## Acceptance criteria (high level)
- Landing page renders all sections and the language toggle switches TR/EN copy.
- Login demo bypass always lands on /dashboard.
- Dashboard renders demo data: stats, schedule grid, appointment list; drawer opens on click and status actions update the UI.
- Calendar, Clients, Services, Staff pages render demo data and their add/edit forms open and accept input.
- Public booking page completes the full flow to a confirmation screen.
- Settings shows integration statuses; no crashes on any route.
