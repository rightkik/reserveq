import { Badge } from '@/components/ui/badge'
import type { ReservationStatus } from '@/types'

const config: Record<ReservationStatus, { label: string; className: string }> = {
  pending:   { label: 'รอยืนยัน',   className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  confirmed: { label: 'ยืนยันแล้ว', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  arrived:   { label: 'มาถึงแล้ว',  className: 'bg-green-100 text-green-800 border-green-200' },
  cancelled: { label: 'ยกเลิก',     className: 'bg-red-100 text-red-800 border-red-200' },
  no_show:   { label: 'ไม่มา',      className: 'bg-zinc-100 text-zinc-600 border-zinc-200' },
}

export function StatusBadge({ status }: { status: ReservationStatus }) {
  const { label, className } = config[status]
  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  )
}

export function statusLabel(status: ReservationStatus): string {
  return config[status]?.label ?? status
}
