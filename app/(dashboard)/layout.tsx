import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SidebarNav, BottomNav } from '@/components/dashboard/SidebarNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('shop_name, logo_url')
    .eq('id', user.id)
    .single()

  const shopName = profile?.shop_name ?? 'ร้านของฉัน'
  const logoUrl = profile?.logo_url ?? null

  return (
    <div className="flex min-h-screen">
      <SidebarNav shopName={shopName} logoUrl={logoUrl} />
      <main className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
