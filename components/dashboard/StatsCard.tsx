import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface Props {
  title: string
  value: string | number
  icon: LucideIcon
  sub?: string
  color?: string
}

export function StatsCard({ title, value, icon: Icon, sub, color = 'text-blue-600' }: Props) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-zinc-500 font-medium">{title}</p>
            <p className="text-3xl font-bold text-zinc-900 mt-1">{value}</p>
            {sub && <p className="text-xs text-zinc-400 mt-1">{sub}</p>}
          </div>
          <div className={`p-2.5 rounded-lg bg-zinc-100 ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
