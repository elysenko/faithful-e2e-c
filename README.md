# FaithfulC Recipe Box

Single-container full-stack recipe manager: an **Express + TypeScript** REST API
(`server/`) that also serves the compiled **Angular** SPA (`web/frontend/`),
backed by **PostgreSQL**. JWT auth (`full_auth`), per-user recipe CRUD, search,
favorites, and 401/404/503 handling. Runs on **port 8080**.

## Stack

| Layer    | Location        | Tech                               |
|----------|-----------------|------------------------------------|
| API      | `server/`       | Express, TypeScript, `pg`, JWT     |
| SPA      | `web/frontend/` | Angular 17 (base href `/faithful-e2e-c/`) |
| Database | (external)      | PostgreSQL (via `DATABASE_URL`)    |

> `backend/` and `web/backend/` are leftover scaffold templates and are **not**
> built or deployed (excluded via `.dockerignore`).

## Environment variables

| Var              | Purpose                                | Default     |
|------------------|----------------------------------------|-------------|
| `DATABASE_URL`   | Postgres connection string             | (required for DB ops) |
| `JWT_SECRET`     | HS256 signing secret                   | dev fallback |
| `PORT`           | Listen port                            | `8080`      |
| `STATIC_DIR`     | Directory of built SPA                 | `<dist>/../public` |
| `DEMO_USERNAME`  | Seeded demo user                       | `demo`      |
| `DEMO_PASSWORD`  | Seeded demo password                   | `demo1234`  |

## Demo credentials

```
username: demo
password: demo1234
```

The demo user is seeded idempotently on every boot (password re-asserted each run).

## Develop

```bash
# API
cd server && npm install && npm run dev      # tsx watch on :8080

# SPA
cd web/frontend && npm install && npm start  # ng serve, proxies /api → :8080
```

## Build & run (production, single container)

```bash
docker build -t faithful-e2e-c .
docker run -p 8080:8080 -e DATABASE_URL=postgres://... faithful-e2e-c
```

The multi-stage `Dockerfile` builds the Angular SPA, compiles the server, then
runs `node dist/index.js`, serving the SPA from `./public` and the API under `/api`.

## Health

- `GET /api/health` — liveness, always `200`.
- `GET /api/health/deep` — runs `SELECT 1`; `503` if the database is unreachable.
