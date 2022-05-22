# CampusFind

Campus Lost & Found platform. Students report lost/found items, browse and search
listings, get automatically surfaced potential matches, submit claims with
supporting evidence, and communicate securely to resolve ownership.

## Status

Early development — see `docs/` for architecture notes as they're written.

## Tech stack

- **Frontend:** React (JavaScript), React Router, TanStack Query, React Hook Form,
  Zod, Tailwind CSS, Socket.IO client
- **Backend:** Node.js, Express (JavaScript), Prisma ORM, JWT auth, Socket.IO,
  Zod, Helmet, rate limiting
- **Database:** PostgreSQL hosted on [Supabase](https://supabase.com)

## Repository layout

```
campus-lost-found/
├── frontend/   React application
├── backend/    Express API + Prisma schema/migrations
└── docs/       Architecture, database, API, matching-algorithm, security docs
```

## Local setup

Setup instructions (env vars, Supabase connection, migrations, seeding) will be
documented here as each piece is built.

## License

Personal portfolio project.
