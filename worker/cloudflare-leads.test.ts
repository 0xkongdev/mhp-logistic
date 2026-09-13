import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  createD1LeadRepository,
  createResendNotifier,
} from './cloudflare-leads'
import worker from './index'
import { renderLeadEmail, type StoredLead } from './leads'

const lead: StoredLead = {
  id: 'lead-123',
  fullName: 'Nguyen Van A',
  phone: '090 123 4567',
  need: 'Nhap hang tu Trung Quoc',
  sourcePath: '/dich-vu',
  createdAt: '2026-09-13T03:04:05.000Z',
}

type RecordedStatement = {
  sql: string
  parameters: unknown[]
}

function createRecordingD1() {
  const statements: RecordedStatement[] = []
  const db = {
    prepare(sql: string) {
      const statement: RecordedStatement = { sql, parameters: [] }
      statements.push(statement)

      return {
        bind(...parameters: unknown[]) {
          statement.parameters = parameters
          return this
        },
        async run() {
          return {}
        },
      }
    },
  } as unknown as D1Database

  return { db, statements }
}

function normalizeSql(sql: string): string {
  return sql.replace(/\s+/g, ' ').trim()
}

type TestRuntimeEnv = {
  DB: D1Database
  LEAD_EMAIL_FROM?: string
  RESEND_API_KEY?: string
}

type TestExecutionContext = {
  waitUntil(promise: Promise<unknown>): void
}

const routeFetch = worker.fetch as unknown as (
  request: Request,
  env: TestRuntimeEnv,
  ctx: TestExecutionContext,
) => Promise<Response> | Response

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('createD1LeadRepository', () => {
  it('inserts all lead values with an initial pending email status', async () => {
    const { db, statements } = createRecordingD1()
    const repository = createD1LeadRepository(db)

    await repository.insert(lead)

    expect(statements).toHaveLength(1)
    expect(normalizeSql(statements[0].sql)).toBe(
      "INSERT INTO leads ( id, full_name, phone, need, source_path, email_status, created_at ) VALUES (?, ?, ?, ?, ?, 'pending', ?)",
    )
    expect(statements[0].parameters).toEqual([
      'lead-123',
      'Nguyen Van A',
      '090 123 4567',
      'Nhap hang tu Trung Quoc',
      '/dich-vu',
      '2026-09-13T03:04:05.000Z',
    ])
  })

  it('marks an email sent with its provider message ID and update time', async () => {
    const { db, statements } = createRecordingD1()
    const repository = createD1LeadRepository(db)

    await repository.markEmailSent(
      'lead-123',
      'email_123',
      '2026-09-13T03:05:00.000Z',
    )

    expect(statements).toHaveLength(1)
    expect(normalizeSql(statements[0].sql)).toBe(
      "UPDATE leads SET email_status = 'sent', email_message_id = ?, email_error = NULL, email_updated_at = ? WHERE id = ?",
    )
    expect(statements[0].parameters).toEqual([
      'email_123',
      '2026-09-13T03:05:00.000Z',
      'lead-123',
    ])
  })

  it('marks an email failed with a bounded error and update time', async () => {
    const { db, statements } = createRecordingD1()
    const repository = createD1LeadRepository(db)

    await repository.markEmailFailed(
      'lead-123',
      'x'.repeat(500),
      '2026-09-13T03:05:00.000Z',
    )

    expect(statements).toHaveLength(1)
    expect(normalizeSql(statements[0].sql)).toBe(
      "UPDATE leads SET email_status = 'failed', email_error = ?, email_updated_at = ? WHERE id = ?",
    )
    expect(statements[0].parameters).toEqual([
      'x'.repeat(300),
      '2026-09-13T03:05:00.000Z',
      'lead-123',
    ])
  })
})

