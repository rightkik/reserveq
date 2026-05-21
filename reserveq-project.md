# ReserveQ — ระบบจองคิวสำหรับร้านอาหาร & ธุรกิจขนาดเล็ก

> **MVP Phase 1** — Web App สำหรับทดลองตลาด  
> Stack: Next.js 14 + Supabase + Vercel  
> เป้าหมาย: Launch ได้ใน 6 สัปดาห์ ด้วยเงินลงทุน $0–$20/เดือน

---

## 1. Project Overview

### ปัญหาที่แก้
เจ้าของร้านอาหารและธุรกิจขนาดเล็กยังบันทึกการจองผ่านสมุดจดหรือ LINE ส่วนตัว ทำให้มองภาพรวมยาก ข้อมูลหาย และแชร์กับทีมไม่ได้

### Target User (Phase 1)
- เจ้าของร้านอาหาร ร้านกาแฟ คลินิกเล็ก ร้านเสริมสวย
- ต้องการระบบบันทึกการจองที่ใช้งานง่าย ไม่ซับซ้อน

### Business Model (เตรียมพร้อมไว้ตั้งแต่ต้น)
- **Trial**: ใช้ฟรี 30 วันแรก
- **Free Tier**: ได้ 30 การจอง/เดือน
- **Pro Tier**: 299 บาท/เดือน — ไม่จำกัดการจอง + Export CSV
- การเงิน: Omise (รองรับ PromptPay + บัตรเครดิต)

---

## 2. Tech Stack

| Layer | Technology | ค่าใช้จ่าย |
|---|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript | ฟรี |
| UI Components | shadcn/ui + Tailwind CSS | ฟรี |
| Database | Supabase (PostgreSQL) | ฟรี (500MB, 50k rows) |
| Authentication | Supabase Auth (Email + Google OAuth) | ฟรี |
| Hosting | Vercel | ฟรี (Hobby plan) |
| Payment (Phase 2) | Omise | 3.65% per transaction |
| Domain | Cloudflare / Namecheap | ~$10/ปี |

**รวมค่าใช้จ่าย Phase 1: $0–$10/เดือน**

---

## 3. Database Schema

### users (managed by Supabase Auth)
```sql
-- Supabase จัดการให้อัตโนมัติผ่าน auth.users
-- เราเพิ่ม profile แยก
```

### profiles
```sql
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  shop_name   TEXT NOT NULL,
  phone       TEXT,
  plan        TEXT DEFAULT 'trial',        -- 'trial' | 'free' | 'pro'
  trial_ends_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### reservations
```sql
CREATE TABLE reservations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        UUID REFERENCES profiles(id) ON DELETE CASCADE,
  customer_name   TEXT NOT NULL,
  customer_phone  TEXT,
  party_size      INT DEFAULT 1,
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  duration_minutes INT DEFAULT 60,
  status          TEXT DEFAULT 'pending',  -- 'pending' | 'confirmed' | 'arrived' | 'cancelled' | 'no_show'
  note            TEXT,
  source          TEXT DEFAULT 'manual',   -- 'manual' | 'online' (Phase 2)
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Index สำหรับ query ตามวันที่เร็ว
CREATE INDEX idx_reservations_owner_date ON reservations(owner_id, reservation_date);
```

### Row Level Security (RLS) — สำคัญมาก
```sql
-- เจ้าของร้านเห็นเฉพาะข้อมูลตัวเอง
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_access" ON reservations
  FOR ALL USING (auth.uid() = owner_id);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_profile" ON profiles
  FOR ALL USING (auth.uid() = id);
