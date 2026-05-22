'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const VALID_PLANS = ['trial', 'free', 'pro']

export async function updatePlan(profileId: string, plan: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) throw new Error('Unauthorized')
  if (!VALID_PLANS.includes(plan)) throw new Error('Invalid plan')

  const admin = createAdminClient()
  await admin.from('profiles').update({ plan }).eq('id', profileId)
  revalidatePath('/admin')
}
