'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, CalendarDays, ClipboardList, Settings, LogOut, MessageCircleQuestion } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

const links = [
  { href: '/dashboard', label: 'ภาพรวม', icon: LayoutDashboard },
  { href: '/calendar', label: 'ปฏิทิน', icon: CalendarDays },
  { href: '/reservations', label: 'การจอง', icon: ClipboardList },
  { href: '/settings', label: 'ตั้งค่า', icon: Settings },
  { href: '/support', label: 'แจ้งปัญหา', icon: MessageCircleQuestion },
]

export function SidebarNav({ shopName, logoUrl }: { shopName: string; logoUrl?: string | null }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="hidden md:flex flex-col w-56 bg-white border-r border-zinc-200 min-h-screen">
      <div className="p-4 border-b border-zinc-200 space-y-3">
        <p className="text-xs text-zinc-400 font-medium uppercase tracking-wide">ReserveQ</p>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg border border-zinc-200 overflow-hidden shrink-0 bg-zinc-50 flex items-center justify-center">
            {logoUrl ? (
              <Image src={logoUrl} alt="logo" width={48} height={48} className="object-cover w-full h-full" unoptimized />
            ) : (
              <span className="text-[10px] font-medium text-zinc-300 text-center leading-tight px-1">No Logo</span>
            )}
          </div>
          <p className="font-semibold text-zinc-800 truncate text-sm leading-tight">{shopName}</p>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
                ? 'bg-blue-50 text-blue-700'
                : 'text-zinc-600 hover:bg-zinc-100'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t border-zinc-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-600 hover:bg-zinc-100 w-full transition-colors"
        >
          <LogOut className="h-4 w-4" />
          ออกจากระบบ
        </button>
      </div>
    </aside>
  )
}

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 flex z-50">
      {links.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            'flex-1 flex flex-col items-center py-2 gap-0.5 text-xs font-medium transition-colors',
            pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
              ? 'text-blue-600'
              : 'text-zinc-500'
          )}
        >
          <Icon className="h-5 w-5" />
          {label}
        </Link>
      ))}
    </nav>
  )
}
