import {
  ArrowRight,
  Box,
  Building2,
  ChevronDown,
  ClipboardCheck,
  Globe2,
  Headphones,
  Mail,
  MapPin,
  Menu,
  Newspaper,
  Package,
  Plane,
  ShoppingBag,
  Truck,
  WalletCards,
  Warehouse,
  X,
} from 'lucide-react'
import { useState } from 'react'

import './App.css'

const marketplaces = [
  ['Taobao', '/assets/taobao.png'],
  ['Xianyu', '/assets/xianyu.png'],
  ['Alibaba', '/assets/alibaba.png'],
  ['Tmall', '/assets/tmall.png'],
  ['1688', '/assets/1688.png'],
  ['Pinduoduo', '/assets/pinduoduo.png'],
]

const stats = [
  ['20K+', 'Các lô hàng được giao trên khắp mạng lưới vận tải khu vực và quốc tế.'],
  ['98%', 'Các đơn hàng được giao đúng hẹn thông qua hoạt động logistics đáng tin cậy.'],
  ['120+', 'Đối tác toàn cầu hỗ trợ vận chuyển hàng hóa và lưu thông hàng hóa.'],
  ['24/7', 'Theo dõi lô hàng và hỗ trợ logistics luôn sẵn sàng mọi lúc.'],
]

const steps = [
  ['Bước 1', 'Đặt hàng', ShoppingBag],
  ['Bước 2', 'Đóng gói hàng hóa', Package],
  ['Bước 3', 'Vận chuyển nội địa', Truck],
  ['Bước 4', 'Kho Trung Quốc', Warehouse],
  ['Bước 5', 'Vận chuyển nội địa', Plane],
  ['Bước 7', 'Kho Việt Nam', Warehouse],
  ['Bước 8', 'Thông quan', ClipboardCheck],
  ['Bước 5', 'Vận chuyển Việt Nam', Truck],
] as const

const rates = [
  ['Hàng giá siêu ngạch', Box],
  ['Hàng giá chi phí', WalletCards],
  ['Hàng giá hàng nặng', WalletCards],
  ['Hàng giá hàng siêu nặng', Box],
] as const

const services = [
  {
    title: 'Vận Tải Đường Bộ',
    image: '/assets/service-road.png',
    text: 'Giải pháp vận tải đường bộ đáng tin cậy, đảm bảo giao hàng an toàn, đúng hẹn và linh hoạt.',
  },
  {
    title: 'Vận Tải Đường Biển',
    image: '/assets/service-warehouse.png',
    text: 'Giải pháp vận tải đường biển đáng tin cậy, đảm bảo vận chuyển hàng hóa toàn cầu an toàn.',
  },
  {
    title: 'Vận Tải Hàng Không',
    image: '/assets/service-sea.png',
    text: 'Dịch vụ vận tải hàng không nhanh chóng cho các lô hàng nhạy cảm về thời gian và giá trị cao.',
  },
]

const reasons = [
  ['01', 'Dịch vụ tận tâm', 'Đội ngũ chuyên gia giàu kinh nghiệm sẵn sàng hỗ trợ bạn 24/7.'],
  ['02', 'Giá cả cạnh tranh', 'Cam kết mang lại giải pháp vận chuyển với chi phí tối ưu nhất thị trường.'],
  ['03', 'An toàn tuyệt đối', 'Hệ thống kho bãi hiện đại, quy trình kiểm soát hàng hóa nghiêm ngặt.'],
  ['04', 'Công nghệ hiện đại', 'Theo dõi đơn hàng thời gian thực qua ứng dụng và website.'],
]

const articles = [
  {
    image: '/assets/news-1.png',
    title: 'Những đơn vị giao hàng hỏa uy tín và bảng giá giao hàng',
    text: 'Các cách hiệu quả để đăng tin tuyển dụng trong năm',
  },
  {
    image: '/assets/news-2.png',
    title: 'Vận chuyển hiệu quả từ 1-3 ngày và bảng giá vận chuyển',
    text: 'Các cách hiệu quả để đăng tin tuyển dụng trong năm',
  },
  {
    image: '/assets/news-hero.png',
    title: 'Cách order hàng từ Trung Quốc qua các kênh vận chuyển',
    text: 'Các cách hiệu quả để đăng tin tuyển dụng trong năm',
  },
]

function Logo({ footer = false }: { footer?: boolean }) {
  return (
    <a className={`brand ${footer ? 'brand--footer' : ''}`} href="/" aria-label="MHP Logistic">
      <img src="/assets/logo.png" alt="MHP Logistic" />
      <span className="brand-divider" />
      <span className="brand-copy">
        <strong>MHP LOGISTIC</strong>
        <small>Nhanh chóng - Đảm bảo chất lượng</small>
      </span>
    </a>
  )
}

