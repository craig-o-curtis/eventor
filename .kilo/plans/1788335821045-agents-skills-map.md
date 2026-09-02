# Plan: Write AGENTS.md with Skills Mapping

## Goal

Create `/Users/craigcurtis/workbench/nestjs/eventer/AGENTS.md` that maps work scenarios to the installed skills, so agents automatically reach for the right skill when encountering specific work.

## Context

**Project: Eventer** — NestJS backend (Prisma planned), SolidJS frontend (planned). Admin interface for event CRUD + registrations, user interface for viewing/registering/canceling.

**Installed skills (10):**

| Skill | Purpose | Trigger keywords |
|-------|---------|------------------|
| `codebase-design` | Deep module design vocabulary | Designing module interfaces, seam placement, testability |
| `diagnosing-bugs` | Hard bug/perf regression diagnosis | "diagnose", "debug", broken, throwing, failing, slow |
| `grill-with-docs` | Interview plan/design + create ADRs/glossary | Sharpening a plan, designing with docs |
| `implement` | Execute work from spec/tickets | Implementing from a spec |
| `nestjs-best-practices` | NestJS architecture + 40 rules | Writing/reviewing NestJS modules, auth, DI, security, perf |
| `prototype` | Throwaway prototype for design questions | Sanity-check logic, explore UI |
| `research` | Investigate against primary sources | Research a topic, gather docs/API facts |
| `tdd` | Test-driven development | Build test-first, "red-green-refactor", integration tests |
| `teach` | Teach user a new skill/concepts | User wants to learn something |
| `writing-for-agents` | Writing docs for agents | Creating/editing skills, AGENTS.md, CLAUDE.md |

## AGENTS.md Structure

```markdown
# Eventer — Agent Guide

## Project

NestJS backend with Prisma. SolidJS frontend (planned). Admin interface for event management, user interface for registration.

## Skills

Reach for these skills when the work matches their trigger:

### nestjs-best-practices
Use when writing, reviewing, or refactoring NestJS code — modules, controllers, services, DI, guards, pipes, interceptors, error handling, security, testing.

### tdd
Use when building features or fixing bugs test-first, or when the user mentions "red-green-refactor" or integration tests.

### codebase-design
Use when designing or improving a module's interface, deciding where a seam goes, or making code more testable.

### diagnosing-bugs
Use when the user says "diagnose" or "debug this", or reports something broken, throwing, failing, or slow.

### prototype
Use when building a throwaway prototype to sanity-check logic/state or explore what a UI should look like.

### research
Use when the user wants a topic researched, docs gathered, or API facts verified against primary sources.

### implement
Use when executing work from a spec or set of tickets.

### grill-with-docs
Use when interviewing a plan or design and capturing decisions as ADRs/glossary.

### teach
Use when the user wants to learn a new skill or concept within this workspace.

### writing-for-agents
Use when creating or editing skills, or modifying this AGENTS.md.
```

## Validation

- [ ] Every installed skill has a pointer
- [ ] Each pointer front-loads the leading word (skill name)
- [ ] Each pointer lists distinct trigger branches
- [ ] No skill is missing or duplicated
- [ ] File saved to repo root as `AGENTS.md`

## Out of Scope

- Implementing actual features (separate work)
- Setting up Prisma or SolidJS (not yet in codebase)
- Modifying skill files themselves
