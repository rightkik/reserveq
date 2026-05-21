import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CalendarCheck, ClipboardList, BarChart3, Shield } from 'lucide-react'

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
        <section className="py-20 text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 leading-tight">
            จัดการการจองร้านคุณ<br />
            <span className="text-blue-600">ได้ง่ายๆ ใน 1 นาที</span>
          </h1>
          <p className="text-lg text-zinc-500 max-w-xl mx-auto">
            บันทึกการจอง ดูปฏิทิน และติดตามสถานะลูกค้าได้ในที่เดียว
            ออกแบบมาสำหรับร้านอาหารและธุรกิจขนาดเล็กในไทย
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

        <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 py-12">
          {[
            { icon: CalendarCheck, title: 'ปฏิทินการจอง', desc: 'ดูการจองแบบรายวันและรายสัปดาห์ในหน้าเดียว' },
            { icon: ClipboardList, title: 'บันทึกการจองได้ทันที', desc: 'เพิ่มการจองใหม่ได้ในไม่กี่วินาที พร้อมบันทึกชื่อ เบอร์ และจำนวนคน' },
            { icon: BarChart3, title: 'สถิติและภาพรวม', desc: 'รู้ช่วงเวลา busy และยอดรวมคนที่คาดว่าจะมาในวันนี้' },
            { icon: Shield, title: 'ข้อมูลปลอดภัย', desc: 'ข้อมูลของคุณเข้าถึงได้แค่คุณเท่านั้น ด้วย Row Level Security' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-5 rounded-xl border border-zinc-100 bg-zinc-50 space-y-2">
              <Icon className="h-7 w-7 text-blue-500" />
              <p className="font-semibold text-zinc-800">{title}</p>
              <p className="text-sm text-zinc-500">{desc}</p>
            </div>
          ))}
        </section>

        <section className="py-12 border-t border-zinc-100">
          <h2 className="text-2xl font-bold text-center text-zinc-900 mb-8">ราคาที่คุ้มค่า</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="border border-zinc-200 rounded-xl p-6 space-y-3">
              <p className="font-bold text-zinc-800 text-lg">ฟรี</p>
              <p className="text-3xl font-bold">฿0</p>
              <ul className="space-y-1.5 text-sm text-zinc-500">
                <li>✓ ทดลองใช้ 30 วัน ไม่จำกัด</li>
                <li>✓ หลังจากนั้น 30 การจอง/เดือน</li>
                <li>✓ ปฏิทินและภาพรวม</li>
              </ul>
              <Button asChild className="w-full" variant="outline">
                <Link href="/register">เริ่มฟรี</Link>
              </Button>
            </div>
            <div className="border-2 border-blue-500 rounded-xl p-6 space-y-3 relative">
              <span className="absolute -top-3 left-4 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">แนะนำ</span>
              <p className="font-bold text-zinc-800 text-lg">Pro</p>
              <p className="text-3xl font-bold">฿299<span className="text-base font-normal text-zinc-400">/เดือน</span></p>
              <ul className="space-y-1.5 text-sm text-zinc-500">
                <li>✓ การจองไม่จำกัด</li>
                <li>✓ Export CSV</li>
                <li>✓ ทุกอย่างใน Free</li>
              </ul>
              <Button asChild className="w-full">
                <Link href="/register">เริ่มใช้ Pro</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-100 py-8 text-center text-sm text-zinc-400">
        © 2025 ReserveQ · ระบบจองคิวสำหรับธุรกิจไทย
      </footer>
    </div>
  )
}
