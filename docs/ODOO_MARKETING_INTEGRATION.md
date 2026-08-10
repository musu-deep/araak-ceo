# ARAAK CEO OFFICE 360 — Render, Marketing & Odoo

## Adopted production gateway

The institutional gateway is:

```text
https://ceo-office-platform.onrender.com
```

ARAAK CEO OFFICE 360 owns institutional authentication, executive permissions, and the central API consumed by ARAAK Marketing & Tenders.

## Production architecture now

```text
ARAAK Marketing & Tenders browser
            ↓
Supabase Edge Functions
  institutional-access
  enterprise-records
            ↓
ARAAK CEO OFFICE 360 / Render
  /api/auth/login
  /api/employees
  /api/marketing
            ↓
CEO PostgreSQL database
```

The browser does not call the Render API directly for Marketing records. Supabase acts as the authenticated server-side bridge, eliminating a browser CORS dependency between the Marketing frontend and CEO OFFICE.

This path is intentionally independent of Odoo API availability, so the marketing and tender workflow can run even when the Odoo subscription/deployment does not expose an external API.

## Odoo adapter

The backend contains a server-side, version-aware Odoo adapter for API-enabled Odoo deployments. It supports JSON-2 for newer versions and XML-RPC for older supported deployments.

The production-safe default is:

```env
ODOO_ENABLED=false
ODOO_URL=https://your-company.odoo.com
```

Do not use private browser/session endpoints as a substitute for a supported external API.

When supported API access is available, configure a dedicated integration user on Render only:

```env
ODOO_ENABLED=true
ODOO_URL=https://your-company.odoo.com
ODOO_DATABASE=your_database_if_required
ODOO_USERNAME=integration-user@example.com
ODOO_API_KEY=server-side-secret
ODOO_PROTOCOL=auto
ODOO_TIMEOUT=20
ODOO_READ_ONLY=true
```

Never expose `ODOO_API_KEY` through a `VITE_` variable, repository file, frontend bundle, or client-side code.

Start read-only, verify `/api/odoo/test`, `/api/odoo/projects`, `/api/odoo/tasks`, and `/api/employees`, then approve write-back as a separate governance step.

## CEO OFFICE endpoints added

Authenticated users:

- `GET /api/employees` — Odoo employee directory when enabled; otherwise the CEO OFFICE user directory.
- `GET /api/odoo/status` — safe Odoo configuration status without secrets.
- `GET /api/odoo/projects` — future API-enabled Odoo project feed.
- `GET /api/odoo/tasks` — future API-enabled Odoo task feed.
- `POST /api/marketing` — central opportunities/tenders gateway.

CEO / Admin:

- `POST /api/odoo/test` — live Odoo connection test when the connector is enabled.

## Marketing central storage

The `/api/marketing` gateway creates its PostgreSQL schema lazily:

- `marketing_records` — opportunities and tenders plus structured JSON metadata.
- `marketing_attachments` — private attached files linked to the central record.

Supported gateway actions are `list`, `create`, `download`, `sources`, `status`, and `verify_write`.

## Supabase bridge

Two Edge Functions are part of the adopted flow:

- `institutional-access` — validates CEO OFFICE credentials, retrieves the employee directory, and provisions/refreshes the Marketing Supabase session.
- `enterprise-records` — validates an active Marketing member and proxies opportunity/tender operations to the CEO OFFICE `/api/marketing` endpoint using the institutional token.

Set this secret/environment variable for both functions when desired; the Render URL is also the safe code default:

```env
ARAAK_CEO_API_URL=https://ceo-office-platform.onrender.com
```

No `VITE_ARAAK_CEO_API_URL` is required for enterprise records because the browser talks to Supabase, not Render.

## Rollout order

1. Merge and deploy the CEO OFFICE gateway changes to Render.
2. Confirm existing CEO routes still work: login, users, messages, meetings, documents, projects/tasks as currently configured.
3. Confirm authenticated `GET /api/employees` returns the platform directory while Odoo is disabled.
4. Confirm `POST /api/marketing` can list and create a test opportunity.
5. Merge the Marketing & Tenders routing changes.
6. Deploy both Supabase Edge Functions: `institutional-access` and `enterprise-records`.
7. Deploy the Marketing frontend and confirm institutional login plus opportunity/tender persistence through CEO PostgreSQL.
8. Keep Odoo disabled until the Odoo subscription/deployment exposes the supported external API.
9. When API access becomes available, activate the server-side connector in read-only mode and validate mapping before any approved write-back.
