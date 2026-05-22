'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    setLoading(false)
    if (resetErr) {
      setError('ส่งอีเมลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')
      return
    }
    setSent(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-600">ReserveQ</CardTitle>
          <CardDescription>รีเซ็ตรหัสผ่าน</CardDescription>
        </CardHeader>

        {sent ? (
          <CardContent className="space-y-4 py-6">
            <div className="text-center space-y-3">
              <div className="text-4xl">📧</div>
              <p className="font-medium text-zinc-800">ส่งลิงก์รีเซ็ตแล้ว</p>
              <p className="text-sm text-zinc-500">
                ตรวจสอบอีเมล <span className="font-medium text-zinc-700">{email}</span> และคลิกลิงก์เพื่อตั้งรหัสผ่านใหม่
              </p>
              <p className="text-xs text-zinc-400">ลิงก์มีอายุ 1 ชั่วโมง</p>
            </div>
            <div className="text-center pt-2">
              <Link href="/login" className="text-sm text-blue-600 hover:underline">
                กลับหน้าเข้าสู่ระบบ
              </Link>
            </div>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
              <p className="text-sm text-zinc-500">
                ใส่อีเมลที่ลงทะเบียนไว้ เราจะส่งลิงก์รีเซ็ตรหัสผ่านให้
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="email">อีเมล</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'กำลังส่ง...' : 'ส่งลิงก์รีเซ็ต'}
              </Button>
              <Link href="/login" className="text-sm text-zinc-500 hover:underline text-center">
                กลับหน้าเข้าสู่ระบบ
              </Link>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  )
}
