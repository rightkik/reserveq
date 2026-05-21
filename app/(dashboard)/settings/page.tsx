'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatThaiDate } from '@/lib/utils/dateUtils'

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [form, setForm] = useState({ shop_name: '', full_name: '', phone: '', shop_open_time: '10:00', shop_close_time: '22:00' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setProfile(data as Profile)
        setForm({
          shop_name: data.shop_name ?? '',
          full_name: data.full_name ?? '',
          phone: data.phone ?? '',
          shop_open_time: data.shop_open_time ?? '10:00',
          shop_close_time: data.shop_close_time ?? '22:00',
        })
      }
    }
    load()
  }, [])

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSaved(false)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      shop_name: form.shop_name,
      full_name: form.full_name || null,
      phone: form.phone || null,
      shop_open_time: form.shop_open_time,
      shop_close_time: form.shop_close_time,
    }, { onConflict: 'id' })

    setSaving(false)
    if (error?.message) { console.error('settings save error:', error); setError(`บันทึกไม่สำเร็จ: ${error.message}`); return }
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const planLabel: Record<string, string> = { trial: 'ทดลองใช้', free: 'ฟรี', pro: 'Pro' }

  return (
    <div className="p-5 md:p-8 space-y-6 max-w-2xl">
      <h1 className="text-xl font-bold text-zinc-900">ตั้งค่าร้าน</h1>

      {profile && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">แผนการใช้งาน</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3">
            <Badge variant="outline" className={profile.plan === 'pro' ? 'border-blue-400 text-blue-700' : 'border-zinc-300'}>
              {planLabel[profile.plan] ?? profile.plan}
            </Badge>
            {profile.plan === 'trial' && (
              <p className="text-sm text-zinc-500">
                ทดลองใช้ถึง {formatThaiDate(profile.trial_ends_at)}
              </p>
            )}
            {profile.plan === 'free' && (
              <p className="text-sm text-zinc-500">30 การจอง/เดือน</p>
            )}
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSave}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">ข้อมูลร้าน</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
            {saved && <p className="text-sm text-green-600 bg-green-50 p-3 rounded-md">บันทึกเรียบร้อยแล้ว</p>}

            <div className="space-y-1.5">
              <Label htmlFor="shop_name">ชื่อร้าน *</Label>
              <Input id="shop_name" value={form.shop_name} onChange={e => set('shop_name', e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="full_name">ชื่อเจ้าของร้าน</Label>
              <Input id="full_name" value={form.full_name} onChange={e => set('full_name', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">เบอร์โทรร้าน</Label>
              <Input id="phone" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="02-xxx-xxxx" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="shop_open_time">เวลาเปิดร้าน</Label>
                <Input id="shop_open_time" type="time" value={form.shop_open_time} onChange={e => set('shop_open_time', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="shop_close_time">เวลาปิดร้าน</Label>
                <Input id="shop_close_time" type="time" value={form.shop_close_time} onChange={e => set('shop_close_time', e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="mt-4 flex justify-end">
          <Button type="submit" disabled={saving}>{saving ? 'กำลังบันทึก...' : 'บันทึก'}</Button>
        </div>
      </form>
    </div>
  )
}
