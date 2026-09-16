import {
  ArrowRight,
  Menu,
  X,
} from 'lucide-react'
import { type ReactNode, useEffect, useState } from 'react'

import './App.css'
import { QuoteForm } from './components/QuoteForm'

type Locale = 'vi' | 'zh'

const localeStorageKey = 'mhp-logistic-locale'
const skipHomePopupKey = 'mhp-logistic-skip-home-popup'

function shouldOpenHomePopup(pathname: string) {
  if (pathname !== '/') return false
  if (sessionStorage.getItem(skipHomePopupKey) === 'true') {
    sessionStorage.removeItem(skipHomePopupKey)
    return false
  }
  return true
}

function getInitialLocale(): Locale {
  const savedLocale = localStorage.getItem(localeStorageKey)
  if (savedLocale === 'vi' || savedLocale === 'zh') return savedLocale

  const systemLocales = navigator.languages?.length ? navigator.languages : [navigator.language]
  return systemLocales.some((language) => language.toLowerCase().startsWith('zh')) ? 'zh' : 'vi'
}

// This keeps the Vietnamese source in the JSX while making every shared page
// switchable without maintaining separate copies of each layout.
const chineseText: Record<string, string> = {
  'Nhanh chóng - Đảm bảo chất lượng': '快捷高效 · 品质保障',
  'Giải pháp toàn diện': '一站式解决方案',
  'DỊCH VỤ CỦA': '我们的', 'CHÚNG TÔI': '服务',
  'Giải pháp Logistic toàn diện cho doanh nghiệp xuất nhập khẩu': '为进出口企业提供一站式物流解决方案',
  'Vận chuyển chính ngạch': '正规贸易运输',
  'Quy trình vận chuyển từ Trung Quốc về Việt Nam, chuyên nghiệp, minh bạch và an toàn': '从中国到越南的专业、透明、安全运输流程',
  'Xem chi tiết': '查看详情',
  'CÁC GÓI': '服务', 'DỊCH VỤ': '套餐', 'XEM BẢNG GIÁ VÀ CÁC GÓI DỊCH VỤ CỦA CHÚNG TÔI': '查看我们的报价和服务套餐',
  'Bảng giá vận chuyển hàng Trung Quốc về Hà Nội và TP.HCM': '中国至河内和胡志明市的运输价格表',
  'Phí ủy thác được tính dựa trên tổng giá trị đơn hàng.': '委托费用根据订单总价值计算。',
  'Giá trị ủy thác': '委托金额', 'Phí': '费用', 'Trọng lượng': '重量', 'Hà Nội': '河内', 'TP.HCM': '胡志明市',
  'Bảng giá vận chuyển đối với hàng nặng': '重货运输价格表', 'Bảng giá vận chuyển đối với hàng siêu nặng': '超重货物运输价格表',
  'Điểm nhận': '收货点', 'kho TQ': '中国仓库', 'kho VN': '越南仓库', 'Hàng phổ thông': '普通货物', 'Hàng nặng': '重货',
  'Mỹ phẩm, quần áo': '化妆品、服装', 'Bao tạp': '杂货包裹', 'LIÊN HỆ': '联系我们',
  'CHÍNH SÁCH & QUY ĐỊNH': '政策与规定', 'Điều khoản & dịch vụ hàng hóa cấm': '禁运货物条款与服务',
  'Chính sách vận chuyển & Đóng gói': '运输与包装政策', 'Hậu quả khi vận chuyển hàng cấm:': '运输违禁品的后果：',
  'Lô hàng sẽ bị tạm giữ hoặc tịch thu tại cửa khẩu.': '货物将在口岸被扣留或没收。',
  'TIN TỨC MỚI NHẤT': '最新资讯', 'Ngày đăng': '发布日期',
  'Vận chuyển hiệu quả từ 1-3 ngày và bảng giá': '1–3 天高效运输及价格表', 'vận chuyển': '运输',
  'Dự thảo Thông tư mới có gì đáng chú ý?': '新通知草案有哪些值得关注之处？',
  'Chính sách': '政策', 'Dịch vụ': '服务', 'Tin tức': '新闻', 'Bảng giá': '报价表',
  'TỶ GIÁ: 3,980 VNĐ': '汇率：3,980 越南盾', 'Số điện thoại: 0969857874': '电话：0969857874', 'Ngôn ngữ:': '语言：',
  'MHP LOGISTIC': 'MHP 物流', 'Vận chuyển nhanh chóng,': '快速运输，', 'thông minh hơn': '更智能',
  'MHP logistics cung cấp giải pháp vận chuyển quốc tế, khai báo hải quan và kho bãi thông minh. Chúng tôi giúp doanh nghiệp tối ưu hóa chuỗi cung ứng': 'MHP Logistics 提供国际运输、报关及智能仓储解决方案，帮助企业优化供应链。',
  'NHẬN TƯ VẤN & BÁO GIÁ NGAY': '立即获取咨询与报价', 'Họ và tên': '姓名', 'Số điện thoại': '电话号码', 'Nhu cầu nhập hàng': '采购需求', 'Đăng ký tư vấn': '预约咨询',
  'Đang gửi...': '发送中...', 'Đăng ký thành công. MHP sẽ liên hệ với bạn sớm.': '登记成功。MHP 将尽快与您联系。', 'Không thể gửi đăng ký. Vui lòng thử lại.': '无法提交登记。请重试。',
  'Vui lòng nhập họ và tên.': '请输入姓名。', 'Vui lòng nhập số điện thoại.': '请输入电话号码。', 'Vui lòng nhập nhu cầu nhập hàng.': '请输入采购需求。',
  'Order hàng các trang thương mại điện tử': '电商平台采购', 'Về chúng tôi': '关于我们', 'Vận chuyển và đặt': '运输与采购', 'hàng Trung': '中国货物',
  'Vận chuyển và đặt\nhàng Trung': '中国货物运输与采购', 'Các dịch vụ của\nchúng tôi': '我们的服务',
  'MHP cung cấp giải pháp vận chuyển quốc tế, khai báo hải quan và kho bãi thông minh. Chúng tôi giúp doanh nghiệp tối ưu hóa chuỗi cung ứng với chi phí thấp nhất và độ an toàn cao nhất.': 'MHP 提供国际运输、报关及智能仓储方案，帮助企业以更低成本和更高安全性优化供应链。',
  'Quy trình đặt hàng': '采购流程', 'Bước 1': '第 1 步', 'Bước 2': '第 2 步', 'Bước 3': '第 3 步', 'Bước 4': '第 4 步', 'Bước 5': '第 5 步', 'Bước 6': '第 6 步', 'Bước 7': '第 7 步', 'Bước 8': '第 8 步',
  'Đặt hàng': '下单', 'Đóng gói hàng hóa': '货物包装', 'Vận chuyển nội địa': '国内运输', 'Kho Trung Quốc': '中国仓库', 'Vận chuyển quốc tế': '国际运输', 'Kho Việt Nam': '越南仓库', 'Thông quan': '清关', 'Vận chuyển Việt Nam': '越南境内运输',
  'Bảng giá vận chuyển': '运输报价表', 'Bảng giá tiểu ngạch': '小额贸易报价表', 'Bảng giá chi phí': '费用报价表', 'Bảng giá hàng nặng': '重货报价表', 'Bảng giá hàng siêu nặng': '超重货物报价表',
  'Các dịch vụ của': '我们的', 'chúng tôi': '服务', 'Vận Tải Đường Bộ': '公路运输', 'Vận Tải Đường Biển': '海运', 'Vận Tải Hàng Không': '空运',
  'Giải pháp vận tải đường bộ đáng tin cậy, đảm bảo giao hàng an toàn, đúng hẹn và tiết kiệm chi phí.': '可靠的公路运输方案，确保安全、准时且经济地交付。',
  'Giải pháp vận tải đường biển đáng tin cậy, đảm bảo vận chuyển hàng hóa toàn cầu an toàn và hiệu quả.': '可靠的海运方案，保障全球货物安全、高效运输。',
  'Dịch vụ vận tải hàng không nhanh chóng cho các lô hàng nhạy cảm về thời gian và yêu cầu giao hàng khẩn cấp.': '为时效敏感和紧急交付货物提供快速空运服务。',
  'Tại sao chọn chúng tôi': '为什么选择我们', 'Tại sao chọn MHP là đối tác': '为什么选择 MHP 作为合作伙伴',
  'Dịch vụ tận tâm': '贴心服务', 'Giá cả cạnh tranh': '具有竞争力的价格', 'An toàn tuyệt đối': '安全保障', 'Công nghệ hiện đại': '现代技术',
  'Đội ngũ chuyên gia giàu kinh nghiệm sẵn sàng hỗ trợ bạn 24/7.': '经验丰富的专家团队全天候为您提供支持。',
  'Cam kết mang lại giải pháp vận chuyển với chi phí tối ưu nhất thị trường.': '致力于提供市场上极具成本优势的运输方案。',
  'Hệ thống kho bãi hiện đại, quy trình kiểm soát hàng hóa nghiêm ngặt.': '现代化仓储系统与严格的货物管控流程。',
  'Theo dõi đơn hàng thời gian thực qua ứng dụng và website.': '通过应用和网站实时跟踪订单。',
  'Vận chuyển hàng Trung nhanh chóng': '快速运输中国货物', 'Đơn vận chuyển': '运输订单', 'Đối tác vận chuyển': '运输合作伙伴',
  'Order nhanh chóng dễ dàng': '轻松快捷采购', 'Ship nhanh': '快速配送', 'Order hàng và vận chuyển nhanhc hóng với chi phí rẻ nhất, ship xuyên quốc gia': '以优惠成本快速采购和跨境运输。', 'Liên hệ chúng tôi': '联系我们',
  'Cẩm nang khách hàng': '客户指南', 'Những kiến thức, kinh nghiệm và hướng dẫn chi tiết giúp bạn tối ưu hóa quá trình nhập hàng và vận chuyển.': '实用知识、经验与详细指南，帮助您优化采购和运输流程。',
  'Những đơn vị giao hàng hóa uy tín và bảng giá giao hàng': '可靠货运单位与配送价格表', 'Các cách hiệu quả để đăng tin tuyển dụng trong năm 2026': '2026 年高效发布招聘信息的方法',
  'Vận chuyển hiệu quả từ 1-3 ngày và bảng giá vận chuyển': '1–3 天高效运输及运输价格表', 'Cách order hàng từ trung quốc qua các kênh vận chuyển': '如何通过运输渠道从中国采购商品',
  'Dịch vụ vận chuyển & nhập khẩu': '运输与进口服务',
  'hàng hóa Trung Quốc': '中国商品',
  'Giải pháp vận chuyển và nhập khẩu hàng hóa từ Trung Quốc về Việt Nam, đồng hành cùng cá nhân, hộ kinh doanh và doanh nghiệp từ khâu đặt hàng đến khi nhận hàng.': '提供从中国到越南的货物运输与进口解决方案，从下单到收货，全程陪伴个人、个体经营户和企业客户。',
  'Nhập khẩu chính ngạch': '正规贸易进口',
  'Ủy thác nhập khẩu': '委托进口',
  '24/7 Hỗ trợ khách hàng': '全天候客户支持',
  'Lựa chọn phương án phù hợp': '选择合适的方案',
  'Mỗi khách hàng có nhu cầu nhập hàng khác nhau. Có doanh nghiệp cần nhập khẩu chính ngạch với đầy đủ hồ sơ, có khách hàng cần một đơn vị hỗ trợ toàn bộ quá trình nhập khẩu, cũng có khách hàng chỉ cần một giải pháp vận chuyển hàng hóa từ Trung Quốc về Việt Nam.': '每位客户的进口需求各不相同。有的企业需要手续齐全的正规贸易进口，有的客户需要服务商协助整个进口流程，也有客户只需要从中国到越南的货物运输方案。',
  'Vận chuyển chính nghạch': '正规贸易运输',
  'Ba giải pháp chính của MHP': 'MHP 的三大核心解决方案',
  'Giải pháp nhập khẩu hàng hóa từ Trung Quốc về Việt Nam theo hình thức chính ngạch, hỗ trợ khách hàng trong quá trình chuẩn bị hồ sơ, thực hiện thủ tục và vận chuyển hàng hóa.': '以正规贸易方式提供从中国到越南的货物进口方案，协助客户准备文件、办理手续并运输货物。',
  'Hỗ trợ quy trình nhập khẩu': '协助进口流程',
  'Tư vấn hồ sơ, chứng từ': '文件与单证咨询',
  'Hỗ trợ thủ tục hải quan': '协助办理海关手续',
  'Vận chuyển hàng hóa về Việt Nam': '将货物运输至越南',
  'Phù hợp với nhu cầu nhập khẩu ổn định': '适合有稳定进口需求的客户',
  'Tự xác định phương án phù hợp': '自行确定合适的方案',
  'Chọn nhu cầu gần nhất với lô hàng của bạn, Hoa Việt sẽ tư vấn phạm vi dịch vụ và báo giá phù hợp.': '请选择最符合您货物情况的需求，Hoa Việt 将为您提供合适的服务范围和报价建议。',
  'Doanh nghiệp cần nhập khẩu hàng hóa': '企业需要进口货物',
  'Cần đơn vị hỗ trợ quá trình nhập khẩu': '需要服务商协助进口流程',
  'Đã mua hàng và cần vận chuyển về Việt Nam': '已采购商品并需要运往越南',
  'Ủy thác vận chuyển': '委托运输',
  'Chưa chắc nên chọn dịch vụ nào': '尚未确定应选择哪项服务',
  'Nhận tư vấn': '获取咨询',
  'Một số hình ảnh về dịch vụ': '部分服务实景图片',
  'MHP đồng hành trong từng giai đoạn': 'MHP 全程陪伴每个阶段',
  'Hiểu đúng nhu cầu': '准确了解需求',
  'Tìm hiểu nhu cầu và đặc điểm lô hàng để đưa ra phương án phù hợp.': '了解需求和货物特点，以制定合适的方案。',
  'Quy trình rõ ràng': '流程清晰',
  'Các bước thực hiện được trao đổi cụ thể trước khi triển khai.': '实施前会明确沟通各个执行步骤。',
  'Cập nhật hành trình': '更新运输进度',
  'Hỗ trợ cập nhật tình trạng lô hàng trong quá trình vận chuyển.': '运输过程中协助更新货物状态。',
  'Hỗ trợ hồ sơ': '文件协助',
  'Tư vấn các công việc liên quan đến hồ sơ trong phạm vi dịch vụ.': '在服务范围内提供文件相关事项咨询。',
  'Đồng hành liên tục': '持续陪伴',
  'Đồng hành từ khi tiếp nhận yêu cầu đến khi hoàn tất giao hàng.': '从接收需求到完成交货，全程提供支持。',
  'Nhiều lựa chọn': '多种选择',
  'Dịch vụ phù hợp với từng nhóm khách hàng và quy mô lô hàng.': '服务适配不同客户群体和货物规模。',
  'Kết nối Trung Quốc đến Hà Nội và TP.HCM': '连接中国、河内与胡志明市',
  'MHP Logistics kết nối các khâu tiếp nhận, tập kết, vận chuyển và giao nhận nhằm giúp khách hàng thuận tiện hơn trong quá trình nhập hàng.': 'MHP Logistics 串联收货、集货、运输和交付环节，让客户的进口过程更加便捷。',
  'Doanh nghiệp': '企业',
  'Nhập khẩu nguyên vật liệu, hàng hóa, sản phẩm phục vụ hoạt động kinh doanh.': '进口用于经营活动的原材料、货物和产品。',
  'Hộ kinh doanh': '个体经营户',
  'Nhập hàng Trung Quốc phục vụ bán buôn, bán lẻ và kinh doanh online.': '从中国进口商品，用于批发、零售和线上经营。',
  'Shop online': '网店',
  'Hỗ trợ vận chuyển hàng hóa từ nguồn hàng Trung Quốc về Việt Nam.': '协助将中国货源运输至越南。',
  'Cá nhân': '个人',
  'Giải pháp vận chuyển phù hợp với nhu cầu nhập hàng cá nhân.': '适合个人进口需求的运输方案。',
  'Hành trình vận chuyển': '运输路线',
  'TRUNG QUỐC': '中国',
  'Kho / Tập kết': '仓库 / 集货',
  'Vận chuyển': '运输',
  'Cửa khẩu': '口岸',
  'VIỆT NAM': '越南',
  'Hà Nội / TP.HCM': '河内 / 胡志明市',
  'Giao hàng': '交货',
  'Kết nối thế giới thông qua giải pháp vận tải thông minh, nhanh chóng và tin cậy': '通过智能、快速、可靠的运输方案连接世界',
  'Tầng 3, tòa PCC1, số 44 Triều Khúc, Phường Thanh Liệt, Hanoi, Vietnam, 100000': '越南河内市 Thanh Liệt 坊 Triều Khúc 路 44 号 PCC1 大厦 3 楼，100000',
  'THÔNG TIN & CHÍNH SÁCH': '信息与政策', 'Bảng giá dịch vụ': '服务报价表', 'Chính sách bảo mật': '隐私政策', 'Điều khoản sử dụng': '使用条款', 'Biểu phí dịch vụ': '服务收费表', 'Hướng dẫn đặt hàng': '订购指南', 'LIÊN HỆ HỖ TRỢ': '联系支持',
  'Các lô hàng được giao trên khắp mạng lưới vận tải khu vực và quốc tế.': '货物已送达遍及区域和国际运输网络的各地。',
  'Các đơn hàng được giao đúng hẹn thông qua hoạt động logistics đáng tin cậy.': '通过可靠的物流服务，订单均准时送达。',
  'Đối tác toàn cầu hỗ trợ vận chuyển hàng hóa và lưu thông hàng hoá.': '全球合作伙伴支持货物运输与流通。',
  'Theo dõi lô hàng và hỗ trợ logistics luôn sẵn sàng mọi lúc.': '货物追踪与物流支持随时为您服务。',
  'Dưới 100 triệu đồng': '低于 1 亿越南盾', 'Từ 100 triệu đến 200 triệu đồng': '1 亿至 2 亿越南盾', 'Trên 200 triệu đồng': '超过 2 亿越南盾',
  'Trên 3.000kg': '超过 3,000 公斤', 'Liên hệ': '联系我们', 'BẰNG TƯỜNG': '凭祥', 'HÀ NỘI': '河内',
  'Trên 30m3': '30 立方米以上', '15 - 30 m3': '15–30 立方米', '5-15 m3': '5–15 立方米',
  '1 - 5 m3': '1–5 立方米', 'Dưới 1m3': '1 立方米以下',
  '1.5m3 = 300 →499kg ( từ 1,000kg trở lên)': '1.5 立方米 = 300–499 公斤（1,000 公斤及以上）', '1.5m3 = 700kg ( từ 1,000kg trở lên)': '1.5 立方米 = 700 公斤（1,000 公斤及以上）', '1.5m3 = 1,000kg ( từ 1,000kg trở lên)': '1.5 立方米 = 1,000 公斤（1,000 公斤及以上）', '1.5m3 > 2,000kg': '1.5 立方米 > 2,000 公斤',
  '(Sắt thép, ốc vít, bàn lề...)': '（钢铁、螺丝、铰链等）',
  'Căn cứ pháp lý': '法律依据', 'Nghị định số 69/2018/NĐ-CP ngày 15/05/2018 của Chính phủ Việt Nam về xuất nhập khẩu hàng hóa': '越南政府关于货物进出口的第 69/2018/NĐ-CP 号法令（2018 年 5 月 15 日）。',
  'Nhóm 1: Vũ khí, Đạn dược & Vật liệu Nguy hiểm': '第 1 类：武器、弹药及危险物品', 'Vũ khí, đạn dược, vật liệu nổ, trang thiết bị kỹ thuật quân sự dưới mọi hình thức': '任何形式的武器、弹药、爆炸物及军事技术装备。',
  'Nhóm 2: Hàng Tiêu dùng & Thiết bị Đã Qua Sử dụng': '第 2 类：消费品及二手设备', 'Hàng điện tử, điện lạnh, thiết bị y tế đã qua sử dụng': '二手电子产品、制冷设备及医疗设备。',
  'Nhóm 3: Nội dung Độc hại & Vi phạm Pháp luật': '第 3 类：有害内容及违法物品', 'Văn hóa phẩm đồi trụy, tài liệu phản động': '色情文化产品及反动资料。',
  'Nhóm 4: Môi trường & Sinh vật Hoang dã': '第 4 类：环境及野生动物', 'Phế liệu, phế thải công nghiệp nguy hại': '废料及危险工业废弃物。',
  'Pin. Ắc quy & thiết bị điện tử': '电池、蓄电池及电子设备', 'Dán nhãn hàng nguy hiểm đúng mã UN': '按联合国编号正确粘贴危险品标签', 'Cung cấp bảng MSDS': '提供 MSDS 安全数据表', 'Đóng gói theo tiêu chuẩn IATA': '按 IATA 标准包装',
  'Hàng có Thương hiệu': '品牌商品', 'Kiểm tra tình trạng bảo hộ thương hiệu': '核查品牌保护状态', 'Cung cấp hợp đồng phân phối chính hãng': '提供官方授权经销合同',
  'Hàng dễ vỡ': '易碎品', 'Lót xốp PE foam tối thiểu 5cm mỗi mặt': '每面使用至少 5 厘米 PE 泡沫保护层',
  'Bộ Khoa học và Công nghệ đang xây dựng dự thảo Thông tư ban hành Danh mục sản phẩm, hàng hóa có mức độ rủi ro trung bình và mức độ rủi ro cao thuộc trách nhiệm quản lý của Bộ. Danh mục này dự kiến áp dụng từ năm 2026, nhằm siết chặt kiểm tra chất lượng.': '科学与技术部正在制定通知草案，发布由该部管理的中、高风险产品和商品目录。该目录预计自 2026 年起实施，以加强质量检验。',
  'Theo dự thảo, Thông tư sẽ kèm áp dụng đối với tổ chức, cá nhân sản xuất, kinh doanh sản phẩm, hàng hóa thuộc danh mục rủi ro trung bình và rủi ro cao trên lãnh thổ Việt Nam. Đây là quy định mới, có ý nghĩa quan trọng đối với các doanh nghiệp nhập hàng phải đến có thể phải thực hiện thêm thủ tục về chất lượng trước khi lưu thông trên thị trường.': '根据草案，该通知适用于在越南境内生产、经营中高风险目录产品和商品的组织与个人。这项新规定对进口企业意义重大，货物投放市场前可能需要额外完成质量手续。',
  'Hàng hóa rủi ro cao: kiểm soát chặt hơn khi nhập khẩu': '高风险货物：进口时监管更严格', 'Với nhóm sản phẩm, hàng hóa có mức độ rủi ro cao, doanh nghiệp nhập khẩu quy chuẩn kỹ thuật quốc gia tương ứng.': '对于高风险产品和商品，进口企业须遵守相应的国家技术法规。',
  'Đáng chú ý, nhiều hàng hóa nhập khẩu thuộc nhóm này còn phải thực hiện': '值得注意的是，该类别的许多进口货物还必须进行', 'kiểm tra nhà nước về chất lượng': '国家质量检验', 'trước khi được cấp phép lưu hành.': '后才能获准流通。',
  'Một số nhóm hàng rủi ro cao trong dự thảo gồm:': '草案中的部分高风险商品包括：',
  'Xăng, nhiên liệu diezen và nhiên liệu sinh học': '汽油、柴油及生物燃料', 'Khí dầu mỏ hóa lỏng LPG': '液化石油气 LPG', 'Mũ bảo hiểm cho người đi mô tô, xe máy': '摩托车和电动车骑行头盔', 'Một số thiết bị điện và điện tử về an toàn điện': '部分涉及电气安全的电器和电子设备', 'Thiết bị phát, thu-phát sóng vô tuyến điện': '无线电发射及收发设备', 'Thiết bị Wi-Fi, thiết bị 5G, thiết bị không dây': 'Wi-Fi、5G 及无线设备', 'Flycam, drone, thiết bị điều khiển từ xa': '航拍无人机、无人机及遥控设备', 'RFID, thiết bị phụ trợ hệ thống RFID': 'RFID 及 RFID 系统辅助设备', 'Micro, loa, tai nghe không dây': '麦克风、扬声器及无线耳机', 'Vật liệu phòng xạ, thiết bị hạt nhân, thiết bị bức xạ': '辐射防护材料、核设备及辐射设备',
  'Đối với doanh nghiệp nhập khẩu, nhóm hàng này cần được rà soát kỹ ngay từ khâu đặt hàng. Nếu chỉ kiểm tra giá, mẫu mã và thời gian giao hàng mà bỏ qua quy chuẩn kỹ thuật, doanh nghiệp có thể gặp rủi ro khi hàng về đến cảng hoặc khi đưa hàng ra thị trường.': '进口企业应从下单阶段起仔细审查此类商品。若只关注价格、款式和交期而忽略技术法规，货物到港或投放市场时可能面临风险。',
  'Hàng hóa rủi ro trung bình: vẫn cần công bố hợp quy trước khi lưu thông': '中等风险货物：流通前仍须进行合规声明', 'Bên cạnh nhóm rủi ro cao, dự thảo cũng quy định': '除高风险类别外，草案还规定了', 'danh mục sản phẩm, hàng hóa có mức độ rủi ro trung bình.': '中等风险产品和商品目录。',
  'Với nhóm này, doanh nghiệp phải công bố tiêu chuẩn áp dụng; đồng thời phải tự đánh giá hoặc được tổ chức chứng nhận được công nhận thực hiện chứng nhận phù hợp quy chuẩn kỹ thuật quốc gia tương ứng.': '对于该类别，企业必须声明适用标准，并进行自我评估或由认可的认证机构证明符合相应国家技术法规。', 'Một số nhóm hàng rủi ro trung bình đáng chú ý gồm:': '值得关注的部分中等风险商品包括：',
  'Đồ chơi trẻ em': '儿童玩具', 'Thép làm cốt bê tông': '混凝土钢筋', 'Thép không gỉ': '不锈钢', 'Dầu nhờn động cơ đốt trong': '内燃机润滑油', 'Sản phẩm chiếu sáng bằng công nghệ LED': 'LED 照明产品', 'Bình nước nóng, lò vi sóng, bàn là, máy hút bụi': '热水器、微波炉、电熨斗和吸尘器', 'Tủ lạnh, máy giặt, điều hòa': '冰箱、洗衣机和空调', 'Ổ cắm, phích cắm, công tắc điện': '插座、插头和电器开关', 'Máy tính xách tay, laptop, máy tính bảng': '笔记本电脑和平板电脑', 'Thiết bị truyền hình, set top box': '电视设备和机顶盒', 'Một số thiết bị phát, thu-phát sóng vô tuyến': '部分无线电发射及收发设备',
  'Điểm đáng chú ý là từ nhiều hàng hóa nhập khẩu thuộc nhóm rủi ro trung bình phải': '值得注意的是，许多中等风险进口商品必须', 'công bố hợp quy trước khi lưu thông trên thị trường.': '在市场流通前进行合规声明。', 'Vì vậy, nếu chủ động kiểm tra danh mục, doanh nghiệp có thể chủ động đưa vào kinh doanh và giảm rủi ro chậm đưa vào vận chuyển.': '因此，主动核查目录可让企业更好地安排经营，并降低运输延误风险。',
  'Vì sao doanh nghiệp nhập khẩu cần chú ý đến mã HS?': '为什么进口企业需要关注 HS 编码？', 'Một điểm quan trọng trong dự thảo là danh mục hàng hóa được gắn với': '草案中的一个重要内容是，货物目录与', 'mã HS theo Danh mục hàng hóa xuất khẩu, nhập khẩu Việt Nam.': '《越南进出口货物目录》中的 HS 编码相对应。',
  'Điều này có nghĩa là doanh nghiệp không thể chỉ dựa vào tên thương mại của sản phẩm. Cùng một mặt hàng, nếu mô tả kỹ thuật, công suất hoặc công nghệ khác nhau, việc áp mã HS có thể khác nhau.': '这意味着企业不能只依据产品商品名称。同一商品若技术描述、功率或技术不同，适用的 HS 编码也可能不同。', 'Ví dụ, với nhóm thiết bị điện tử, thiết bị không dây, thiết bị Wi-Fi, laptop, tablet hoặc flycam, doanh nghiệp cần kiểm tra kỹ:': '例如，对于电子设备、无线设备、Wi-Fi 设备、笔记本电脑、平板电脑或无人机，企业应仔细核查：',
  'Sản phẩm có chức năng phát/thu sóng vô tuyến không?': '产品是否具有无线电发射/接收功能？', 'Có tích hợp Wi-Fi, Bluetooth, 5G hay các công nghệ truyền dữ liệu không?': '是否集成 Wi-Fi、蓝牙、5G 或其他数据传输技术？', 'Có thuộc nhóm phải công bố hợp quy hoặc chứng nhận hợp quy không?': '是否属于需要合规声明或合规认证的类别？', 'Hàng nhập khẩu có kèm theo tài liệu kỹ thuật không?': '进口货物是否附有技术资料？',
  'Việc xác định sai mã HS hoặc bỏ sót yêu cầu quản lý chất lượng có thể khiến doanh nghiệp phát sinh chi phí lưu kho, lưu bãi, chậm thông quan hoặc chậm kế hoạch phân phối hàng hóa.': 'HS 编码错误或遗漏质量管理要求，可能导致仓储、堆场成本增加、清关延误或货物分销计划延迟。',
  'Thời điểm dự kiến áp dụng và điều khoản chuyển tiếp': '预计实施时间及过渡条款', 'Theo nội dung dự thảo, Thông tư dự kiến có hiệu lực từ': '根据草案内容，该通知预计自', 'ngày 01/07/2026.': '2026 年 7 月 1 日起生效。', 'Các quy định chuyển tiếp cũng thông báo tiếp nhận hàng trong bộ quy định được áp dụng để chưa thông tư có hiệu lực và áp dụng phù hợp với các quy định khác.': '过渡性规定还对通知生效前已接收货物的适用方式作出说明，并与其他规定保持一致。',
  'Đây là khoảng thời gian quan trọng để doanh nghiệp chủ động rà soát lại danh mục nhập khẩu, đối chiếu các quy chuẩn kỹ thuật và chuẩn bị hồ sơ công bố hợp quy nếu cần.': '这是企业主动复核进口目录、比对技术法规并在必要时准备合规声明文件的重要时期。',
  'Doanh nghiệp nên chuẩn bị từ bây giờ?': '企业现在应如何准备？', 'Để hạn chế rủi ro trong quá trình nhập khẩu và lưu thông hàng hóa, doanh nghiệp nên chủ động thực hiện các bước sau:': '为降低进口和货物流通过程中的风险，企业应主动采取以下步骤：', 'Thứ nhất, rà soát danh mục sản phẩm đang nhập khẩu.': '第一，审查正在进口的产品目录。', 'Doanh nghiệp cần kiểm tra từng nhóm hàng xem có thuộc danh mục rủi ro trung bình hoặc rủi ro cao hay không.': '企业需要核查每个商品类别是否属于中等或高风险目录。', 'Thứ hai, đối chiếu mã HS.': '第二，核对 HS 编码。', 'Việc xác định mã HS chính xác là cơ sở để kiểm tra yêu cầu về tiêu chuẩn và quy chuẩn kỹ thuật trước khi hàng về cảng.': '准确确定 HS 编码，是货物到港前核查标准和技术法规要求的基础。',
  'Kết luận': '结论', 'Dự thảo Thông tư mới của Bộ Khoa học và Công nghệ cho thấy xu hướng quản lý chất lượng hàng hóa ngày càng chặt chẽ hơn, đặc biệt với các sản phẩm có yếu tố an toàn, kỹ thuật, điện tử, viễn thông và thiết bị tiêu dùng.': '科学与技术部的新通知草案表明，对货物质量的管理日趋严格，尤其是涉及安全、技术、电子、通信和消费设备的产品。', 'Đối với doanh nghiệp nhập khẩu, đây không chỉ là thay đổi về mặt thủ tục, mà còn là yêu cầu phải quản trị rủi ro tốt hơn ngay từ khâu đặt hàng, xác định mã HS và kiểm tra tiêu chuẩn áp dụng để có thể chủ động trong việc nhập khẩu cũng như phân phối sản phẩm.': '对进口企业而言，这不仅是程序上的变化，也要求从下单、确定 HS 编码到核查适用标准开始，更好地进行风险管理，从而主动开展进口和产品分销。', 'Việc cập nhật sớm quy định sẽ giúp doanh nghiệp giảm rủi ro chậm thông quan, tiết kiệm chi phí phát sinh và đảm bảo hàng hóa đủ điều kiện lưu thông trên thị trường.': '及早更新相关规定将帮助企业降低清关延误风险、节省额外成本，并确保货物符合市场流通条件。',
  'Thông báo điều chỉnh bảng giá 11/09/2025': '2025 年 9 月 11 日价格表调整通知',
  'BẢNG GIÁ VẬN CHUYỂN CHÍNH NGẠCH': '正规贸易运输价格表',
  'PHÍ VẬN CHUYỂN VỚI HÀNG NẶNG (CHƯA BAO GỒM VAT)': '重货运输费用（未含增值税）',
  'TRỌNG LƯỢNG': '重量',
  'BẢNG TƯỜNG HÀ NỘI (đ/Kg)': '河内墙板（越南盾/公斤）',
  'BẢNG TƯỜNG HCM (đ/Kg)': '胡志明市墙板（越南盾/公斤）',
  'ĐỐI VỚI HÀNG NGUYÊN CONT, NGUYÊN XE LIÊN HỆ HOTLINE': '整柜、整车货物请联系热线',
  '>5000kg': '>5000 公斤',
  '3000kg - 5000kg': '3000–5000 公斤',
  '2000kg - 3000kg': '2000–3000 公斤',
  '1000kg - 2000kg': '1000–2000 公斤',
  'Dưới 1000kg': '1000 公斤以下',
  'Lưu ý: đơn hàng dưới 50kg làm tròn lên 50kg. Tối thiểu 50kg cho 1 mục hàng khai thuế': '注意：不足 50 公斤的订单按 50 公斤计费；每项报税货物最低为 50 公斤。',
  'Đóng thông báo bảng giá': '关闭价格表通知',
}

