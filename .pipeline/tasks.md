# Pipeline Task Decomposition

## Summary
"FaithfulC" is a single-container full-stack recipe box: a NestJS + Prisma REST API (JWT auth, PostgreSQL) that also serves a React + Vite SPA on port 8080, replacing the nginx placeholder. Authenticated users own recipes (title, ingredients, steps, favorite flag), can create/read/update/delete them, search by title (case-insensitive substring), and filter by favorite. A demo user is seeded for the primary login path. Auth is `full_auth`: JWT Bearer with bcrypt hashing, public `/login` + `/signup`, first signup user becomes admin.

## Surface contract

### Backend routes (global prefix `/api`)
- `POST /api/auth/signup` — email + password (≥8); first user role=`admin`, else `user`; 409 on duplicate email.
- `POST /api/auth/login` — verify bcrypt; returns `{ token, user }`; 401 on invalid.
- `POST /api/auth/logout` — 204, client discards token.
- `GET /api/auth/me` — current authenticated user.
- `GET /api/recipes?q=<term>&favorite=1` — list owned recipes (cards: `id,title,isFavorite`); title `contains` + favorite filters.
- `POST /api/recipes` — create (`title,ingredients,steps` required); 400 if missing.
- `GET /api/recipes/:id` — owned full detail; 404 if missing/not owned.
- `PATCH /api/recipes/:id` — update; required fields non-empty; 400 if cleared; 404 if missing.
- `PATCH /api/recipes/:id/favorite` — toggle `isFavorite`, returns new state.
- `DELETE /api/recipes/:id` — hard delete; 204; 404 if missing.
- `GET /api/health` — liveness.
- `GET /api/health/deep` — DB `SELECT 1`; 503 if down.
- `GET /api/admin/settings` — list service/config keys with masked values + configured status (admin only).
- `PATCH /api/admin/settings` — upsert key-value pairs (admin only).
- Public routes: `/api/auth/*`, `/api/health`, `/api/health/deep`; all others guarded (401 without token).

### Frontend routes
- `/login` (public), `/signup` (public).
- `/` — RecipeList (protected).
- `/recipes/new` — RecipeNew (protected).
- `/recipes/:id` — RecipeDetail (protected).
- `/recipes/:id/edit` — RecipeEdit (protected).
- `/admin/settings` — admin settings page (admin only).
- `*` — NotFound (404).

### Entities
- `User { id, email (unique), passwordHash, role, createdAt }`
- `Recipe { id, userId, title, ingredients, steps, isFavorite, createdAt, updatedAt }` — indexes on `userId`, `title`.
- `SystemSetting { key, value, updatedAt }`

## db_agent tasks
- [ ] Create `backend/prisma/schema.prisma` with PostgreSQL datasource and Prisma client generator.
- [ ] Define `enum UserRole { ADMIN USER }` and `User { id String @id @default(uuid()); email String @unique; passwordHash String; role UserRole @default(USER); createdAt DateTime @default(now()) }` (full_auth: default USER, first signup promoted to ADMIN in backend logic).
- [ ] Define `Recipe { id String @id @default(uuid()); userId String; title String; ingredients String; steps String; isFavorite Boolean @default(false); createdAt DateTime @default(now()); updatedAt DateTime @updatedAt; @@index([userId]); @@index([title]) }`.
- [ ] Define `SystemSetting { key String @id; value String; updatedAt DateTime @updatedAt }` for admin-configurable service settings.
- [ ] Generate the initial Prisma migration for User, Recipe, and SystemSetting.
- [ ] Create `backend/prisma/seed.ts` — idempotent seed of demo user (`demo@faithfulc.app` / `demodemo1`, overridable via `DEMO_EMAIL`/`DEMO_PASSWORD`) with bcrypt-hashed password; upsert so re-runs are safe.

