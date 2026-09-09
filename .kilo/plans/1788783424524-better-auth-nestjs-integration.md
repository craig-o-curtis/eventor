# Better Auth Integration Plan

## Summary

Integrate Better Auth into the existing NestJS + Prisma backend using `@thallesp/nestjs-better-auth`. Enable email/password authentication with role-based access (`PARTICIPANT`/`ADMIN`), replace custom auth scaffolding, and update route protection to use Better Auth's global guard pattern.

## Requirements

- AC-1: Disable NestJS body parser so Better Auth can read raw request bodies
- AC-2: Configure Better Auth server with Prisma adapter, email/password enabled, and role enforcement (default `PARTICIPANT`, immutable on sign-up)
- AC-3: Generate Prisma schema changes for Better Auth tables and apply migrations
- AC-4: Import `AuthModule` in root `AppModule`
- AC-5: Protect all routes via global `AuthGuard`; mark public routes with `@AllowAnonymous()`
- AC-6: Migrate existing auth scaffolding (`RequestUser`, `CurrentUser`, `RoleGuard`) to use Better Auth session
- AC-7: Verify auth flow: sign-up, sign-in, protected route access, role enforcement

## Decision

### Implementation

- **Auth library:** `better-auth` core + `@thallesp/nestjs-better-auth` (already in `package.json`)
- **Database:** Prisma Postgres, same connection as existing `PrismaService`
- **Auth methods:** Email/password only (no social/OAuth initially)
- **Role model:** Two roles — `PARTICIPANT` (default) and `ADMIN`
- **Route protection:** Global `AuthGuard` via `AuthModule.forRoot()`, with `@AllowAnonymous()` on public routes
- **Session source:** Better Auth session cookie; no `secondaryStorage`

### User & Role Handling

- Better Auth's `user` config will set `role` as a custom field with default `PARTICIPANT`
- `emailAndPassword` defaults suffice for sign-up; Better Auth will insert the default role
- Role is not exposed as a sign-up field and cannot be overridden by the client
- Admin assignment will be handled later via seed data or an admin plugin if needed

### Replaced Components

- `src/common/decorators/current-user.decorator.ts` — replaced by Better Auth `@Session()` / `@UserSession`
- `src/common/interfaces/request-user.interface.ts` — replaced by Better Auth `UserSession` type
- `src/guards/role.guard.ts` — rewritten to use Better Auth session instead of custom `request.user`

## Build Plan

1. Install `better-auth` core package (`pnpm add better-auth`)
2. Create `src/lib/auth/auth.ts` with Better Auth config:
   - Prisma adapter using existing `PrismaService` / `db`
   - `emailAndPassword: { enabled: true }`
   - `user.fields` mapping to existing `User` model columns
   - `user.additionalFields` for immutable `role` with default `PARTICIPANT`
   - Environment variables for secret/URL
3. Disable NestJS body parser in `src/main.ts` (`bodyParser: false`)
4. Update `src/app.module.ts` to import `AuthModule.forRoot({ auth })`
5. Run Better Auth CLI to generate Prisma schema additions:
   - `npx auth@latest generate --output src/prisma/schema.prisma`
   - Merge generated models into existing `src/prisma/contract.prisma`
6. Run Prisma migration:
   - `pnpm prisma:db:migrate`
7. Update `src/user/user.controller.ts`:
   - Add `@AllowAnonymous()` to `GET /user` and `GET /user/:id`
   - Add `@Session() session: UserSession` where user identity is needed
8. Rewrite `src/guards/role.guard.ts`:
   - Inject `AuthService` from `@thallesp/nestjs-better-auth`
   - Read session via `request.user` (Better Auth populates this)
   - Verify `session.user.role === 'ADMIN'`
9. Remove or deprecate:
   - `src/common/decorators/current-user.decorator.ts`
   - `src/common/interfaces/request-user.interface.ts`
10. Verify with tests / manual curl:
    - `GET /api/auth/ok` returns `{ status: "ok" }`
    - Sign-up creates user with `PARTICIPANT` role
    - Protected routes reject unauthenticated requests
    - Admin routes reject non-admin users

## Consequences

- All routes are protected by default; missing `@AllowAnonymous()` on a public route will break it
- Existing `RoleGuard` tests will need updates for new session shape
- Prisma schema merge must preserve existing `User` model fields and relationships
- Better Auth tables (`session`, `account`, `verification`) will be added to the same schema
- Future role management (promoting users to admin) needs a separate mechanism

## Follow-up

- Add admin user seeding or admin panel for role assignment
- Consider email verification and password reset plugins
- Evaluate `secondaryStorage` (Redis) for session scaling
- Add social OAuth providers if needed

## Rationale

Follows the official NestJS integration guide exactly, aligns with the project's existing Prisma + NestJS patterns, and replaces incomplete custom auth with a production-grade library. The global guard pattern makes the public API surface explicit and auditable.
