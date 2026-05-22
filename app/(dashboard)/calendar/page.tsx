import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { DayView } from '@/components/calendar/DayView'
import { WeekView } from '@/components/calendar/WeekView'
import { MonthView } from '@/components/calendar/MonthView'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { format, addDays, subDays, addWeeks, subWeeks, addMonths, subMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import { th } from 'date-fns/locale'
import type { Reservation } from '@/types'

interface Props {
  searchParams: Promise<{ view?: string; date?: string }>
}

export default async function CalendarPage({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('shop_open_time, shop_close_time')
    .eq('id', user.id)
    .single()

  const params = await searchParams
  const view = params.view === 'week' ? 'week' : params.view === 'month' ? 'month' : 'day'
  const dateParam = params.date ?? format(new Date(), 'yyyy-MM-dd')
  const currentDate = new Date(dateParam + 'T00:00:00')

  let startDate: string
  let endDate: string

  if (view === 'week') {
    startDate = format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'yyyy-MM-dd')
    endDate = format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'yyyy-MM-dd')
  } else if (view === 'month') {
    startDate = format(startOfMonth(currentDate), 'yyyy-MM-dd')
    endDate = format(endOfMonth(currentDate), 'yyyy-MM-dd')
  } else {
    startDate = dateParam
    endDate = dateParam
  }

  const { data } = await supabase
    .from('reservations')
    .select('*')
    .eq('owner_id', user.id)
    .gte('reservation_date', startDate)
    .lte('reservation_date', endDate)
    .order('reservation_time')

  const reservations = (data ?? []) as Reservation[]
  const openTime = profile?.shop_open_time ?? '10:00'
  const closeTime = profile?.shop_close_time ?? '22:00'

  const prevDate = view === 'month'
    ? format(startOfMonth(subMonths(currentDate, 1)), 'yyyy-MM-dd')
    : view === 'week'
    ? format(subWeeks(currentDate, 1), 'yyyy-MM-dd')
    : format(subDays(currentDate, 1), 'yyyy-MM-dd')

  const nextDate = view === 'month'
    ? format(startOfMonth(addMonths(currentDate, 1)), 'yyyy-MM-dd')
    : view === 'week'
    ? format(addWeeks(currentDate, 1), 'yyyy-MM-dd')
    : format(addDays(currentDate, 1), 'yyyy-MM-dd')

  const displayTitle = view === 'month'
    ? format(currentDate, 'MMMM yyyy', { locale: th })
    : view === 'week'
    ? `${format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'd MMM', { locale: th })} – ${format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'd MMM yyyy', { locale: th })}`
    : format(currentDate, 'd MMMM yyyy', { locale: th })

  return (
    <div className="p-5 md:p-8 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-zinc-900">ปฏิทินการจอง</h1>
        <Button asChild size="sm">
          <Link href={`/reservations/new?date=${dateParam}`}><Plus className="h-4 w-4 mr-1.5" />เพิ่มการจอง</Link>
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-zinc-200 overflow-hidden">
          <Link
            href={`/calendar?view=day&date=${dateParam}`}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${view === 'day' ? 'bg-blue-600 text-white' : 'text-zinc-600 hover:bg-zinc-50'}`}
          >
            รายวัน
          </Link>
          <Link
            href={`/calendar?view=week&date=${dateParam}`}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${view === 'week' ? 'bg-blue-600 text-white' : 'text-zinc-600 hover:bg-zinc-50'}`}
          >
            รายสัปดาห์
          </Link>
          <Link
            href={`/calendar?view=month&date=${dateParam}`}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${view === 'month' ? 'bg-blue-600 text-white' : 'text-zinc-600 hover:bg-zinc-50'}`}
          >
            รายเดือน
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/calendar?view=${view}&date=${prevDate}`}>
            <Button variant="outline" size="icon" className="h-8 w-8"><ChevronLeft className="h-4 w-4" /></Button>
          </Link>
          <span className="text-sm font-medium text-zinc-700 min-w-[160px] text-center">{displayTitle}</span>
          <Link href={`/calendar?view=${view}&date=${nextDate}`}>
            <Button variant="outline" size="icon" className="h-8 w-8"><ChevronRight className="h-4 w-4" /></Button>
          </Link>
        </div>

        <Link href={`/calendar?view=${view}&date=${format(new Date(), 'yyyy-MM-dd')}`}>
          <Button variant="outline" size="sm" className="h-8">วันนี้</Button>
        </Link>
      </div>

      {view === 'day' ? (
        <DayView date={dateParam} reservations={reservations} openTime={openTime} closeTime={closeTime} />
      ) : view === 'week' ? (
        <WeekView currentDate={currentDate} reservations={reservations} />
      ) : (
        <MonthView currentDate={currentDate} reservations={reservations} />
      )}
    </div>
  )
}