```

---

## 4. Project Structure

```
reserveq/
├── app/                          # Next.js App Router
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx            # Sidebar + top nav
│   │   ├── dashboard/page.tsx    # Overview + stats
│   │   ├── calendar/page.tsx     # Calendar view
│   │   ├── reservations/
│   │   │   ├── page.tsx          # List view
│   │   │   └── new/page.tsx      # Add reservation form
│   │   └── settings/page.tsx     # Shop settings
│   ├── api/
│   │   └── reservations/
│   │       └── export/route.ts   # CSV export endpoint
│   ├── layout.tsx
│   └── page.tsx                  # Landing page
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── calendar/
│   │   ├── DayView.tsx
│   │   ├── WeekView.tsx
│   │   └── TimeSlot.tsx
│   ├── reservations/
│   │   ├── ReservationCard.tsx
│   │   ├── ReservationForm.tsx
│   │   ├── StatusBadge.tsx
│   │   └── ReservationList.tsx
│   └── dashboard/
│       ├── StatsCard.tsx
│       └── BusyHoursChart.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Client-side Supabase
│   │   └── server.ts             # Server-side Supabase
│   ├── hooks/
│   │   ├── useReservations.ts
│   │   └── useDashboardStats.ts
│   └── utils/
│       ├── dateUtils.ts
│       └── exportCSV.ts
├── types/
│   └── index.ts                  # TypeScript types
├── middleware.ts                  # Auth protection
├── .env.local
└── package.json
```

---

## 5. Key Pages & Features

### 5.1 Landing Page (`/`)
- Hero section: "จัดการการจองร้านคุณได้ง่ายๆ ใน 1 นาที"
- Features overview
- Pricing section (Free / Pro)
- CTA: "เริ่มใช้งานฟรี 30 วัน"

### 5.2 Dashboard (`/dashboard`)
**Stats Cards:**
- จำนวนการจองวันนี้
- จำนวนคนที่คาดว่าจะมา
- อัตรา No-show เดือนนี้
- การจองรอยืนยัน

**Charts:**
- Peak hours bar chart (ช่วงเวลาไหน busy ที่สุด)
- สัดส่วน status ของการจองสัปดาห์นี้

### 5.3 Calendar (`/calendar`)
- Toggle: Day View / Week View
- Day View: แสดง time slots ทุก 30 นาที ตั้งแต่เวลาเปิด-ปิดร้าน
- แต่ละ slot แสดง: ชื่อลูกค้า + จำนวนคน + status badge
- คลิกที่ slot ว่าง → เปิด form เพิ่มการจอง
- คลิกที่การจองที่มีอยู่ → เปิด modal แก้ไข/เปลี่ยนสถานะ

### 5.4 Reservation Form
**Fields:**
- ชื่อลูกค้า (required)
- เบอร์โทร
- จำนวนคน
- วันที่ (date picker)
- เวลา (time picker — เลือกเป็น 30 นาที)
- ระยะเวลา (default 60 นาที)
- Note / ความต้องการพิเศษ
- สถานะ (default: รอยืนยัน)

### 5.5 Reservation List (`/reservations`)
- Filter: วันที่, สถานะ, ค้นหาชื่อ/เบอร์
- Bulk action: เปลี่ยนสถานะหลายรายการพร้อมกัน
- ปุ่ม Export CSV (Pro only)

### 5.6 Settings (`/settings`)
- ชื่อร้าน, เบอร์โทรร้าน
- เวลาเปิด-ปิด (ใช้ใน calendar)
- แสดง Plan ปัจจุบัน + วันหมดอายุ Trial
- (Phase 2) ตั้งค่าการแจ้งเตือน

---

## 6. Status Flow

```
[รอยืนยัน] → [ยืนยันแล้ว] → [มาถึง]
     ↓               ↓
  [ยกเลิก]      [No-show]
