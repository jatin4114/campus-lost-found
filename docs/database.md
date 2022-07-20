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

## Avoiding N+1 queries

Every repository that returns related data (an item with its category/
location/images/owner, a claim with its evidence/claimant, a match with both
items) uses a single Prisma query with `include`, not a query-per-related-row
loop. `itemRepository.search` similarly runs one `findMany` + one `count` in
parallel rather than counting per page.
