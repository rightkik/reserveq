@AGENTS.md

# ReserveQ — Context for Claude

## What this is
Thai market SaaS MVP — restaurant & small business booking management system.
Owner records phone-in reservations manually and views them in a calendar.

## Stack (strict — do not deviate)
- **Next.js 16.2.6** App Router + TypeScript (NOT Next.js 14 — APIs differ)
- **Supabase** (PostgreSQL + Auth) via `@supabase/ssr` 0.10.3
- **shadcn/ui** + Tailwind CSS v4 + Recharts + date-fns
- **Package manager:** npm
- **Supabase project:** `wafgtfqbuhwogvjufejs.supabase.co`

## Critical Next.js 16 differences (read before writing any code)
- `middleware.ts` is **deprecated** → use `proxy.ts`, export function named `proxy`
- `params` in pages/layouts are **Promises** → must `await params`
- `cookies()` from `next/headers` is **async** → must `await cookies()`
- `@supabase/ssr`: use `getAll`/`setAll` only (not deprecated `get`/`set`/`remove`)
- Always read `node_modules/next/dist/docs/` before writing Next.js code

## What's been built (Phase 1 complete)
| File | Purpose |
|---|---|
| `proxy.ts` | Auth guard — redirects unauthenticated users to /login |
| `lib/supabase/client.ts` | Browser Supabase client |
| `lib/supabase/server.ts` | Server Supabase client (async cookies) |
| `types/index.ts` | Profile, Reservation, ReservationStatus types |
| `lib/utils/dateUtils.ts` | generateTimeSlots, formatThaiDate, getWeekDays, etc. |
| `app/page.tsx` | Landing page (Thai, pricing, features) |
| `app/(auth)/login/` | Email/password login |
| `app/(auth)/register/` | Sign up + auto-inserts profiles row |
| `app/(dashboard)/layout.tsx` | Sidebar (desktop) + bottom nav (mobile) |
| `app/(dashboard)/dashboard/` | Stats cards + busy hours chart + today's list |
| `app/(dashboard)/calendar/` | Day view (30-min slots) + week view |
| `app/(dashboard)/reservations/` | CRUD list with filters + inline status change |
| `app/(dashboard)/reservations/new/` | New reservation form |
| `app/(dashboard)/settings/` | Shop info, hours, plan display |
| `app/api/reservations/export/route.ts` | CSV export (Pro/Trial only, UTF-8 BOM) |
| `components/reservations/ReservationForm.tsx` | Form with quota check logic |
| `components/reservations/ReservationActions.tsx` | Status select + edit dialog + delete |
| `components/calendar/DayView.tsx` | Click empty slot → /reservations/new?date=&time= |
| `components/calendar/WeekView.tsx` | 7-column week grid |
| `components/dashboard/BusyHoursChart.tsx` | Recharts BarChart |
| `components/dashboard/SidebarNav.tsx` | Nav with logout |

## Database (already created in Supabase)
Tables `profiles` and `reservations` with RLS are live.
See `reserveq-project.md` Section 3 for full SQL if you need to recreate.

## Business logic
- **Quota:** Trial (unlimited 30 days) → Free (30/month) → Pro (unlimited)
- **Status flow:** pending → confirmed → arrived / cancelled / no_show
- **RLS:** every query is scoped to `auth.uid()` automatically

## Env vars needed locally
Create `.env.local` (gitignored — never committed):
```
NEXT_PUBLIC_SUPABASE_URL=https://wafgtfqbuhwogvjufejs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key from Supabase Settings → API>
```

## Dev server
```bash
npm install   # first time only
npm run dev   # runs on http://localhost:3000
```
If port conflict: delete `.next/dev/lock` then restart.

## GitHub
https://github.com/rightkik/reserveq  (branch: master)

## Phase 2 TODO
- Payment (Omise — PromptPay + credit card)
- Public booking link (ลูกค้าจองเอง)
- LINE Notify / SMS reminder
- Walk-in tracking
- Deploy to Vercel
