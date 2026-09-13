import { describe, expect, it } from 'vitest'

import {
  handleCreateLead,
  renderLeadEmail,
  validateLeadPayload,
  type LeadNotifier,
  type LeadRepository,
  type LeadServices,
  type StoredLead,
} from './leads'

const validPayload = {
  fullName: 'Nguyen Van A',
  phone: '090 123 4567',
  need: 'Nhap hang',
  sourcePath: '/',
  website: '',
}

describe('validateLeadPayload', () => {
  it('trims a valid lead and omits the honeypot field', () => {
    expect(
      validateLeadPayload({
        fullName: '  Nguyen Van A  ',
        phone: ' 090 123 4567 ',
        need: ' Nhap hang ',
        sourcePath: '/',
        website: '',
      }),
    ).toEqual({
      ok: true,
      value: {
        fullName: 'Nguyen Van A',
        phone: '090 123 4567',
        need: 'Nhap hang',
        sourcePath: '/',
      },
    })
  })

  it.each([
    ['full name', { ...validPayload, fullName: '   ' }],
    ['phone', { ...validPayload, phone: '' }],
    ['need', { ...validPayload, need: '  ' }],
  ])('rejects a missing visible %s field', (_label, payload) => {
    expect(validateLeadPayload(payload).ok).toBe(false)
  })

  it.each([
    ['full name', { ...validPayload, fullName: 'a'.repeat(101) }],
    ['phone', { ...validPayload, phone: '1'.repeat(31) }],
    ['need', { ...validPayload, need: 'a'.repeat(501) }],
    ['source path', { ...validPayload, sourcePath: `/${'a'.repeat(200)}` }],
  ])('rejects an over-limit %s', (_label, payload) => {
    expect(validateLeadPayload(payload).ok).toBe(false)
  })

  it.each([null, undefined, 'lead', 42, []])(
    'rejects non-object input %#',
    (payload) => {
      expect(validateLeadPayload(payload).ok).toBe(false)
    },
  )

  it('rejects a filled website honeypot', () => {
    expect(
      validateLeadPayload({ ...validPayload, website: 'https://spam.test' }).ok,
    ).toBe(false)
  })

  it.each(['123 456 7', '+84 123 456 789 012 34'])(
    'rejects phone %s outside 8–15 digits after normalization',
    (phone) => {
      expect(validateLeadPayload({ ...validPayload, phone }).ok).toBe(false)
    },
  )
})

describe('renderLeadEmail', () => {
  it('escapes every visitor-controlled field and includes lead metadata', () => {
    const email = renderLeadEmail({
      id: 'lead-123',
      createdAt: '2026-09-13T03:04:05.000Z',
      fullName: '<script>name</script>',
      phone: '<script>phone</script>',
      need: '<script>need</script>',
      sourcePath: '<script>path</script>',
    })

    expect(email.html).not.toContain('<script>')
    expect(email.html).toContain('&lt;script&gt;name&lt;/script&gt;')
    expect(email.html).toContain('&lt;script&gt;phone&lt;/script&gt;')
    expect(email.html).toContain('&lt;script&gt;need&lt;/script&gt;')
    expect(email.html).toContain('&lt;script&gt;path&lt;/script&gt;')
    expect(email.html).toContain('lead-123')
    expect(email.html).toContain('10:04:05 13 thg 9, 2026')
    expect(email.text).toContain('lead-123')
    expect(email.text).toContain('10:04:05 13 thg 9, 2026')
  })
})

class MemoryLeadRepository implements LeadRepository {
  inserted: StoredLead[] = []
  sent: Array<{ id: string; messageId: string; updatedAt: string }> = []
  failed: Array<{ id: string; error: string; updatedAt: string }> = []
  throwOnInsert = false

  constructor(private readonly events: string[]) {}

  async insert(lead: StoredLead): Promise<void> {
    this.events.push('insert')
    if (this.throwOnInsert) {
      throw new Error('database unavailable')
    }
    this.inserted.push(lead)
  }

  async markEmailSent(
    id: string,
    messageId: string,
    updatedAt: string,
  ): Promise<void> {
    this.sent.push({ id, messageId, updatedAt })
  }

  async markEmailFailed(
    id: string,
    error: string,
    updatedAt: string,
  ): Promise<void> {
    this.failed.push({ id, error, updatedAt })
  }
}

class MemoryLeadNotifier implements LeadNotifier {
  leads: StoredLead[] = []
  messageId = 'message-456'
  error: Error | undefined

  constructor(private readonly events: string[]) {}

  async send(lead: StoredLead): Promise<string> {
    this.events.push('notify')
    this.leads.push(lead)
    if (this.error) {
      throw this.error
    }
    return this.messageId
  }
}

