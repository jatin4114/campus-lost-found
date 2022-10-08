# CampusFind

A full-stack campus Lost & Found platform: students report lost/found
items, browse and search listings, get automatically surfaced potential
matches, submit claims with supporting evidence, and communicate securely
in real time to resolve ownership. Admins/moderators handle reported
content, user moderation, and keep an audit trail of sensitive actions.

## Features

- **Auth** — JWT access/refresh tokens (rotating, revocable), argon2
  password hashing, email verification (mock email service in dev)
- **Item reporting** — LOST/FOUND items with category/location/date,
  image uploads (local disk in dev, swappable storage abstraction)
- **Search & browse** — server-side search/filter/pagination
- **Claims** — a real state machine (ACTIVE → CLAIM_PENDING → CLAIMED →
  RESOLVED) requiring evidence, with ownership-gated accept/reject
- **Matching engine** — a hand-rolled, deterministic weighted scorer
  (title/description similarity, category, location proximity, date
  decay) — see [`docs/matching-algorithm.md`](docs/matching-algorithm.md)
- **Notifications** — persistent, with unread counts
- **Real-time messaging** — Socket.IO, authenticated, room-membership
  enforced, typing indicators, presence
- **Admin & moderation** — dashboard stats, user suspension, item
  reports with a review workflow, full audit logging
- **Security** — Helmet, CORS, rate limiting, Zod validation everywhere,
  ownership checks in the service layer (not just the UI) — see
  [`docs/security.md`](docs/security.md)
- **Tests** — 19 unit tests (matching algorithm) + 14 integration tests
  (auth, items, claims), all passing
- **API docs** — interactive OpenAPI/Swagger at `/api/docs`

## Architecture

See [`docs/architecture.md`](docs/architecture.md) for the full breakdown.
Short version:

```
React ── HTTPS/REST + Socket.IO ── Express ── services ── repositories ── Prisma ── Postgres (Supabase)
```

## Tech stack

- **Frontend:** React (JavaScript, no TypeScript), Vite, React Router,
  TanStack Query, React Hook Form, Zod, Tailwind CSS, Socket.IO client
- **Backend:** Node.js, Express, Prisma ORM, JWT, argon2, Socket.IO, Zod,
  Helmet, express-rate-limit, Multer, sharp, structured logging via pino/
  pino-http (request-id correlated, pretty-printed in dev, JSON in prod)
- **Database:** PostgreSQL hosted on [Supabase](https://supabase.com) in
  production; a local Postgres container in development (same
  `DATABASE_URL`-driven setup — swapping to Supabase is a one-line change)

## Repository layout

```
campus-lost-found/
├── frontend/   React application (Vite)
├── backend/    Express API, Prisma schema/migrations, tests
├── docs/       architecture, database, api, matching-algorithm, security
└── .github/    CI workflow
```

## Local setup

### 1. Backend

```bash
cd backend
npm install
```

Create `backend/.env` (never commit this file):

```bash
cp .env.example .env
```

Set `DATABASE_URL` — either a local Postgres container:

```bash
docker run -d --name campusfind-postgres \
  -e POSTGRES_USER=campusfind -e POSTGRES_PASSWORD=campusfind -e POSTGRES_DB=campusfind \
  -p 5433:5432 postgres:16-alpine
```
```
DATABASE_URL="postgresql://campusfind:campusfind@localhost:5433/campusfind?schema=public"
```

...or a real Supabase database (see [Supabase setup](#supabase-setup) below). Set
`JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` to any long random strings.

Then:

```bash
npx prisma migrate deploy   # apply migrations
npm run db:seed             # categories, locations, 3 demo users, sample items
npm run dev                 # http://localhost:4000
```

Demo accounts (seeded, password `Password123!`): `alice@campus.edu`,
`bob@campus.edu` (both STUDENT), `admin@campus.edu` (ADMIN).

### 2. Frontend

```bash
cd frontend
npm install
npm run dev   # http://localhost:5173
```

### Supabase setup

1. Create a free project at [supabase.com](https://supabase.com).
2. Copy its pooled connection string into `backend/.env` as `DATABASE_URL`.
3. Run `npx prisma migrate deploy` from `backend/` to apply the schema.

No code changes are needed to switch between local Postgres and Supabase — only
the connection string. See [`docs/database.md`](docs/database.md) for more.

### Environment variables (backend)

| Variable              | Purpose                                   |
|------------------------|--------------------------------------------|
| `NODE_ENV`            | `development` / `test` / `production`     |
| `PORT`                | API port (default 4000)                   |
| `CORS_ORIGIN`         | Allowed frontend origin                   |
| `DATABASE_URL`        | Postgres connection string (Supabase or local)|
| `JWT_ACCESS_SECRET`   | Access token signing secret                |
| `JWT_REFRESH_SECRET`  | Refresh token signing secret                |

## Database migrations & seeding

Migrations live in `backend/prisma/migrations/` — always create one via
Prisma rather than hand-editing the schema in the database:

```bash
npx prisma migrate dev --name <description>   # local dev, creates + applies
npx prisma migrate deploy                       # apply existing migrations (CI/prod)
npm run db:seed                                  # re-run seed data
```

## Tests

```bash
cd backend
npm test          # 19 unit + 14 integration tests (vitest)
npm run lint       # oxlint

cd frontend
npm run lint       # oxlint
npm run build      # production build
```

## API documentation

With the backend running, open **http://localhost:4000/api/docs** for the
interactive Swagger UI (spec source: `backend/openapi.yaml`).

## Docker

```bash
docker compose up --build
```

Runs the frontend (nginx, port 5173) and backend (port 4000). Supabase remains
the hosted Postgres database — `DATABASE_URL` comes from `backend/.env`,
which is never baked into the image or committed. The backend container
applies pending migrations and seeds demo data on startup
(`docker-entrypoint.sh`), so `docker compose up --build` alone gets a fresh
database to a working demo — no manual `prisma migrate deploy`/`db:seed`
step needed first.

## Deployment

`.github/workflows/ci.yml` runs lint + tests + build on every push/PR to
`master`. `.github/workflows/deploy.yml` runs after CI succeeds on `master`
and publishes both images to GitHub Container Registry
(`ghcr.io/<owner>/campusfind-{backend,frontend}`), tagged `latest` and by
commit SHA — no external secrets needed beyond the automatic
`GITHUB_TOKEN`. It deliberately stops there: there's no hosting target
configured yet (no Fly.io/Render/etc. account), so the last step — pulling
the published image onto an actual host — is a follow-up once one is
chosen, pointed at the same Supabase database via `DATABASE_URL`.

## Future improvements

- True background push (service worker + Web Push/VAPID) — real-time
  notifications currently reach any open tab via the existing socket, but
  not a fully closed browser
- A larger, cross-request IDF corpus for the matching engine (currently
  computed per-request from the candidate batch — works well at small
  scale, see `docs/matching-algorithm.md`)
- A map picker for campus locations (lat/lng already drive the matching
  engine's distance calculation)
- Pagination for conversation message history (currently unbounded per
  conversation — fine at low message-per-claim volumes, not indefinitely)
- Frontend E2E tests (component + unit coverage exists; no browser-driven
  end-to-end suite yet)

## License

Personal portfolio project.
