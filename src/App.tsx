import {
  ArrowRight,
  CheckCircle2,
  Headphones,
  PackageCheck,
  Route,
  ShieldCheck,
  Truck,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const services = [
  {
    icon: Route,
    title: 'Vận tải tối ưu',
    description:
      'Tối ưu tuyến đường và lịch giao nhận để hàng hóa đến đúng nơi, đúng thời điểm.',
  },
  {
    icon: PackageCheck,
    title: 'Theo dõi minh bạch',
    description:
      'Cập nhật trạng thái đơn hàng xuyên suốt, giúp bạn chủ động trong mọi kế hoạch.',
  },
  {
    icon: ShieldCheck,
    title: 'An toàn hàng hóa',
    description:
      'Quy trình kiểm soát chặt chẽ từ lúc tiếp nhận đến khi bàn giao thành công.',
  },
]

function App() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
          <a className="flex items-center gap-2.5 font-semibold tracking-tight" href="#">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Truck className="size-5" />
            </span>
            <span>MHP Logistic</span>
          </a>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a className="transition-colors hover:text-foreground" href="#dich-vu">
              Dịch vụ
            </a>
            <a className="transition-colors hover:text-foreground" href="#loi-ich">
              Lợi ích
            </a>
            <a className="transition-colors hover:text-foreground" href="#lien-he">
              Liên hệ
            </a>
          </nav>
          <Button asChild>
            <a href="#lien-he">Nhận báo giá</a>
          </Button>
        </div>
      </header>

      <main>
        <section className="relative isolate">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_85%_20%,oklch(0.92_0.08_230),transparent_35%),radial-gradient(circle_at_10%_80%,oklch(0.95_0.06_70),transparent_30%)]" />
          <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-28">
            <div>
              <Badge variant="secondary" className="mb-6 rounded-full px-3 py-1">
                Giao vận tin cậy trên toàn quốc
              </Badge>
              <h1 className="max-w-3xl text-5xl font-semibold leading-[1.05] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
                Kết nối hàng hóa, mở rộng kinh doanh.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
                Giải pháp logistics linh hoạt cho doanh nghiệp, từ vận chuyển đến
                quản lý giao nhận — nhanh chóng, minh bạch và an toàn.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" asChild className="h-11 px-5">
                  <a href="#lien-he">
                    Bắt đầu ngay <ArrowRight data-icon="inline-end" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild className="h-11 px-5">
                  <a href="#dich-vu">Khám phá dịch vụ</a>
                </Button>
              </div>
            </div>

            <Card className="relative overflow-hidden border-white/70 bg-white/80 shadow-2xl shadow-sky-950/10 backdrop-blur dark:bg-card/80">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 via-blue-600 to-orange-400" />
              <CardHeader>
                <CardDescription>Đơn hàng đang vận chuyển</CardDescription>
                <div className="flex items-center justify-between gap-4">
                  <CardTitle className="text-2xl">#MHP-240812</CardTitle>
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                    Đúng tiến độ
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative mb-8 mt-3">
                  <div className="h-2 rounded-full bg-muted">
                    <div className="h-2 w-[72%] rounded-full bg-primary" />
                  </div>
                  <div className="mt-3 flex justify-between text-xs text-muted-foreground">
                    <span>TP. Hồ Chí Minh</span>
                    <span>Đà Nẵng</span>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    ['08:30', 'Đã tiếp nhận hàng hóa'],
                    ['11:45', 'Đang trung chuyển'],
                    ['Dự kiến 17:30', 'Giao đến người nhận'],
                  ].map(([time, label], index) => (
                    <div className="flex items-start gap-3" key={label}>
                      <CheckCircle2
                        className={index < 2 ? 'mt-0.5 size-5 text-emerald-600' : 'mt-0.5 size-5 text-muted-foreground/40'}
                      />
                      <div>
                        <p className="text-sm font-medium">{label}</p>
                        <p className="text-xs text-muted-foreground">{time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="border-y bg-muted/30" id="loi-ich">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-5 py-10 text-center md:grid-cols-4 lg:px-8">
            {[
              ['24/7', 'Hỗ trợ khách hàng'],
              ['98%', 'Giao hàng đúng hẹn'],
              ['63+', 'Tỉnh thành phủ sóng'],
              ['5.000+', 'Chuyến hàng mỗi tháng'],
            ].map(([value, label]) => (
              <div key={label}>
                <p className="text-2xl font-semibold tracking-tight sm:text-3xl">{value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28" id="dich-vu">
          <div className="max-w-2xl">
            <Badge variant="outline">Giải pháp của chúng tôi</Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Mọi thứ bạn cần cho một hành trình liền mạch
            </h2>
            <p className="mt-4 text-muted-foreground">
              Một đối tác duy nhất để đơn giản hóa vận hành và nâng cao trải nghiệm khách hàng.
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {services.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="transition-transform duration-300 hover:-translate-y-1">
                <CardHeader>
                  <span className="mb-3 grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <CardTitle>{title}</CardTitle>
                  <CardDescription className="leading-6">{description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8 lg:pb-28" id="lien-he">
          <div className="overflow-hidden rounded-3xl bg-primary px-6 py-12 text-primary-foreground sm:px-12 lg:flex lg:items-center lg:justify-between lg:px-16 lg:py-16">
            <div className="max-w-2xl">
              <p className="text-sm font-medium text-primary-foreground/70">Sẵn sàng vận chuyển?</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                Cùng MHP đưa hàng hóa của bạn đi xa hơn.
              </h2>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:mt-0 lg:pl-10">
              <Button size="lg" variant="secondary" asChild className="h-11 px-5">
                <a href="mailto:hello@mhplogistic.vn">
                  Nhận tư vấn <ArrowRight data-icon="inline-end" />
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-11 border-white/20 bg-white/5 px-5 text-white hover:bg-white/10 hover:text-white">
                <a href="tel:+84000000000">
                  <Headphones data-icon="inline-start" /> Hotline
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 font-medium">
              <Truck className="size-5" /> MHP Logistic
            </div>
            <p className="text-sm text-muted-foreground">© 2026 MHP Logistic. All rights reserved.</p>
          </div>
          <Separator className="my-6 sm:hidden" />
        </div>
      </footer>
    </div>
  )
}

export default App
