# Architecture

## Stacks Requested
- `backend` — NestJS + Prisma + PostgreSQL REST API (JWT auth)
- `web` — React + Vite SPA (single-container with backend)

## Scaffold Status
- ✅ `backend` — newly scaffolded from `template-backend` into `backend/`
- ✅ `web` — newly scaffolded from `template-web` into `web/` (frontend/ and backend structure)

## Platform Directories
| Platform | Directory | Template Source |
|---|---|---|
| backend | `backend/` | `template-backend` (NestJS + Prisma + JWT auth) |
| web | `web/` | `template-web` (frontend/ + backend/ + nginx.conf) |

## Project Layout
```
.
├── backend/               # NestJS API (JWT auth, Prisma, PostgreSQL)
│   ├── src/
│   │   ├── auth/          # JWT signup/login/me/logout
│   │   ├── health/        # GET /api/health, /api/health/deep
│   │   ├── prisma/        # PrismaService
│   │   └── main.ts        # Entry point, port 8080
│   └── prisma/
│       └── schema.prisma  # User + Recipe models (to be added by coder)
├── web/
│   ├── frontend/          # React + Vite SPA shell
│   └── backend/           # (reference; active backend is top-level backend/)
├── Dockerfile             # Replace placeholder nginx → multi-stage build
├── k8s/                   # Kubernetes manifests
├── colossus.yaml          # Build manifest for deploy agents
└── ATLAS_STACK.md         # Stack rules for all agents
```

## Next Steps for Developer
1. **Edit `.env`**: copy `backend/.env.template` to `backend/.env` and fill in `DATABASE_URL` and `JWT_SECRET`.
2. **Start PostgreSQL**: `docker-compose up -d postgres` (or use provisioned cluster).
3. **Add Recipe model**: extend `backend/prisma/schema.prisma` with `Recipe` model per plan.
4. **Run migrations**: `cd backend && npx prisma migrate dev --name init`
5. **Run seed**: `cd backend && npx prisma db seed`
6. **Build frontend**: `cd web/frontend && npm install && npm run build` (output to `frontend/dist`)
7. **Start backend**: `cd backend && npm run start:dev`
8. **Update Dockerfile**: replace nginx placeholder with multi-stage Node + Vite build.
9. **K8s probes**: add `readinessProbe`/`livenessProbe` on `/api/health` to `k8s/deployment.yaml`.

## Template Sources
- Backend: `/app/scaffold-templates/template-backend/` — NestJS 10, Prisma, passport-jwt, class-validator, Swagger
- Web: `/app/scaffold-templates/template-web/` — frontend (Angular shell, replace with React/Vite per plan) + nginx.conf
