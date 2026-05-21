'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function RegisterPage() {
  const router = useRouter()
  const [shopName, setShopName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { shop_name: shopName } },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        shop_name: shopName,
      })

      if (profileError && profileError.code !== '23505') {
        setError('สร้างโปรไฟล์ไม่สำเร็จ กรุณาลองใหม่')
        setLoading(false)
        return
      }
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-600">ReserveQ</CardTitle>
          <CardDescription>สมัครใช้งานฟรี 30 วันแรก</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="shopName">ชื่อร้าน</Label>
              <Input
                id="shopName"
                placeholder="ร้านอาหารของคุณ"
                value={shopName}
                onChange={e => setShopName(e.target.value)}
                required
              />
            </div>
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
            <div className="space-y-1.5">
              <Label htmlFor="password">รหัสผ่าน</Label>
              <Input
                id="password"
                type="password"
                placeholder="อย่างน้อย 6 ตัวอักษร"
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'กำลังสมัคร...' : 'เริ่มใช้งานฟรี'}
            </Button>
            <p className="text-sm text-zinc-500 text-center">
              มีบัญชีแล้ว?{' '}
              <Link href="/login" className="text-blue-600 hover:underline">
                เข้าสู่ระบบ
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