## backend_agent tasks
- [ ] Create backend project config: `backend/package.json`, `tsconfig.json`, `tsconfig.build.json`, `nest-cli.json`, `.dockerignore` with NestJS + Prisma + auth deps.
- [ ] Create `backend/src/prisma/prisma.module.ts` and `prisma.service.ts` (`PrismaService extends PrismaClient` with `onModuleInit` connect).
- [ ] Create `backend/src/common/all-exceptions.filter.ts` — global filter mapping `PrismaClientInitializationError` and connection codes `P1001`/`P1017` → HTTP 503 `{ message: "The recipe service is temporarily unavailable. Please try again." }`; other Nest exceptions pass through.
- [ ] Create `backend/src/health/health.controller.ts` — `GET /api/health` (liveness) and `GET /api/health/deep` (DB `SELECT 1`, 503 if down); both `@Public()`.
- [ ] Create auth module `backend/src/auth/*` — `auth.module.ts`, `auth.controller.ts`, `auth.service.ts`, `jwt.strategy.ts`, `jwt-auth.guard.ts`, `dto/login.dto.ts`, `dto/signup.dto.ts`. Implement signup (email+password ≥8; first user role=ADMIN, else USER; 409 dup), login (bcrypt verify; 401 invalid; returns `{ token, user }`), logout (204), `GET /api/auth/me`.
- [ ] Wire `JwtAuthGuard` as a global guard with a `@Public()` decorator exempting `/api/auth/*` and `/api/health*`; unauthenticated non-public request → 401.
- [ ] Create admin guard (role check for `ADMIN`) and protect the `(admin)` route group / `/api/admin/*` endpoints.
- [ ] Create recipes module `backend/src/recipes/*` — `recipes.module.ts`, `recipes.controller.ts`, `recipes.service.ts`, `dto/create-recipe.dto.ts`, `dto/update-recipe.dto.ts`. All queries scope to authenticated `userId`.
- [ ] Implement `GET /api/recipes?q=&favorite=` — owned recipes with title `contains` (`mode: insensitive`) + `isFavorite` filters; return cards (`id,title,isFavorite`).
- [ ] Implement `POST /api/recipes` (`@IsNotEmpty` on title/ingredients/steps; 400 → not saved), `GET /api/recipes/:id` (full detail; 404 if not owned), `PATCH /api/recipes/:id` (validate non-empty; 400 if cleared; 404 if missing), `PATCH /api/recipes/:id/favorite` (toggle, return new state), `DELETE /api/recipes/:id` (204; 404 if missing).
- [ ] Create `backend/src/main.ts` — global prefix `/api`, `ValidationPipe({ whitelist, transform })`, register global exception filter, CORS, `ServeStaticModule`/express static serving `frontend/dist` with SPA fallback to `index.html` for non-`/api` routes, listen on `process.env.PORT ?? 8080`.
- [ ] Create `backend/src/app.module.ts` wiring Prisma, Auth, Recipes, Health, admin settings, static serving, and global guard/filter providers.
- [ ] Create `backend/lib/config.ts` with `resolveConfig(key: string): string | null` — reads `process.env[key]` first; if value equals `PLACEHOLDER_CONFIGURE_IN_SETTINGS` or absent, reads `SystemSetting` DB row; returns null if neither set.
- [ ] Implement `GET /api/admin/settings` (list service keys for `postgresql`, `minio` with masked values + configured status) and `PATCH /api/admin/settings` (upsert key-value pairs, ADMIN role required).

