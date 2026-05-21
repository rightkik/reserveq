import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { BusyHoursChart } from '@/components/dashboard/BusyHoursChart'
import { StatusBadge } from '@/components/reservations/StatusBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CalendarCheck, Users, Clock, AlertCircle, Plus } from 'lucide-react'
import { formatTime } from '@/lib/utils/dateUtils'
import type { Reservation } from '@/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = new Date().toISOString().slice(0, 10)

  const startOfWeek = new Date()
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1)

  const [todayRes, pendingRes, weekRes] = await Promise.all([
    supabase.from('reservations').select('*').eq('owner_id', user.id).eq('reservation_date', today).neq('status', 'cancelled'),
    supabase.from('reservations').select('id', { count: 'exact', head: true }).eq('owner_id', user.id).eq('status', 'pending'),
    supabase.from('reservations').select('reservation_time').eq('owner_id', user.id).gte('reservation_date', startOfWeek.toISOString().slice(0, 10)).neq('status', 'cancelled'),
  ])

  const todayReservations = (todayRes.data ?? []) as Reservation[]
  const todayCount = todayReservations.length
  const todayGuests = todayReservations.reduce((s, r) => s + r.party_size, 0)
  const pendingCount = pendingRes.count ?? 0

  const hourCounts: Record<string, number> = {}
  ;(weekRes.data ?? []).forEach(({ reservation_time }) => {
    const hour = reservation_time.slice(0, 5)
    hourCounts[hour] = (hourCounts[hour] ?? 0) + 1
  })
  const chartData = Object.entries(hourCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([hour, count]) => ({ hour, count }))

  return (
    <div className="p-5 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-zinc-900">ภาพรวมวันนี้</h1>
        <Button asChild size="sm">
          <Link href="/reservations/new"><Plus className="h-4 w-4 mr-1.5" />เพิ่มการจอง</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard title="การจองวันนี้" value={todayCount} icon={CalendarCheck} color="text-blue-600" />
        <StatsCard title="คาดว่าจะมา" value={todayGuests} icon={Users} sub="คน" color="text-green-600" />
        <StatsCard title="รอยืนยัน" value={pendingCount} icon={AlertCircle} color="text-yellow-600" />
        <StatsCard title="ช่วงเวลา Busy" value={chartData[0]?.hour ?? '-'} icon={Clock} sub="สัปดาห์นี้" color="text-purple-600" />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">การจองตามช่วงเวลา (สัปดาห์นี้)</CardTitle>
        </CardHeader>
        <CardContent>
          <BusyHoursChart data={chartData} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">การจองวันนี้</CardTitle>
        </CardHeader>
        <CardContent>
          {todayReservations.length === 0 ? (
            <p className="text-sm text-zinc-400 text-center py-6">ยังไม่มีการจองวันนี้</p>
          ) : (
            <div className="space-y-2">
              {todayReservations
                .sort((a, b) => a.reservation_time.localeCompare(b.reservation_time))
                .map(r => (
                  <div key={r.id} className="flex items-center justify-between py-2 border-b border-zinc-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono text-zinc-500 w-12">{formatTime(r.reservation_time)}</span>
                      <div>
                        <p className="text-sm font-medium text-zinc-900">{r.customer_name}</p>
                        <p className="text-xs text-zinc-400">{r.party_size} คน{r.customer_phone ? ` · ${r.customer_phone}` : ''}</p>
                      </div>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
