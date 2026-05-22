import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { category, subject, detail, phone } = await req.json()
  if (!category || !subject || !detail) {
    return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบ' }, { status: 400 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('shop_name, full_name')
    .eq('id', user.id)
    .single()

  const shopName = profile?.shop_name ?? '-'
  const ownerName = profile?.full_name ?? '-'

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
    to: 'pressinth@gmail.com',
    subject: `[ReserveQ] ${category} — ${subject}`,
    text: body,
  })

  if (error) {
    console.error('resend error:', error)
    return NextResponse.json({ error: 'ส่งอีเมลไม่สำเร็จ' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
