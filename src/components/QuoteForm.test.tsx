// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { QuoteForm } from './QuoteForm'

const successMessage = 'Đăng ký thành công. MHP sẽ liên hệ với bạn sớm.'
const retryMessage = 'Không thể gửi đăng ký. Vui lòng thử lại.'

function createDeferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((complete) => {
    resolve = complete
  })

  return { promise, resolve }
}

async function fillVisibleFields() {
  const user = userEvent.setup()
  await user.type(screen.getByRole('textbox', { name: 'Họ và tên' }), 'Nguyễn Văn A')
  await user.type(screen.getByRole('textbox', { name: 'Số điện thoại' }), '090 123 4567')
  await user.type(screen.getByRole('textbox', { name: 'Nhu cầu nhập hàng' }), 'Nhập linh kiện')
  return user
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  window.history.replaceState({}, '', '/')
})

describe('QuoteForm', () => {
  it('renders the existing Vietnamese fields and submit action with autocomplete hints', () => {
    render(<QuoteForm locale="vi" />)

    expect(screen.getByRole('textbox', { name: 'Họ và tên' })).toHaveAttribute('autocomplete', 'name')
    expect(screen.getByRole('textbox', { name: 'Số điện thoại' })).toHaveAttribute('autocomplete', 'tel')
    expect(screen.getByRole('textbox', { name: 'Nhu cầu nhập hàng' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Đăng ký tư vấn' })).toBeInTheDocument()
  })

  it('shows accessible required-field errors and does not request the API for an empty submission', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()
    render(<QuoteForm locale="vi" />)

    await user.click(screen.getByRole('button', { name: 'Đăng ký tư vấn' }))

    expect(screen.getByText('Vui lòng nhập họ và tên.')).toBeInTheDocument()
    expect(screen.getByText('Vui lòng nhập số điện thoại.')).toBeInTheDocument()
    expect(screen.getByText('Vui lòng nhập nhu cầu nhập hàng.')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Họ và tên' })).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('textbox', { name: 'Số điện thoại' })).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('textbox', { name: 'Nhu cầu nhập hàng' })).toHaveAttribute('aria-invalid', 'true')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('posts the exact lead payload to the same-origin endpoint', async () => {
    window.history.replaceState({}, '', '/dich-vu')
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 202,
      json: vi.fn().mockResolvedValue({ success: true, message: successMessage }),
    })
    vi.stubGlobal('fetch', fetchMock)
    render(<QuoteForm locale="vi" />)
    const user = await fillVisibleFields()

    await user.click(screen.getByRole('button', { name: 'Đăng ký tư vấn' }))

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Nguyễn Văn A',
        phone: '090 123 4567',
        need: 'Nhập linh kiện',
        sourcePath: '/dich-vu',
        website: '',
      }),
    })
  })

  it('disables the sending action and prevents a duplicate request while pending', async () => {
    const pending = createDeferred<{ ok: boolean; status: number; json(): Promise<unknown> }>()
    const fetchMock = vi.fn().mockReturnValue(pending.promise)
    vi.stubGlobal('fetch', fetchMock)
    render(<QuoteForm locale="vi" />)
    const user = await fillVisibleFields()

    await user.click(screen.getByRole('button', { name: 'Đăng ký tư vấn' }))

    const submittingButton = screen.getByRole('button', { name: 'Đang gửi...' })
    expect(submittingButton).toBeDisabled()
    await user.click(submittingButton)
    expect(fetchMock).toHaveBeenCalledTimes(1)

    pending.resolve({
      ok: true,
      status: 202,
      json: async () => ({ success: true, message: successMessage }),
    })
    expect(await screen.findByText(successMessage)).toBeInTheDocument()
  })

  it('clears visible inputs and shows the stable success message after a 202 response with malformed JSON', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 202,
      json: vi.fn().mockRejectedValue(new SyntaxError('invalid JSON')),
    })
    vi.stubGlobal('fetch', fetchMock)
    render(<QuoteForm locale="vi" />)
    const user = await fillVisibleFields()

    await user.click(screen.getByRole('button', { name: 'Đăng ký tư vấn' }))

    expect(await screen.findByText(successMessage)).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Họ và tên' })).toHaveValue('')
    expect(screen.getByRole('textbox', { name: 'Số điện thoại' })).toHaveValue('')
    expect(screen.getByRole('textbox', { name: 'Nhu cầu nhập hàng' })).toHaveValue('')
  })

  it.each([
    ['a non-2xx response', () => Promise.resolve({ ok: false, status: 500, json: async () => ({ message: 'server detail' }) })],
    ['a rejected request', () => Promise.reject(new TypeError('network unavailable'))],
  ])('preserves visible values and shows the stable retry message after %s', async (_scenario, response) => {
    vi.stubGlobal('fetch', vi.fn(response))
    render(<QuoteForm locale="vi" />)
    const user = await fillVisibleFields()

    await user.click(screen.getByRole('button', { name: 'Đăng ký tư vấn' }))

    expect(await screen.findByText(retryMessage)).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Họ và tên' })).toHaveValue('Nguyễn Văn A')
    expect(screen.getByRole('textbox', { name: 'Số điện thoại' })).toHaveValue('090 123 4567')
    expect(screen.getByRole('textbox', { name: 'Nhu cầu nhập hàng' })).toHaveValue('Nhập linh kiện')
  })

  it('includes an unfocusable honeypot with browser autofill disabled', () => {
    render(<QuoteForm locale="vi" />)

    const honeypot = document.querySelector<HTMLInputElement>('input[name="website"]')
    expect(honeypot).toHaveClass('quote-form__honeypot')
    expect(honeypot).toHaveAttribute('tabindex', '-1')
    expect(honeypot).toHaveAttribute('autocomplete', 'off')
  })

  it('updates visible validation errors when the locale changes', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<QuoteForm locale="vi" />)

    await user.click(screen.getByRole('button', { name: 'Đăng ký tư vấn' }))
    expect(screen.getByText('Vui lòng nhập họ và tên.')).toBeInTheDocument()
    expect(screen.getByText('Vui lòng nhập số điện thoại.')).toBeInTheDocument()
    expect(screen.getByText('Vui lòng nhập nhu cầu nhập hàng.')).toBeInTheDocument()

    rerender(<QuoteForm locale="zh" />)
    expect(screen.getByText('请输入姓名。')).toBeInTheDocument()
    expect(screen.getByText('请输入电话号码。')).toBeInTheDocument()
    expect(screen.getByText('请输入采购需求。')).toBeInTheDocument()
    expect(screen.queryByText('Vui lòng nhập họ và tên.')).not.toBeInTheDocument()

    rerender(<QuoteForm locale="vi" />)
    expect(screen.getByText('Vui lòng nhập họ và tên.')).toBeInTheDocument()
    expect(screen.queryByText('请输入姓名。')).not.toBeInTheDocument()
  })

  it('renders validation, submitting, success, and error feedback in Chinese', async () => {
    const pending = createDeferred<{ ok: boolean; status: number; json(): Promise<unknown> }>()
    const fetchMock = vi.fn()
      .mockReturnValueOnce(pending.promise)
      .mockRejectedValueOnce(new TypeError('network unavailable'))
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()
    const { rerender } = render(<QuoteForm locale="zh" />)

    await user.click(screen.getByRole('button', { name: '预约咨询' }))
    expect(screen.getByText('请输入姓名。')).toBeInTheDocument()
    expect(screen.getByText('请输入电话号码。')).toBeInTheDocument()
    expect(screen.getByText('请输入采购需求。')).toBeInTheDocument()

    await user.type(screen.getByRole('textbox', { name: 'Họ và tên' }), '张伟')
    await user.type(screen.getByRole('textbox', { name: 'Số điện thoại' }), '13800138000')
    await user.type(screen.getByRole('textbox', { name: 'Nhu cầu nhập hàng' }), '进口配件')
    await user.click(screen.getByRole('button', { name: '预约咨询' }))
    expect(screen.getByRole('button', { name: '发送中...' })).toBeDisabled()

    pending.resolve({ ok: true, status: 202, json: async () => ({ success: true }) })
    expect(await screen.findByText('登记成功。MHP 将尽快与您联系。')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '预约咨询' })).toBeEnabled()

    rerender(<QuoteForm locale="zh" />)
    await user.type(screen.getByRole('textbox', { name: 'Họ và tên' }), '张伟')
    await user.type(screen.getByRole('textbox', { name: 'Số điện thoại' }), '13800138000')
    await user.type(screen.getByRole('textbox', { name: 'Nhu cầu nhập hàng' }), '进口配件')
    await user.click(screen.getByRole('button', { name: '预约咨询' }))
    expect(await screen.findByText('无法提交登记。请重试。')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '预约咨询' })).toBeEnabled()
  })
})