const translatedNodes = new WeakMap<Text, string>()

function translateDocument(locale: Locale) {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  for (let node = walker.nextNode() as Text | null; node; node = walker.nextNode() as Text | null) {
    // React-localized messages own their text across both locale and state changes.
    if (!node.parentElement || node.parentElement.closest('script, style, [data-i18n="react"]')) continue
    const source = translatedNodes.get(node) ?? node.nodeValue ?? ''
    translatedNodes.set(node, source)
    const leading = source.match(/^\s*/)?.[0] ?? ''
    const trailing = source.match(/\s*$/)?.[0] ?? ''
    const value = source.trim()
    node.nodeValue = locale === 'zh' && chineseText[value] ? `${leading}${chineseText[value]}${trailing}` : source
  }

  document.querySelectorAll<HTMLElement>('[placeholder], [aria-label], [alt]').forEach((element) => {
    if (element.closest('[data-i18n="react"]')) return
    for (const attribute of ['placeholder', 'aria-label', 'alt']) {
      const sourceKey = `i18n${attribute.replace(/(^|-)([a-z])/g, (_, __, letter) => letter.toUpperCase())}`
      const source = element.dataset[sourceKey] ?? element.getAttribute(attribute)
      if (source === null) continue
      element.dataset[sourceKey] = source
      element.setAttribute(attribute, locale === 'zh' && chineseText[source] ? chineseText[source] : source)
    }
  })
}

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
  ['120+', 'Đối tác toàn cầu hỗ trợ vận chuyển hàng hóa và lưu thông hàng hoá.'],
  ['24/7', 'Theo dõi lô hàng và hỗ trợ logistics luôn sẵn sàng mọi lúc.'],
]