## ui_agent tasks
- [ ] Create frontend project config: `frontend/package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`.
- [ ] Create `frontend/src/main.tsx` and `App.tsx` — React Router with routes `/login`, `/signup` (public), `/`, `/recipes/new`, `/recipes/:id`, `/recipes/:id/edit`, `/admin/settings` (protected), `*` → `NotFound`; add `data-flow` node marker per route.
- [ ] Create `frontend/src/auth/AuthContext.tsx` and `ProtectedRoute.tsx` — token persisted in `localStorage`; redirect to `/login` when no token / on 401.
- [ ] Create `frontend/src/components/Header.tsx` rendering "FaithfulC" on every authenticated page, with admin nav link visible only to ADMIN users.
- [ ] Create `frontend/src/routes/Login.tsx` and `Signup.tsx` — public auth screens (full_auth: both part of main app); surface auth errors (401/409).
- [ ] Create `frontend/src/routes/RecipeList.tsx` + `components/{RecipeCard,SearchBar,FavoriteToggle,EmptyState}.tsx` — read/write `?q=` and `?favorite=1` URL params, fetch `/api/recipes`, render cards (title + favorite indicator), card click → `/recipes/:id`, favorite toggle → `PATCH .../favorite`, zero results → `EmptyState`, "Add recipe" action → `/recipes/new`.
- [ ] Create `frontend/src/components/RecipeForm.tsx` and routes `RecipeNew.tsx`, `RecipeDetail.tsx`, `RecipeEdit.tsx`, `NotFound.tsx` — New posts then navigates `/`; Detail shows full title/ingredients/steps + favorite toggle + Edit/Delete + 404 view; Edit PATCHes and blocks save on empty required field; Delete confirms then returns to `/`; client-side + server validation errors shown.
- [ ] Create `frontend/src/routes/AdminSettings.tsx` at `/admin/settings` — list each service in `postgresql`, `minio` with configured/unconfigured badge and per-service credential form; call `GET`/`PATCH /api/admin/settings`. (No integration credential fields — spec declares no third-party integrations.)

## service_agent tasks
- [ ] Create `frontend/src/api/client.ts` — `fetch`/axios wrapper that attaches JWT Bearer from `localStorage`, redirects to `/login` on 401, and surfaces 503 as a friendly banner.
- [ ] Add typed API client methods for auth: signup, login, logout, me.
- [ ] Add typed API client methods for recipes: list (with `q`/`favorite` params), create, getById, update, toggleFavorite, delete.
- [ ] Add typed API client methods for admin settings: get settings, patch settings.
- [ ] Ensure all client calls integrate with `AuthContext` for token lifecycle and error/redirect handling.

## tester tasks
- [ ] Backend e2e (Nest + supertest): signup/login happy path; duplicate email → 409; invalid login → 401; guarded route without token → 401.
- [ ] Backend e2e: recipe CRUD happy paths; missing required field → 400 (not saved); unknown id → 404; recipes scoped to owner.
- [ ] Backend e2e: search filter (`q` case-insensitive substring), favorite filter, combined `?q=&favorite=1`; favorite toggle returns new state.
- [ ] DB-down test: point `DATABASE_URL` at a dead host → assert 503 on `/api/recipes` and `/api/health/deep`.
- [ ] Admin settings e2e: non-admin → 403/guard; admin can GET (masked) and PATCH settings.
- [ ] Frontend e2e (Playwright): demo login → main page; walk each route; empty-search state (no cards); deep-link to missing recipe → 404.
- [ ] Perf: seed ~200 recipes, measure `/api/recipes` + list render; confirm `userId`/`title` indexes keep p95 < 500ms.

## Open questions
- `minio` is listed in provisioned deployments (`spec_deployments`) but is never referenced anywhere in the spec (no object storage, uploads, or images in scope). Admin settings tasks include a MinIO credential form per the settings rules, but no backend integration uses it. Confirm whether MinIO is actually required or a stray provisioning entry — if unused, drop its settings form.
- `spec_integrations` contains a single placeholder entry derived from the spec's literal "Integrations: None". Treated as **no third-party integrations**, so no `lib/integrations/*` client modules were scheduled. Confirm this is correct.
- Spec seeds a demo user and states "first signup user → admin", but does not describe an explicit admin bootstrap for the demo path. Confirm whether the seeded demo user should have `ADMIN` or `USER` role (assumed `USER` unless it is the first account).
- Spec does not define behavior for the `/admin/settings` UI beyond service credential forms; confirm whether editing DB/DATABASE_URL via settings is desired given those are supplied through k8s `app-secrets`.
