export const LEAD_LIMITS = {
  fullName: 100,
  phone: 30,
  need: 500,
  sourcePath: 200,
} as const

export type LeadInput = {
  fullName: string
  phone: string
  need: string
  sourcePath: string
}

export type StoredLead = LeadInput & {
  id: string
  createdAt: string
}

export interface LeadRepository {
  insert(lead: StoredLead): Promise<void>
  markEmailSent(
    id: string,
    messageId: string,
    updatedAt: string,
  ): Promise<void>
  markEmailFailed(id: string, error: string, updatedAt: string): Promise<void>
}

export interface LeadNotifier {
  send(lead: StoredLead): Promise<string>
}

export type LeadNotificationResult = { leadId: string } & (
  | { outcome: 'sent'; messageId: string }
  | { outcome: 'provider_failed'; errorCode: 'NOTIFICATION_SEND_FAILED' }
  | { outcome: 'sent_status_write_failed'; messageId: string; errorCode: 'SENT_STATUS_WRITE_FAILED' }
)

export type LeadServices = {
  repository: LeadRepository
  notifier: LeadNotifier
  logNotification(result: LeadNotificationResult): void
  defer(promise: Promise<void>): void
  randomUUID(): string
  now(): Date
}

export type ValidationResult =
  | { ok: true; value: LeadInput }
  | { ok: false; error: string }

const invalid = (error: string): ValidationResult => ({ ok: false, error })

function normalizePhone(phone: string): string | null {
  if (phone.length > LEAD_LIMITS.phone || !/^\+?[0-9 ().-]+$/.test(phone)) return null
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 8 || digits.length > 15) return null
  return `${phone.startsWith('+') ? '+' : ''}${digits}`
}

export function validateLeadPayload(value: unknown): ValidationResult {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return invalid('Dữ liệu không hợp lệ.')
  }

  const payload = value as Record<string, unknown>
  if (typeof payload.website !== 'undefined') {
    if (typeof payload.website !== 'string' || payload.website.trim() !== '') {
      return invalid('Dữ liệu không hợp lệ.')
    }
  }

  const fieldNames = ['fullName', 'phone', 'need', 'sourcePath'] as const
  for (const fieldName of fieldNames) {
    if (typeof payload[fieldName] !== 'string') {
      return invalid('Vui lòng điền đầy đủ thông tin.')
    }
  }

  const lead: LeadInput = {
    fullName: payload.fullName.trim(),
    phone: payload.phone.trim(),
    need: payload.need.trim(),
    sourcePath: payload.sourcePath.trim(),
  }

  if (!lead.fullName || !lead.phone || !lead.need || !lead.sourcePath) {
    return invalid('Vui lòng điền đầy đủ thông tin.')
  }

  if (
    lead.fullName.length > LEAD_LIMITS.fullName ||
    lead.phone.length > LEAD_LIMITS.phone ||
    lead.need.length > LEAD_LIMITS.need ||
    lead.sourcePath.length > LEAD_LIMITS.sourcePath
  ) {
    return invalid('Thông tin vượt quá độ dài cho phép.')
  }

  if (!normalizePhone(lead.phone)) {
    return invalid('Số điện thoại không hợp lệ.')
  }

  return { ok: true, value: lead }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }

    return entities[character]
  })
}

