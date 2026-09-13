# Lead Form D1 Email Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Persist every valid consultation request in Cloudflare D1 and notify `0xkong2610@gmail.com` through Resend.

**Architecture:** A focused React `QuoteForm` posts to a same-origin Worker endpoint. The Worker validates and stores the lead synchronously, then defers Resend delivery and records its outcome. Core behavior is dependency-injected for fast unit tests; Cloudflare-specific D1 and Resend adapters stay at the runtime boundary.

**Tech Stack:** React 19, TypeScript 6, Vite 8, Cloudflare Workers, Cloudflare D1, Resend HTTPS API, Vitest, Testing Library, jsdom

**Spec:** `docs/superpowers/specs/2026-09-13-lead-form-d1-email-design.md`

## Global Constraints

- D1 persistence is the source of truth and must complete before a `202` response.
- Email delivery is asynchronous and must never remove or lose an accepted lead.
- The fixed recipient is `0xkong2610@gmail.com`.
- `RESEND_API_KEY` is stored only as a Cloudflare secret.
- The browser cannot select the recipient or access email credentials.
- Do not store visitor IP addresses.
- Do not automatically retry browser submissions or failed emails in this version.
- All SQL values use prepared-statement bindings and all visitor-controlled email HTML is escaped.

---

### Task 1: Test Harness and Lead Application Service

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `vitest.config.ts`
- Create: `test/setup.ts`
- Create: `worker/leads.test.ts`
- Create: `worker/leads.ts`

**Interfaces:**
- Produces: `LeadInput`, `StoredLead`, `LeadRepository`, and `LeadNotifier` types.
- Produces: `validateLeadPayload(value: unknown): ValidationResult`.
- Produces: `renderLeadEmail(lead: StoredLead): { subject: string; text: string; html: string }`.
- Produces: `handleCreateLead(request: Request, services: LeadServices): Promise<Response>`.
- `LeadServices` supplies `repository`, `notifier`, `defer`, `randomUUID`, and `now` so tests use real application behavior without Cloudflare globals.

- [ ] **Step 1: Install the test dependencies and scripts**

Run:

```bash
npm install --save-dev vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

Add these scripts to `package.json`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

Create `vitest.config.ts` with the React plugin, the existing `@` alias, `globals: true`, and `setupFiles: ['./test/setup.ts']`. Create `test/setup.ts` containing:

```ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 2: Write failing validation and email-rendering tests**

Create `worker/leads.test.ts` with table-driven assertions that:

```ts
expect(validateLeadPayload({
  fullName: '  Nguyen Van A  ',
  phone: ' 090 123 4567 ',
  need: ' Nhap hang ',
  sourcePath: '/',
  website: '',
})).toEqual({
  ok: true,
  value: {
    fullName: 'Nguyen Van A',
    phone: '090 123 4567',
    need: 'Nhap hang',
    sourcePath: '/',
  },
})
```

Reject missing visible fields, names over 100 characters, phones over 30 characters, needs over 500 characters, source paths over 200 characters, non-object input, a filled `website` honeypot, and phone values outside 8–15 digits after normalization. Assert that `renderLeadEmail()` converts `<script>` in every visitor-controlled field to escaped text and includes the lead ID and Vietnam-local submission time.

- [ ] **Step 3: Run the focused tests and confirm RED**

Run:

```bash
npm test -- worker/leads.test.ts
```

Expected: FAIL because `worker/leads.ts` and its exports do not exist.

- [ ] **Step 4: Implement validation and safe email rendering**

Create `worker/leads.ts` with discriminated validation results and these exact limits:

```ts
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
```

Use a local `escapeHtml()` that escapes `&`, `<`, `>`, `"`, and `'`. Format the email time with `Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', dateStyle: 'medium', timeStyle: 'medium' })`.

- [ ] **Step 5: Add failing service-flow tests**

Use in-memory fakes implementing:

