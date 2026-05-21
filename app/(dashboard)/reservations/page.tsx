import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StatusBadge } from '@/components/reservations/StatusBadge'
import { ReservationActions } from '@/components/reservations/ReservationActions'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { formatThaiDate, formatTime } from '@/lib/utils/dateUtils'
import type { Reservation, ReservationStatus } from '@/types'

interface Props {
  searchParams: Promise<{ date?: string; status?: string; q?: string }>
}

export default async function ReservationsPage({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params = await searchParams
  const { date, status, q } = params

  let query = supabase.from('reservations').select('*').eq('owner_id', user.id).order('reservation_date', { ascending: false }).order('reservation_time')

  if (date) query = query.eq('reservation_date', date)
  if (status) query = query.eq('status', status as ReservationStatus)

  const { data } = await query.limit(200)
  let reservations = (data ?? []) as Reservation[]

  if (q) {
    const lower = q.toLowerCase()
    reservations = reservations.filter(r =>
      r.customer_name.toLowerCase().includes(lower) ||
      r.customer_phone?.includes(q)
    )
  }

  return (
    <div className="p-5 md:p-8 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-zinc-900">การจองทั้งหมด</h1>
        <Button asChild size="sm">
          <Link href="/reservations/new"><Plus className="h-4 w-4 mr-1.5" />เพิ่มการจอง</Link>
        </Button>
      </div>

      <ReservationFilters defaultDate={date} defaultStatus={status} defaultQ={q} />

      <div className="space-y-2">
        {reservations.length === 0 ? (
          <p className="text-sm text-zinc-400 text-center py-12">ไม่พบการจอง</p>
        ) : (
          reservations.map(r => (
            <Card key={r.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-zinc-900">{r.customer_name}</p>
                      <StatusBadge status={r.status} />
                    </div>
                    <p className="text-sm text-zinc-500 mt-0.5">
                      {formatThaiDate(r.reservation_date)} · {formatTime(r.reservation_time)} · {r.party_size} คน
                    </p>
                    {r.customer_phone && <p className="text-xs text-zinc-400">{r.customer_phone}</p>}
                    {r.note && <p className="text-xs text-zinc-400 mt-1 italic">"{r.note}"</p>}
                  </div>
                  <ReservationActions reservation={r} />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

function ReservationFilters({ defaultDate, defaultStatus, defaultQ }: { defaultDate?: string; defaultStatus?: string; defaultQ?: string }) {
  return (
    <form method="GET" className="flex flex-wrap gap-2">
      <input
        name="date"
        type="date"
        defaultValue={defaultDate}
        className="h-9 rounded-md border border-zinc-200 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <select
        name="status"
        defaultValue={defaultStatus ?? ''}
        className="h-9 rounded-md border border-zinc-200 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">ทุกสถานะ</option>
        <option value="pending">รอยืนยัน</option>
        <option value="confirmed">ยืนยันแล้ว</option>
        <option value="arrived">มาถึงแล้ว</option>
        <option value="cancelled">ยกเลิก</option>
        <option value="no_show">ไม่มา</option>
      </select>
      <input
        name="q"
        type="search"
        defaultValue={defaultQ}
        placeholder="ค้นหาชื่อ/เบอร์..."
        className="h-9 rounded-md border border-zinc-200 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-40"
      />
      <Button type="submit" variant="outline" size="sm" className="h-9">ค้นหา</Button>
      {(defaultDate || defaultStatus || defaultQ) && (
        <Button asChild variant="ghost" size="sm" className="h-9">
          <Link href="/reservations">ล้างตัวกรอง</Link>
        </Button>
      )}
    </form>
  )
}
