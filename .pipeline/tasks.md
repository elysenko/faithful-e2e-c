# Pipeline Task Decomposition

## Summary
FaithfulC Recipe Box is a greenfield single-container full-stack app: a TypeScript React (Vite + React Router) SPA served by a Node/Express + TypeScript REST API backed by PostgreSQL. It provides JWT-based `full_auth` (login/signup/logout with first user → admin), per-user recipe CRUD with title/ingredients/steps, substring search, favorites filtering, and robust 401/404/503 handling. The image runs on port 8080 with SPA base path `/faithful-e2e-c/`.

## Surface contract
**Public routes (no auth):**
- `POST /api/auth/login` — verify creds, return JWT + user (401 on bad creds)
- `POST /api/auth/signup` — create user (first user → `admin`, rest → `user`), return JWT
- `GET /api/health` — liveness, always 200
- `GET /api/health/deep` — runs `SELECT 1`, 503 if DB down

**Guarded API routes (`requireAuth`, user-scoped):**
- `GET /api/auth/me` — current user
- `POST /api/auth/logout`
- `GET /api/recipes?q=&favorite=true` — list, ordered `updated_at desc`
- `POST /api/recipes` — create (201), zod validation (400)
- `GET /api/recipes/:id` — owner-scoped (404 if absent)
- `PUT /api/recipes/:id` — update (400 on invalid, 404 if absent)
- `PATCH /api/recipes/:id/favorite` — toggle/set favorite
- `DELETE /api/recipes/:id` — delete (204, 404 if absent)

**Admin API routes (admin role):**
- `GET /api/admin/settings` — list service/config keys with masked values + configured status
- `PATCH /api/admin/settings` — upsert key/value pairs

**Client routes (SPA, base `/faithful-e2e-c/`):**
- `/login` — LoginPage (public) — `flow: login`
- `/signup` — SignupPage (public) — `flow: signup`
- `/` — RecipeListPage (guarded), query params `?q=<search>&fav=1&modal=new` — `flow: recipe-list`
- `/recipes/:id` — RecipeDetailPage (guarded), edit mode `?edit=1` — `flow: recipe-detail`
- `/admin/settings` — admin settings page (admin only)
- `*` — NotFoundPage — `flow: not-found`

**Entities:**
- `User` — `id`, `username` (unique), `password_hash`, `role` (`admin`|`user`, default `user`), `created_at`
- `Recipe` — `id` (uuid), `user_id` (FK), `title` (required), `ingredients` (text, newline-delimited), `steps` (text, newline-delimited), `favorite` (bool, default false), `created_at`, `updated_at`
- `SystemSetting` — `key`, `value`, `updatedAt`

## db_agent tasks
- [ ] Create `server/src/db.ts` — `pg` Pool from `DATABASE_URL`; query helper that maps connection failures to a typed `DbUnavailableError`.
- [ ] Create `server/src/migrate.ts` — idempotent migrations: `CREATE EXTENSION IF NOT EXISTS pgcrypto`; `CREATE TABLE IF NOT EXISTS users(id serial pk, username text unique not null, password_hash text not null, role text not null default 'user', created_at timestamptz default now())`.
- [ ] In `migrate.ts`, create `recipes(id uuid default gen_random_uuid() pk, user_id int references users(id), title text not null, ingredients text not null, steps text not null, favorite boolean not null default false, created_at timestamptz default now(), updated_at timestamptz default now())`.
- [ ] Add indexes: `CREATE INDEX ON recipes (user_id)`, `CREATE INDEX ON recipes (user_id, favorite)`, `CREATE INDEX ON recipes (user_id, lower(title))` (NFR p95 < 500ms).
- [ ] Enforce `full_auth` role model on `users`: `role text` constrained to `admin`|`user` with default `user`; first signup gets `admin` (enforced in backend, schema default `user`).
- [ ] Seed demo user in `migrate.ts` via bcrypt from `DEMO_USERNAME`/`DEMO_PASSWORD` (default `demo`/`demo1234`) if absent.
- [ ] Add `SystemSetting` table — `key text primary key, value text not null, updated_at timestamptz` (for admin settings backing `postgresql` + `minio` deployments).

## backend_agent tasks
- [ ] Create `server/package.json` + `server/tsconfig.json` — deps `express`, `pg`, `jsonwebtoken`, `bcryptjs`, `zod`, `dotenv`; dev `typescript`, `@types/*`, `tsx`.
- [ ] Create `server/src/auth/jwt.ts` — sign/verify JWT (HS256, `JWT_SECRET`).
- [ ] Create `server/src/auth/middleware.ts` — `requireAuth` → 401 if `Authorization: Bearer` missing/invalid; attach `req.user`. Add admin-role guard for `/api/admin/*`.
- [ ] Create `server/src/routes/auth.ts` — `POST /api/auth/login` (bcrypt verify, 401 on bad creds), `POST /api/auth/signup` (first user → `admin`, others → `user`), `GET /api/auth/me` (guarded), `POST /api/auth/logout`.
- [ ] Create `server/src/validation.ts` — zod schemas: recipe (title/ingredients/steps non-empty) + auth payloads.
- [ ] Create `server/src/routes/recipes.ts` — `GET /api/recipes?q=&favorite=true` (user-scoped, `lower(title) LIKE`, ordered `updated_at desc`); `POST` (validate → 400, insert → 201); `GET /:id` (owner-scoped, 404); `PUT /:id` (validate → 400, 404); `PATCH /:id/favorite`; `DELETE /:id` (204, 404). Apply `requireAuth` to all recipe routes.
- [ ] Create `server/src/middleware/errors.ts` — central handler: `ZodError`→400 `{error, fields}`, `DbUnavailableError`→503 `{error:"Service Unavailable"}`, not-found→404, unknown→500.
- [ ] Create `server/src/routes/health.ts` — `GET /api/health` (200 always), `GET /api/health/deep` (`SELECT 1` → 503 if DB down).
- [ ] Create `server/src/index.ts` — bootstrap: run `migrate()` on boot (log + continue if DB down), mount routers under `/api`, serve `client/dist` static + SPA fallback for non-API GETs, listen on `PORT||8080`.
- [ ] Create `server/src/lib/config.ts` — `resolveConfig(key)`: reads `process.env[key]` first; if equal to `PLACEHOLDER_CONFIGURE_IN_SETTINGS` or absent, reads `SystemSetting` DB row; returns null if neither set.
- [ ] Create `server/src/routes/admin/settings.ts` — `GET /api/admin/settings` (list `postgresql` + `minio` config keys with masked values + configured status), `PATCH /api/admin/settings` (upsert key/value pairs, admin role required).

