# Test Specification

> ⚠️ **Warning:** `.pipeline/surface.json` was not found. The API surface below is
> derived from `requirements/spec.md` (not present either) and the "Surface contract"
> section of `.pipeline/tasks.md`. If a machine-readable `surface.json` is produced
> later, re-run this agent to reconcile endpoint coverage counts.

## Coverage summary
- Total cases: 68
- API endpoints covered: 14 / 14 (from tasks.md surface contract)
- User journeys covered: 12

Endpoints under test (global prefix `/api`):
`POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/logout`,
`GET /api/auth/me`, `GET /api/recipes`, `POST /api/recipes`, `GET /api/recipes/:id`,
`PATCH /api/recipes/:id`, `PATCH /api/recipes/:id/favorite`, `DELETE /api/recipes/:id`,
`GET /api/health`, `GET /api/health/deep`, `GET /api/admin/settings`,
`PATCH /api/admin/settings`.

## API tests

### `POST /api/auth/signup`
- **Happy path**: `{ email: "new@faithfulc.app", password: "password1" }` on an empty user table → `201`; body `{ token, user }`; `user.role === "admin"` (first user promoted); `user.email` echoed; no `passwordHash` in response.
- **Happy path (subsequent user)**: signup a second distinct email after at least one user exists → `201`; `user.role === "user"`.
- **Validation failures**:
  - Missing `email` → `400`.
  - Malformed `email` (`"not-an-email"`) → `400`.
  - `password` shorter than 8 chars (`"short"`) → `400`.
  - Missing `password` → `400`.
- **Auth failures**: none (public route).
- **Idempotency / edge cases**: duplicate email (signup an already-registered address) → `409` with `{ message }`; no second user row created.

### `POST /api/auth/login`
- **Happy path (demo user)**: `{ email: "demo@faithfulc.app", password: "demodemo1" }` (seeded) → `200`; body `{ token, user }`; `token` is a non-empty JWT; `user.email === "demo@faithfulc.app"`.
- **Validation failures**: missing `email` or `password` → `400`.
- **Auth failures**:
  - Correct email, wrong password → `401` with `{ message }`; no token.
  - Unknown email → `401` with `{ message }` (same message as wrong-password, no user-enumeration leak).
- **Idempotency / edge cases**: token returned by two successive logins each authenticate a subsequent `GET /api/auth/me` call.

### `POST /api/auth/logout`
- **Happy path**: authenticated `POST` with valid Bearer token → `204`, empty body (client discards token; server is stateless).
- **Auth failures**: no token → still `204` OR `401` per implementation; assert it does **not** 500. (Route is under `/api/auth/*` public group → expect `204`.)
- **Edge cases**: token remains structurally valid after logout (stateless JWT); logout does not blacklist — documented, not asserted as revocation.

### `GET /api/auth/me`
- **Happy path**: valid Bearer token → `200`; body is current user `{ id, email, role, createdAt }`; no `passwordHash`.
- **Auth failures**: no `Authorization` header → `401`; malformed/expired token → `401`.

### `GET /api/recipes`
- **Happy path**: authenticated user with ≥1 owned recipe, no query params → `200`; array of card objects each shaped `{ id, title, isFavorite }` only (no `ingredients`/`steps`).
- **Search filter**: `?q=cho` matches recipes whose `title` contains "cho" case-insensitively (`"Chocolate Cake"` matches `?q=CHOC`); non-matching titles excluded.
- **Favorite filter**: `?favorite=1` returns only recipes with `isFavorite === true`.
- **Combined filter**: `?q=cake&favorite=1` returns recipes matching both title substring AND favorite.
- **Ownership scoping**: user A cannot see user B's recipes — user A's list excludes recipes created by user B even when titles match `q`.
- **Empty result**: query matching nothing (`?q=zzzzz`) → `200` with `[]`.
- **Auth failures**: no token → `401`.

### `POST /api/recipes`
- **Happy path**: `{ title: "Soup", ingredients: "water, salt", steps: "boil" }` → `201`; body includes generated `id`, `isFavorite === false`, `createdAt`; recipe owned by authenticated user.
- **Validation failures** (recipe NOT persisted in any of these):
  - Missing `title` → `400`.
  - Missing `ingredients` → `400`.
  - Missing `steps` → `400`.
  - Whitespace-only `title` (`"   "`) → `400` (non-empty after trim).
  - Unknown extra property is stripped (whitelist) — sending `{ ...valid, hacker: 1 }` succeeds `201` and `hacker` is not stored.
