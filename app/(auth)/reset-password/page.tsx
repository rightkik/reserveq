'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('รหัสผ่านไม่ตรงกัน'); return }
    if (password.length < 6) { setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'); return }

    setLoading(true)
    const supabase = createClient()
    const { error: updateErr } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (updateErr) { setError(`ไม่สำเร็จ: ${updateErr.message}`); return }
    setDone(true)
    setTimeout(() => router.push('/dashboard'), 3000)
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-sm">
          <CardContent className="py-10 text-center space-y-3">
            <p className="text-zinc-500 text-sm">กำลังตรวจสอบลิงก์...</p>
            <p className="text-xs text-zinc-400">หากหน้านี้ค้างนาน ลิงก์อาจหมดอายุแล้ว</p>
            <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline block">
              ขอลิงก์ใหม่
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-600">ReserveQ</CardTitle>
          <CardDescription>ตั้งรหัสผ่านใหม่</CardDescription>
        </CardHeader>

        {done ? (
          <CardContent className="py-8 text-center space-y-2">
            <p className="text-green-600 font-medium">เปลี่ยนรหัสผ่านสำเร็จ</p>
            <p className="text-sm text-zinc-500">กำลังพาไปหน้าหลัก...</p>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
              <div className="space-y-1.5">
                <Label htmlFor="password">รหัสผ่านใหม่</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm">ยืนยันรหัสผ่านใหม่</Label>
                <Input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่'}
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  )
}
