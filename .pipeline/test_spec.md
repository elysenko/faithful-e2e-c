# Test Specification

> ⚠️ **Warning:** `.pipeline/surface.json` was not found. The API surface below was
> derived from the "Surface contract" in `.pipeline/tasks.md` and the approved spec.
> Endpoint/route counts should be re-validated once `surface.json` is generated.

## Coverage summary
- Total cases: 68
- API endpoints covered: 14 / 14 (derived from `tasks.md` surface contract; no `surface.json`)
- User journeys covered: 6

API endpoints under test:
1. `POST /api/auth/login`
2. `POST /api/auth/signup`
3. `GET /api/auth/me`
4. `POST /api/auth/logout`
5. `GET /api/health`
6. `GET /api/health/deep`
7. `GET /api/recipes`
8. `POST /api/recipes`
9. `GET /api/recipes/:id`
10. `PUT /api/recipes/:id`
11. `PATCH /api/recipes/:id/favorite`
12. `DELETE /api/recipes/:id`
13. `GET /api/admin/settings`
14. `PATCH /api/admin/settings`

User journeys under test: login, signup, recipe-list (search/favorites/add), recipe-detail (edit/delete), not-found, admin-settings.

---

## API tests

### `POST /api/auth/login`
- **Happy path**: body `{username:"demo", password:"demo1234"}` (seeded demo creds) → `200`; body `{ token: <non-empty JWT string>, user: { id, username:"demo", role } }`. Token decodes as HS256 and carries the user id.
- **Validation failures**: missing `username` or missing `password` → `400` with `{error, fields}` (zod). Empty-string username/password → `400`.
- **Auth failures**: correct username + wrong password → `401`; unknown username → `401`. Response body carries an error message (used by client "Invalid credentials"); no token returned.
- **Idempotency / edge cases**: repeated logins with the same creds each return a valid token. Content-Type not JSON → `400`.

### `POST /api/auth/signup`
- **Happy path**: first-ever signup `{username:"alice", password:"pw12345678"}` on an empty users table → `200`/`201` with `{ token, user:{ role:"admin" } }` (first user becomes admin). A subsequent signup `{username:"bob", ...}` → user with `role:"user"`.
- **Validation failures**: missing/empty `username` or `password` → `400 {error, fields}`.
- **Auth failures**: signup with an already-taken username (e.g. `demo`) → `409` (or `400`) conflict; no duplicate user created.
- **Idempotency / edge cases**: two concurrent/sequential signups never both receive `admin` — exactly the first persisted user is `admin`.

### `GET /api/auth/me`
- **Happy path**: with a valid `Authorization: Bearer <token>` → `200` with `{ id, username, role }` matching the token subject.
- **Auth failures**: no `Authorization` header → `401`; malformed/invalid/expired token → `401`.
- **Idempotency / edge cases**: token signed with a different `JWT_SECRET` → `401`.

### `POST /api/auth/logout`
- **Happy path**: with valid Bearer token → `200` (or `204`); safe no-op server-side (JWT is stateless, client clears token).
- **Auth failures**: no token → `401`.
- **Idempotency / edge cases**: calling logout twice succeeds both times.

### `GET /api/health`
- **Happy path**: no auth required → `200` always, regardless of DB state. Body indicates liveness (e.g. `{status:"ok"}`).
- **Idempotency / edge cases**: returns `200` even when PostgreSQL is stopped (liveness is independent of DB).

### `GET /api/health/deep`
- **Happy path**: DB reachable → runs `SELECT 1` → `200` (readiness ok).
- **Auth failures**: none (public).
- **Idempotency / edge cases**: PostgreSQL stopped/unreachable → `503 {error:"Service Unavailable"}`.

### `GET /api/recipes`
- **Happy path**: valid token, user owns 3 recipes → `200` with a JSON array of 3 recipe cards ordered by `updated_at desc`. Each item has `{id, title, favorite, ...}`.
- **Validation failures**: `?favorite=` with a non-boolean garbage value is ignored or treated as falsey (returns full list; no 500).
- **Auth failures**: no token → `401`.
- **Idempotency / edge cases**:
  - `?q=chick` → only recipes whose `lower(title) LIKE '%chick%'` for the current user.
  - `?q=<no-match>` → `200` with empty array `[]`.
  - `?favorite=true` → only favorited recipes for the user.
  - Scoping: user A never sees user B's recipes (results filtered by `user_id`).
  - DB down → `503`.

