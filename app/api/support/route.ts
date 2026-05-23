import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'

const resend = new Resend(process.env.RESEND_API_KEY)
const DAILY_LIMIT = 3

function bangkokDayRange() {
  const now = new Date()
  const bangkokMs = now.getTime() + 7 * 60 * 60 * 1000
  const bangkokDate = new Date(bangkokMs).toISOString().slice(0, 10) // YYYY-MM-DD
  const start = new Date(`${bangkokDate}T00:00:00+07:00`)
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000)
  return { start, end }
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { start, end } = bangkokDayRange()
  const { count } = await supabase
    .from('support_tickets')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', start.toISOString())
    .lt('created_at', end.toISOString())

  return NextResponse.json({ used: count ?? 0, limit: DAILY_LIMIT })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { category, subject, detail, phone } = await req.json()
  if (!category || !subject || !detail) {
    return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบ' }, { status: 400 })
  }

  // Rate limit check
  const { start, end } = bangkokDayRange()
  const { count } = await supabase
    .from('support_tickets')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', start.toISOString())
    .lt('created_at', end.toISOString())

  if ((count ?? 0) >= DAILY_LIMIT) {
    return NextResponse.json(
      { error: 'คุณส่งเรื่องครบ 3 ครั้งแล้วในวันนี้ กรุณาลองใหม่พรุ่งนี้' },
      { status: 429 }
    )
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('shop_name, full_name')
    .eq('id', user.id)
    .single()

  const shopName = profile?.shop_name ?? '-'
  const ownerName = profile?.full_name ?? '-'

  // Insert ticket record
  await supabase.from('support_tickets').insert({
    user_id: user.id,
    category,
    subject,
    detail,
    phone: phone || null,
  })

  const body = `
แจ้งปัญหาจาก ReserveQ

ร้าน: ${shopName}
เจ้าของ: ${ownerName}
อีเมล: ${user.email}
เบอร์โทร: ${phone || '-'}

ประเภท: ${category}
หัวข้อ: ${subject}

รายละเอียด:
${detail}

---
ส่งเมื่อ: ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}
  `.trim()

  const { error } = await resend.emails.send({
    from: 'ReserveQ <onboarding@resend.dev>',
    to: 'chino_bc@hotmail.com',
    subject: `[ReserveQ] ${category} — ${subject}`,
    text: body,
  })

  if (error) {
    console.error('resend error:', error)
    return NextResponse.json({ error: 'ส่งอีเมลไม่สำเร็จ' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
