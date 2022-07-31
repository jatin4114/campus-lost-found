# Architecture

```
React (Vite, JS)
   │ HTTPS/REST + Socket.IO
   ▼
Node.js + Express
   │
   ├─ routes/        thin — no logic, just wiring + validation + auth middleware
   ├─ controllers/   parse req, call a service, shape the response
   ├─ services/      business rules, transactions, orchestration
   ├─ repositories/  Prisma queries only — no business logic
   ├─ middleware/     auth, validation, rate limiting, uploads, errors
   ├─ sockets/        Socket.IO namespace: auth handshake, room membership
   └─ validators/     Zod schemas per resource
   │
   ▼
Prisma ORM
   │
   ▼
PostgreSQL (Supabase in production, a local container in development)
```

## Layering rule

Controllers never touch Prisma directly, and services never touch `req`/`res`.
A service takes plain arguments (a user id, a validated payload) and returns
plain data or throws an `ApiError`; a controller's job is entirely "unwrap the
request, call the service, wrap the response." This is what makes the claim
state machine, the matching engine, and the moderation workflow independently
testable (see `tests/unit/` and `tests/integration/`) without spinning up
HTTP at all for the pure-logic pieces.

## Why a repository layer, not just services calling Prisma

Two reasons, both realized in practice during this build:

1. **N+1 avoidance is centralized.** Every repository function that returns
   related data uses one Prisma query with `include` (see
   `docs/database.md#avoiding-n1-queries`) — a service author reaching for
   `itemRepository.findById` never has to remember to include `category`/
   `location`/`images` themselves.
2. **Business rules stay out of the query layer.** e.g.
   `claimRepository.acceptClaim` is a single `$transaction` that updates the
   item, updates the claim, and creates the conversation atomically —
   `claimService.acceptClaim` is the layer that decides *whether* accepting
   is allowed (ownership, current status), not how the write happens.

## Real-time layer

Socket.IO shares the same HTTP server as Express (`server.js`). The
handshake middleware verifies the same JWT access token the REST API uses,
so there's exactly one auth mechanism, not two. Conversation "rooms" are
joined only after a server-side membership check
(`conversationService.assertParticipant`) — the client can't join a room it
isn't entitled to just by guessing a conversation id.

## Matching engine as a standalone module

`services/matching/` (`textSimilarity.js`, `locationSimilarity.js`,
`dateSimilarity.js`, `scoring.js`) has no dependency on Express, Prisma, or
any other service — each function is pure, which is what makes
`tests/unit/*.test.js` possible without any database or HTTP involved. See
`docs/matching-algorithm.md` for the algorithm itself.

## Frontend structure

```
src/
├── pages/            one file per route, grouped by feature area
├── components/       shared UI (layout/, common/, items/)
├── context/           AuthContext — the one piece of global client state
├── services/          TanStack Query hooks per resource (itemsApi.js, etc.)
├── schemas/            Zod schemas mirroring the backend's validation
└── lib/                apiClient.js (axios + token refresh interceptor),
                        socket.js (lazy Socket.IO singleton)
```

`apiClient.js` is the only place that knows about access/refresh tokens; a
401 with `UNAUTHENTICATED` transparently refreshes and retries the original
request once. Admin and messaging routes are lazy-loaded (`React.lazy`) since
most users never open either — see `docs/database.md`-adjacent perf notes in
the commit history for the bundle-size reasoning.

## Deliberate scope cuts

- No password-reset flow (would follow the same signed-JWT pattern as email
  verification).
- No map integration for locations — lat/lng exist and drive the haversine
  distance calculation, but there's no visual map picker in the report form.
- Refresh tokens travel in the JSON body, not an httpOnly cookie (documented
  in `docs/security.md`).

These are documented as cuts, not surprises — see each doc's own "known gaps"
or "future improvements" section.
