# Database

CampusFind uses PostgreSQL (hosted on [Supabase](https://supabase.com) in production)
via Prisma ORM. The schema lives at `backend/prisma/schema.prisma`; every
change goes through a Prisma migration under `backend/prisma/migrations/` —
never a manual `ALTER TABLE`.

## Local development

Development runs against a local Postgres container so migrations can be
authored and tested without touching the hosted Supabase database:

```
docker run -d --name campusfind-postgres \
  -e POSTGRES_USER=campusfind -e POSTGRES_PASSWORD=campusfind -e POSTGRES_DB=campusfind \
  -p 5433:5432 postgres:16-alpine
```

Set `backend/.env` (never committed):

```
DATABASE_URL="postgresql://campusfind:campusfind@localhost:5433/campusfind?schema=public"
```

Then, from `backend/`:

```
npm install
npx prisma migrate dev   # apply migrations
npm run db:seed          # load categories/locations/demo users
```

## Connecting to Supabase instead

Create a Supabase project, copy its pooled connection string into
`DATABASE_URL`, and run `npx prisma migrate deploy` to apply the same
migration history against it. No schema or code changes are required to
switch — only the connection string.

**Also set `DIRECT_URL`** to Supabase's non-pooled connection string (same host
minus `-pooler`). Supabase's pooled connection runs in pgbouncer transaction
mode, which doesn't support the session-level Postgres advisory lock
`prisma migrate` takes — without `directUrl` in `schema.prisma`, `migrate
dev`/`migrate deploy` will hang for ~10s and fail with `P1002`. The app
itself still talks to `DATABASE_URL` (pooled) at runtime; only the Prisma
CLI uses `DIRECT_URL`.

If a migration ever gets stuck on `P1002` even with `DIRECT_URL` set, an
earlier interrupted migrate run may have left an idle connection holding the
advisory lock — check `pg_locks`/`pg_stat_activity` for an idle session and
terminate it (`SELECT pg_terminate_backend(<pid>)`), or just wait: Supabase
auto-suspends idle compute after a few minutes, which clears it too.

**If `migrate dev` refuses with "was modified after it was applied" and offers
only `migrate reset`**: this happens after a migration fails partway (e.g. a
hand-edited SQL file that had a bug on its first attempt), leaving both a
rolled-back row and a later successful row for the same migration name in
`_prisma_migrations` — `migrate dev`'s shadow-database drift check doesn't
like that history shape, even though the actually-applied state is fine.
**Do not run `migrate reset`** against Supabase — it drops and recreates the
whole schema. Instead, hand-write the new migration file directly
(`mkdir prisma/migrations/<timestamp>_<name>/` + a `migration.sql` you write
yourself) and apply it with `prisma migrate deploy`, which only applies
pending files in order and isn't affected by this drift check at all.

## Core entities

`User`, `Campus`, `Location`, `Category`, `Item`, `ItemImage`, `Claim`,
`ClaimEvidence`, `Match`, `Conversation`, `ConversationParticipant`,
`Message`, `Notification`, `Report`, `ModerationAction`, `AuditLog`,
`RefreshToken`. See `schema.prisma` for fields, relations and indexes —
it's the single source of truth for the data model.

## Indexing rationale

Indexes are added for the columns the item-discovery and moderation
endpoints filter/sort on: `Item.type`, `Item.status`, `Item.categoryId`,
`Item.locationId`, `Item.eventDate`, `Item.createdAt`, `User.email`
(unique), `Claim.status`, `Notification.userId`, `Message.conversationId`.

Checked with `EXPLAIN ANALYZE` against the item-search query
(`type`/`status`/`categoryId` filter + `createdAt` sort) — at seed-data scale
(~25 rows) Postgres's planner correctly picks a sequential scan over the
indexes, since scanning a 25-row table is cheaper than an index lookup. That's
expected planner behavior, not a missing index; the indexes exist so the
planner switches to using them automatically once the table has enough rows
that a full scan stops being the cheaper plan — no code or schema change
needed when that happens.

### A real composite index, added from an actual query plan

Later, `EXPLAIN` against the matching engine's actual candidate query
(`type` + `categoryId` + `status`, used by both
`itemRepository.findActiveByTypeAndCategory` and the default browse filter)
showed something more concrete than the seq-scan case above:

```
Index Scan using "Item_categoryId_idx" on "Item"
  Index Cond: ("categoryId" = 'x'::text)
  Filter: (("deletedAt" IS NULL) AND (type = 'LOST'::"ItemType") AND (status = 'ACTIVE'::"ItemStatus"))
```

Postgres used the single-column `categoryId` index to narrow the candidates,
then filtered `type`/`status`/`deletedAt` row-by-row afterward (the
`Filter:` line) rather than satisfying the whole predicate from an index.
Added `@@index([categoryId, type, status])` so that, once the table is
large enough for the planner to prefer an index path at all, it can resolve
all three columns from the index directly instead of a post-filter step.

## Avoiding N+1 queries

Every repository that returns related data (an item with its category/
location/images/owner, a claim with its evidence/claimant, a match with both
items) uses a single Prisma query with `include`, not a query-per-related-row
loop. `itemRepository.search` similarly runs one `findMany` + one `count` in
parallel rather than counting per page.
