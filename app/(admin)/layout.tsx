import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="bg-white border-b px-6 py-3 flex items-center justify-between">
        <span className="font-bold text-blue-600">ReserveQ Admin</span>
        <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-zinc-800">← กลับหน้าร้าน</Link>
      </header>
      {children}
    </div>
  )
}