const steps = [
  ['Bước 1', 'Đặt hàng'],
  ['Bước 2', 'Đóng gói hàng hóa'],
  ['Bước 3', 'Vận chuyển nội địa'],
  ['Bước 4', 'Kho Trung Quốc'],
  ['Bước 5', 'Vận chuyển quốc tế'],
  ['Bước 6', 'Kho Việt Nam'],
  ['Bước 7', 'Thông quan'],
  ['Bước 8', 'Vận chuyển Việt Nam'],
] as const

const rates = [
  ['Bảng giá tiểu ngạch', '/assets/rates-figma-icon-gold.png'],
  ['Bảng giá chi phí', '/assets/rates-figma-icon-blue.png'],
  ['Bảng giá hàng nặng', '/assets/rates-figma-icon-blue.png'],
  ['Bảng giá hàng siêu nặng', '/assets/rates-figma-icon-gold.png'],
] as const

const services = [
  {
    title: 'Vận Tải Đường Bộ',
    image: '/assets/service-road.png',
    text: 'Giải pháp vận tải đường bộ đáng tin cậy, đảm bảo giao hàng an toàn, đúng hẹn và tiết kiệm chi phí.',
  },
  {
    title: 'Vận Tải Đường Biển',
    image: '/assets/service-warehouse.png',
    text: 'Giải pháp vận tải đường biển đáng tin cậy, đảm bảo vận chuyển hàng hóa toàn cầu an toàn và hiệu quả.',
  },
  {
    title: 'Vận Tải Hàng Không',
    image: '/assets/service-sea.png',
    text: 'Dịch vụ vận tải hàng không nhanh chóng cho các lô hàng nhạy cảm về thời gian và yêu cầu giao hàng khẩn cấp.',
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
    // Keep the first guide card visually aligned with the first service card.
    image: '/assets/service-road.png',
    title: 'Những đơn vị giao hàng hóa uy tín và bảng giá giao hàng',
    text: 'Các cách hiệu quả để đăng tin tuyển dụng trong năm 2026',
  },
  {
    image: '/assets/customer-guide-2.png',
    title: 'Vận chuyển hiệu quả từ 1-3 ngày và bảng giá vận chuyển',
    text: 'Các cách hiệu quả để đăng tin tuyển dụng trong năm 2026',
  },
  {
    image: '/assets/customer-guide-3.png',
    title: 'Cách order hàng từ trung quốc qua các kênh vận chuyển',
    text: 'Các cách hiệu quả để đăng tin tuyển dụng trong năm 2026',
  },
]

