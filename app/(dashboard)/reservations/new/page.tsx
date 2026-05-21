import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ReservationForm } from '@/components/reservations/ReservationForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  searchParams: Promise<{ date?: string; time?: string }>
}

export default async function NewReservationPage({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('shop_open_time, shop_close_time')
    .eq('id', user.id)
    .single()

  const params = await searchParams

  return (
    <div className="p-5 md:p-8">
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>เพิ่มการจองใหม่</CardTitle>
        </CardHeader>
        <CardContent>
          <ReservationForm
            defaultDate={params.date}
            defaultTime={params.time}
            openTime={profile?.shop_open_time ?? '10:00'}
            closeTime={profile?.shop_close_time ?? '22:00'}
          />
        </CardContent>
      </Card>
    </div>
  )
}
