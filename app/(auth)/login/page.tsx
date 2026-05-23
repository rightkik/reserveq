'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

const WARN_AT = 3
const COOLDOWN_AT = 4
const LOCK_AT = 6
const COOLDOWN_MS = 2 * 60 * 1000

function key(prefix: string, email: string) {
  return `rq_${prefix}_${email.toLowerCase().trim()}`
}

function getFailures(email: string): number {
  try { return parseInt(localStorage.getItem(key('fail', email)) ?? '0', 10) } catch { return 0 }
}
function setFailures(email: string, n: number) {
  try { localStorage.setItem(key('fail', email), String(n)) } catch { /* noop */ }
}
function getCooldownUntil(email: string): number {
  try { return parseInt(localStorage.getItem(key('cd', email)) ?? '0', 10) } catch { return 0 }
}
function setCooldownUntil(email: string, ts: number) {
  try { localStorage.setItem(key('cd', email), String(ts)) } catch { /* noop */ }
}
function isAccountLocked(email: string): boolean {
  try { return localStorage.getItem(key('lock', email)) === '1' } catch { return false }
}
function lockAccount(email: string) {
  try { localStorage.setItem(key('lock', email), '1') } catch { /* noop */ }
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [warning, setWarning] = useState('')
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [locked, setLocked] = useState(false)

  useEffect(() => {
    if (!email) { setCooldown(0); setLocked(false); return }

    if (isAccountLocked(email)) { setLocked(true); return }

    const until = getCooldownUntil(email)
    const remaining = Math.max(0, Math.ceil((until - Date.now()) / 1000))
    setCooldown(remaining)

    if (remaining <= 0) return
    const interval = setInterval(() => {
      const r = Math.max(0, Math.ceil((getCooldownUntil(email) - Date.now()) / 1000))
      setCooldown(r)
      if (r === 0) clearInterval(interval)
    }, 1000)
    return () => clearInterval(interval)
  }, [email])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (locked || cooldown > 0) return
    setError('')
    setWarning('')
    setLoading(true)

    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      const failures = getFailures(email) + 1
      setFailures(email, failures)

      if (failures >= LOCK_AT) {
        lockAccount(email)
        setLocked(true)
        setError('')
      } else if (failures >= COOLDOWN_AT) {
        const until = Date.now() + COOLDOWN_MS
        setCooldownUntil(email, until)
        setCooldown(Math.ceil(COOLDOWN_MS / 1000))
        setError(`ใส่รหัสผ่านผิดหลายครั้ง กรุณารอ 2 นาทีก่อนลองใหม่`)
      } else {
        setError(
          authError.message === 'Email not confirmed'
            ? 'กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ โปรดตรวจสอบกล่องจดหมาย'
            : 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
        )
        if (failures >= WARN_AT) {
          setWarning(`ระวัง: ใส่ผิดเกิน ${COOLDOWN_AT} ครั้ง จะถูกล็อก 2 นาที และเกิน ${LOCK_AT} ครั้ง บัญชีจะถูกล็อกถาวร`)
        }
      }
      setLoading(false)
      return
    }

    setFailures(email, 0)
    if (data.user) {
      await supabase.from('profiles').update({ last_login: new Date().toISOString() }).eq('id', data.user.id)
    }
    router.push('/dashboard')
    router.refresh()
  }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
  const isDisabled = loading || cooldown > 0 || locked

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-4">
        <Link href="/" className="flex items-center gap-2 justify-center text-sm text-zinc-400 hover:text-zinc-600 transition-colors">
          <span>←</span> กลับหน้าแรก
        </Link>
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-600">ReserveQ</CardTitle>
          <CardDescription>เข้าสู่ระบบเพื่อจัดการการจอง</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {locked && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded-md space-y-1">
                <p className="font-medium">บัญชีถูกล็อก</p>
                <p>กรุณาติดต่อผู้ดูแลระบบ:{' '}
                  <a href="mailto:pressinth@gmail.com" className="underline font-medium">pressinth@gmail.com</a>
                </p>
              </div>
            )}
            {!locked && cooldown > 0 && (
              <div className="text-sm text-orange-700 bg-orange-50 border border-orange-200 p-3 rounded-md">
                กรุณารอ <span className="font-bold">{fmt(cooldown)}</span> นาที ก่อนลองใหม่
              </div>
            )}
            {!locked && cooldown === 0 && error && (
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>
            )}
            {warning && (
              <p className="text-sm text-orange-600 bg-orange-50 border border-orange-200 p-3 rounded-md">{warning}</p>
            )}
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">รหัสผ่าน</Label>
                <Link href="/forgot-password" className="text-xs text-blue-600 hover:underline">
                  ลืมรหัสผ่าน?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={isDisabled}>
              {loading ? 'กำลังเข้าสู่ระบบ...' : cooldown > 0 ? `รอ ${fmt(cooldown)}` : 'เข้าสู่ระบบ'}
            </Button>
            <p className="text-sm text-zinc-500 text-center">
              ยังไม่มีบัญชี?{' '}
              <Link href="/register" className="text-blue-600 hover:underline">สมัครฟรี 30 วัน</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
      </div>
    </div>
  )
}
