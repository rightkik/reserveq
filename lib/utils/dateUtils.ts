import { format, parse, addMinutes, startOfWeek, addDays, isSameDay } from 'date-fns'
import { th } from 'date-fns/locale'

export function formatThaiDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'd MMMM yyyy', { locale: th })
}

export function formatTime(time: string): string {
  return time.slice(0, 5)
}

export function generateTimeSlots(openTime: string, closeTime: string): string[] {
  const slots: string[] = []
  const base = new Date('2000-01-01')
  const [openH, openM] = openTime.split(':').map(Number)
  const [closeH, closeM] = closeTime.split(':').map(Number)

  let current = new Date(base)
  current.setHours(openH, openM, 0, 0)

  const end = new Date(base)
  end.setHours(closeH, closeM, 0, 0)

  while (current < end) {
    slots.push(format(current, 'HH:mm'))
    current = addMinutes(current, 30)
  }

  return slots
}

export function getWeekDays(date: Date): Date[] {
  const start = startOfWeek(date, { weekStartsOn: 1 })
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

export function isSameDate(a: Date | string, b: Date | string): boolean {
  const da = typeof a === 'string' ? new Date(a) : a
  const db = typeof b === 'string' ? new Date(b) : b
  return isSameDay(da, db)
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function parseTimeInput(time: string): string {
  return time.slice(0, 5)
}
