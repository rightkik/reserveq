import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CalendarDays, ClipboardList, BarChart3, Lock, RefreshCw, FileDown } from 'lucide-react'

const features = [
  {
    icon: CalendarDays,
    title: 'ปฏิทินครบทุกมุมมอง',
    desc: 'ดูการจองแบบรายวัน รายสัปดาห์ และรายเดือน คลิกวันไหนก็เข้าดูรายละเอียดได้ทันที',
  },
  {
    icon: ClipboardList,
    title: 'บันทึกการจองทันที',
    desc: 'เพิ่มการจองใหม่ได้ในไม่กี่วินาที บันทึกชื่อ เบอร์โทร จำนวนคน และหมายเหตุได้ครบ',
  },
  {
    icon: RefreshCw,
    title: 'ติดตามสถานะลูกค้า',
    desc: 'อัปเดตสถานะได้ครบ รอยืนยัน → ยืนยันแล้ว → มาถึง → ไม่มา / ยกเลิก',
  },
  {
    icon: BarChart3,
    title: 'สถิติและภาพรวมรายวัน',
    desc: 'รู้ช่วงเวลา busy ของร้าน และยอดรวมลูกค้าที่คาดว่าจะมาในวันนี้',
  },
  {
    icon: FileDown,
    title: 'Export ข้อมูลได้ (Pro)',
    desc: 'ส่งออกรายการจองเป็นไฟล์ CSV ได้ทุกเมื่อ สำหรับแผน Pro',
  },
  {
    icon: Lock,
    title: 'ข้อมูลของคุณเท่านั้น',
    desc: 'แต่ละร้านเข้าถึงได้เฉพาะข้อมูลตัวเอง ไม่มีร้านอื่นมองเห็นการจองของคุณ',
  },
]

const businessTypes = ['🍽 ร้านอาหาร', '💆 ร้านนวด', '🏥 คลินิก', '💅 ร้านเสริมสวย', '🧖 สปา', '📋 และอื่นๆ']

