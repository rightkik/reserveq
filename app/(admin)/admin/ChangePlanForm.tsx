'use client'

import { useState } from 'react'
import { updatePlan } from './actions'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function ChangePlanForm({ profileId, currentPlan }: { profileId: string; currentPlan: string }) {
  const [pending, setPending] = useState(false)

  async function handleChange(value: string) {
    setPending(true)
    await updatePlan(profileId, value)
    setPending(false)
  }

  return (
    <Select defaultValue={currentPlan} onValueChange={handleChange} disabled={pending}>
      <SelectTrigger className="w-24 h-7 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="trial">ทดลอง</SelectItem>
        <SelectItem value="free">ฟรี</SelectItem>
        <SelectItem value="pro">Pro</SelectItem>
      </SelectContent>
    </Select>
  )
}