describe('createResendNotifier', () => {
  it('posts a rendered email to the fixed recipient and returns its message ID', async () => {
    const requests: Array<{ input: RequestInfo | URL; init?: RequestInit }> = []
    const fetcher: typeof fetch = async (input, init) => {
      requests.push({ input, init })
      return Response.json({ id: 'email_123' })
    }
    const notifier = createResendNotifier(
      'resend-secret',
      'MHP Logistic <onboarding@resend.dev>',
      '0xkong2610@gmail.com',
      fetcher,
    )

    await expect(notifier.send(lead)).resolves.toBe('email_123')

    expect(requests).toHaveLength(1)
    expect(requests[0].input).toBe('https://api.resend.com/emails')
    expect(requests[0].init).toMatchObject({ method: 'POST' })
    expect(new Headers(requests[0].init?.headers)).toEqual(
      new Headers({
        Authorization: 'Bearer resend-secret',
        'Content-Type': 'application/json',
      }),
    )
    expect(JSON.parse(String(requests[0].init?.body))).toEqual({
      from: 'MHP Logistic <onboarding@resend.dev>',
      to: ['0xkong2610@gmail.com'],
      ...renderLeadEmail(lead),
    })
  })

  it.each([
    ['a non-2xx response', new Response('provider secret details', { status: 500 })],
    ['a 2xx response without an ID', Response.json({})],
  ])('throws a bounded generic error for %s', async (_label, response) => {
    const notifier = createResendNotifier(
      'resend-secret',
      'MHP Logistic <onboarding@resend.dev>',
      '0xkong2610@gmail.com',
      async () => response,
    )

    let thrown: unknown
    try {
      await notifier.send(lead)
    } catch (error) {
      thrown = error
    }

    expect(thrown).toBeInstanceOf(Error)
    expect((thrown as Error).message).toBe('Email notification failed.')
    expect((thrown as Error).message.length).toBeLessThanOrEqual(300)
    expect((thrown as Error).message).not.toContain('provider secret details')
  })
})

describe('Worker routes', () => {
  it('preserves the health endpoint', async () => {
    const response = await routeFetch(
      new Request('https://mhp.test/api/health'),
      {} as TestRuntimeEnv,
      { waitUntil() {} },
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ status: 'ok' })
  })

  it('routes lead submissions through D1 and Resend with the fixed recipient', async () => {
    const { db, statements } = createRecordingD1()
    const deferred: Promise<unknown>[] = []
    const requests: Array<{ input: RequestInfo | URL; init?: RequestInit }> = []
    vi.stubGlobal('fetch', async (input: RequestInfo | URL, init?: RequestInit) => {
      requests.push({ input, init })
      return Response.json({ id: 'email_123' })
    })

    const response = await routeFetch(
      new Request('https://mhp.test/api/leads', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Nguyen Van A',
          phone: '090 123 4567',
          need: 'Nhap hang tu Trung Quoc',
          sourcePath: '/dich-vu',
          website: '',
        }),
      }),
      {
        DB: db,
        LEAD_EMAIL_FROM: 'MHP Logistic <onboarding@resend.dev>',
        RESEND_API_KEY: 'resend-secret',
      },
      { waitUntil: (promise) => deferred.push(promise) },
    )

    expect(response.status).toBe(202)
    expect(statements).toHaveLength(1)
    expect(normalizeSql(statements[0].sql)).toContain("'pending'")
    expect(deferred).toHaveLength(1)

    await Promise.all(deferred)

    expect(requests).toHaveLength(1)
    expect(JSON.parse(String(requests[0].init?.body))).toMatchObject({
      from: 'MHP Logistic <onboarding@resend.dev>',
      to: ['0xkong2610@gmail.com'],
    })
    expect(normalizeSql(statements[1].sql)).toContain("email_status = 'sent'")
    expect(statements[1].parameters[0]).toBe('email_123')
  })

  it('still persists a lead and marks email failed when email configuration is absent', async () => {
    const { db, statements } = createRecordingD1()
    const deferred: Promise<unknown>[] = []
    const unexpectedFetch = vi.fn(async () => Response.json({ id: 'unexpected' }))
    vi.stubGlobal('fetch', unexpectedFetch)

    const response = await routeFetch(
      new Request('https://mhp.test/api/leads', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Nguyen Van A',
          phone: '090 123 4567',
          need: 'Nhap hang tu Trung Quoc',
          sourcePath: '/dich-vu',
          website: '',
        }),
      }),
      { DB: db },
      { waitUntil: (promise) => deferred.push(promise) },
    )

    expect(response.status).toBe(202)
    expect(normalizeSql(statements[0].sql)).toContain("'pending'")
    expect(deferred).toHaveLength(1)

    await Promise.all(deferred)

    expect(unexpectedFetch).not.toHaveBeenCalled()
    expect(statements).toHaveLength(2)
    expect(normalizeSql(statements[1].sql)).toContain("email_status = 'failed'")
    expect(statements[1].parameters[0]).toContain('not configured')
    expect(String(statements[1].parameters[0]).length).toBeLessThanOrEqual(300)
  })
})