```

### Status Colors
- `pending` → สีเหลือง
- `confirmed` → สีน้ำเงิน
- `arrived` → สีเขียว
- `cancelled` → สีแดง
- `no_show` → สีเทา

---

## 7. CSV Export Format

```csv
วันที่,เวลา,ชื่อลูกค้า,เบอร์โทร,จำนวนคน,สถานะ,หมายเหตุ
2024-01-15,19:00,สมชาย ใจดี,081-234-5678,4,มาถึง,โต๊ะริมหน้าต่าง
2024-01-15,20:00,มานี รักดี,089-876-5432,2,ยกเลิก,
```

---

## 8. Business Logic สำคัญ

### Quota Check (Freemium)
```typescript
// ตรวจสอบก่อนเพิ่มการจองทุกครั้ง
async function checkQuota(userId: string): Promise<boolean> {
  const profile = await getProfile(userId)
  
  if (profile.plan === 'pro') return true
  if (profile.plan === 'trial' && profile.trial_ends_at > new Date()) return true
  
  // Free plan: นับการจองเดือนนี้
  const count = await countReservationsThisMonth(userId)
  return count < 30
}
```

### Conflict Detection
```typescript
// ตรวจสอบ slot ซ้ำซ้อน (optional แต่ควรมี)
async function checkConflict(
  ownerId: string,
  date: Date,
  time: string,
  duration: number
): Promise<boolean>
```

---

## 9. Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   # Server only

# Phase 2
OMISE_PUBLIC_KEY=pkey_xxx
OMISE_SECRET_KEY=skey_xxx
```

---

## 10. Development Roadmap

### Phase 1 — MVP (สัปดาห์ 1–6)
- [x] Project setup (Next.js + Supabase + shadcn)
- [ ] Landing page
- [ ] Auth: Register / Login / Logout
- [ ] บันทึกการจอง (CRUD)
- [ ] Calendar: Day View
- [ ] Calendar: Week View
- [ ] Dashboard stats
- [ ] Export CSV
- [ ] Settings หน้าข้อมูลร้าน
- [ ] Quota / plan check
- [ ] Deploy to Vercel

### Phase 2 (หลังจากมี users แรก)
- [ ] Payment (Omise)
- [ ] Public booking link (ลูกค้าจองเอง)
- [ ] LINE notification / SMS reminder
- [ ] Walk-in tracking
- [ ] Multi-staff support

---

## 11. Claude Code Prompt (ใช้เพื่อเริ่ม dev)

> คัดลอก prompt ด้านล่างนี้ไปวางใน Claude Code (VS Code) เพื่อเริ่มสร้างโปรเจกต์

---

```
You are helping me build "ReserveQ" — a restaurant & small business booking management web app. 
This is a Thai market SaaS MVP built for market testing with minimal investment.

## Project Goal
A simple booking/reservation management system for small restaurant owners and service businesses in Thailand. Owners record phone-in reservations manually (name, phone, party size, time) and see them in a calendar view.

## Tech Stack (strict — do not deviate)
- Framework: Next.js 14 with App Router + TypeScript
- UI: shadcn/ui + Tailwind CSS
- Database + Auth: Supabase (PostgreSQL + Supabase Auth)
- Hosting: Vercel
- Package manager: npm

## Database Schema (Supabase)

### profiles table
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  shop_name TEXT NOT NULL,
  phone TEXT,
  plan TEXT DEFAULT 'trial',
  trial_ends_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
  shop_open_time TIME DEFAULT '10:00',
  shop_close_time TIME DEFAULT '22:00',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_profile" ON profiles FOR ALL USING (auth.uid() = id);
```

### reservations table
```sql
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  party_size INT DEFAULT 1,
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  duration_minutes INT DEFAULT 60,
  status TEXT DEFAULT 'pending',
  note TEXT,
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_reservations_owner_date ON reservations(owner_id, reservation_date);
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_access" ON reservations FOR ALL USING (auth.uid() = owner_id);
```

## App Structure
```
app/
├── (auth)/login/page.tsx
├── (auth)/register/page.tsx
├── (dashboard)/layout.tsx        ← sidebar nav
├── (dashboard)/dashboard/page.tsx
├── (dashboard)/calendar/page.tsx
├── (dashboard)/reservations/page.tsx
├── (dashboard)/reservations/new/page.tsx
├── (dashboard)/settings/page.tsx
├── api/reservations/export/route.ts
├── layout.tsx
└── page.tsx                      ← landing page
```

