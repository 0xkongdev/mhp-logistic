import { createD1LeadRepository, createResendNotifier } from './cloudflare-leads'
import { handleCreateLead, type LeadNotifier } from './leads'

const LEAD_EMAIL_RECIPIENT = 'mhplogistics@gmail.com'

interface RuntimeEnv extends Env {
  RESEND_API_KEY: string
}

function createLeadNotifier(env: RuntimeEnv): LeadNotifier {
  if (!env.RESEND_API_KEY || !env.LEAD_EMAIL_FROM) {
    return {
      async send() {
        throw new Error('Email notification is not configured.')
      },
    }
  }

  return createResendNotifier(
    env.RESEND_API_KEY,
    env.LEAD_EMAIL_FROM,
    LEAD_EMAIL_RECIPIENT,
  )
}

export default {
  async fetch(
    request: Request,
    env: RuntimeEnv,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname === '/api/health') {
      return Response.json({ status: 'ok' })
    }

    if (url.pathname === '/api/leads') {
      return handleCreateLead(request, {
        repository: createD1LeadRepository(env.DB),
        notifier: createLeadNotifier(env),
        logNotification: (result) => console.log({ event: 'lead_notification', ...result }),
        defer: (promise) => ctx.waitUntil(promise),
        randomUUID: () => crypto.randomUUID(),
        now: () => new Date(),
      })
    }

    return Response.json({ error: 'Not found' }, { status: 404 })
  },
} satisfies ExportedHandler<RuntimeEnv>
