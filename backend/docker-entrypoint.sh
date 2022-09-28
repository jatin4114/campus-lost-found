#!/bin/sh
set -e

# Apply any pending migrations, then seed (idempotent — upserts campuses/
# categories/demo users, only creates the sample items if they don't
# already exist) before starting the server. This is what makes
# `docker compose up` alone produce a working demo on a fresh database,
# instead of requiring `prisma migrate deploy`/`db:seed` run by hand first.
npx prisma migrate deploy
node prisma/seed.js

exec node src/server.js
