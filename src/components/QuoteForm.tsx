import { useState, type FormEvent } from 'react'

type Locale = 'vi' | 'zh'
type FormStatus = 'idle' | 'submitting' | 'success' | 'error'
type FieldName = 'fullName' | 'phone' | 'need'
type FieldErrors = Partial<Record<FieldName, string>>

type QuoteFormProps = {
  locale: Locale
}

const formMessages = {
  vi: {
    submit: 'Đăng ký tư vấn',
    submitting: 'Đang gửi...',
    success: 'Đăng ký thành công. MHP sẽ liên hệ với bạn sớm.',
    error: 'Không thể gửi đăng ký. Vui lòng thử lại.',
    required: {
      fullName: 'Vui lòng nhập họ và tên.',
      phone: 'Vui lòng nhập số điện thoại.',
      need: 'Vui lòng nhập nhu cầu nhập hàng.',
    },
  },
  zh: {
    submit: '预约咨询',
    submitting: '发送中...',
    success: '登记成功。MHP 将尽快与您联系。',
    error: '无法提交登记。请重试。',
    required: {
      fullName: '请输入姓名。',
      phone: '请输入电话号码。',
      need: '请输入采购需求。',
    },
  },
} as const

export function QuoteForm({ locale }: QuoteFormProps) {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [need, setNeed] = useState('')
  const [website, setWebsite] = useState('')
  const [status, setStatus] = useState<FormStatus>('idle')
  const [errors, setErrors] = useState<FieldErrors>({})
  const messages = formMessages[locale]

  const clearFieldError = (field: FieldName) => {
    setErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (status === 'submitting') return

    const nextErrors: FieldErrors = {}
    if (!fullName.trim()) nextErrors.fullName = messages.required.fullName
    if (!phone.trim()) nextErrors.phone = messages.required.phone
    if (!need.trim()) nextErrors.need = messages.required.need

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      setStatus('idle')
      return
    }

    setStatus('submitting')

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          phone,
          need,
          sourcePath: window.location.pathname,
          website,
        }),
      })

      await response.json().catch(() => undefined)
      if (response.status !== 202) throw new Error('Lead submission was not accepted')

      setFullName('')
      setPhone('')
      setNeed('')
      setWebsite('')
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <form className="quote-form" onSubmit={handleSubmit} noValidate>
      <strong>NHẬN TƯ VẤN &amp; BÁO GIÁ NGAY</strong>
      <div className="quote-form__grid">
        <div className="quote-form__field">
          <input
            name="fullName"
            aria-label="Họ và tên"
            placeholder="Họ và tên"
            autoComplete="name"
            maxLength={100}
            value={fullName}
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? 'quote-form-full-name-error' : undefined}
            onChange={(event) => {
              setFullName(event.target.value)
              clearFieldError('fullName')
            }}
          />
          {errors.fullName && <span id="quote-form-full-name-error" className="quote-form__validation">{errors.fullName}</span>}
        </div>
        <div className="quote-form__field">
          <input
            name="phone"
            aria-label="Số điện thoại"
            placeholder="Số điện thoại"
            autoComplete="tel"
            inputMode="tel"
            maxLength={30}
            value={phone}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? 'quote-form-phone-error' : undefined}
            onChange={(event) => {
              setPhone(event.target.value)
              clearFieldError('phone')
            }}
          />
          {errors.phone && <span id="quote-form-phone-error" className="quote-form__validation">{errors.phone}</span>}
        </div>
        <div className="quote-form__field">
          <input
            name="need"
            aria-label="Nhu cầu nhập hàng"
            placeholder="Nhu cầu nhập hàng"
            maxLength={500}
            value={need}
            aria-invalid={Boolean(errors.need)}
            aria-describedby={errors.need ? 'quote-form-need-error' : undefined}
            onChange={(event) => {
              setNeed(event.target.value)
              clearFieldError('need')
            }}
          />
          {errors.need && <span id="quote-form-need-error" className="quote-form__validation">{errors.need}</span>}
        </div>
        <button type="submit" disabled={status === 'submitting'}>
          {status === 'submitting' ? messages.submitting : messages.submit}
        </button>
      </div>
      <input
        className="quote-form__honeypot"
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={website}
        onChange={(event) => setWebsite(event.target.value)}
      />
      <div
        className={`quote-form__result${status === 'success' || status === 'error' ? ` quote-form__result--${status}` : ''}`}
        aria-live="polite"
      >
        {status === 'success' ? messages.success : status === 'error' ? messages.error : ''}
      </div>
    </form>
  )
}