```ts
export interface LeadRepository {
  insert(lead: StoredLead): Promise<void>
  markEmailSent(id: string, messageId: string, updatedAt: string): Promise<void>
  markEmailFailed(id: string, error: string, updatedAt: string): Promise<void>
}

export interface LeadNotifier {
  send(lead: StoredLead): Promise<string>
}
```

Assert that `handleCreateLead()`:

- Returns `400` for malformed JSON, non-JSON content, invalid input, and honeypot content without inserting or notifying.
- Returns `400` for request bodies larger than 4 KiB and `405` for non-POST methods.
- Inserts exactly one trimmed lead and returns `202` with `{ "success": true, "message": "Đăng ký thành công. MHP sẽ liên hệ với bạn sớm." }`.
- Calls the supplied `defer()` only after insertion.
- Returns `500` and does not defer notification when insertion throws.
- Marks the lead `sent` with the provider ID on successful notification.
- Marks the lead `failed` with an error truncated to 300 characters when notification throws.

- [ ] **Step 6: Run service tests and confirm RED**

Run:

```bash
npm test -- worker/leads.test.ts
```

Expected: FAIL because `handleCreateLead()` is not implemented.

- [ ] **Step 7: Implement the minimal application service**

Add:

```ts
export type LeadServices = {
  repository: LeadRepository
  notifier: LeadNotifier
  defer(promise: Promise<void>): void
  randomUUID(): string
  now(): Date
}
```

Reject a declared `Content-Length` over 4 KiB, then read the request text and reject it if the actual encoded body exceeds 4 KiB before parsing JSON. Create `StoredLead` with `randomUUID()` and `now().toISOString()`. Await `repository.insert()`, create one notification promise that marks `sent` or `failed`, pass it to `defer()`, then return `202`. Return Vietnamese JSON errors without including exception messages.

- [ ] **Step 8: Run tests and commit**

Run:

```bash
npm test -- worker/leads.test.ts
npm run lint
```

Expected: all focused tests PASS and lint exits zero.

Commit:

```bash
git add package.json package-lock.json vitest.config.ts test/setup.ts worker/leads.ts worker/leads.test.ts
git commit -m "feat: add tested lead application service"
```

---

### Task 2: Cloudflare D1 and Resend Runtime Adapters

**Files:**
- Create: `worker/cloudflare-leads.test.ts`
- Create: `worker/cloudflare-leads.ts`
- Modify: `worker/index.ts`
- Modify: `wrangler.jsonc`
- Modify: `worker-configuration.d.ts` through `npm run cf-typegen`
- Create: `migrations/0001_create_leads.sql`

**Interfaces:**
- Consumes: `StoredLead`, `LeadRepository`, `LeadNotifier`, `renderLeadEmail()`, and `handleCreateLead()` from `worker/leads.ts`.
- Produces: `createD1LeadRepository(db: D1Database): LeadRepository`.
- Produces: `createResendNotifier(apiKey: string, from: string, recipient: string, fetcher?: typeof fetch): LeadNotifier`.
- Produces route: `POST /api/leads`.
- Produces: local `RuntimeEnv` type extending generated bindings with `RESEND_API_KEY: string` because secret names are not inferred by Wrangler type generation.

- [ ] **Step 1: Write failing adapter tests**

Create `worker/cloudflare-leads.test.ts`. Use a recording D1 fake whose `prepare().bind().run()` captures SQL and parameters. Assert:

- `insert()` binds all lead values and initial status `pending`.
- `markEmailSent()` writes `sent`, message ID, and update timestamp.
- `markEmailFailed()` writes `failed`, bounded error, and update timestamp.
- `createResendNotifier()` posts to `https://api.resend.com/emails` with bearer authentication, fixed recipient `0xkong2610@gmail.com`, configured sender, and rendered text/HTML.
- A Resend `{ "id": "email_123" }` response returns `email_123`.
- Non-2xx responses and a 2xx response without an ID throw a bounded generic error.

- [ ] **Step 2: Run adapter tests and confirm RED**

Run:

```bash
npm test -- worker/cloudflare-leads.test.ts
```

Expected: FAIL because `worker/cloudflare-leads.ts` does not exist.