const servicePageItems = [
  {
    image: '/assets/service-page-road.png',
    alt: 'Xe tải container vận chuyển hàng hóa đường bộ',
  },
  {
    image: '/assets/service-page-sea.png',
    alt: 'Tàu container vận chuyển hàng hóa đường biển',
  },
  {
    image: '/assets/service-page-air.png',
    alt: 'Máy bay vận chuyển hàng hóa quốc tế',
  },
]

function ServicePage() {
  return (
    <main className="service-page">
      <div className="service-page-inner">
        <div className="service-page-heading">
          <p>Giải pháp toàn diện</p>
          <h1>DỊCH VỤ CỦA <span>CHÚNG TÔI</span></h1>
          <small>Giải pháp Logistic toàn diện cho doanh nghiệp xuất nhập khẩu</small>
        </div>

        <div className="service-page-list">
          {servicePageItems.map((item) => (
            <article className="service-page-item" key={item.image}>
              <img src={item.image} alt={item.alt} />
              <div>
                <h2>Vận chuyển chính ngạch</h2>
                <p>Quy trình vận chuyển từ Trung Quốc về Việt Nam, chuyên nghiệp, minh bạch và an toàn</p>
                <a href="#contact">Xem chi tiết <ArrowRight /></a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}

function SectionIntro({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <div className="section-intro">
      <div>
        <p className="eyebrow"><span />{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      <p>{text}</p>
    </div>
  )
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const isServicePage = window.location.pathname.replace(/\/$/, '') === '/dich-vu'

  return (
    <div className="site" id="top">
      <header>
        <div className="topbar">
          <div className="shell topbar-inner">
            <span className="exchange">¥ TỶ GIÁ: 4,000 VNĐ</span>
            <div className="topbar-info">
              <a href="tel:0866091688"><Headphones /> Số điện thoại: 086.609.1688</a>
              <span><Globe2 /> Ngôn ngữ: <img src="/assets/vietnam.png" alt="" /> VIE <ChevronDown /></span>
            </div>
          </div>
        </div>
        <div className="nav-wrap">
          <div className="shell navbar">
            <Logo />
            <nav className={menuOpen ? 'open' : ''}>
              <a href="/#about" onClick={() => setMenuOpen(false)}><Building2 /> Giới thiệu</a>
              <a href="/dich-vu" aria-current={isServicePage ? 'page' : undefined} onClick={() => setMenuOpen(false)}><Box /> Dịch vụ</a>
              <a href="/#news" onClick={() => setMenuOpen(false)}><Newspaper /> Tin tức</a>
              <a href="/#rates" onClick={() => setMenuOpen(false)}><ClipboardCheck /> Bảng giá</a>
            </nav>
            <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Mở menu">
              {menuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      {isServicePage ? <ServicePage /> : <main>
        <section className="hero">
          <div className="shell hero-content">
            <div className="hero-copy">
              <p className="hero-kicker">MHP LOGISTIC</p>
              <h1>Vận chuyển nhanh chóng,<br />thông minh hơn</h1>
              <p>MHP logistics cung cấp giải pháp vận chuyển quốc tế, khai báo hải quan và kho bãi thông minh. Chúng tôi giúp doanh nghiệp tối ưu hóa chuỗi cung ứng</p>
            </div>
            <form className="quote-form" onSubmit={(event) => event.preventDefault()}>
              <strong>NHẬN TƯ VẤN &amp; BÁO GIÁ NGAY</strong>
              <div>
                <input aria-label="Họ và tên" placeholder="Họ và tên" />
                <input aria-label="Số điện thoại" placeholder="Số điện thoại" inputMode="tel" />
                <input aria-label="Nhu cầu nhập hàng" placeholder="Nhu cầu nhập hàng" />
                <button>Đăng ký tư vấn</button>
              </div>
            </form>
          </div>
        </section>

        <section className="marketplaces">
          <div className="shell">
            <h2>Order hàng các trang thương mại điện tử</h2>
            <div className="market-list">
              {marketplaces.map(([name, image]) => (
                <div className="market-item" key={name}>
                  <img src={image} alt={name} />
                  <span>{name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="about section-pad" id="about">
          <div className="shell">
            <SectionIntro
              eyebrow="Về chúng tôi"
              title={'Vận chuyển và đặt\nhàng Trung'}
              text="MHP cung cấp giải pháp vận chuyển quốc tế, khai báo hải quan và kho bãi thông minh. Chúng tôi giúp doanh nghiệp tối ưu hóa chuỗi cung ứng với chi phí thấp nhất và độ an toàn cao nhất."
            />
            <div className="about-grid">
              <img className="about-photo" src="/assets/about-worker.png" alt="Nhân viên kho MHP" />
              <div className="stats-grid">
                {stats.map(([value, text]) => (
                  <article key={value}>
                    <span className="stat-dot" />
                    <div><strong>{value}</strong><p>{text}</p></div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="process section-pad">
          <div className="shell">
            <h2>Quy trình đặt hàng</h2>
            <div className="process-map">
              {steps.map(([step, title, Icon], index) => (
                <article className={index > 3 ? 'red' : ''} key={`${step}-${title}-${index}`}>
                  <span><Icon /></span>
                  <div><small>{step}</small><strong>{title}</strong></div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="rates section-pad" id="rates">
          <div className="shell">
            <h2>Bảng giá vận chuyển</h2>
            <div className="rates-layout">
              <div className="rate-grid">
                {rates.map(([title, Icon]) => (
                  <article key={title as string}>
                    <Icon />
                    <strong>{title as string}</strong>
                    <a href="#contact">Xem chi tiết <ArrowRight /></a>
                  </article>
                ))}
              </div>
              <img src="/assets/rate-truck.png" alt="Xe tải MHP Logistic" />
            </div>
          </div>
        </section>

        <section className="services section-pad" id="services">
          <div className="shell">
            <SectionIntro
              eyebrow="Dịch vụ"
              title={'Các dịch vụ của\nchúng tôi'}
              text="MHP cung cấp giải pháp vận chuyển quốc tế, khai báo hải quan và kho bãi thông minh. Chúng tôi giúp doanh nghiệp tối ưu hóa chuỗi cung ứng với chi phí thấp nhất và độ an toàn cao nhất."
            />
            <div className="service-grid">
              {services.map((service) => (
                <article key={service.title}>
                  <img src={service.image} alt="" />
                  <div><h3>{service.title}</h3><p>{service.text}</p></div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="why section-pad">
          <div className="shell why-grid">
            <div>
              <p className="eyebrow"><span />Tại sao chọn chúng tôi</p>
              <h2>Tại sao chọn MHP là<br />đối tác</h2>
              <div className="reason-list">
                {reasons.map(([number, title, text]) => (
                  <article key={number}>
                    <span>{number}</span>
                    <div><strong>{title}</strong><p>{text}</p></div>
                  </article>
                ))}
              </div>
            </div>
            <div className="why-visual">
              <div><h3>MHP LOGISTIC</h3><p>Vận chuyển hàng Trung nhanh chóng</p></div>
              <img src="/assets/why-truck.png" alt="Xe tải MHP" />
              <div className="mini-stats"><span><b>200</b>Đơn vận chuyển</span><span><b>4</b>Đối tác vận chuyển</span></div>
            </div>
          </div>
        </section>

        <section className="cta" id="contact">
          <div className="shell">
            <p>MHP Logistic</p>
            <h2>Order nhanh chóng dễ dàng<br />Ship nhanh</h2>
            <span>Liên hệ ngay để nhận hỗ trợ mang về nhiều ưu đãi đặc biệt.</span>
            <a href="tel:0866091688">Liên hệ chúng tôi</a>
          </div>
        </section>

        <section className="news section-pad" id="news">
          <div className="shell">
            <SectionIntro
              eyebrow="Tin tức"
              title="Cẩm nang khách hàng"
              text="Những kiến thức, kinh nghiệm và hướng dẫn chi tiết giúp bạn tối ưu hóa quá trình nhập hàng và vận chuyển."
            />
            <div className="article-grid">
              {articles.map((article) => (
                <article key={article.title}>
                  <img src={article.image} alt="" />
                  <p><b>Ngày đăng</b><span />24 / 08 / 2025</p>
                  <h3>{article.title}</h3>
                  <span>{article.text}</span>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>}

      <footer>
        <div className="shell footer-main">
          <div><Logo footer /><p>Kết nối thế giới thông qua giải pháp vận tải thông minh, nhanh chóng và tin cậy</p></div>
          <div><h3>THÔNG TIN &amp; CHÍNH SÁCH</h3><a href="#">Chính sách bảo mật</a><a href="#">Điều khoản sử dụng</a><a href="/#rates">Biểu phí dịch vụ</a><a href="#">Hướng dẫn đặt hàng</a></div>
          <div><h3>LIÊN HỆ HỖ TRỢ</h3><p><MapPin />Tầng 3, tòa PCC1, số 44 Triều Khúc, Phường Thanh Liệt, Hanoi, Vietnam, 100000</p><a href="tel:0898586622"><Headphones />0898 586 622</a><a href="mailto:support@erktransport.com"><Mail />support@erktransport.com</a></div>
        </div>
        <div className="shell footer-bottom"><span>© 2026 MHP Logistics. All rights reserved.</span><div><a href="#">Chính sách bảo mật</a><a href="#">Điều khoản sử dụng</a></div></div>
      </footer>
    </div>
  )
}

export default App
