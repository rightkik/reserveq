'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Reservation, ReservationStatus } from '@/types'
import { ReservationForm } from './ReservationForm'
import { StatusBadge } from './StatusBadge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'

const statusOptions: { value: ReservationStatus; label: string }[] = [
  { value: 'pending', label: 'รอยืนยัน' },
  { value: 'confirmed', label: 'ยืนยันแล้ว' },
  { value: 'arrived', label: 'มาถึงแล้ว' },
  { value: 'cancelled', label: 'ยกเลิก' },
  { value: 'no_show', label: 'ไม่มา' },
]

export function ReservationActions({ reservation }: { reservation: Reservation }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function updateStatus(status: ReservationStatus) {
    const supabase = createClient()
    await supabase.from('reservations').update({ status, updated_at: new Date().toISOString() }).eq('id', reservation.id)
    router.refresh()
  }

  async function handleDelete() {
    if (!confirm(`ลบการจองของ "${reservation.customer_name}" ใช่ไหม?`)) return
    setDeleting(true)
    const supabase = createClient()
    await supabase.from('reservations').delete().eq('id', reservation.id)
    router.refresh()
  }

  return (
    <>
      <div className="flex items-center gap-1 shrink-0">
        <Select defaultValue={reservation.status} onValueChange={v => updateStatus(v as ReservationStatus)}>
          <SelectTrigger className="h-8 w-32 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map(s => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpen(true)}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={handleDelete} disabled={deleting}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>แก้ไขการจอง</DialogTitle>
          </DialogHeader>
          <ReservationForm reservation={reservation} onSuccess={() => { setOpen(false); router.refresh() }} />
        </DialogContent>
      </Dialog>
    </>
  )
}