const newsArticles = [
  {
    // Use the same road-transport visual as the first customer-guide card.
    image: '/assets/service-road.png',
    date: '24 / 08 / 2025',
    title: 'Những đơn vị giao hàng hóa uy tín và bảng giá giao hàng',
    text: 'Các cách hiệu quả để đăng tin tuyển dụng trong năm 2026',
  },
  {
    image: '/assets/news-page-2.png',
    date: '24 / 08 / 2025',
    title: 'Vận chuyển hiệu quả từ 1-3 ngày và bảng giá vận chuyển',
    text: 'Các cách hiệu quả để đăng tin tuyển dụng trong năm 2026',
  },
  {
    image: '/assets/news-page-3.png',
    date: '24 / 08 / 2025',
    title: 'Cách order hàng từ trung quốc qua các kênh vận chuyển',
    text: 'Các cách hiệu quả để đăng tin tuyển dụng trong năm 2026',
  },
]

function Logo({ footer = false }: { footer?: boolean }) {
  return (
    <a
      className={`brand ${footer ? 'brand--footer' : ''}`}
      href="/"
      aria-label="MHP Logistic"
      onClick={() => sessionStorage.setItem(skipHomePopupKey, 'true')}
    >
      <img src={footer ? '/assets/figma-icons/footer-logo.svg' : '/assets/logo.png'} alt="MHP Logistic" />
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
    image: '/assets/service-option-road.png',
    alt: 'Xe tải container vận chuyển hàng hóa đường bộ',
    title: 'Vận chuyển chính nghạch',
    text: 'Quy trình vận chuyển từ Trung Quốc về Việt Nam, chuyên nghiệp, minh bạch và an toàn',
  },
  {
    image: '/assets/service-option-sea.png',
    alt: 'Tàu container vận chuyển hàng hóa đường biển',
    title: 'Vận chuyển chính nghạch',
    text: 'Quy trình vận chuyển từ Trung Quốc về Việt Nam, chuyên nghiệp, minh bạch và an toàn',
  },
  {
    image: '/assets/service-option-air.png',
    alt: 'Máy bay vận chuyển hàng hóa quốc tế',
    title: 'Vận chuyển chính nghạch',
    text: 'Quy trình vận chuyển từ Trung Quốc về Việt Nam, chuyên nghiệp, minh bạch và an toàn',
  },
]