- [ ] **Step 3: Implement D1 and Resend adapters**

Use D1 prepared statements with these operations:

```sql
INSERT INTO leads (
  id, full_name, phone, need, source_path, email_status, created_at
) VALUES (?, ?, ?, ?, ?, 'pending', ?)
```

```sql
UPDATE leads
SET email_status = 'sent', email_message_id = ?, email_error = NULL, email_updated_at = ?
WHERE id = ?
```

```sql
UPDATE leads
SET email_status = 'failed', email_error = ?, email_updated_at = ?
WHERE id = ?
```

The Resend adapter must set `Authorization: Bearer ${apiKey}` and `Content-Type: application/json`, and send `{ from, to: [recipient], subject, text, html }`.

- [ ] **Step 4: Create the D1 database and migration**

Run:

```bash
npx wrangler d1 create mhp-logistic-leads --location apac --binding DB --update-config
npx wrangler d1 migrations create DB create_leads
```

Rename the generated migration to `migrations/0001_create_leads.sql` if Wrangler uses a different zero-padded prefix, and write:

```sql
CREATE TABLE leads (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL CHECK(length(full_name) BETWEEN 1 AND 100),
  phone TEXT NOT NULL CHECK(length(phone) BETWEEN 1 AND 30),
  need TEXT NOT NULL CHECK(length(need) BETWEEN 1 AND 500),
  source_path TEXT NOT NULL CHECK(length(source_path) BETWEEN 1 AND 200),
  email_status TEXT NOT NULL DEFAULT 'pending'
    CHECK(email_status IN ('pending', 'sent', 'failed')),
  email_message_id TEXT,
  email_error TEXT,
  created_at TEXT NOT NULL,
  email_updated_at TEXT
);

CREATE INDEX leads_created_at_idx ON leads(created_at DESC);
```

Add a non-secret Wrangler variable:

```json
"vars": {
  "LEAD_EMAIL_FROM": "MHP Logistic <onboarding@resend.dev>"
}
```

- [ ] **Step 5: Wire the Worker route**

Change `worker/index.ts` to accept `(request, env, ctx)`. Preserve `/api/health`; route `/api/leads` to `handleCreateLead()` using the D1 repository, Resend notifier, `ctx.waitUntil`, `crypto.randomUUID`, and the fixed recipient. If `RESEND_API_KEY` or `LEAD_EMAIL_FROM` is absent, the database insert still succeeds and the deferred notifier marks the lead failed.

- [ ] **Step 6: Generate bindings, apply the local migration, and run tests**

Run:

```bash
npm run cf-typegen
npx wrangler d1 migrations apply DB --local
npm test -- worker/leads.test.ts worker/cloudflare-leads.test.ts
npm run build
```

Expected: migration applies once, all Worker tests PASS, and TypeScript/Vite build succeeds.

- [ ] **Step 7: Commit**

```bash
git add worker worker-configuration.d.ts wrangler.jsonc migrations
git commit -m "feat: persist leads and send email notifications"
```

---

### Task 3: Interactive Consultation Form

**Files:**
- Create: `src/components/QuoteForm.test.tsx`
- Create: `src/components/QuoteForm.tsx`
- Modify: `src/App.tsx`
- Modify: `src/App.css`

**Interfaces:**
- Consumes: same-origin `POST /api/leads`.
- Produces: `QuoteForm` React component with no required props.
- Sends: `{ fullName, phone, need, sourcePath: window.location.pathname, website }`.

- [ ] **Step 1: Write failing form tests**

Add `// @vitest-environment jsdom` to `src/components/QuoteForm.test.tsx`. With Testing Library and `userEvent`, assert:

- The three visible inputs and submit button render with existing Vietnamese labels.
- Empty submit shows required-field errors and does not call `fetch`.
- Valid submit calls `/api/leads` once with `method: 'POST'`, JSON content type, and the exact payload.
- While the promise is pending, the button is disabled and reads `Đang gửi...`; a second click does not create another request.
- A `202` clears visible inputs and displays the success message.
- A non-2xx response or rejected fetch preserves input values and displays `Không thể gửi đăng ký. Vui lòng thử lại.`.
- A visually hidden `website` input exists with `tabIndex={-1}` and `autoComplete="off"`.

