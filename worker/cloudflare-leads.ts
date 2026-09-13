import {
  renderLeadEmail,
  type LeadNotifier,
  type LeadRepository,
} from './leads'

const RESEND_ENDPOINT = 'https://api.resend.com/emails'
const MAX_EMAIL_ERROR_LENGTH = 300
const EMAIL_FAILURE_MESSAGE = 'Email notification failed.'

export function createD1LeadRepository(db: D1Database): LeadRepository {
  return {
    async insert(lead) {
      await db
        .prepare(
          `INSERT INTO leads (
            id, full_name, phone, need, source_path, email_status, created_at
          ) VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
        )
        .bind(
          lead.id,
          lead.fullName,
          lead.phone,
          lead.need,
          lead.sourcePath,
          lead.createdAt,
        )
        .run()
    },

    async markEmailSent(id, messageId, updatedAt) {
      await db
        .prepare(
          `UPDATE leads
          SET email_status = 'sent', email_message_id = ?, email_error = NULL, email_updated_at = ?
          WHERE id = ?`,
        )
        .bind(messageId, updatedAt, id)
        .run()
    },

    async markEmailFailed(id, error, updatedAt) {
      await db
        .prepare(
          `UPDATE leads
          SET email_status = 'failed', email_error = ?, email_updated_at = ?
          WHERE id = ?`,
        )
        .bind(error.slice(0, MAX_EMAIL_ERROR_LENGTH), updatedAt, id)
        .run()
    },
  }
}

export function createResendNotifier(
  apiKey: string,
  from: string,
  recipient: string,
  fetcher: typeof fetch = fetch,
): LeadNotifier {
  return {
    async send(lead) {
      const email = renderLeadEmail(lead)
      const response = await fetcher(RESEND_ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: [recipient],
          ...email,
        }),
      })

      if (!response.ok) {
        throw new Error(EMAIL_FAILURE_MESSAGE)
      }

      let result: unknown
      try {
        result = await response.json()
      } catch {
        throw new Error(EMAIL_FAILURE_MESSAGE)
      }

      if (
        typeof result !== 'object' ||
        result === null ||
        !('id' in result) ||
        typeof result.id !== 'string' ||
        result.id.length === 0
      ) {
        throw new Error(EMAIL_FAILURE_MESSAGE)
      }

      return result.id
    },
  }
}