const serviceSolutions = [
  {
    image: '/assets/service-solution-1.png',
    title: 'Nhập khẩu chính ngạch',
    text: 'Giải pháp nhập khẩu hàng hóa từ Trung Quốc về Việt Nam theo hình thức chính ngạch, hỗ trợ khách hàng trong quá trình chuẩn bị hồ sơ, thực hiện thủ tục và vận chuyển hàng hóa.',
    features: ['Hỗ trợ quy trình nhập khẩu', 'Tư vấn hồ sơ, chứng từ', 'Hỗ trợ thủ tục hải quan', 'Vận chuyển hàng hóa về Việt Nam', 'Phù hợp với nhu cầu nhập khẩu ổn định'],
  },
  {
    image: '/assets/service-solution-2.png',
    title: 'Nhập khẩu chính ngạch',
    text: 'Giải pháp nhập khẩu hàng hóa từ Trung Quốc về Việt Nam theo hình thức chính ngạch, hỗ trợ khách hàng trong quá trình chuẩn bị hồ sơ, thực hiện thủ tục và vận chuyển hàng hóa.',
    features: ['Hỗ trợ quy trình nhập khẩu', 'Tư vấn hồ sơ, chứng từ', 'Hỗ trợ thủ tục hải quan', 'Vận chuyển hàng hóa về Việt Nam', 'Phù hợp với nhu cầu nhập khẩu ổn định'],
  },
  {
    image: '/assets/service-solution-3.png',
    title: 'Nhập khẩu chính ngạch',
    text: 'Giải pháp nhập khẩu hàng hóa từ Trung Quốc về Việt Nam theo hình thức chính ngạch, hỗ trợ khách hàng trong quá trình chuẩn bị hồ sơ, thực hiện thủ tục và vận chuyển hàng hóa.',
    features: ['Hỗ trợ quy trình nhập khẩu', 'Tư vấn hồ sơ, chứng từ', 'Hỗ trợ thủ tục hải quan', 'Vận chuyển hàng hóa về Việt Nam', 'Phù hợp với nhu cầu nhập khẩu ổn định'],
  },
]

const serviceStages = [
  ['🎯', 'Hiểu đúng nhu cầu', 'Tìm hiểu nhu cầu và đặc điểm lô hàng để đưa ra phương án phù hợp.'],
  ['📋', 'Quy trình rõ ràng', 'Các bước thực hiện được trao đổi cụ thể trước khi triển khai.'],
  ['📍', 'Cập nhật hành trình', 'Hỗ trợ cập nhật tình trạng lô hàng trong quá trình vận chuyển.'],
  ['📄', 'Hỗ trợ hồ sơ', 'Tư vấn các công việc liên quan đến hồ sơ trong phạm vi dịch vụ.'],
  ['🤝', 'Đồng hành liên tục', 'Đồng hành từ khi tiếp nhận yêu cầu đến khi hoàn tất giao hàng.'],
  ['⚡', 'Nhiều lựa chọn', 'Dịch vụ phù hợp với từng nhóm khách hàng và quy mô lô hàng.'],
]

