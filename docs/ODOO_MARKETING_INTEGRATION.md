# ARAAK CEO OFFICE 360 — Odoo + Marketing Integration

The production gateway is `https://ceo-office-platform.onrender.com`.

## Architecture

```text
Odoo
  hr.employee / project.project / project.task / ir.attachment
        ↓
ARAAK CEO OFFICE 360 on Render
  /api/auth/login
  /api/employees
  /api/odoo/status
  /api/odoo/test
  /api/odoo/projects
  /api/odoo/tasks
  /api/marketing
        ↓
ARAAK Marketing & Tenders
  institutional access + opportunities + tenders + attachments
```

ARAAK CEO remains the identity and executive-governance gateway. Odoo stays server-side and its API key must never be exposed through a `VITE_` variable or browser bundle.

## Render environment

Set these variables in the CEO OFFICE Render service:

```env
ODOO_ENABLED=true
ODOO_URL=https://your-company.odoo.com
ODOO_DATABASE=your_database
ODOO_USERNAME=integration@your-company.com
ODOO_API_KEY=server-side-secret
ODOO_PROTOCOL=auto
ODOO_TIMEOUT=20
ODOO_READ_ONLY=true
ODOO_MARKETING_MODEL=project.project
CORS_ORIGINS=https://ceo-office-platform.onrender.com,https://YOUR-MARKETING-DOMAIN
```

Start with `ODOO_READ_ONLY=true`, verify `/api/odoo/test`, employee mapping, projects and tasks, then set `ODOO_READ_ONLY=false` only when write-back for opportunities/tenders is approved.

## Odoo permissions

The dedicated Odoo integration user should have only the models required by the approved scope:

- read: `hr.employee`
- read: `project.project`
- read: `project.task`
- read/write after approval: the model selected by `ODOO_MARKETING_MODEL`
- read/write after approval: `ir.attachment` for private opportunity/tender files

## Marketing deployment

The marketing frontend and Supabase `institutional-access` function should point to:

```env
VITE_ARAAK_CEO_API_URL=https://ceo-office-platform.onrender.com
ARAAK_CEO_API_URL=https://ceo-office-platform.onrender.com
```

The first variable belongs to the marketing frontend deployment. The second belongs to the Supabase Edge Function environment.
