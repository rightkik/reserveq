import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Reservation, ReservationStatus } from '@/types'

const statusLabel: Record<ReservationStatus, string> = {
  pending: 'รอยืนยัน',
  confirmed: 'ยืนยันแล้ว',
  arrived: 'มาถึงแล้ว',
  cancelled: 'ยกเลิก',
  no_show: 'ไม่มา',
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('plan, trial_ends_at').eq('id', user.id).single()
  const isPro = profile?.plan === 'pro'
  const isTrial = profile?.plan === 'trial' && new Date(profile.trial_ends_at) > new Date()

  if (!isPro && !isTrial) {
    return NextResponse.json({ error: 'Pro plan required' }, { status: 403 })
  }

  const { searchParams } = request.nextUrl
  const date = searchParams.get('date')
  const status = searchParams.get('status') as ReservationStatus | null

  let query = supabase.from('reservations').select('*').eq('owner_id', user.id).order('reservation_date').order('reservation_time')
  if (date) query = query.eq('reservation_date', date)
  if (status) query = query.eq('status', status)

  const { data } = await query
  const reservations = (data ?? []) as Reservation[]

  function sanitizeCsv(val: string): string {
    return /^[=+\-@\t\r]/.test(val) ? `'${val}` : val
  }

  const bom = '﻿'
  const header = 'วันที่,เวลา,ชื่อลูกค้า,เบอร์โทร,จำนวนคน,สถานะ,หมายเหตุ\n'
  const rows = reservations.map(r =>
    [r.reservation_date, r.reservation_time.slice(0, 5), `"${sanitizeCsv(r.customer_name)}"`, r.customer_phone ?? '', r.party_size, statusLabel[r.status], `"${sanitizeCsv(r.note ?? '')}"`].join(',')
  ).join('\n')

  return new NextResponse(bom + header + rows, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="reservations-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