- **Auth failures**: no token → `401`; recipe not created.

### `GET /api/recipes/:id`
- **Happy path**: owned recipe id → `200`; full detail `{ id, title, ingredients, steps, isFavorite, createdAt, updatedAt }`.
- **Validation / edge cases**: non-existent id → `404`.
- **Auth failures**: recipe owned by another user → `404` (not 403 — existence not leaked); no token → `401`.

### `PATCH /api/recipes/:id`
- **Happy path**: owned recipe, `{ title: "New Title" }` → `200`; response reflects updated field; `updatedAt` changed.
- **Validation failures**:
  - Clearing a required field, `{ title: "" }` → `400`; recipe unchanged in DB.
  - Whitespace-only required field → `400`.
- **Edge cases**: non-existent id → `404`; another user's recipe → `404`.
- **Auth failures**: no token → `401`.

### `PATCH /api/recipes/:id/favorite`
- **Happy path**: owned recipe with `isFavorite=false` → `200`; body reflects new state `{ isFavorite: true }`; second call toggles back to `false`.
- **Edge cases**: non-existent id → `404`; another user's recipe → `404`.
- **Auth failures**: no token → `401`.

### `DELETE /api/recipes/:id`
- **Happy path**: owned recipe id → `204`, empty body; subsequent `GET /api/recipes/:id` → `404` (hard delete).
- **Edge cases**: non-existent id → `404`; already-deleted id (double delete) → `404`; another user's recipe → `404` and row untouched.
- **Auth failures**: no token → `401`.

### `GET /api/health`
- **Happy path**: no auth required (public) → `200`; liveness body (e.g. `{ status: "ok" }`). Returns `200` even when DB is down (liveness must not depend on DB).

### `GET /api/health/deep`
- **Happy path**: DB reachable → `200`; body indicates DB check passed (`SELECT 1`).
- **DB-down**: `DATABASE_URL` pointed at a dead host → `503` with `{ message: "The recipe service is temporarily unavailable. Please try again." }`.
- **Auth failures**: none (public route).

### `GET /api/admin/settings`
- **Happy path**: authenticated ADMIN → `200`; list of service/config keys (`postgresql`, `minio`) with **masked** values and a `configured` boolean per key; secret values never returned in clear.
- **Auth failures**:
  - Authenticated non-admin user → `403`.
  - No token → `401`.

### `PATCH /api/admin/settings`
- **Happy path**: ADMIN sends `{ key: value }` upserts → `200`; a following `GET` shows `configured: true` for the upserted key (value still masked).
- **Validation failures**: malformed body (non-object / wrong types) → `400`.
- **Auth failures**: non-admin → `403`; no token → `401`.

## UI / journey tests

### Journey: Demo login happy path (primary path)
- **Steps**: navigate to `/login` → type `demo@faithfulc.app` / `demodemo1` → submit.
- **Expected outcomes**: redirect to `/` (RecipeList); `Header` shows "FaithfulC"; JWT persisted in `localStorage`; recipe cards (or `EmptyState`) render.
- **Negative path**: wrong password → stay on `/login`; visible error message surfaced from `401`; no token stored.

### Journey: Signup (first user → admin)
- **Steps**: navigate to `/signup` → enter unused email + password ≥8 → submit.
- **Expected outcomes**: authenticated and redirected to `/`; token stored; if first account, admin nav link visible in `Header`.
- **Negative path**: duplicate email → visible `409` error, remain on `/signup`; password < 8 → client-side validation error, no request sent (or `400` surfaced).

### Journey: Protected-route redirect
- **Steps**: with no token in `localStorage`, deep-link directly to `/` (or `/recipes/new`).
- **Expected outcomes**: `ProtectedRoute` redirects to `/login`; protected content not rendered.
- **Negative path**: token present but API returns `401` (expired) → client redirects to `/login` and clears token.

### Journey: Browse recipe list
- **Steps**: log in → land on `/`.
- **Expected outcomes**: one `RecipeCard` per owned recipe (title + favorite indicator); "Add recipe" action visible; `Header` present.
- **Negative path**: user with zero recipes → `EmptyState` message, no cards.

### Journey: Search recipes
- **Steps**: on `/`, type a term into `SearchBar`.
- **Expected outcomes**: URL updates to `?q=<term>`; list re-fetches; only matching titles shown (case-insensitive).
- **Negative path**: term matching nothing → `EmptyState` shown, zero cards; clearing the term restores full list.

