'use client'

import { useRouter } from 'next/navigation'
import type { Reservation } from '@/types'
import { StatusBadge } from '@/components/reservations/StatusBadge'
import { generateTimeSlots, timeToMinutes } from '@/lib/utils/dateUtils'

interface Props {
  date: string
  reservations: Reservation[]
  openTime: string
  closeTime: string
}

export function DayView({ date, reservations, openTime, closeTime }: Props) {
  const router = useRouter()
  const slots = generateTimeSlots(openTime, closeTime)

  function getSlotReservations(slot: string): Reservation[] {
    return reservations.filter(r => r.reservation_time.slice(0, 5) === slot)
  }

  return (
    <div className="border border-zinc-200 rounded-lg overflow-hidden">
      {slots.map(slot => {
        const slotRes = getSlotReservations(slot)
        return (
          <div
            key={slot}
            className="flex border-b border-zinc-100 last:border-0 min-h-[56px] group"
          >
            <div className="w-16 shrink-0 flex items-start pt-3 px-3">
              <span className="text-xs font-mono text-zinc-400">{slot}</span>
            </div>
            <div className="flex-1 p-1.5 space-y-1">
              {slotRes.map(r => (
                <ReservationSlotCard key={r.id} reservation={r} />
              ))}
              <button
                onClick={() => router.push(`/reservations/new?date=${date}&time=${slot}`)}
                className="w-full text-left px-2 py-1 text-xs text-zinc-300 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors opacity-0 group-hover:opacity-100"
              >
                + เพิ่มการจอง
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ReservationSlotCard({ reservation: r }: { reservation: Reservation }) {
  const router = useRouter()
  return (
    <button
      onClick={() => router.push(`/reservations?q=${encodeURIComponent(r.customer_name)}`)}
      className="w-full text-left bg-white border border-zinc-200 rounded-md px-3 py-1.5 hover:border-blue-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-800 truncate">{r.customer_name}</p>
          <p className="text-xs text-zinc-400">{r.party_size} คน{r.note ? ` · ${r.note}` : ''}</p>
        </div>
        <StatusBadge status={r.status} />
      </div>
    </button>
  )
}
