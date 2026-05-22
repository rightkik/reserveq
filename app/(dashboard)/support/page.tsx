'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const CATEGORIES = [
  'ปัญหาการใช้งาน',
  'ข้อมูลผิดพลาด',
  'ขอเปลี่ยนแผน',
  'ปัญหาการเข้าสู่ระบบ',
  'อื่นๆ',
]

export default function SupportPage() {
  const [form, setForm] = useState({ category: '', subject: '', detail: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.category) { setError('กรุณาเลือกประเภทปัญหา'); return }
    setError('')
    setLoading(true)

    const res = await fetch('/api/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    setLoading(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'เกิดข้อผิดพลาด กรุณาลองใหม่')
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <div className="p-5 md:p-8 max-w-2xl">
        <h1 className="text-xl font-bold text-zinc-900 mb-6">แจ้งปัญหา / ติดต่อผู้ดูแล</h1>
        <Card>
          <CardContent className="py-12 text-center space-y-3">
            <div className="text-5xl">✅</div>
            <p className="text-lg font-medium text-zinc-800">ส่งเรื่องเรียบร้อยแล้ว</p>
            <p className="text-sm text-zinc-500">ทีมงานจะติดต่อกลับภายใน 1–2 วันทำการ</p>
            <p className="text-xs text-zinc-400">หากเร่งด่วน ติดต่อ: pressinth@gmail.com</p>
            <Button variant="outline" className="mt-4" onClick={() => { setSent(false); setForm({ category: '', subject: '', detail: '', phone: '' }) }}>
              แจ้งปัญหาเพิ่มเติม
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-5 md:p-8 max-w-2xl">
      <h1 className="text-xl font-bold text-zinc-900 mb-6">แจ้งปัญหา / ติดต่อผู้ดูแล</h1>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">ฝากเรื่องถึงผู้ดูแลระบบ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}

            <div className="space-y-1.5">
              <Label>ประเภทปัญหา *</Label>
              <Select value={form.category} onValueChange={v => set('category', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกประเภท..." />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="subject">หัวข้อ *</Label>
              <Input
                id="subject"
                placeholder="สรุปปัญหาสั้นๆ"
                value={form.subject}
                onChange={e => set('subject', e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="detail">รายละเอียด *</Label>
              <Textarea
                id="detail"
                placeholder="อธิบายปัญหาที่พบ เกิดขึ้นเมื่อไหร่ ทำอะไรแล้วเกิดปัญหา..."
                value={form.detail}
                onChange={e => set('detail', e.target.value)}
                required
                rows={5}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">เบอร์โทรติดต่อกลับ <span className="text-zinc-400 font-normal">(ถ้ามี)</span></Label>
              <Input
                id="phone"
                type="tel"
                placeholder="08x-xxx-xxxx"
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-zinc-400">ทีมงานจะติดต่อกลับภายใน 1–2 วันทำการ</p>
          <Button type="submit" disabled={loading}>
            {loading ? 'กำลังส่ง...' : 'ส่งเรื่อง'}
          </Button>
        </div>
      </form>
    </div>
  )
}
