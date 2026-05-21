import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: 'ReserveQ — ระบบจองคิวสำหรับร้านของคุณ',
  description: 'จัดการการจองร้านอาหารและธุรกิจขนาดเล็กได้ง่ายๆ',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={geist.variable}>
      <body className="min-h-screen bg-zinc-50 font-sans antialiased">{children}</body>
    </html>
  )
}
