# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

## Lead capture

The consultation form is served by the Cloudflare Worker. It stores each valid
lead in the `DB` D1 binding and sends the notification through Resend. The
Resend account used for the initial setup must be allowed to send to
`mhplogistics@gmail.com`; `onboarding@resend.dev` is only the initial sender.

Set the Resend API key as a Cloudflare secret. Create the key in the Resend
dashboard, then paste it only into Wrangler's hidden prompt. Do not put the
key in chat, shell history, `.dev.vars`, source code, or documentation.

```bash
npx wrangler secret put RESEND_API_KEY
```

Apply the migration locally while developing, then apply it to the production
D1 database before deploying:

```bash
npx wrangler d1 migrations apply DB --local
npx wrangler d1 migrations apply DB --remote
```

Inspect the latest production leads with:

```bash
npx wrangler d1 execute DB --remote --command "SELECT id, full_name, phone, need, email_status, created_at FROM leads ORDER BY created_at DESC LIMIT 20"
```

Deploy the Worker and site assets with:

```bash
npm run deploy
```

`LEAD_EMAIL_FROM` is currently configured as `MHP Logistic
<onboarding@resend.dev>` in `wrangler.jsonc`. For production, verify a sending
domain in Resend, replace that value with an address on the verified domain
(for example, `MHP Logistic <leads@example.com>`), and deploy again. Keep the
recipient as `mhplogistics@gmail.com` unless the Worker code is intentionally
changed.

Worker logs emit structured `lead_notification` events with a lead ID and an
outcome: `sent`, `provider_failed`, or `sent_status_write_failed`. Provider
acceptance includes the message ID; failures use safe error codes without
visitor details or credentials. If Resend accepts an email but writing its
sent status to D1 fails, the Worker leaves the row pending and logs both IDs
for manual reconciliation. Check the provider message before updating that
row; do not resend it automatically. Email notifications have no automatic
retry.