function ServicePage() {
  return (
    <main className="service-detail-page">
      <section className="service-detail-hero">
        <div className="service-detail-hero__shade" />
        <div className="shell service-detail-hero__content">
          <h1>Dịch vụ vận chuyển &amp; nhập khẩu<br />hàng hóa Trung Quốc</h1>
          <p>Giải pháp vận chuyển và nhập khẩu hàng hóa từ Trung Quốc về Việt Nam, đồng hành cùng cá nhân, hộ kinh doanh và doanh nghiệp từ khâu đặt hàng đến khi nhận hàng.</p>
          <div className="service-detail-hero__tags">
            <span>Nhập khẩu chính ngạch</span>
            <span>Ủy thác nhập khẩu</span>
            <span>24/7 Hỗ trợ khách hàng</span>
          </div>
        </div>
      </section>

      <section className="service-detail-options">
        <div className="service-detail-shell">
          <header className="service-detail-heading">
            <h2>Lựa chọn phương án phù hợp</h2>
            <p>Mỗi khách hàng có nhu cầu nhập hàng khác nhau. Có doanh nghiệp cần nhập khẩu chính ngạch với đầy đủ hồ sơ, có khách hàng cần một đơn vị hỗ trợ toàn bộ quá trình nhập khẩu, cũng có khách hàng chỉ cần một giải pháp vận chuyển hàng hóa từ Trung Quốc về Việt Nam.</p>
          </header>
          <div className="service-detail-options__grid">
          {servicePageItems.map((item) => (
            <article className="service-detail-option" key={item.image}>
              <img src={item.image} alt={item.alt} />
              <div className="service-detail-option__body">
                <h2>{item.title}</h2>
                <p>{item.text}</p>
                <a href="#service-solutions">Xem chi tiết <ArrowRight /></a>
              </div>
            </article>
          ))}
          </div>
        </div>
      </section>

      <section className="service-detail-solutions" id="service-solutions">
        <div className="service-detail-shell">
          <header className="service-detail-heading">
            <h2>Ba giải pháp chính của MHP</h2>
            <p>Mỗi khách hàng có nhu cầu nhập hàng khác nhau. Có doanh nghiệp cần nhập khẩu chính ngạch với đầy đủ hồ sơ, có khách hàng cần một đơn vị hỗ trợ toàn bộ quá trình nhập khẩu, cũng có khách hàng chỉ cần một giải pháp vận chuyển hàng hóa từ Trung Quốc về Việt Nam.</p>
          </header>
          <div className="service-detail-solutions__list">
            {serviceSolutions.map((solution, index) => (
              <article className={index % 2 ? 'reverse' : ''} key={solution.image}>
                <img src={solution.image} alt={`Dịch vụ ${solution.title}`} />
                <div>
                  <h3>{solution.title}</h3>
                  <p>{solution.text}</p>
                  <ul>{solution.features.map((feature) => <li key={feature}><span>✓</span>{feature}</li>)}</ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="service-detail-selector">
        <div className="service-detail-shell">
          <header>
            <h2>Tự xác định phương án phù hợp</h2>
            <p>Chọn nhu cầu gần nhất với lô hàng của bạn, Hoa Việt sẽ tư vấn phạm vi dịch vụ và báo giá phù hợp.</p>
          </header>
          <div className="service-detail-selector__grid">
            <a href="tel:0969857874"><small>Doanh nghiệp cần nhập khẩu hàng hóa</small><strong>Nhập khẩu chính ngạch</strong></a>
            <a href="tel:0969857874"><small>Cần đơn vị hỗ trợ quá trình nhập khẩu</small><strong>Ủy thác nhập khẩu</strong></a>
            <a href="tel:0969857874"><small>Đã mua hàng và cần vận chuyển về Việt Nam</small><strong>Ủy thác vận chuyển</strong></a>
            <a href="tel:0969857874"><small>Chưa chắc nên chọn dịch vụ nào</small><strong>Nhận tư vấn</strong></a>
          </div>
        </div>
      </section>

      <section className="service-detail-gallery">
        <div className="service-detail-shell">
          <h2>Một số hình ảnh về dịch vụ</h2>
          <div>{[1, 2, 3, 4, 5, 6].map((number) => <img key={number} src={`/assets/service-gallery-${number}.png`} alt={`Hoạt động vận chuyển MHP ${number}`} />)}</div>
        </div>
      </section>

      <section className="service-detail-stages">
        <div className="service-detail-shell">
          <h2>MHP đồng hành trong từng giai đoạn</h2>
          <div>{serviceStages.map(([icon, title, text]) => <article key={title}><span>{icon}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
        </div>
      </section>

      <section className="service-detail-route">
        <div className="service-detail-shell service-detail-route__grid">
          <div className="service-detail-route__intro">
            <h2>Kết nối Trung Quốc đến Hà Nội và TP.HCM</h2>
            <p>MHP Logistics kết nối các khâu tiếp nhận, tập kết, vận chuyển và giao nhận nhằm giúp khách hàng thuận tiện hơn trong quá trình nhập hàng.</p>
            <div>
              <article><h3>Doanh nghiệp</h3><p>Nhập khẩu nguyên vật liệu, hàng hóa, sản phẩm phục vụ hoạt động kinh doanh.</p></article>
              <article><h3>Hộ kinh doanh</h3><p>Nhập hàng Trung Quốc phục vụ bán buôn, bán lẻ và kinh doanh online.</p></article>
              <article><h3>Shop online</h3><p>Hỗ trợ vận chuyển hàng hóa từ nguồn hàng Trung Quốc về Việt Nam.</p></article>
              <article><h3>Cá nhân</h3><p>Giải pháp vận chuyển phù hợp với nhu cầu nhập hàng cá nhân.</p></article>
            </div>
          </div>
          <div className="service-detail-route__journey">
            <h3>Hành trình vận chuyển</h3>
            <ol>{['TRUNG QUỐC', 'Kho / Tập kết', 'Vận chuyển', 'Cửa khẩu', 'VIỆT NAM', 'Hà Nội / TP.HCM', 'Giao hàng'].map((item, index) => <li key={item}><span>{index + 1}</span>{item}</li>)}</ol>
          </div>
        </div>
      </section>
    </main>
  )
}

const entrustedRates = [
  ['Dưới 100 triệu đồng', '2%'],
  ['Từ 100 triệu đến 200 triệu đồng', '1.5%'],
  ['Trên 200 triệu đồng', '1%'],
]

const heavyRates = [
  ['50kg – 150kg', '8.000đ/kg', '10.000đ/kg'],
  ['150kg – 500kg', '7.000đ/kg', '9.000đ/kg'],
  ['500kg – 1.000kg', '6.000đ/kg', '8.000đ/kg'],
  ['1.000kg – 3.000kg', '5.500đ/kg', '7.500đ/kg'],
  ['Trên 3.000kg', 'Liên hệ', 'Liên hệ'],
]

const extraHeavyRates = [
  ['Trên 30m3', 'Liên hệ', 'Liên hệ'],
  ['15 - 30 m3', '1.000.000 đ/kg', '1.400.000 đ/kg'],
  ['5-15 m3', '1.100.000 đ/kg', '1.500.000 đ/kg'],
  ['1 - 5 m3', '1.200.000 đ/kg', '1.600.000 đ/kg'],
  ['Dưới 1m3', '1.300.000 đ/kg', '1.700.000 đ/kg'],
]

const announcementRates = [
  ['>5000kg', 'Liên hệ', 'Liên hệ'],
  ['3000kg - 5000kg', '5.000 đ', '10.000 đ'],
  ['2000kg - 3000kg', '6.000 đ', '11.000 đ'],
  ['1000kg - 2000kg', '7.000 đ', '12.000 đ'],
  ['Dưới 1000kg', '8.000 đ', '13.000 đ'],
] as const

function PricePage() {
  return (
    <main className="pricing-page">
      <section className="pricing-hero">
        <p>Giải pháp toàn diện</p>
        <h1>CÁC GÓI <span>DỊCH VỤ</span></h1>
        <small>XEM BẢNG GIÁ VÀ CÁC GÓI DỊCH VỤ CỦA CHÚNG TÔI</small>
      </section>

      <div className="shell pricing-content">
        <PriceSection title="Bảng giá vận chuyển hàng Trung Quốc về Hà Nội và TP.HCM">
          <table className="pricing-table pricing-table--two">
            <thead><tr><th>Giá trị ủy thác</th><th>Phí</th></tr></thead>
            <tbody>{entrustedRates.map(([value, fee]) => <tr key={value}><td>{value}</td><td>{fee}</td></tr>)}</tbody>
          </table>
        </PriceSection>

        <PriceSection title="Bảng giá vận chuyển đối với hàng nặng">
          <table className="pricing-table">
            <thead><tr><th>Trọng lượng</th><th>Hà Nội</th><th>TP.HCM</th></tr></thead>
            <tbody>{heavyRates.map(([weight, hanoi, hcm]) => <tr key={weight}><td>{weight}</td><td>{hanoi}</td><td>{hcm}</td></tr>)}</tbody>
          </table>
        </PriceSection>

        <PriceSection title="Bảng giá vận chuyển đối với hàng siêu nặng">
          <table className="pricing-table">
            <thead><tr><th>Trọng lượng</th><th>Hà Nội</th><th>TP.HCM</th></tr></thead>
            <tbody>{extraHeavyRates.map(([weight, hanoi, hcm]) => <tr key={weight}><td>{weight}</td><td>{hanoi}</td><td>{hcm}</td></tr>)}</tbody>
          </table>
        </PriceSection>

        <PriceSection title="Bảng giá vận chuyển đối với hàng siêu nặng">
          <table className="pricing-table pricing-table--shipping">
            <colgroup>
              <col className="pricing-table__origin" /><col className="pricing-table__destination" />
              <col /><col /><col /><col /><col />
              <col className="pricing-table__cosmetic" /><col className="pricing-table__cosmetic" />
              <col className="pricing-table__parcel" /><col className="pricing-table__parcel" />
            </colgroup>
            <thead>
              <tr><th rowSpan={2}>Điểm nhận<br />kho TQ</th><th rowSpan={2}>Điểm nhận<br />kho VN</th><th colSpan={2}>Hàng phổ thông</th><th colSpan={3}>Hàng nặng<br /><small>(Sắt thép, ốc vít, bàn lề...)</small></th><th colSpan={2}>Mỹ phẩm, quần áo</th><th colSpan={2}>Bao tạp</th></tr>
              <tr><th>kg</th><th>m3</th><th>700-1000<br />kg/m3</th><th>1000-1500<br />kg/m3</th><th>&gt;1500<br />kg/m3</th><th>kg</th><th>m3</th><th>kg</th><th>m3</th></tr>
            </thead>
            <tbody>
              <tr><td rowSpan={2} className="pricing-table__red">BẰNG TƯỜNG</td><td>HÀ NỘI</td><td className="pricing-table__red">6.000</td><td className="pricing-table__red">1.600.000</td><td>4.000</td><td>3.000</td><td>2.500</td><td className="pricing-table__red">6.000</td><td className="pricing-table__red">2.100.000</td><td>10.000</td><td>2.000.000</td></tr>
              <tr><td>TP.HCM</td><td className="pricing-table__red">8.000</td><td className="pricing-table__red">2.100.000</td><td>6.000</td><td>5.000</td><td>4.500</td><td className="pricing-table__red">8.000</td><td className="pricing-table__red">2.600.000</td><td>12.000</td><td>2.500.000</td></tr>
            </tbody>
          </table>
        </PriceSection>
      </div>
    </main>
  )
}

function PriceSection({ title, children }: { title: string; children: ReactNode }) {
  return <section className="pricing-section"><h2>{title}</h2><p>Phí ủy thác được tính dựa trên tổng giá trị đơn hàng.</p>{children}</section>
}

const prohibitedGoods = [
  ['Căn cứ pháp lý', 'Nghị định số 69/2018/NĐ-CP ngày 15/05/2018 của Chính phủ Việt Nam về xuất nhập khẩu hàng hóa'],
  ['Nhóm 1: Vũ khí, Đạn dược & Vật liệu Nguy hiểm', 'Vũ khí, đạn dược, vật liệu nổ, trang thiết bị kỹ thuật quân sự dưới mọi hình thức'],
  ['Nhóm 2: Hàng Tiêu dùng & Thiết bị Đã Qua Sử dụng', 'Hàng điện tử, điện lạnh, thiết bị y tế đã qua sử dụng'],
  ['Nhóm 3: Nội dung Độc hại & Vi phạm Pháp luật', 'Văn hóa phẩm đồi trụy, tài liệu phản động'],
  ['Nhóm 4: Môi trường & Sinh vật Hoang dã', 'Phế liệu, phế thải công nghiệp nguy hại'],
]

const packingPolicies = [
  ['Pin. Ắc quy & thiết bị điện tử', ['Dán nhãn hàng nguy hiểm đúng mã UN', 'Cung cấp bảng MSDS', 'Đóng gói theo tiêu chuẩn IATA']],
  ['Hàng có Thương hiệu', ['Kiểm tra tình trạng bảo hộ thương hiệu', 'Cung cấp hợp đồng phân phối chính hãng']],
  ['Hàng dễ vỡ', ['Phế liệu, phế thải công nghiệp nguy hại', 'Lót xốp PE foam tối thiểu 5cm mỗi mặt']],
]

function PolicyPage() {
  return (
    <main className="policy-page">
      <section className="policy-hero">
        <p>Giải pháp toàn diện</p>
        <h1>CHÍNH SÁCH &amp; QUY ĐỊNH</h1>
        <span>XEM BẢNG GIÁ VÀ CÁC GÓI DỊCH VỤ CỦA CHÚNG TÔI</span>
      </section>

      <section className="policy-content">
        <div className="policy-cards">
          <article className="policy-card policy-card--prohibited">
            <h2><span>1.</span> Điều khoản &amp; dịch vụ hàng hóa cấm</h2>
            <div className="policy-card__rule" />
            <div className="policy-list">
              {prohibitedGoods.map(([title, text]) => <div key={title}><strong>{title}</strong><p>{text}</p></div>)}
            </div>
            <p className="policy-warning"><strong>Hậu quả khi vận chuyển hàng cấm:</strong> Lô hàng sẽ bị tạm giữ hoặc tịch thu tại cửa khẩu.</p>
          </article>

          <article className="policy-card policy-card--packing">
            <h2><span>2.</span> Chính sách vận chuyển &amp; Đóng gói</h2>
            <div className="policy-card__rule" />
            <div className="policy-list policy-list--packing">
              {packingPolicies.map(([title, details]) => <div key={title as string}><strong>{title as string}</strong>{(details as string[]).map((detail) => <p key={detail}>{detail}</p>)}</div>)}
            </div>
          </article>
        </div>
      </section>
    </main>
  )
}

function NewsPage() {
  return (
    <main className="news-page">
      <section className="news-page-hero">
        <p>Giải pháp toàn diện</p>
        <h1>TIN TỨC MỚI NHẤT</h1>
        <span>XEM BẢNG GIÁ VÀ CÁC GÓI DỊCH VỤ CỦA CHÚNG TÔI</span>
      </section>

      <section className="news-page-content">
        <div className="shell news-page-grid">
          {newsArticles.map((article) => (
            <a className="news-card" href="/tin-tuc/van-chuyen-hieu-qua" key={article.title}>
              <span className="news-card-media"><img src={article.image} alt={article.title} /></span>
              <p><b>Ngày đăng</b><span />{article.date}</p>
              <h2>{article.title}</h2>
              <div>{article.text}</div>
            </a>
          ))}
        </div>
      </section>
    </main>
  )
}

function NewsDetailPage() {
  return (
    <main className="news-detail-page">
      <section className="news-detail-hero">
        <div className="shell"><h1>Vận chuyển hiệu quả từ 1-3 ngày và bảng giá<br />vận chuyển</h1></div>
      </section>

      <article className="news-detail-content">
        <h2>Dự thảo Thông tư mới có gì đáng chú ý?</h2>
        <p>Bộ Khoa học và Công nghệ đang xây dựng dự thảo Thông tư ban hành Danh mục sản phẩm, hàng hóa có mức độ rủi ro trung bình và mức độ rủi ro cao thuộc trách nhiệm quản lý của Bộ. Danh mục này dự kiến áp dụng từ năm 2026, nhằm siết chặt kiểm tra chất lượng.</p>
        <p>Theo dự thảo, Thông tư sẽ kèm áp dụng đối với tổ chức, cá nhân sản xuất, kinh doanh sản phẩm, hàng hóa thuộc danh mục rủi ro trung bình và rủi ro cao trên lãnh thổ Việt Nam. Đây là quy định mới, có ý nghĩa quan trọng đối với các doanh nghiệp nhập hàng phải đến có thể phải thực hiện thêm thủ tục về chất lượng trước khi lưu thông trên thị trường.</p>

        <h2>Hàng hóa rủi ro cao: kiểm soát chặt hơn khi nhập khẩu</h2>
        <p>Với nhóm sản phẩm, hàng hóa có mức độ rủi ro cao, doanh nghiệp nhập khẩu quy chuẩn kỹ thuật quốc gia tương ứng.</p>
        <p>Đáng chú ý, nhiều hàng hóa nhập khẩu thuộc nhóm này còn phải thực hiện <b>kiểm tra nhà nước về chất lượng</b> trước khi được cấp phép lưu hành.</p>
        <p>Một số nhóm hàng rủi ro cao trong dự thảo gồm:</p>
        <ul>
          <li>Xăng, nhiên liệu diezen và nhiên liệu sinh học</li><li>Khí dầu mỏ hóa lỏng LPG</li><li>Mũ bảo hiểm cho người đi mô tô, xe máy</li><li>Một số thiết bị điện và điện tử về an toàn điện</li><li>Thiết bị phát, thu-phát sóng vô tuyến điện</li><li>Thiết bị Wi-Fi, thiết bị 5G, thiết bị không dây</li><li>Flycam, drone, thiết bị điều khiển từ xa</li><li>RFID, thiết bị phụ trợ hệ thống RFID</li><li>Micro, loa, tai nghe không dây</li><li>Vật liệu phòng xạ, thiết bị hạt nhân, thiết bị bức xạ</li>
        </ul>
        <p>Đối với doanh nghiệp nhập khẩu, nhóm hàng này cần được rà soát kỹ ngay từ khâu đặt hàng. Nếu chỉ kiểm tra giá, mẫu mã và thời gian giao hàng mà bỏ qua quy chuẩn kỹ thuật, doanh nghiệp có thể gặp rủi ro khi hàng về đến cảng hoặc khi đưa hàng ra thị trường.</p>

        <h2>Hàng hóa rủi ro trung bình: vẫn cần công bố hợp quy trước khi lưu thông</h2>
        <p>Bên cạnh nhóm rủi ro cao, dự thảo cũng quy định <b>danh mục sản phẩm, hàng hóa có mức độ rủi ro trung bình.</b></p>
        <p>Với nhóm này, doanh nghiệp phải công bố tiêu chuẩn áp dụng; đồng thời phải tự đánh giá hoặc được tổ chức chứng nhận được công nhận thực hiện chứng nhận phù hợp quy chuẩn kỹ thuật quốc gia tương ứng.</p>
        <p>Một số nhóm hàng rủi ro trung bình đáng chú ý gồm:</p>
        <ul>
          <li>Đồ chơi trẻ em</li><li>Thép làm cốt bê tông</li><li>Thép không gỉ</li><li>Dầu nhờn động cơ đốt trong</li><li>Sản phẩm chiếu sáng bằng công nghệ LED</li><li>Bình nước nóng, lò vi sóng, bàn là, máy hút bụi</li><li>Tủ lạnh, máy giặt, điều hòa</li><li>Ổ cắm, phích cắm, công tắc điện</li><li>Máy tính xách tay, laptop, máy tính bảng</li><li>Thiết bị truyền hình, set top box</li><li>Một số thiết bị phát, thu-phát sóng vô tuyến</li>
        </ul>
        <p>Điểm đáng chú ý là từ nhiều hàng hóa nhập khẩu thuộc nhóm rủi ro trung bình phải <b>công bố hợp quy trước khi lưu thông trên thị trường.</b> Vì vậy, nếu chủ động kiểm tra danh mục, doanh nghiệp có thể chủ động đưa vào kinh doanh và giảm rủi ro chậm đưa vào vận chuyển.</p>

        <h2>Vì sao doanh nghiệp nhập khẩu cần chú ý đến mã HS?</h2>
        <p>Một điểm quan trọng trong dự thảo là danh mục hàng hóa được gắn với <b>mã HS theo Danh mục hàng hóa xuất khẩu, nhập khẩu Việt Nam.</b></p>
        <p>Điều này có nghĩa là doanh nghiệp không thể chỉ dựa vào tên thương mại của sản phẩm. Cùng một mặt hàng, nếu mô tả kỹ thuật, công suất hoặc công nghệ khác nhau, việc áp mã HS có thể khác nhau.</p>
        <p>Ví dụ, với nhóm thiết bị điện tử, thiết bị không dây, thiết bị Wi-Fi, laptop, tablet hoặc flycam, doanh nghiệp cần kiểm tra kỹ:</p>
        <ul><li>Sản phẩm có chức năng phát/thu sóng vô tuyến không?</li><li>Có tích hợp Wi-Fi, Bluetooth, 5G hay các công nghệ truyền dữ liệu không?</li><li>Có thuộc nhóm phải công bố hợp quy hoặc chứng nhận hợp quy không?</li><li>Hàng nhập khẩu có kèm theo tài liệu kỹ thuật không?</li></ul>
        <p>Việc xác định sai mã HS hoặc bỏ sót yêu cầu quản lý chất lượng có thể khiến doanh nghiệp phát sinh chi phí lưu kho, lưu bãi, chậm thông quan hoặc chậm kế hoạch phân phối hàng hóa.</p>

        <h2>Thời điểm dự kiến áp dụng và điều khoản chuyển tiếp</h2>
        <p>Theo nội dung dự thảo, Thông tư dự kiến có hiệu lực từ <b>ngày 01/07/2026.</b> Các quy định chuyển tiếp cũng thông báo tiếp nhận hàng trong bộ quy định được áp dụng để chưa thông tư có hiệu lực và áp dụng phù hợp với các quy định khác.</p>
        <p>Đây là khoảng thời gian quan trọng để doanh nghiệp chủ động rà soát lại danh mục nhập khẩu, đối chiếu các quy chuẩn kỹ thuật và chuẩn bị hồ sơ công bố hợp quy nếu cần.</p>

        <h2>Doanh nghiệp nên chuẩn bị từ bây giờ?</h2>
        <p>Để hạn chế rủi ro trong quá trình nhập khẩu và lưu thông hàng hóa, doanh nghiệp nên chủ động thực hiện các bước sau:</p>
        <p><b>Thứ nhất, rà soát danh mục sản phẩm đang nhập khẩu.</b><br />Doanh nghiệp cần kiểm tra từng nhóm hàng xem có thuộc danh mục rủi ro trung bình hoặc rủi ro cao hay không.</p>
        <p><b>Thứ hai, đối chiếu mã HS.</b><br />Việc xác định mã HS chính xác là cơ sở để kiểm tra yêu cầu về tiêu chuẩn và quy chuẩn kỹ thuật trước khi hàng về cảng.</p>

        <h2>Kết luận</h2>
        <p>Dự thảo Thông tư mới của Bộ Khoa học và Công nghệ cho thấy xu hướng quản lý chất lượng hàng hóa ngày càng chặt chẽ hơn, đặc biệt với các sản phẩm có yếu tố an toàn, kỹ thuật, điện tử, viễn thông và thiết bị tiêu dùng.</p>
        <p>Đối với doanh nghiệp nhập khẩu, đây không chỉ là thay đổi về mặt thủ tục, mà còn là yêu cầu phải quản trị rủi ro tốt hơn ngay từ khâu đặt hàng, xác định mã HS và kiểm tra tiêu chuẩn áp dụng để có thể chủ động trong việc nhập khẩu cũng như phân phối sản phẩm.</p>
        <p>Việc cập nhật sớm quy định sẽ giúp doanh nghiệp giảm rủi ro chậm thông quan, tiết kiệm chi phí phát sinh và đảm bảo hàng hóa đủ điều kiện lưu thông trên thị trường.</p>
      </article>
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

function FigmaIcon({ name, className = '' }: { name: string; className?: string }) {
  return <img className={`figma-icon ${className}`} src={`/assets/figma-icons/${name}`} alt="" aria-hidden="true" />
}

function PriceAnnouncement({ onClose }: { onClose: () => void }) {
  return (
    <div className="price-modal" role="dialog" aria-modal="true" aria-labelledby="price-modal-title">
      <div className="price-modal__backdrop" onClick={onClose} aria-hidden="true" />
      <section className="price-modal__content">
        <div className="price-modal__notice">
          <strong>Thông báo điều chỉnh bảng giá 11/09/2025</strong>
          <button type="button" onClick={onClose} aria-label="Đóng thông báo bảng giá"><X /></button>
        </div>
        <h2 id="price-modal-title">BẢNG GIÁ VẬN CHUYỂN CHÍNH NGẠCH</h2>
        <h3>PHÍ VẬN CHUYỂN VỚI HÀNG NẶNG (CHƯA BAO GỒM VAT)</h3>
        <table className="price-table">
          <thead><tr><th>TRỌNG LƯỢNG</th><th>BẢNG TƯỜNG HÀ NỘI (đ/Kg)</th><th>BẢNG TƯỜNG HCM (đ/Kg)</th></tr></thead>
          <tbody>
            <tr className="price-table__alert"><td colSpan={3}>ĐỐI VỚI HÀNG NGUYÊN CONT, NGUYÊN XE LIÊN HỆ HOTLINE</td></tr>
            {announcementRates.map(([weight, hanoi, hcm]) => <tr key={weight}><td>{weight}</td><td>{hanoi}</td><td>{hcm}</td></tr>)}
          </tbody>
        </table>
        <p className="price-modal__note">Lưu ý: đơn hàng dưới 50kg làm tròn lên 50kg. Tối thiểu 50kg cho 1 mục hàng khai thuế</p>
      </section>
    </div>
  )
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [locale, setLocale] = useState<Locale>(getInitialLocale)
  const pathname = window.location.pathname.replace(/\/$/, '') || '/'
  const isIntroductionPage = pathname === '/gioi-thieu'
  const isServicePage = pathname === '/dich-vu'
  const isPricePage = pathname === '/bang-gia'
  // News articles remain part of the News section, so the navigation still
  // gives people a clear sense of where they are.
  const isNewsPage = pathname === '/tin-tuc' || pathname.startsWith('/tin-tuc/')
  const isNewsDetailPage = pathname.startsWith('/tin-tuc/')
  const isPolicyPage = pathname === '/chinh-sach-bao-mat' || pathname === '/dieu-khoan-su-dung'
  const [priceModalOpen, setPriceModalOpen] = useState(false)

  useEffect(() => {
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'vi'
    translateDocument(locale)
  }, [locale])

  useEffect(() => {
    if (!shouldOpenHomePopup(pathname)) return

    // Let the homepage render first, then show the announcement shortly after.
    const popupTimer = window.setTimeout(() => setPriceModalOpen(true), 2000)
    return () => window.clearTimeout(popupTimer)
  }, [pathname])

  const changeLocale = (nextLocale: Locale) => {
    setLocale(nextLocale)
    localStorage.setItem(localeStorageKey, nextLocale)
  }

  return (
    <div className="site" id="top">
      <header>
        <div className="topbar">
          <div className="shell topbar-inner">
            <span className="exchange"><FigmaIcon name="exchange.png" />TỶ GIÁ: 3,980 VNĐ</span>
            <div className="topbar-info">
              <a href="tel:0969857874"><FigmaIcon name="phone.svg" /> Số điện thoại: 0969857874</a>
              <div className="topbar-language">
                <span className="topbar-language-label"><FigmaIcon name="globe.svg" />Ngôn ngữ:</span>
                <div className="language-switcher" role="group" aria-label="Chọn ngôn ngữ">
                  <button type="button" className={locale === 'vi' ? 'active' : ''} onClick={() => changeLocale('vi')} aria-pressed={locale === 'vi'}><img src="/assets/vietnam.png" alt="" />VIE</button>
                  <button type="button" className={locale === 'zh' ? 'active' : ''} onClick={() => changeLocale('zh')} aria-pressed={locale === 'zh'}><span className="language-flag" aria-hidden="true">🇨🇳</span>中文</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="nav-wrap">
          <div className="shell navbar">
            <Logo />
            <nav id="main-navigation" className={menuOpen ? 'open' : ''} aria-label="Điều hướng chính">
              <a href="/chinh-sach-bao-mat" aria-current={isPolicyPage ? 'page' : undefined} onClick={() => setMenuOpen(false)}><FigmaIcon name="policy.svg" /> Chính sách</a>
              <a href="/dich-vu" aria-current={isServicePage ? 'page' : undefined} onClick={() => setMenuOpen(false)}><FigmaIcon name="box.svg" /> Dịch vụ</a>
              <a href="/tin-tuc" aria-current={isNewsPage ? 'page' : undefined} onClick={() => setMenuOpen(false)}><FigmaIcon name="news.svg" /> Tin tức</a>
              <a href="/bang-gia" aria-current={isPricePage ? 'page' : undefined} onClick={() => setMenuOpen(false)}><FigmaIcon name="pricing.svg" className="pricing-nav-icon" /> Bảng giá</a>
            </nav>
            <button
              className="menu-button"
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
              aria-expanded={menuOpen}
              aria-controls="main-navigation"
            >
              {menuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      {isPolicyPage ? <PolicyPage /> : isIntroductionPage || isServicePage ? <ServicePage /> : isPricePage ? <PricePage /> : isNewsDetailPage ? <NewsDetailPage /> : isNewsPage ? <NewsPage /> : <main>
        <section className="hero">
          <div className="shell hero-content">
            <div className="hero-copy">
              <p className="hero-kicker">MHP LOGISTIC</p>
              <h1>Vận chuyển nhanh chóng,<br />thông minh hơn</h1>
              <p>MHP logistics cung cấp giải pháp vận chuyển quốc tế, khai báo hải quan và kho bãi thông minh. Chúng tôi giúp doanh nghiệp tối ưu hóa chuỗi cung ứng</p>
            </div>
            <QuoteForm locale={locale} />
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
              {steps.map(([step, title], index) => (
                <article className={index > 3 ? 'red' : ''} key={`${step}-${title}-${index}`}>
                  <span><i className={`process-icon process-icon--${index + 1}`} /></span>
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
                {rates.map(([title, icon]) => (
                  <article key={title as string}>
                    <img className="rate-card-icon" src={icon} alt="" />
                    <strong>{title as string}</strong>
                    <a href="/bang-gia">Xem chi tiết <img src="/assets/rates-figma-arrow.svg" alt="" /></a>
                  </article>
                ))}
              </div>
              <img src="/assets/rates-figma-truck.png" alt="Xe tải MHP Logistic" />
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

        <section className="why">
          <div className="shell why-grid">
            <div className="why-content">
              <p className="eyebrow"><span />Tại sao chọn chúng tôi</p>
              <h2>Tại sao chọn MHP là đối tác</h2>
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
              <img src="/assets/why-mhp-figma.png" alt="Xe tải vận chuyển MHP" />
            </div>
            <div className="mini-stats"><span><b>200</b>Đơn vận chuyển</span><span><b>4</b>Đối tác vận chuyển</span></div>
          </div>
        </section>

        <section className="cta" id="contact">
          <div className="shell">
            <p>MHP Loggistic</p>
            <h2>Order nhanh chóng dễ dàng<br />Ship nhanh</h2>
            <span>Order hàng và vận chuyển nhanhc hóng với chi phí rẻ nhất, ship xuyên quốc gia</span>
            <a href="tel:0866091688">Liên hệ chúng tôi</a>
          </div>
        </section>

        <section className="news" id="news">
          <div className="shell customer-guide-shell">
            <SectionIntro
              eyebrow="Tin tức"
              title="Cẩm nang khách hàng"
              text="Những kiến thức, kinh nghiệm và hướng dẫn chi tiết giúp bạn tối ưu hóa quá trình nhập hàng và vận chuyển."
            />
            <div className="article-grid">
              {articles.map((article) => (
                <a className="article-card" href="/tin-tuc/van-chuyen-hieu-qua" key={article.title}>
                  <div className="article-card-media"><img src={article.image} alt="" /></div>
                  <p><b>Ngày đăng</b><span />24 / 08 / 2025</p>
                  <h3>{article.title}</h3>
                  <span>{article.text}</span>
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>}

      <footer>
        <div className="shell footer-main">
          <div><Logo footer /><p>Kết nối thế giới thông qua giải pháp vận tải thông minh, nhanh chóng và tin cậy</p></div>
          <div className="footer-policy-links"><h3>THÔNG TIN &amp; CHÍNH SÁCH</h3><a href="/chinh-sach-bao-mat"><FigmaIcon name="footer-policy.svg" />Chính sách</a><a href="/bang-gia"><FigmaIcon name="box.svg" className="footer-policy-box-icon" />Bảng giá dịch vụ</a><a href="/tin-tuc"><FigmaIcon name="footer-terms.svg" />Tin tức</a></div>
          <div><h3>LIÊN HỆ HỖ TRỢ</h3><a href="https://www.google.com/maps/search/?api=1&query=Khu%20ph%E1%BB%91%20Giang%20Li%E1%BB%85u%2C%20ph%C6%B0%E1%BB%9Dng%20Ph%C6%B0%C6%A1ng%20Li%E1%BB%85u%2C%20t%E1%BB%89nh%20B%E1%BA%AFc%20Ninh" target="_blank" rel="noreferrer"><FigmaIcon name="location.svg" />Khu phố Giang Liễu, phường Phương Liễu, tỉnh Bắc Ninh.</a><a href="tel:0969857874"><FigmaIcon name="footer-phone.svg" />0969857874</a><a href="mailto:mhplogistics@gmail.com"><FigmaIcon name="mail.svg" />mhplogistics@gmail.com</a></div>
        </div>
        <div className="shell footer-bottom"><span>© 2026 MHP Logistics. All rights reserved.</span><div><a href="/chinh-sach-bao-mat">Chính sách bảo mật</a><a href="/dieu-khoan-su-dung">Điều khoản sử dụng</a></div></div>
      </footer>
      {pathname === '/' && priceModalOpen && <PriceAnnouncement onClose={() => setPriceModalOpen(false)} />}
    </div>
  )
}

export default App