- [ ] **Step 2: Run form tests and confirm RED**

Run:

```bash
npm test -- src/components/QuoteForm.test.tsx
```

Expected: FAIL because `QuoteForm.tsx` does not exist.

- [ ] **Step 3: Implement the controlled form**

Create `QuoteForm.tsx` using `useState` for the four fields, `idle | submitting | success | error` status, and per-field validation. Use `aria-invalid`, `aria-describedby`, an `aria-live="polite"` result message, `autoComplete="name"` for the name, and `autoComplete="tel"` plus `inputMode="tel"` for phone. Parse response JSON defensively but use stable local fallback messages.

- [ ] **Step 4: Replace the inert form and style states**

Import and render `<QuoteForm />` in `App.tsx` where the current form calls only `preventDefault()`. Preserve the `.quote-form` structure and responsive grid. Add CSS for disabled buttons, validation messages, result states, and a honeypot class positioned outside the viewport.

Add Chinese mappings in `chineseText` for `Đang gửi...`, the success message, the retry message, and each required-field message so the existing document translator continues to cover the form.

- [ ] **Step 5: Run tests, lint, and build**

Run:

```bash
npm test -- src/components/QuoteForm.test.tsx
npm test
npm run lint
npm run build
```

Expected: all tests PASS, lint exits zero, and the production build succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/components/QuoteForm.tsx src/components/QuoteForm.test.tsx src/App.tsx src/App.css
git commit -m "feat: connect consultation form to lead API"
```

---

### Task 4: Deployment Setup, Smoke Test, and Operator Notes

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes: `DB`, `RESEND_API_KEY`, and `LEAD_EMAIL_FROM` Worker bindings.
- Produces: documented setup, migration, inspection, and deployment commands.

- [ ] **Step 1: Document exact operator commands**

Add a `Lead capture` section to `README.md` explaining that the Resend account must use `0xkong2610@gmail.com` while `onboarding@resend.dev` is the sender. Document:

```bash
npx wrangler secret put RESEND_API_KEY
npx wrangler d1 migrations apply DB --local
npx wrangler d1 migrations apply DB --remote
npx wrangler d1 execute DB --remote --command "SELECT id, full_name, phone, need, email_status, created_at FROM leads ORDER BY created_at DESC LIMIT 20"
npm run deploy
```

Also explain how to replace `LEAD_EMAIL_FROM` with an address on a Resend-verified production domain.

- [ ] **Step 2: Verify locally before external configuration**

Run:

```bash
npm test
npm run lint
npm run build
```

Expected: all tests PASS, lint exits zero, and build succeeds.

- [ ] **Step 3: Configure the Resend secret**

Have the operator create a Resend API key in the Resend dashboard. Run `npx wrangler secret put RESEND_API_KEY` and paste it only into Wrangler's hidden prompt. Never place the key in chat, shell history, `.dev.vars`, source code, or documentation.

- [ ] **Step 4: Apply production migration and deploy**

Run:

```bash
npx wrangler d1 migrations apply DB --remote
npm run deploy
```

Expected: the migration reports success and Wrangler returns the deployed Worker URL/version.

- [ ] **Step 5: Perform the end-to-end smoke test**

Submit a uniquely identifiable lead through the deployed home-page form. Verify the form displays success, the D1 query returns one matching row with `email_status = 'sent'`, and `0xkong2610@gmail.com` receives exactly one message containing the matching lead ID and phone number.

- [ ] **Step 6: Commit the operator documentation**

```bash
git add README.md
git commit -m "docs: document lead notification operations"
```

- [ ] **Step 7: Final verification**

Run:

```bash
npm test
npm run lint
npm run build
git status --short
```

Expected: tests PASS, lint exits zero, build succeeds, and the working tree contains no uncommitted implementation changes.