export function renderLeadEmail(lead: StoredLead): {
  subject: string
  text: string
  html: string
} {
  const submittedAt = new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    dateStyle: 'medium',
    timeStyle: 'medium',
  }).format(new Date(lead.createdAt))

  const text = [
    'Có khách hàng mới đăng ký tư vấn.',
    `Mã lead: ${lead.id}`,
    `Thời gian: ${submittedAt}`,
    `Họ tên: ${lead.fullName}`,
    `Điện thoại: ${lead.phone}`,
    `Nhu cầu: ${lead.need}`,
    `Trang nguồn: ${lead.sourcePath}`,
  ].join('\n')

  const phoneTarget = normalizePhone(lead.phone)
  const phoneHtml = phoneTarget
    ? `<a href="${escapeHtml(`tel:${phoneTarget}`)}">${escapeHtml(lead.phone)}</a>`
    : escapeHtml(lead.phone)

  const html = `
    <h1>Có khách hàng mới đăng ký tư vấn</h1>
    <dl>
      <dt>Mã lead</dt><dd>${escapeHtml(lead.id)}</dd>
      <dt>Thời gian</dt><dd>${escapeHtml(submittedAt)}</dd>
      <dt>Họ tên</dt><dd>${escapeHtml(lead.fullName)}</dd>
      <dt>Điện thoại</dt><dd>${phoneHtml}</dd>
      <dt>Nhu cầu</dt><dd>${escapeHtml(lead.need)}</dd>
      <dt>Trang nguồn</dt><dd>${escapeHtml(lead.sourcePath)}</dd>
    </dl>
  `.trim()

  return {
    subject: `Khách hàng mới: ${lead.fullName}`,
    text,
    html,
  }
}

const MAX_BODY_BYTES = 4 * 1024

function jsonError(message: string, status: number): Response {
  return Response.json({ success: false, message }, { status })
}

export async function handleCreateLead(
  request: Request,
  services: LeadServices,
): Promise<Response> {
  if (request.method !== 'POST') {
    return Response.json(
      { success: false, message: 'Phương thức không được hỗ trợ.' },
      { status: 405, headers: { Allow: 'POST' } },
    )
  }

  const contentType = request.headers.get('content-type')
  if (contentType?.split(';', 1)[0].trim().toLowerCase() !== 'application/json') {
    return jsonError('Nội dung yêu cầu không hợp lệ.', 400)
  }

  const declaredLength = Number(request.headers.get('content-length'))
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return jsonError('Nội dung yêu cầu quá lớn.', 400)
  }

  let body: string
  try {
    body = await request.text()
  } catch {
    return jsonError('Không thể đọc nội dung yêu cầu.', 400)
  }

  if (new TextEncoder().encode(body).byteLength > MAX_BODY_BYTES) {
    return jsonError('Nội dung yêu cầu quá lớn.', 400)
  }

  let payload: unknown
  try {
    payload = JSON.parse(body)
  } catch {
    return jsonError('Nội dung JSON không hợp lệ.', 400)
  }

  const validation = validateLeadPayload(payload)
  if (!validation.ok) {
    return jsonError(validation.error, 400)
  }

  const lead: StoredLead = {
    ...validation.value,
    id: services.randomUUID(),
    createdAt: services.now().toISOString(),
  }

  try {
    await services.repository.insert(lead)
  } catch {
    return jsonError('Không thể gửi đăng ký lúc này. Vui lòng thử lại sau.', 500)
  }

  const notification = (async () => {
    let messageId: string
    try {
      messageId = await services.notifier.send(lead)
    } catch (error) {
      services.logNotification({
        leadId: lead.id,
        outcome: 'provider_failed',
        errorCode: 'NOTIFICATION_SEND_FAILED',
      })
      await services.repository.markEmailFailed(
        lead.id,
        String(error).slice(0, 300),
        services.now().toISOString(),
      )
      return
    }

    try {
      await services.repository.markEmailSent(
        lead.id,
        messageId,
        services.now().toISOString(),
      )
    } catch {
      // The provider accepted this email. Preserve pending for reconciliation;
      // a failed status or another send would misrepresent that outcome.
      services.logNotification({
        leadId: lead.id,
        outcome: 'sent_status_write_failed',
        messageId,
        errorCode: 'SENT_STATUS_WRITE_FAILED',
      })
      return
    }

    services.logNotification({ leadId: lead.id, outcome: 'sent', messageId })
  })()

  services.defer(notification)

  return Response.json(
    {
      success: true,
      message: 'Đăng ký thành công. MHP sẽ liên hệ với bạn sớm.',
    },
    { status: 202 },
  )
}
