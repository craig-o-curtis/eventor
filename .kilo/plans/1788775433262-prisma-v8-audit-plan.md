# Prisma 8 Setup Audit — Missing Steps

## Context

User asked to compare the Prisma v8 docs checklist (Postgres existing-project path) against the current Eventor project state and identify missing steps.

## Current State

The project is already on Prisma 8 **RC**:
- `prisma`: `8.0.0-rc.12`
- `@prisma/orm-postgres`: `8.0.0-rc.8`

## Checklist Audit

### Already Completed

| Doc Step | Status | Evidence |
|----------|--------|----------|
| 2. Initialize Prisma 8 | Done | `prisma:init` script in package.json: `npx prisma orm init --target postgres --authoring psl`; `prisma-next.md`, `prisma.config.ts`, `src/prisma/contract.prisma` all present |
| 3. Set DB connection string | Done | `.env` has `DATABASE_URL` pointing to Prisma Postgres (pooled.db.prisma.io) |
| 4. Infer contract | Done (but no reusable script) | `src/prisma/contract.json` and `contract.d.ts` exist with `profileHash`, `storageHash`, `executionHash` — inferred from live DB |
| 5. Emit artifacts | Done | `prisma:contract:emit` script; generated `contract.json` + `contract.d.ts` present |
| 7. High-level query | Done (in prod code, not standalone) | `src/user/user.service.ts` uses `this.prisma.db.orm.public.User` ORM calls |

### Missing / Incomplete

| Doc Step | Issue | Details |
|----------|-------|---------|
| 1. Example script tooling | **Missing `tsx`** | Docs say install `tsx` + `typescript`. Project has `typescript` but no `tsx` (not in package.json, not in node_modules/.pnpm). Project uses `vitest` for TS execution instead. Low priority but deviate from docs. |
| 6. Sign the database | **Missing entirely** | No `prisma db sign` script in package.json. No `.dbsign` file or any sign artifact. `.gitignore` does not mention it. The docs call this out as important for: (a) databases never signed by Prisma 8 before, (b) databases signed under an older contract hash. |
| 8. Low-level SQL query | **Missing** | No `db.sql` usage anywhere in source. No standalone `script.ts`. The docs' Step 8 example pattern (`db.sql.user.select(...).build()` + `db.runtime().execute(plan)`) is absent. |
| 7. Standalone example script | **Missing** | No `script.ts` example file as described in docs Step 7. High-level pattern exists in `UserService` but no isolated verification script. |

### Additional Gap: Missing Scripts

The package.json has Prisma scripts but is missing:
- `prisma:contract:infer` — for `prisma contract infer --output ./src/prisma/contract.prisma`
- `prisma:db:sign` — for `prisma db sign`

The docs say "see if we are missing steps" — here are the concrete missing pieces:

## Action Items

1. **Run `prisma db sign`** (Highest priority)
   - Command: `npx prisma db sign` (or `pnpm prisma db sign`)
   - Records that the live database matches the emitted contract
   - Without this, the database is not registered as signed under the current contract hash

2. **Add `prisma:db:sign` and `prisma:contract:infer` scripts**
   - In `package.json`:
     - `"prisma:contract:infer": "prisma contract infer --output ./src/prisma/contract.prisma"`
     - `"prisma:db:sign": "prisma db sign"`

3. **Install `tsx`** (if standalone scripts are desired)
   - `pnpm add --save-dev tsx`
   - Only needed for running `script.ts` examples. The project currently uses `vitest` which handles TS natively. If vitest is used instead, this step is unnecessary.

4. **Add low-level query example** (Step 8 from docs)
   - Optional: create a `script.ts` demonstrating `db.sql.user.select("id", "email", "name").limit(2).build()` + `db.runtime().execute(plan)`

5. **Verify high-level query works end-to-end** (Step 7)
   - The `UserService` uses `db.orm.public.User` but never calls `db.connect()` explicitly (the docs show `await db.connect({ url: process.env.DATABASE_URL! })`). Verify this auto-connects or add an `onModuleInit` hook to `PrismaService` if needed.

## Key Finding

The most critical missing step is **Step 6: Sign the database** (`prisma db sign`). Everything else is either present or minor. The database has not been signed, which the docs explicitly say matters.