### `POST /api/recipes`
- **Happy path**: valid token + `{title:"Soup", ingredients:"water\nsalt", steps:"boil"}` → `201` with created recipe `{id (uuid), title, ingredients, steps, favorite:false, user_id}`; row persisted and owned by the caller.
- **Validation failures**: missing/empty `title` → `400 {error, fields}` and **no row persisted**; missing/empty `ingredients` → `400`; missing/empty `steps` → `400`. Whitespace-only `title` → `400`.
- **Auth failures**: no token → `401`.
- **Idempotency / edge cases**: DB down → `503`, nothing persisted.

### `GET /api/recipes/:id`
- **Happy path**: owner requests own recipe id → `200` with full `{title, ingredients, steps, favorite}`.
- **Auth failures**: no token → `401`.
- **Idempotency / edge cases**: unknown/non-existent id → `404`; id owned by a different user → `404` (owner-scoped, no leak); malformed uuid → `404` (or `400`); DB down → `503`.

### `PUT /api/recipes/:id`
- **Happy path**: owner sends valid full payload → `200` with updated recipe; `updated_at` advances; persisted changes visible on subsequent `GET`.
- **Validation failures**: empty `title`/`ingredients`/`steps` → `400 {error, fields}`, **no change persisted**.
- **Auth failures**: no token → `401`.
- **Idempotency / edge cases**: unknown id → `404`; other user's id → `404`; DB down → `503`.

### `PATCH /api/recipes/:id/favorite`
- **Happy path**: owner toggles favorite on a non-favorite recipe → `200` with `favorite:true`; toggling again → `favorite:false`. Change persists across reload/subsequent GET.
- **Auth failures**: no token → `401`.
- **Idempotency / edge cases**: unknown id → `404`; other user's id → `404`; DB down → `503`.

### `DELETE /api/recipes/:id`
- **Happy path**: owner deletes own recipe → `204` no body; subsequent `GET /api/recipes/:id` → `404`; item absent from list.
- **Auth failures**: no token → `401`.
- **Idempotency / edge cases**: unknown id → `404`; other user's id → `404` (not deleted); second delete of same id → `404`; DB down → `503`.

### `GET /api/admin/settings`
- **Happy path**: admin token → `200` with a list of config keys (`postgresql`, `minio`) each with a **masked** value and a `configured` boolean status. Raw secret values are never returned in cleartext.
- **Auth failures**: no token → `401`; **non-admin (role `user`) token → `403`** (guarded to admin role).
- **Idempotency / edge cases**: DB down → `503`.

### `PATCH /api/admin/settings`
- **Happy path**: admin token + `{ "postgresql.url": "postgres://..." }` → `200`; value upserted into `SystemSetting`; subsequent `GET` shows `configured:true` for that key (still masked).
- **Validation failures**: malformed body (non-object / non-string values) → `400`.
- **Auth failures**: no token → `401`; non-admin token → `403`.
- **Idempotency / edge cases**: upserting the same key twice updates in place (no duplicate rows); DB down → `503`.

---

## UI / journey tests

### Journey: login (`flow: login`, route `/login`, public)
- **Steps**: navigate to `/login`; observe the demo-credentials hint; type demo username/password; submit.
- **Expected outcomes**: token stored in localStorage; redirect to `/`; Header shows "FaithfulC" + logout. On page reload while authenticated, the user stays on `/` (token restored from localStorage).
- **Negative path**: submitting wrong credentials → stays on `/login`, shows "Invalid credentials", no token stored. Visiting `/login` while already authenticated may redirect to `/`.

### Journey: signup (`flow: signup`, route `/signup`, public)
- **Steps**: navigate to `/signup`; enter a new username/password; submit.
- **Expected outcomes**: on success, token stored, redirect to `/`. First user created in the system is `admin` (admin nav link visible in Header).
- **Negative path**: duplicate username → inline error, no redirect. Empty fields → inline validation error, no request persisted.

### Journey: recipe-list — browse / search / favorites / add (`flow: recipe-list`, route `/`, guarded)
- **Steps**: authenticated user lands on `/`; view card grid; type in search box; toggle favorites filter; click "Add recipe" → fill `RecipeForm` in `?modal=new` → submit.
- **Expected outcomes**:
  - Card grid renders one `RecipeCard` per recipe (title + favorite indicator).
  - Debounced search updates URL `?q=<term>` and list narrows to substring title matches.
  - Favorites toggle sets `?fav=1` and shows only favorited recipes; state reflected in URL.
  - Search with no matches → `EmptyState` message shown, **zero cards** rendered.
  - Add recipe: valid submit closes modal, list refreshes and includes the new recipe.
  - Card favorite toggle calls `PATCH .../favorite`; indicator updates and **persists across page reload**.
