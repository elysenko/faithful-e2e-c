# Architecture

## Requested stack
- `backend` — NestJS + Prisma + PostgreSQL (template-backend)
- `web` — Angular + NestJS full-stack web template (template-web)

## Scaffolding status
- `backend/` — ✅ **newly scaffolded** from `template-backend` (NestJS + Prisma + PostgreSQL)
- `web/` — ✅ **newly scaffolded** from `template-web` (Angular frontend + NestJS backend)

## Platform locations
| Platform | Directory | Notes |
|---|---|---|
| Backend API | `backend/` | NestJS, Prisma ORM, PostgreSQL |
| Web frontend | `web/frontend/` | Angular 19 (per template) |
| Web backend | `web/backend/` | NestJS (per template) |

## ⚠️ Plan vs template mismatch
The scope plan calls for **React (Vite + React Router) + Node/Express + TypeScript** in a
single container on port 8080. The scaffolded templates provide Angular + NestJS.
The coder agent must replace template contents with the planned stack:
- `client/` — React + Vite + React Router (replaces `web/frontend/`)
- `server/` — Express + TypeScript (replaces both `backend/` and `web/backend/`)

## Template sources
- `backend/` ← `/app/scaffold-templates/template-backend/`
- `web/` ← `/app/scaffold-templates/template-web/`

## Next steps
1. Edit `backend/.env` (no `.env.template` was present — create manually with `DATABASE_URL`, `JWT_SECRET`)
2. Implement the Express + React stack per the plan (coder agent handles this)
3. Update `colossus.yaml` to reflect the actual Express/Vite setup (port 8080, single container)
4. Update `.colossus-acceptance.json` `expect_text` with real front-page content after coding
5. Build: `docker build .` — multi-stage (Vite → Node runtime)
6. Migrate: `DATABASE_URL=... npx prisma migrate dev` (once DB is available)
