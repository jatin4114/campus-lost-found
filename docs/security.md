# Security model

## Authentication

- Passwords hashed with **argon2** (`argon2.hash`/`argon2.verify`) — never
  stored or returned in plaintext. `userRepository.toPublicUser` strips
  `passwordHash` from every response that includes a user object.
- Short-lived JWT **access tokens** (15 min default) signed with
  `JWT_ACCESS_SECRET`.
- **Refresh tokens** are JWTs too, but also stored server-side (SHA-256
  hashed, never the raw token) in `RefreshToken` with an `expiresAt` and
  `revokedAt`. Refreshing rotates the token — the presented refresh token is
  revoked and a new one issued, so a stolen-then-reused old token is rejected.
  Logout revokes by hash.
- Email verification is a signed, single-purpose JWT (`purpose: 'verify-email'`)
  — no separate token table, since it's short-lived (24h) and single-use by
  virtue of already being verified.

## Authorization

- `requireAuth` middleware attaches `req.user = {id, role}` from a verified
  access token; every mutating endpoint requires it.
- `requireRole(...roles)` gates admin/moderator-only routes
  (`/api/v1/admin/*`).
- **Resource ownership is enforced in the service layer, not just route
  guards or the UI** — e.g. `itemService.updateItem`/`deleteItem` checks
  `item.userId === user.id` (or ADMIN/MODERATOR) before allowing a mutation,
  independent of whatever the client sends. Same pattern for claim review
  (only the item owner can accept/reject) and image upload/delete.

## Input validation

Every mutating endpoint validates `req.body`/`req.query`/`req.params`
against a Zod schema (`middleware/validate.js`) before the controller runs —
malformed input never reaches a service.

## File upload safety

Item images are validated by MIME type (JPEG/PNG/WebP only), capped at 5MB
and 5 images per item (`middleware/upload.js`), and stored on disk with a
randomly generated filename (`crypto.randomUUID()`) — the original filename
and its extension-implied type are never trusted for anything beyond a
display hint. Every upload is re-encoded through `sharp` (resized to a
1600px max dimension, re-saved as WebP) before being written to disk, which
strips EXIF metadata as a side effect — including GPS coordinates a phone
camera embeds by default, which nobody uploading a photo of a found item is
likely thinking about exposing.

## Transport/header hardening

- **Helmet** sets standard security headers (CSP, HSTS, X-Content-Type-Options,
  etc).
- **CORS** is restricted to a single configured origin (`CORS_ORIGIN`), with
  credentials enabled only for that origin.
- Socket.IO connections are authenticated at the handshake (same JWT access
  token) before any event handler runs; conversation room joins are gated by
  an actual `ConversationParticipant` row, not just "is logged in".

## Rate limiting

- `/api/v1/auth/register` and `/api/v1/auth/login`: 10 requests / 15 min per
  IP — slows credential stuffing and account enumeration.
- `POST /api/v1/items` and `POST /api/v1/reports`: 30 requests / hour per IP
  — these are cheap to script and easy to use for spam/abuse.
- Every other `/api/*` route: 120 requests / minute per IP as a backstop.

## Error handling

In production (`NODE_ENV=production`), a 500 error's message is replaced with
a generic "Something went wrong" — no stack traces or internal error text
reach the client. 4xx errors (validation, not-found, forbidden) always
return their specific machine-readable `code` and a safe message.

## Audit logging

Admin/moderation actions (`USER_SUSPENDED`, `HIDE_ITEM`, etc.) are recorded
in `AuditLog` with the actor, action, entity, a metadata JSON blob, and the
request IP — but **never** secrets, passwords, or tokens.

## Known gaps (deliberate scope cuts, not oversights)

- No CSRF protection: the API is token-based (Bearer auth), not cookie-
  session-based, so CSRF doesn't apply the way it would to a cookie-auth app.
- No password-reset flow yet (only registration/verification) — would follow
  the same signed-JWT pattern as email verification.
- Refresh tokens are returned in the JSON body rather than an httpOnly
  cookie; a production deployment should move them to an httpOnly,
  SameSite=Strict cookie to reduce XSS exposure.
