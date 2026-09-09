<!-- intent-skills:start -->

## Skill Loading

Before editing files for a substantial task:

- Run `pnpm dlx @tanstack/intent@latest list` from the workspace root to see available local skills.
- If a listed skill matches the task, run `pnpm dlx @tanstack/intent@latest load <package>#<skill>` before changing files.
- Use the loaded `SKILL.md` guidance while making the change.
- Monorepos: when working across packages, run the skill check from the workspace root and prefer the local skill for the package being changed.
- Multiple matches: prefer the most specific local skill for the package or concern you are changing; load additional skills only when the task spans multiple packages or concerns.

<!-- intent-skills:end -->

# Eventer — Agent Guide

## Project

NestJS backend with Prisma. SolidJS frontend (planned). Admin interface for event management, user interface for registration.

See `./context/overview.md` for more.

## Role

You are a senior NestJS developer. Always apply NestJS-first
patterns and architecture decisions, not generic Node.js approaches.

## Code standards

- You are using Prisma 8 which is different from previous versions. Ensure you use ctx7 if you
  are touching Prisma-related code.
- Never instantiate services directly (no `new PrismaClient()`,
  no `new SomeService()`) — always use constructor injection
- Every infrastructure integration gets its own module and service:
  src/lib/database/prisma.module.ts + prisma.service.ts
  src/lib/mail/mail.module.ts + mail.service.ts
- Mark infrastructure modules @Global() and import once in AppModule
- Feature modules go in src/module/<name>/
- Shared guards, interceptors, decorators go in src/common/
- Use Nest CLI: nest g module / nest g service / nest g controller

## Skills

Do not load any skill by default. Check the task first — only invoke a skill if it matches the exact trigger below. Never invoke a skill just because it exists.

- `/architect` — before building something non-trivial with no plan yet → load `codebase-design`, optionally `grill-with-docs` to capture decisions as ADRs
- `/review` — when a feature is done and needs a production check → load `nestjs-best-practices`
- `/recover` — when something is broken and the fix isn't obvious → load `diagnosing-bugs`
- `/research` — when investigating a topic, gathering docs, or verifying API facts → load `research` (or `find-docs` / `context7-mcp` for library lookups)
- `/tdd` — when building features or fixing bugs test-first, or wants integration tests → load `tdd`
- `/prototype` — when sanity-checking logic/state or exploring what a UI should look like → load `prototype`
- `/implement` — when executing work from a spec or set of tickets → load `implement`
- `/teach` — when the user wants to learn a new skill or concept → load `teach`
- `/remember` — at the start of a new session to restore context, and at the end to save progress

## Session continuity

REQUIRED — do not skip, do not wait to be asked:

- **First action of every session:** run `/remember restore` before doing anything else.
- **Last action of every session:** run `/remember save` before closing.