### Journey: Filter by favorite
- **Steps**: on `/`, activate favorites filter.
- **Expected outcomes**: URL updates to `?favorite=1`; only favorite recipes rendered. Combined with search → URL `?q=<term>&favorite=1` and both filters applied.
- **Negative path**: no favorites → `EmptyState`.

### Journey: Toggle favorite from card
- **Steps**: on `/`, click `FavoriteToggle` on a card.
- **Expected outcomes**: `PATCH /api/recipes/:id/favorite` called; indicator flips immediately; state persists after reload.
- **Negative path**: API error → indicator reverts; error surfaced (no silent desync).

### Journey: Add a recipe
- **Steps**: click "Add recipe" → `/recipes/new` → fill title/ingredients/steps in `RecipeForm` → submit.
- **Expected outcomes**: `POST /api/recipes`; navigate to `/`; new card appears in the list.
- **Negative path**: submit with an empty required field → client-side validation blocks and/or server `400` shown; no navigation; recipe not created.

### Journey: View recipe detail
- **Steps**: click a card → `/recipes/:id`.
- **Expected outcomes**: full title, ingredients, steps rendered; favorite toggle + Edit + Delete actions present.
- **Negative path**: deep-link to a non-existent/unowned id → API `404` → in-app 404/NotFound view (not a crash).

### Journey: Edit a recipe
- **Steps**: on detail → Edit → `/recipes/:id/edit` → change a field → save.
- **Expected outcomes**: `PATCH /api/recipes/:id`; detail reflects new content.
- **Negative path**: clear a required field → save blocked (client) and/or `400` surfaced; content unchanged.

### Journey: Delete a recipe
- **Steps**: on detail → Delete → confirm.
- **Expected outcomes**: `DELETE /api/recipes/:id`; return to `/`; card no longer listed.
- **Negative path**: cancel at confirm dialog → nothing deleted, stays on detail.

### Journey: Admin settings page
- **Steps**: as ADMIN, use nav link → `/admin/settings`.
- **Expected outcomes**: services (`postgresql`, `minio`) listed with configured/unconfigured badges; per-service credential form; save calls `PATCH /api/admin/settings` and badge flips to configured.
- **Negative path**: non-admin deep-linking `/admin/settings` → blocked/redirected (no admin data shown; API `403`).

## Data integrity tests
- After `POST /api/recipes` succeeds: exactly one new `Recipe` row exists, `userId` = authenticated user, `isFavorite=false`, `createdAt`/`updatedAt` set.
- After any `400` validation failure on create/update: **no** row is created and no existing row is mutated.
- Passwords stored only as bcrypt `passwordHash`; no plaintext password ever persisted or returned in any API response.
- `User.email` is unique — a duplicate signup never creates a second row (enforced by `@unique` + 409).
- `PATCH /api/recipes/:id` bumps `updatedAt`; `createdAt` is immutable across updates.
- `DELETE` is a hard delete — the row is absent afterward (no soft-delete flag), and other users' rows are never affected.
- Ownership invariant: every list/detail/mutation only ever reads or writes rows where `Recipe.userId` = authenticated user.
- Seed idempotency: running the seed multiple times upserts a single demo user (no duplicates), matching `DEMO_EMAIL`/`DEMO_PASSWORD` when overridden.

## Out of scope
- **Token revocation / server-side session invalidation** — logout is stateless (client discards token); spec explicitly says client discards, so revocation is not asserted.
- **Password reset / email verification flows** — not described in the spec.
- **MinIO / object storage behaviour** — provisioned but unreferenced by the spec (open question in tasks.md); only its presence in the admin settings list is checked, not any storage integration.
- **Rate limiting / brute-force lockout on login** — spec is silent.
- **Editing `DATABASE_URL`/`JWT_SECRET` via `/admin/settings`** — supplied via k8s `app-secrets`; open question in tasks.md, so not exercised.
- **Pagination / sorting of `/api/recipes`** — spec defines search + favorite filters only; no pagination contract to test.
- **Kubernetes probe wiring & Dockerfile multi-stage build** — infra/deploy concerns verified operationally (probe hits `/api/health`), not via application test cases here.
- **Performance/load target (p95 < 500ms with ~200 seeded recipes)** — a separate perf pass per the spec's Testing Strategy, not a functional case in this document.