const steps = [
  { step: '1', title: 'สมัครฟรี', desc: 'ไม่ต้องใช้บัตรเครดิต ทดลองใช้ได้ 30 วันเต็ม' },
  { step: '2', title: 'ตั้งค่าร้าน', desc: 'ใส่ชื่อร้าน เวลาเปิด-ปิด และ upload โลโก้' },
  { step: '3', title: 'รับจองได้เลย', desc: 'บันทึกการจอง ดูปฏิทิน ติดตามสถานะลูกค้า' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-zinc-100 px-5 py-4 flex items-center justify-between max-w-5xl mx-auto">
        <p className="text-xl font-bold text-blue-600">ReserveQ</p>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">เข้าสู่ระบบ</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/register">สมัครฟรี</Link>
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5">

        {/* Hero */}
        <section className="py-20 text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 leading-tight">
            เลิกจดจองลงกระดาษ<br />
            <span className="text-blue-600">จัดการทุกการจองในที่เดียว</span>
          </h1>
          <p className="text-lg text-zinc-500 max-w-xl mx-auto">
            สำหรับร้านอาหาร ร้านนวด คลินิก สปา และทุกธุรกิจที่รับจองในไทย<br />
            บันทึก ติดตาม และดูปฏิทินการจองได้จากทุกอุปกรณ์
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg">
              <Link href="/register">เริ่มใช้งานฟรี 30 วัน</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">เข้าสู่ระบบ</Link>
            </Button>
          </div>
          <p className="text-xs text-zinc-400">ไม่ต้องใช้บัตรเครดิต · ยกเลิกได้ทุกเมื่อ</p>
        </section>

        {/* Business types */}
        <section className="py-8 border-t border-zinc-100">
          <p className="text-center text-sm font-medium text-zinc-400 mb-5">เหมาะกับธุรกิจที่รับการจอง</p>
          <div className="flex flex-wrap justify-center gap-3">
            {businessTypes.map(b => (
              <span key={b} className="px-4 py-2 rounded-full bg-zinc-50 border border-zinc-200 text-sm text-zinc-600">
                {b}
              </span>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="py-14 border-t border-zinc-100">
          <h2 className="text-2xl font-bold text-center text-zinc-900 mb-10">ฟีเจอร์ที่ออกแบบมาสำหรับคุณ</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-5 rounded-xl border border-zinc-100 bg-zinc-50 space-y-2">
                <Icon className="h-7 w-7 text-blue-500" />
                <p className="font-semibold text-zinc-800">{title}</p>
                <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="py-14 border-t border-zinc-100">
          <h2 className="text-2xl font-bold text-center text-zinc-900 mb-10">เริ่มใช้งานใน 3 ขั้นตอน</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {steps.map(({ step, title, desc }) => (
              <div key={step} className="text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white text-lg font-bold flex items-center justify-center mx-auto">
                  {step}
                </div>
                <p className="font-semibold text-zinc-800">{title}</p>
                <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button asChild size="lg">
              <Link href="/register">เริ่มใช้งานฟรีเลย</Link>
            </Button>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-14 border-t border-zinc-100">
          <h2 className="text-2xl font-bold text-center text-zinc-900 mb-2">ราคาที่คุ้มค่า</h2>
          <p className="text-center text-zinc-400 text-sm mb-10">ทดลองใช้ฟรี 30 วัน ไม่มีเงื่อนไข</p>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="border border-zinc-200 rounded-xl p-6 space-y-4">
              <div>
                <p className="font-bold text-zinc-800 text-lg">ฟรี</p>
                <p className="text-3xl font-bold mt-1">฿0</p>
              </div>
              <ul className="space-y-2 text-sm text-zinc-500">
                <li className="flex items-center gap-2"><span className="text-green-500 font-bold">✓</span> ทดลองใช้ 30 วัน ไม่จำกัดการจอง</li>
                <li className="flex items-center gap-2"><span className="text-green-500 font-bold">✓</span> หลังจากนั้น 30 การจอง/เดือน</li>
                <li className="flex items-center gap-2"><span className="text-green-500 font-bold">✓</span> ปฏิทินและภาพรวม</li>
                <li className="flex items-center gap-2"><span className="text-green-500 font-bold">✓</span> ติดตามสถานะลูกค้า</li>
              </ul>
              <Button asChild className="w-full" variant="outline">
                <Link href="/register">เริ่มฟรี</Link>
              </Button>
            </div>
            <div className="border-2 border-blue-500 rounded-xl p-6 space-y-4 relative">
              <span className="absolute -top-3 left-4 bg-blue-500 text-white text-xs px-3 py-0.5 rounded-full font-medium">แนะนำ</span>
              <div>
                <p className="font-bold text-zinc-800 text-lg">Pro</p>
                <p className="text-3xl font-bold mt-1">฿299<span className="text-base font-normal text-zinc-400">/เดือน</span></p>
              </div>
              <ul className="space-y-2 text-sm text-zinc-500">
                <li className="flex items-center gap-2"><span className="text-blue-500 font-bold">✓</span> การจองไม่จำกัด</li>
                <li className="flex items-center gap-2"><span className="text-blue-500 font-bold">✓</span> Export CSV</li>
                <li className="flex items-center gap-2"><span className="text-blue-500 font-bold">✓</span> ทุกอย่างใน Free</li>
                <li className="flex items-center gap-2"><span className="text-blue-500 font-bold">✓</span> รองรับการเติบโตของร้าน</li>
              </ul>
              <Button asChild className="w-full">
                <Link href="/register">เริ่มใช้ Pro</Link>
              </Button>
            </div>
          </div>
        </section>

      </main>

      <footer className="border-t border-zinc-100 py-8 text-center text-sm text-zinc-400">
        © 2026 ReserveQ · ระบบจองคิวสำหรับธุรกิจไทย
      </footer>
    </div>
  )
}
