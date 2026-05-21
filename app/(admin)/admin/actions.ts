'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function updatePlan(profileId: string, plan: string) {
  const admin = createAdminClient()
  await admin.from('profiles').update({ plan }).eq('id', profileId)
  revalidatePath('/admin')
}
