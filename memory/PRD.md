# Arak Executive Platform — PRD

## Problem Statement
Build executive monitoring platform for Arak Group CEO office combining task management + project management + delegation/approval + KPIs + RAG status + timeline visualization. Role-based hierarchical access for 5 executives + admin.

## Architecture
- Backend: FastAPI + Motor (MongoDB async) + JWT cookie auth + bcrypt
- Frontend: React 19 + react-router + axios + recharts + Tailwind + shadcn
- Arabic RTL, Tajawal/Cairo fonts, Luxury Dark theme (#0A0D14 + #D4AF37 gold)

## User Personas & Access
| Role | Sees |
|---|---|
| admin | Everything + user management |
| ceo (د. علي العتيبي) | All sectors |
| vp_development | development, arak_development, academy, digital, corporate |
| vp_investment | investment only |
| dev_manager | arak_development only |
| tracker | All sectors (read-focused) |

## Implemented (Feb 2026, iter 1)
- JWT auth with httpOnly cookies + Authorization header fallback
- 6 pre-seeded executive accounts (password: Arak@2026)
- 8 seed projects across all sectors, 32 seed tasks
- Dashboard: 6 KPI cards, RAG pie chart, sector bar chart, task status, sector progress area chart, recent projects table
- Projects: card grid, filters, RAG badges, create modal, detail view with tabs (overview/tasks/updates)
- Tasks: Kanban board (5 columns), priority dots, status change buttons, approval action, create modal
- Reports: radar chart, budget pie, dual-bar chart, status breakdown, sector summary table
- Team: avatar grid with role-color badges
- Admin: user CRUD, role change, activate/deactivate, create new users
- Arak Group logo integrated in sidebar + login page

## Backlog (Future)
- P1: Real-time online presence widget
- P1: Internal messaging + sticky notes
- P1: Document center with file upload (object storage)
- P2: Email/WhatsApp integration for progress capture
- P2: AI-powered recommendation engine
- P2: Activity log timeline view
