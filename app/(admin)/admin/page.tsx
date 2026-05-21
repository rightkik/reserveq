import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChangePlanForm } from './ChangePlanForm'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

const planLabel: Record<string, string> = { trial: 'ทดลอง', free: 'ฟรี', pro: 'Pro' }
const planColor: Record<string, string> = {
  trial: 'bg-yellow-100 text-yellow-800',
  free: 'bg-zinc-100 text-zinc-700',
  pro: 'bg-blue-100 text-blue-700',
}

function thaiDate(str: string | null) {
  if (!str) return '-'
  return format(new Date(str), 'd MMM yyyy', { locale: th })
}

export default async function AdminPage() {
  const admin = createAdminClient()

  const [profilesRes, authRes, reservationsRes] = await Promise.all([
    admin.from('profiles').select('*').order('created_at', { ascending: false }),
    admin.auth.admin.listUsers({ perPage: 1000 }),
    admin.from('reservations').select('owner_id'),
  ])

  const profiles = profilesRes.data ?? []
  const authUsers = authRes.data?.users ?? []
  const reservations = reservationsRes.data ?? []

  const emailMap = new Map(authUsers.map(u => [u.id, u.email ?? '-']))

  const countMap = new Map<string, number>()
  for (const r of reservations) {
    countMap.set(r.owner_id, (countMap.get(r.owner_id) ?? 0) + 1)
  }

  const total = profiles.length
  const trials = profiles.filter(p => p.plan === 'trial').length
  const freeUsers = profiles.filter(p => p.plan === 'free').length
  const proUsers = profiles.filter(p => p.plan === 'pro').length

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-zinc-900">ภาพรวมระบบ</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'ร้านทั้งหมด', value: total },
          { label: 'ทดลองใช้', value: trials },
          { label: 'ฟรี', value: freeUsers },
          { label: 'Pro', value: proUsers },
        ].map(c => (
          <Card key={c.label}>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm font-medium text-zinc-500">{c.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-zinc-50">
                <tr>
                  <th className="text-left p-3 font-medium text-zinc-500">ร้าน</th>
                  <th className="text-left p-3 font-medium text-zinc-500">อีเมล</th>
                  <th className="text-left p-3 font-medium text-zinc-500">แผน</th>
                  <th className="text-left p-3 font-medium text-zinc-500">หมดทดลอง</th>
                  <th className="text-right p-3 font-medium text-zinc-500">การจอง</th>
                  <th className="text-left p-3 font-medium text-zinc-500">สมัครเมื่อ</th>
                  <th className="text-left p-3 font-medium text-zinc-500">เปลี่ยนแผน</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {profiles.map(p => (
                  <tr key={p.id} className="hover:bg-zinc-50">
                    <td className="p-3 font-medium">{p.shop_name}</td>
                    <td className="p-3 text-zinc-500">{emailMap.get(p.id) ?? '-'}</td>
                    <td className="p-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${planColor[p.plan] ?? ''}`}>
                        {planLabel[p.plan] ?? p.plan}
                      </span>
                    </td>
                    <td className="p-3 text-zinc-500">
                      {p.plan === 'trial' ? thaiDate(p.trial_ends_at) : '-'}
                    </td>
                    <td className="p-3 text-right">{countMap.get(p.id) ?? 0}</td>
                    <td className="p-3 text-zinc-500">{thaiDate(p.created_at)}</td>
                    <td className="p-3">
                      <ChangePlanForm profileId={p.id} currentPlan={p.plan} />
                    </td>
                  </tr>
                ))}
                {profiles.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-zinc-400">ยังไม่มีผู้ใช้</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