- **Negative path**:
  - Unauthenticated navigation to `/` → redirect to `/login` (`RequireAuth`).
  - Add-recipe submit with missing title/ingredients/steps → inline `400` validation errors, modal stays open, nothing added.
  - Backend `503` during load → `ErrorBanner` "Service temporarily unavailable" shown.

### Journey: recipe-detail — view / edit / delete (`flow: recipe-detail`, route `/recipes/:id`, guarded)
- **Steps**: click a card → `/recipes/:id`; view full title/ingredients/steps + favorite toggle; enter edit via `?edit=1`, change fields, save; then delete via confirm.
- **Expected outcomes**:
  - Detail shows full title, newline-delimited ingredients and steps, favorite toggle.
  - Edit mode renders editable `RecipeForm`; valid save issues `PUT`, exits edit mode, shows updated content.
  - Delete button prompts confirmation; confirming issues `DELETE` and redirects to `/`; recipe no longer in list.
- **Negative path**:
  - Navigating to an unknown/other-user `/recipes/:id` → `404` NotFound state shown (from API `404`).
  - Edit save with an empty required field → inline `400` errors, no persistence.
  - Unauthenticated access → redirect to `/login`.
  - `503` on load/save/delete → `ErrorBanner` shown.

### Journey: not-found (`flow: not-found`, route `*`)
- **Steps**: navigate to an unmatched SPA path (e.g. `/faithful-e2e-c/nonsense`).
- **Expected outcomes**: `NotFoundPage` renders with `flow: not-found` marker.
- **Negative path**: n/a (this is the fallback).

### Journey: admin-settings (`route /admin/settings`, admin only)
- **Steps**: as admin, open the admin nav link → `/admin/settings`; view `postgresql` and `minio` rows with configured/unconfigured badges; enter credentials in a service form → save (`PATCH`).
- **Expected outcomes**: rows show masked values + `configured` badge; saving updates the badge to configured after refresh (`GET` re-fetch).
- **Negative path**: a `user`-role account has no admin nav link and, on direct navigation to `/admin/settings`, is blocked/redirected (API returns `403`). Unauthenticated → redirect to `/login`.

---

## Data integrity tests
- After `POST /api/recipes`, exactly one `recipes` row exists with `user_id = caller`, `favorite=false`, and non-null `id` (uuid), `created_at`, `updated_at`.
- A failed create/update (validation `400`) leaves the `recipes` table unchanged (no partial/orphan rows).
- `PUT`/`PATCH favorite` advance `updated_at` (`updated_at >= created_at`); list ordering by `updated_at desc` reflects the most recently mutated recipe first.
- `DELETE` removes exactly the target row and no other user's rows.
- Recipes are strictly user-scoped: no query returns a row whose `user_id` differs from the authenticated caller.
- `users.username` is unique — signup with an existing username never creates a second row.
- Exactly one user holds `role='admin'` as a result of "first signup → admin" (schema default is `user`).
- Seeded demo user exists after migration with a bcrypt `password_hash` (never plaintext); re-running migrations is idempotent (no duplicate demo user, tables/indexes created only if absent).
- `SystemSetting` upsert is keyed by `key` (primary key) — repeated `PATCH` of the same key updates in place, never duplicates.

## Out of scope
- **MinIO / object storage flows** (upload/download): the spec body describes no file-upload feature; `minio` appears only as an admin-settings credential row. Not under functional test beyond the settings key existing. (Reason: spec is silent on any storage flow — see Open question in `tasks.md`.)
- **NFR performance p95 < 500ms**: listed as a benchmark (seed ~100 recipes, measure `GET /api/recipes`), not a pass/fail functional assertion here; treated as a separate perf check. (Reason: requires load-generation harness outside functional scope.)
- **Docker build & container smoke test** (`docker build` succeeds, serves SPA on 8080 with base `/faithful-e2e-c/`): infrastructure/CI concern, verified by the build/deploy stage, not by these functional cases. (Reason: environment-level, not API/UI behaviour.)
- **Ingress base-path rewrite correctness**: asset loading under `/faithful-e2e-c/` depends on deployment ingress config not exercised by app-level tests. (Reason: spec defers this to the ingress rewrite rule.)
- **JWT expiry/refresh semantics beyond valid/invalid**: spec does not define token TTL or refresh; only presence/validity of the token is tested. (Reason: spec silent on token lifetime.)
- **Password strength / rate limiting on auth**: not specified. (Reason: spec defines only non-empty validation.)

---
Wrote .pipeline/test_spec.md (68 cases across 14 endpoints / 6 journeys).
