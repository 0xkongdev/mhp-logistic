/// <reference types="node" />
// @vitest-environment jsdom

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { act, cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import App from './App'

const localized = {
  vi: {
    switchLabel: 'VIE',
    heading: 'NHẬN TƯ VẤN & BÁO GIÁ NGAY',
    fields: ['Họ và tên', 'Số điện thoại', 'Nhu cầu nhập hàng'],
    required: ['Vui lòng nhập họ và tên.', 'Vui lòng nhập số điện thoại.', 'Vui lòng nhập nhu cầu nhập hàng.'],
    submit: 'Đăng ký tư vấn',
    submitting: 'Đang gửi...',
    success: 'Đăng ký thành công. MHP sẽ liên hệ với bạn sớm.',
    error: 'Không thể gửi đăng ký. Vui lòng thử lại.',
  },
  zh: {
    switchLabel: '中文',
    heading: '立即获取咨询与报价',
    fields: ['姓名', '电话号码', '采购需求'],
    required: ['请输入姓名。', '请输入电话号码。', '请输入采购需求。'],
    submit: '预约咨询',
    submitting: '发送中...',
    success: '登记成功。MHP 将尽快与您联系。',
    error: '无法提交登记。请重试。',
  },
} as const

function expectStaticFormTranslation(locale: keyof typeof localized) {
  expect(screen.getByText(localized[locale].heading)).toBeInTheDocument()
  for (const name of localized[locale].fields) {
    expect(screen.getByRole('textbox', { name })).toHaveAttribute('placeholder', name)
  }
}

beforeEach(() => {
  window.history.replaceState({}, '', '/')
  sessionStorage.setItem('mhp-logistic-skip-home-popup', 'true')
})

afterEach(() => {
  cleanup()
  localStorage.clear()
  sessionStorage.clear()
  vi.unstubAllGlobals()
})

describe.each(['vi', 'zh'] as const)('App form localization starting in %s', (initialLocale) => {
  const otherLocale = initialLocale === 'vi' ? 'zh' : 'vi'
  const localeRoundTrip = [initialLocale, otherLocale, initialLocale] as const

  it('keeps visible required errors and submit text localized across both direction changes', async () => {
    localStorage.setItem('mhp-logistic-locale', initialLocale)
    const user = userEvent.setup()
    render(<App />)

    const submit = screen.getByRole('button', { name: localized[initialLocale].submit })
    await user.click(submit)

    for (const locale of localeRoundTrip) {
      await user.click(screen.getByRole('button', { name: localized[locale].switchLabel }))
      expectStaticFormTranslation(locale)
      expect(submit).toHaveTextContent(localized[locale].submit)
      localized[locale].fields.forEach((name, index) => {
        expect(screen.getByRole('textbox', { name })).toHaveAccessibleDescription(localized[locale].required[index])
      })
    }
  })

  it.each([
    ['success', 202],
    ['error', 500],
  ] as const)('keeps submitting and %s feedback localized across both direction changes', async (outcome, status) => {
    localStorage.setItem('mhp-logistic-locale', initialLocale)
    let resolveResponse!: (response: Response) => void
    const responsePromise = new Promise<Response>((resolve) => { resolveResponse = resolve })
    const fetchMock = vi.fn(() => responsePromise)
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()
    const { container } = render(<App />)

    const values = ['Nguyen Van A', '0901234567', 'Nhap hang']
    for (const [index, name] of localized[initialLocale].fields.entries()) {
      await user.type(screen.getByRole('textbox', { name }), values[index])
    }
    const submit = screen.getByRole('button', { name: localized[initialLocale].submit })
    await user.click(submit)

    for (const locale of localeRoundTrip) {
      await user.click(screen.getByRole('button', { name: localized[locale].switchLabel }))
      expectStaticFormTranslation(locale)
      expect(submit).toHaveTextContent(localized[locale].submitting)
      expect(submit).toBeDisabled()
    }

    await act(async () => {
      resolveResponse(Response.json({ success: status === 202 }, { status }))
    })

    for (const locale of localeRoundTrip) {
      await user.click(screen.getByRole('button', { name: localized[locale].switchLabel }))
      expectStaticFormTranslation(locale)
      expect(submit).toHaveTextContent(localized[locale].submit)
      expect(submit).toBeEnabled()
      expect(container.querySelector('[aria-live="polite"]')).toHaveTextContent(localized[locale][outcome])
    }
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})

it('renders the quote-form heading with the approved compact typography', () => {
  const style = document.createElement('style')
  style.textContent = readFileSync(resolve('src/App.css'), 'utf8')
  document.head.append(style)

  try {
    render(<App />)

    const heading = screen.getByText(localized.vi.heading)
    const styles = getComputedStyle(heading)

    expect(styles.fontSize).toBe('20px')
    expect(styles.lineHeight).toBe('32px')
    expect(styles.fontWeight).toBe('600')
  } finally {
    style.remove()
  }
})

it('links the support contact details to the matching address, phone, and email', () => {
  render(<App />)
  const footer = within(screen.getByRole('contentinfo'))

  expect(footer.getByRole('link', { name: /Khu phố Giang Liễu, phường Phương Liễu, tỉnh Bắc Ninh\./i })).toHaveAttribute(
    'href',
    'https://www.google.com/maps/search/?api=1&query=Khu%20ph%E1%BB%91%20Giang%20Li%E1%BB%85u%2C%20ph%C6%B0%E1%BB%9Dng%20Ph%C6%B0%C6%A1ng%20Li%E1%BB%85u%2C%20t%E1%BB%89nh%20B%E1%BA%AFc%20Ninh',
  )
  expect(footer.getByRole('link', { name: /0969857874/i })).toHaveAttribute('href', 'tel:0969857874')
  expect(footer.getByRole('link', { name: /mhplogistics@gmail\.com/i })).toHaveAttribute('href', 'mailto:mhplogistics@gmail.com')
})

it('keeps the current header phone number when switching languages', async () => {
  const user = userEvent.setup()
  render(<App />)

  const phoneLink = screen.getByRole('link', { name: 'Số điện thoại: 0969857874' })
  expect(phoneLink).toHaveAttribute('href', 'tel:0969857874')

  await user.click(screen.getByRole('button', { name: localized.zh.switchLabel }))
  expect(phoneLink).toHaveAccessibleName('电话：0969857874')
})
