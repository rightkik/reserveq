'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Reservation, ReservationStatus } from '@/types'
import { generateTimeSlots } from '@/lib/utils/dateUtils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Props {
  defaultDate?: string
  defaultTime?: string
  reservation?: Reservation
  openTime?: string
  closeTime?: string
  onSuccess?: () => void
}

const statusOptions: { value: ReservationStatus; label: string }[] = [
  { value: 'pending', label: 'รอยืนยัน' },
  { value: 'confirmed', label: 'ยืนยันแล้ว' },
  { value: 'arrived', label: 'มาถึงแล้ว' },
  { value: 'cancelled', label: 'ยกเลิก' },
  { value: 'no_show', label: 'ไม่มา' },
]

const durationOptions = [30, 60, 90, 120, 180]

export function ReservationForm({ defaultDate, defaultTime, reservation, openTime = '10:00', closeTime = '22:00', onSuccess }: Props) {
  const router = useRouter()
  const isEdit = !!reservation
  const timeSlots = generateTimeSlots(openTime, closeTime)

  const [form, setForm] = useState({
    customer_name: reservation?.customer_name ?? '',
    customer_phone: reservation?.customer_phone ?? '',
    party_size: reservation?.party_size ?? 2,
    reservation_date: reservation?.reservation_date ?? defaultDate ?? '',
    reservation_time: reservation?.reservation_time?.slice(0, 5) ?? defaultTime ?? '',
    duration_minutes: reservation?.duration_minutes ?? 60,
    status: reservation?.status ?? 'pending' as ReservationStatus,
    note: reservation?.note ?? '',
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function set<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!isEdit) {
      const reservationDateTime = new Date(`${form.reservation_date}T${form.reservation_time}`)
      if (reservationDateTime < new Date()) {
        setError('ไม่สามารถจองวันและเวลาที่ผ่านมาแล้วได้')
        setLoading(false)
        return
      }
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('กรุณาเข้าสู่ระบบ'); setLoading(false); return }

    // ensure profile row exists (may be missing if email confirmation was required at signup)
    const { error: upsertErr } = await supabase.from('profiles').upsert(
      { id: user.id, shop_name: user.email?.split('@')[0] ?? 'ร้านของฉัน' },
      { onConflict: 'id', ignoreDuplicates: true }
    )
    if (upsertErr) { console.error('profile upsert error:', upsertErr) }

    if (!isEdit) {
      const { data: profile } = await supabase.from('profiles').select('plan, trial_ends_at').eq('id', user.id).single()
      if (profile) {
        const isPro = profile.plan === 'pro'
        const isTrial = profile.plan === 'trial' && new Date(profile.trial_ends_at) > new Date()
        if (!isPro && !isTrial) {
          const now = new Date()
          const { count } = await supabase.from('reservations')
            .select('id', { count: 'exact', head: true })
            .eq('owner_id', user.id)
            .gte('created_at', new Date(now.getFullYear(), now.getMonth(), 1).toISOString())
          if ((count ?? 0) >= 30) {
            setError('คุณใช้โควต้าฟรี 30 รายการ/เดือนครบแล้ว กรุณาอัปเกรดเป็น Pro')
            setLoading(false)
            return
          }
        }
      }
    }

    const payload = {
      customer_name: form.customer_name,
      customer_phone: form.customer_phone || null,
      party_size: Number(form.party_size),
      reservation_date: form.reservation_date,
      reservation_time: form.reservation_time,
      duration_minutes: Number(form.duration_minutes),
      status: form.status,
      note: form.note || null,
    }

    let err
    if (isEdit) {
      ;({ error: err } = await supabase.from('reservations').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', reservation!.id))
    } else {
      ;({ error: err } = await supabase.from('reservations').insert({ ...payload, owner_id: user.id }))
    }

    if (err?.message) {
      console.error('Supabase error:', err)
      setError(`บันทึกไม่สำเร็จ: ${err.message}`)
      setLoading(false)
      return
    }

    if (onSuccess) {
      onSuccess()
    } else {
      router.push('/reservations')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="customer_name">ชื่อลูกค้า *</Label>
          <Input
            id="customer_name"
            value={form.customer_name}
            onChange={e => set('customer_name', e.target.value)}
            placeholder="ชื่อลูกค้า"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="customer_phone">เบอร์โทร</Label>
          <Input
            id="customer_phone"
            type="tel"
            value={form.customer_phone}
            onChange={e => set('customer_phone', e.target.value)}
            placeholder="08x-xxx-xxxx"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="reservation_date">วันที่ *</Label>
          <Input
            id="reservation_date"
            type="date"
            value={form.reservation_date}
            onChange={e => set('reservation_date', e.target.value)}
            min={isEdit ? undefined : new Date().toISOString().split('T')[0]}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label>เวลา *</Label>
          <Select value={form.reservation_time} onValueChange={v => set('reservation_time', v)} required>
            <SelectTrigger>
              <SelectValue placeholder="เลือกเวลา" />
            </SelectTrigger>
            <SelectContent>
              {timeSlots.map(t => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="party_size">จำนวนคน *</Label>
          <Input
            id="party_size"
            type="number"
            min={1}
            max={100}
            value={form.party_size}
            onChange={e => set('party_size', Number(e.target.value))}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>ระยะเวลา</Label>
          <Select value={String(form.duration_minutes)} onValueChange={v => set('duration_minutes', Number(v))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {durationOptions.map(d => (
                <SelectItem key={d} value={String(d)}>{d} นาที</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>สถานะ</Label>
          <Select value={form.status} onValueChange={v => set('status', v as ReservationStatus)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {statusOptions.map(s => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="note">หมายเหตุ</Label>
        <Textarea
          id="note"
          value={form.note}
          onChange={e => set('note', e.target.value)}
          placeholder="ความต้องการพิเศษ เช่น โต๊ะริมหน้าต่าง"
          rows={2}
        />
      </div>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={() => router.back()}>ยกเลิก</Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'กำลังบันทึก...' : isEdit ? 'บันทึกการเปลี่ยนแปลง' : 'เพิ่มการจอง'}
        </Button>
      </div>
    </form>
  )
}