## ui_agent tasks
- [ ] Create `client/package.json`, `client/tsconfig.json`, `client/vite.config.ts` — React + Vite + React Router + TS; dev proxy `/api`→`localhost:8080`; `base: '/faithful-e2e-c/'`.
- [ ] Create `client/index.html`, `client/src/main.tsx`, `client/src/App.tsx`, `client/src/styles.css` — router with `data.flow` node on every route.
- [ ] Create `client/src/auth/AuthContext.tsx` + `RequireAuth.tsx` — JWT in localStorage; `login/logout/user`; guard redirects to `/login` when no valid token.
- [ ] Create `client/src/pages/LoginPage.tsx` (`flow: login`) — posts creds, store token → redirect `/`, 401 → "Invalid credentials", demo-credentials hint.
- [ ] Create `client/src/pages/SignupPage.tsx` (`flow: signup`) — analogous to login; store token → redirect `/`.
- [ ] Create `client/src/pages/RecipeListPage.tsx` (`flow: recipe-list`) + `RecipeCard.tsx`, `FavoriteToggle.tsx`, `EmptyState.tsx` — grid of cards; debounced search → `?q=`; favorites toggle → `?fav=1`; empty result → EmptyState; "Add recipe" → `?modal=new` with `RecipeForm`; inline 400 errors; card favorite toggle.
- [ ] Create `client/src/pages/RecipeDetailPage.tsx` (`flow: recipe-detail`) — full title/ingredients/steps + favorite toggle; `?edit=1` → editable `RecipeForm` (`PUT`, 400 inline); delete confirm → `DELETE` → redirect `/`; 404 → NotFound state.
- [ ] Create `client/src/components/RecipeForm.tsx` — shared create/edit form with inline validation error display.
- [ ] Create `client/src/pages/NotFoundPage.tsx` (`flow: not-found`).
- [ ] Create `client/src/components/Header.tsx` — shows "FaithfulC" + logout on all authenticated pages; admin nav link visible only to admins.
- [ ] Create `client/src/components/ErrorBanner.tsx` — global error banner (503 → "Service temporarily unavailable").
- [ ] Create `client/src/pages/AdminSettingsPage.tsx` at `/admin/settings` (admin only) — lists `postgresql` and `minio` with configured/unconfigured badge + per-service credential forms wired to `GET`/`PATCH /api/admin/settings`.

## service_agent tasks
- [ ] Create `client/src/api/client.ts` — fetch wrapper attaching `Authorization: Bearer`; base path-relative `api/`; 401 → redirect `/login`; 503 → trigger `ErrorBanner`.
- [ ] Add typed API functions for auth: `login`, `signup`, `me`, `logout` consumed by AuthContext/pages.
- [ ] Add typed API functions for recipes: list (with `q`/`favorite` params), create, get, update, favorite toggle, delete — matching the surface contract.
- [ ] Add typed API functions for admin settings: `getSettings`, `patchSettings` for the AdminSettingsPage.

## tester tasks
- [ ] Auth: login with demo creds → 200 + token + redirect `/`; bad creds → 401 + error; unauthenticated `/api/recipes` → 401; unauthenticated page nav → redirect `/login`; signup first user → `admin`.
- [ ] CRUD/validation: create/list/get/update/delete round-trip; missing title/ingredients/steps on create and edit → 400, no persistence.
- [ ] Search/favorites: `?q=` filters by title substring; no match → EmptyState + zero cards; `?fav=1` shows only favorites; toggle persists across reload.
- [ ] Not found: `GET` unknown `/recipes/:id` → 404 state.
- [ ] 503: stop Postgres → load/save/search/delete return 503 + banner; `/api/health` stays 200; `/api/health/deep` → 503.
- [ ] Admin settings: non-admin blocked from `/api/admin/settings`; admin can list + PATCH `postgresql`/`minio` config keys.
- [ ] NFR: seed ~100 recipes, measure `GET /api/recipes` p95 < 500ms (index-backed).
- [ ] Build: `docker build` succeeds; container serves SPA on 8080 with base `/faithful-e2e-c/` and connects to Postgres.

## Open questions
- The `<spec_integrations>` input contains a placeholder/garbage entry derived from the "None" integrations text; treated as **no integrations** per the spec (PostgreSQL/MinIO are first-party infrastructure). No integration client modules created.
- `minio` appears in `<spec_deployments>` but the spec body does not describe any object-storage usage (no upload/download flows). It is surfaced only as an admin-settings credential row; confirm whether recipe images or file uploads are intended, otherwise MinIO remains unused.
- Spec does not define admin-specific screens beyond `/admin/settings`; confirm no additional admin dashboard is required.
