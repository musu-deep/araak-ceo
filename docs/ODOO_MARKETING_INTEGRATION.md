# ARAAK CEO OFFICE 360 — Render, Marketing & Odoo

## Adopted production gateway

The institutional gateway is:

```text
https://ceo-office-platform.onrender.com
```

ARAAK CEO OFFICE 360 owns institutional authentication, executive permissions, and the central API consumed by ARAAK Marketing & Tenders.

## Production architecture now

```text
ARAAK Marketing & Tenders
  institutional login ─────────────┐
  employee directory ──────────────┤
  opportunities / tenders ─────────┤
  private attachments ─────────────┤
                                   ↓
                    ARAAK CEO OFFICE 360 / Render
                    /api/auth/login
                    /api/employees
                    /api/marketing
                                   ↓
                      CEO PostgreSQL database
```

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

## Marketing deployment

The marketing frontend uses the Render CEO gateway as its canonical enterprise-record endpoint. The Supabase institutional-access function also routes CEO authentication and employee-directory calls to Render.

Recommended deployment variables:

```env
# Marketing frontend
VITE_ARAAK_CEO_API_URL=https://ceo-office-platform.onrender.com

# Supabase institutional-access Edge Function
ARAAK_CEO_API_URL=https://ceo-office-platform.onrender.com
```

On the Render CEO service, `CORS_ORIGINS` must include the exact production origin of the Marketing & Tenders frontend.

## Rollout order

1. Merge and deploy the CEO OFFICE gateway changes to Render.
2. Confirm existing CEO routes still work: login, users, messages, meetings, documents, projects/tasks as currently configured.
3. Confirm authenticated `GET /api/employees` returns the platform directory while Odoo is disabled.
4. Confirm `POST /api/marketing` can list and create a test opportunity.
5. Merge and deploy the Marketing & Tenders routing changes.
6. Confirm institutional login from Marketing uses Render and opportunities/tenders are persisted in CEO PostgreSQL.
7. Keep Odoo disabled until the Odoo subscription/deployment exposes the supported external API.
8. When API access becomes available, activate the server-side connector in read-only mode and validate mapping before any approved write-back.
