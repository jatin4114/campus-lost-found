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
