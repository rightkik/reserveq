import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: 'ReserveQ — ระบบจัดการการจองสำหรับธุรกิจไทย',
  description:
    'จัดการการจองร้านอาหาร ร้านนวด คลินิก สปา และธุรกิจไทยทุกประเภทในที่เดียว บันทึกการจองทางโทรศัพท์ ดูปฏิทิน ติดตามสถานะลูกค้า ทดลองใช้ฟรี 30 วัน ไม่ต้องใช้บัตรเครดิต',
  openGraph: {
    type: 'website',
    locale: 'th_TH',
    siteName: 'ReserveQ',
    title: 'ReserveQ — ระบบจัดการการจองสำหรับธุรกิจไทย',
    description:
      'บันทึกการจอง ดูปฏิทิน ติดตามสถานะลูกค้า ครบในที่เดียว ทดลองใช้ฟรี 30 วัน',
  },
  twitter: {
    card: 'summary',
    title: 'ReserveQ — ระบบจัดการการจองสำหรับธุรกิจไทย',
    description:
      'บันทึกการจอง ดูปฏิทิน ติดตามสถานะลูกค้า ครบในที่เดียว ทดลองใช้ฟรี 30 วัน',
  },
  robots: {
    index: false,   // default: ไม่ให้ index — landing page จะ override เป็น true
    follow: false,
  },
  verification: {
    google: '95cabcf2da426d36',
  },
}

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={geist.variable}>
      <body className="min-h-screen bg-zinc-50 font-sans antialiased">
        {children}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  )
}
