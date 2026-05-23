import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const { email, shopName } = await req.json()
  if (!email || !shopName) {
    return NextResponse.json({ error: 'missing fields' }, { status: 400 })
  }

  const registeredAt = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })

  const body = `
สมาชิกใหม่ลงทะเบียนใน ReserveQ

ชื่อร้าน: ${shopName}
อีเมล: ${email}
วันเวลาสมัคร: ${registeredAt}

---
แจ้งเตือนอัตโนมัติจาก ReserveQ
  `.trim()

  const { error } = await resend.emails.send({
    from: 'ReserveQ <onboarding@resend.dev>',
    to: 'chino_bc@hotmail.com',
    subject: `[ReserveQ] สมาชิกใหม่ — ${shopName}`,
    text: body,
  })

  if (error) {
    console.error('resend notify error:', error)
    return NextResponse.json({ error: 'send failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