function createServiceHarness() {
  const events: string[] = []
  const repository = new MemoryLeadRepository(events)
  const notifier = new MemoryLeadNotifier(events)
  const deferred: Promise<void>[] = []
  const services: LeadServices = {
    repository,
    notifier,
    defer(promise) {
      events.push('defer')
      deferred.push(promise)
    },
    randomUUID: () => 'lead-123',
    now: () => new Date('2026-09-13T03:04:05.000Z'),
  }

  return { deferred, events, notifier, repository, services }
}

function jsonRequest(body: unknown, headers?: HeadersInit): Request {
  return new Request('https://mhp.test/api/leads', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })
}

describe('handleCreateLead', () => {
  it.each([
    [
      'malformed JSON',
      new Request('https://mhp.test/api/leads', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{',
      }),
    ],
    [
      'non-JSON content',
      new Request('https://mhp.test/api/leads', {
        method: 'POST',
        headers: { 'content-type': 'text/plain' },
        body: JSON.stringify(validPayload),
      }),
    ],
    ['invalid input', jsonRequest({ ...validPayload, fullName: '' })],
    [
      'honeypot content',
      jsonRequest({ ...validPayload, website: 'https://spam.test' }),
    ],
  ])('returns 400 for %s without side effects', async (_label, request) => {
    const { deferred, notifier, repository, services } = createServiceHarness()

    const response = await handleCreateLead(request, services)

    expect(response.status).toBe(400)
    expect(repository.inserted).toEqual([])
    expect(notifier.leads).toEqual([])
    expect(deferred).toEqual([])
  })

  it.each([
    [
      'declared size',
      jsonRequest(validPayload, { 'content-length': '4097' }),
    ],
    [
      'encoded body size',
      jsonRequest({ ...validPayload, need: 'ư'.repeat(2049) }),
    ],
  ])('returns 400 when the %s exceeds 4 KiB', async (_label, request) => {
    const { deferred, notifier, repository, services } = createServiceHarness()

    const response = await handleCreateLead(request, services)

    expect(response.status).toBe(400)
    expect(repository.inserted).toEqual([])
    expect(notifier.leads).toEqual([])
    expect(deferred).toEqual([])
  })

  it('returns 405 for a non-POST method', async () => {
    const { services } = createServiceHarness()

    const response = await handleCreateLead(
      new Request('https://mhp.test/api/leads', { method: 'GET' }),
      services,
    )

    expect(response.status).toBe(405)
  })

  it('inserts one trimmed lead before deferring notification and returns 202', async () => {
    const { deferred, events, repository, services } = createServiceHarness()

    const response = await handleCreateLead(
      jsonRequest({
        ...validPayload,
        fullName: '  Nguyen Van A  ',
        phone: ' 090 123 4567 ',
        need: ' Nhap hang ',
      }),
      services,
    )

    expect(response.status).toBe(202)
    await expect(response.json()).resolves.toEqual({
      success: true,
      message: 'Đăng ký thành công. MHP sẽ liên hệ với bạn sớm.',
    })
    expect(repository.inserted).toEqual([
      {
        id: 'lead-123',
        createdAt: '2026-09-13T03:04:05.000Z',
        fullName: 'Nguyen Van A',
        phone: '090 123 4567',
        need: 'Nhap hang',
        sourcePath: '/',
      },
    ])
    expect(deferred).toHaveLength(1)
    expect(events.indexOf('insert')).toBeLessThan(events.indexOf('defer'))
  })

  it('returns 500 without deferring when insertion fails', async () => {
    const { deferred, notifier, repository, services } = createServiceHarness()
    repository.throwOnInsert = true

    const response = await handleCreateLead(jsonRequest(validPayload), services)

    expect(response.status).toBe(500)
    expect(notifier.leads).toEqual([])
    expect(deferred).toEqual([])
    await expect(response.json()).resolves.toEqual({
      success: false,
      message: 'Không thể gửi đăng ký lúc này. Vui lòng thử lại sau.',
    })
  })

  it('marks a successful notification as sent with the provider ID', async () => {
    const { deferred, repository, services } = createServiceHarness()

    await handleCreateLead(jsonRequest(validPayload), services)
    await Promise.all(deferred)

    expect(repository.sent).toEqual([
      {
        id: 'lead-123',
        messageId: 'message-456',
        updatedAt: '2026-09-13T03:04:05.000Z',
      },
    ])
    expect(repository.failed).toEqual([])
  })

  it('marks a failed notification with an error truncated to 300 characters', async () => {
    const { deferred, notifier, repository, services } = createServiceHarness()
    notifier.error = new Error('x'.repeat(400))

    await handleCreateLead(jsonRequest(validPayload), services)
    await Promise.all(deferred)

    expect(repository.sent).toEqual([])
    expect(repository.failed).toHaveLength(1)
    expect(repository.failed[0]).toMatchObject({
      id: 'lead-123',
      updatedAt: '2026-09-13T03:04:05.000Z',
    })
    expect(repository.failed[0].error).toHaveLength(300)
    expect(repository.failed[0].error).toBe(`Error: ${'x'.repeat(293)}`)
  })
})
