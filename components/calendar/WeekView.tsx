'use client'

import { useRouter } from 'next/navigation'
import { format, isSameDay } from 'date-fns'
import { th } from 'date-fns/locale'
import type { Reservation } from '@/types'
import { StatusBadge } from '@/components/reservations/StatusBadge'
import { getWeekDays, formatTime } from '@/lib/utils/dateUtils'
import { cn } from '@/lib/utils'

interface Props {
  currentDate: Date
  reservations: Reservation[]
}

export function WeekView({ currentDate, reservations }: Props) {
  const router = useRouter()
  const days = getWeekDays(currentDate)
  const today = new Date()

  return (
    <div className="overflow-x-auto">
      <div className="grid grid-cols-7 min-w-[600px] border border-zinc-200 rounded-lg overflow-hidden">
        {days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const dayRes = reservations
            .filter(r => r.reservation_date === dateStr)
            .sort((a, b) => a.reservation_time.localeCompare(b.reservation_time))
          const isToday = isSameDay(day, today)

          return (
            <div key={dateStr} className="border-r border-zinc-200 last:border-0 min-h-[200px]">
              <div
                className={cn(
                  'py-2 px-2 text-center border-b border-zinc-200',
                  isToday ? 'bg-blue-50' : 'bg-zinc-50'
                )}
              >
                <p className="text-xs text-zinc-500">{format(day, 'EEE', { locale: th })}</p>
                <p className={cn('text-lg font-semibold', isToday ? 'text-blue-600' : 'text-zinc-800')}>
                  {format(day, 'd')}
                </p>
              </div>
              <div className="p-1.5 space-y-1">
                {dayRes.map(r => (
                  <button
                    key={r.id}
                    onClick={() => router.push(`/reservations?date=${dateStr}&q=${encodeURIComponent(r.customer_name)}`)}
                    className="w-full text-left bg-white border border-zinc-200 rounded px-2 py-1 hover:border-blue-300 transition-all"
                  >
                    <p className="text-xs font-medium text-zinc-800 truncate">{r.customer_name}</p>
                    <p className="text-xs text-zinc-400">{formatTime(r.reservation_time)} · {r.party_size}คน</p>
                  </button>
                ))}
                <button
                  onClick={() => router.push(`/reservations/new?date=${dateStr}`)}
                  className="w-full text-xs text-zinc-300 hover:text-blue-500 py-1 hover:bg-blue-50 rounded transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
