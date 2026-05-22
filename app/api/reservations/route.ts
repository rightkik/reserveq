import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, trial_ends_at')
    .eq('id', user.id)
    .single()

  if (profile) {
    const isPro = profile.plan === 'pro'
    const isTrial = profile.plan === 'trial' && new Date(profile.trial_ends_at) > new Date()
    if (!isPro && !isTrial) {
      const now = new Date()
      const { count } = await supabase
        .from('reservations')
        .select('id', { count: 'exact', head: true })
        .eq('owner_id', user.id)
        .gte('created_at', new Date(now.getFullYear(), now.getMonth(), 1).toISOString())
      if ((count ?? 0) >= 30) {
        return NextResponse.json({ error: 'quota_exceeded' }, { status: 403 })
      }
    }
  }

  const body = await request.json()
  const { error } = await supabase.from('reservations').insert({ ...body, owner_id: user.id })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true }, { status: 201 })
}
