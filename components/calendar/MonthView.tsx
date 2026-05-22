'use client'

import { useRouter } from 'next/navigation'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from 'date-fns'
import { th } from 'date-fns/locale'
import type { Reservation } from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  currentDate: Date
  reservations: Reservation[]
}

const DAY_HEADERS = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา']

export function MonthView({ currentDate, reservations }: Props) {
  const router = useRouter()
  const today = new Date()

  const countMap = new Map<string, number>()
  for (const r of reservations) {
    countMap.set(r.reservation_date, (countMap.get(r.reservation_date) ?? 0) + 1)
  }

  const calStart = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 })
  const calEnd = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 })

  const weeks: Date[][] = []
  let day = calStart
  while (day <= calEnd) {
    const week: Date[] = []
    for (let i = 0; i < 7; i++) {
      week.push(day)
      day = addDays(day, 1)
    }
    weeks.push(week)
  }

  return (
    <div className="border border-zinc-200 rounded-lg overflow-hidden">
      <div className="grid grid-cols-7 border-b border-zinc-200 bg-zinc-50">
        {DAY_HEADERS.map(d => (
          <div key={d} className="py-2 text-center text-xs font-medium text-zinc-500">{d}</div>
        ))}
      </div>
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7 border-b border-zinc-200 last:border-0">
          {week.map(d => {
            const dateStr = format(d, 'yyyy-MM-dd')
            const inMonth = isSameMonth(d, currentDate)
            const isToday = isSameDay(d, today)
            const count = countMap.get(dateStr) ?? 0

            return (
              <button
                key={dateStr}
                onClick={() => router.push(`/calendar?view=day&date=${dateStr}`)}
                className={cn(
                  'min-h-[80px] p-2 text-left hover:bg-blue-50 transition-colors border-r border-zinc-100 last:border-0 flex flex-col gap-1',
                  !inMonth && 'bg-zinc-50/70'
                )}
              >
                <span className={cn(
                  'w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium',
                  isToday ? 'bg-blue-600 text-white' : inMonth ? 'text-zinc-800' : 'text-zinc-300'
                )}>
                  {format(d, 'd')}
                </span>
                {count > 0 && (
                  <span className="text-xs bg-blue-100 text-blue-700 rounded px-1.5 py-0.5 font-medium self-start leading-4">
                    {count} จอง
                  </span>
                )}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