## Key Features to Build (in priority order)

1. **Auth** — Supabase email/password login + register. Auto-create profile row on register. Protect all /dashboard routes with middleware.

2. **Reservation CRUD**
   - Form fields: customer_name (required), customer_phone, party_size (number, min 1), reservation_date (date picker), reservation_time (time select in 30min increments), duration_minutes (default 60), status (select), note (textarea)
   - List view with filter by date and status
   - Edit and delete actions

3. **Calendar View** (most important UI)
   - Day View: show time slots from shop open to close (30-min intervals)
   - Week View: 7 columns, each showing reservations per day
   - Click empty slot → open "Add Reservation" form pre-filled with that time
   - Click existing reservation → open edit/status modal
   - Status color coding: pending=yellow, confirmed=blue, arrived=green, cancelled=red, no_show=gray

4. **Dashboard Stats**
   - Today's reservation count
   - Expected guests today (sum of party_size)
   - Pending confirmations count
   - Simple bar chart: reservations by hour for this week (use recharts)

5. **Export CSV** — GET /api/reservations/export — streams CSV of filtered reservations

6. **Business Logic**
   - Quota check before adding reservation (free plan: 30/month, trial: unlimited for 30 days, pro: unlimited)
   - Show upgrade prompt when quota exceeded

## UI/UX Requirements
- Mobile-first responsive design
- Thai language labels (e.g., "จองโต๊ะ", "ยืนยันแล้ว", "รอยืนยัน")
- Clean, minimal design — the user is a restaurant owner, not a tech person
- Sidebar navigation on desktop, bottom nav on mobile
- Loading states and error handling on all async operations

## Important Rules
- Always use Supabase server client (from `@supabase/ssr`) in Server Components and Route Handlers
- Always use Supabase browser client in Client Components
- Never expose SUPABASE_SERVICE_ROLE_KEY to client
- All database queries must respect RLS (never bypass with service role on client)
- Use TypeScript types from `/types/index.ts` — define Reservation and Profile types there

## Start by:
1. Running: `npx create-next-app@latest reserveq --typescript --tailwind --app --src-dir false`
2. Installing: `npm install @supabase/ssr @supabase/supabase-js`
3. Installing shadcn: `npx shadcn@latest init`
4. Installing: `npm install recharts date-fns`
5. Creating `.env.local` with placeholder Supabase keys
6. Setting up Supabase client files in `/lib/supabase/client.ts` and `/lib/supabase/server.ts`
7. Creating the middleware for auth protection
8. Then building features in priority order above

Ask me for my Supabase project URL and anon key before proceeding with setup.
```

---

## 12. คำแนะนำ Setup ครั้งแรก

### Step 1: สร้าง Supabase Project
1. ไป [supabase.com](https://supabase.com) → New Project
2. ตั้งชื่อ: `reserveq`
3. เลือก Region: Singapore (ใกล้ไทยที่สุด)
4. Copy `Project URL` และ `anon key` จาก Settings → API

### Step 2: รัน SQL Schema
1. ไปที่ SQL Editor ใน Supabase Dashboard
2. Copy SQL จาก Section 3 (Database Schema) แล้ว Run

### Step 3: เริ่ม Dev
```bash
# สร้าง project
npx create-next-app@latest reserveq --typescript --tailwind --app

cd reserveq

# install dependencies
npm install @supabase/ssr @supabase/supabase-js recharts date-fns

# install shadcn
npx shadcn@latest init

# เพิ่ม components ที่ต้องใช้
npx shadcn@latest add button input label card badge select textarea dialog calendar

# สร้าง .env.local
echo "NEXT_PUBLIC_SUPABASE_URL=your-url" >> .env.local
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key" >> .env.local
```

### Step 4: เปิด VS Code + Claude Code
```bash
code reserveq
# เปิด Claude Code แล้ว paste prompt จาก Section 11
```

---

*ReserveQ MVP — เวอร์ชัน 1.0 | Phase 1 Planning Document*
