# Development Cheatsheet

## Running the app

```bash
pnpm start:dev      # watch mode (recompiles + restarts on change)
pnpm start          # run once
pnpm start:prod     # node dist/main.js (requires a prior `pnpm build`)
pnpm build          # nest build -> dist/
pnpm test           # vitest run
pnpm test:e2e       # vitest run --config ./vitest.config.e2e.ts
pnpm lint           # oxlint
pnpm typecheck      # tsc --noEmit
```

> ESM note: this project is `"type": "module"` with `moduleResolution: nodenext`.
> Relative imports **must** carry the emitted `.js` extension
> (`import { AppModule } from "./app.module.js"`). The `migrations/` folder is
> excluded from `tsconfig.json` because Prisma owns those files.

## Prisma / Database

The project uses **Prisma Next** (`@prisma/orm-postgres` v8) against a **Prisma
Postgres** database. There is no generated client package — the query client is
built at runtime from the compiled contract.

| File | Purpose |
| --- | --- |
| [`src/prisma/contract.prisma`](src/prisma/contract.prisma) | Data contract — the source of truth for models |
| [`src/prisma/contract.json`](src/prisma/contract.json) | Compiled contract (generated, committed) |
| [`src/prisma/contract.d.ts`](src/prisma/contract.d.ts) | Contract types for the editor (generated, committed) |
| [`src/prisma/db.ts`](src/prisma/db.ts) | The `db` client — `db.orm.public.User…` |
| [`src/lib/database/prisma.service.ts`](src/lib/database/prisma.service.ts) | Nest wrapper (`PrismaService.db`), closes the pool on shutdown |
| [`prisma.config.ts`](prisma.config.ts) | CLI config (contract path + `DATABASE_URL`) |
| [`migrations/`](migrations/) | On-disk migration packages (Prisma-generated) |

### Connection behaviour

The app does **not** connect to the database on boot. `db.ts` builds a lazy
`pg.Pool`; the first actual query opens the first connection. A bad
`DATABASE_URL` therefore fails on the first request, not at startup. Add an
`OnModuleInit` `select 1` to `PrismaService` if you want fail-fast.

### Schema change workflow

1. Edit [`src/prisma/contract.prisma`](src/prisma/contract.prisma).
2. `pnpm prisma:contract:emit` — regenerate `contract.json` + `contract.d.ts`.
3. `npx prisma migration plan` — scaffold a migration from the contract diff.
4. `npx prisma db migrate` — apply pending migrations to the database.
5. `npx prisma db verify` — confirm the live schema matches the contract.

Other useful commands:

```bash
pnpm prisma:contract:infer      # regenerate contract.prisma from an existing DB
npx prisma db schema            # inspect the live database schema
npx prisma migration status     # show migration path / pending state
npx prisma migration log        # show applied migration history
npx prisma db update            # push the contract to the DB without a migration file (dev only)
```

### Seeding an admin user

Routes behind [`RoleGuard`](src/guards/role.guard.ts) require a user whose
`role` is `ADMIN`. `role` defaults to `USER` and nothing else grants ADMIN, so a
fresh database has no way past the guard until an admin exists.

```bash
# set ADMIN_EMAIL (and optionally ADMIN_NAME) in .env first
pnpm db:seed
```

`db:seed` runs [`src/prisma/seed.ts`](src/prisma/seed.ts) (compiled to
`dist/prisma/seed.js`). It is **idempotent** — an `upsert` on `email` — so it is
safe to run on every environment and re-run any time. It creates the admin if
missing and promotes an existing user with that email to `ADMIN`; it does not
overwrite the name on re-run.

## NestJS generators

```bash
nest g module <name>
nest g controller <name>
nest g service <name>
nest g resource <name>                     # module + controller + service + DTOs
nest g guard guards/<name> --flat
nest g middleware middleware/<name> --flat
nest g interceptor utils/<name> --flat
nest g decorator common/decorators/<name> --flat
nest g filter common/filters/<name> --flat
nest g pipe <name>
```

## Arcjet Security Integration

Arcjet provides rate limiting, bot detection, and email validation. Setup steps:

### 1. Install packages

```bash
pnpm add @arcjet/nest
pnpm add @nestjs/config
```

### 2. Configure environment variables

Add to `.env`:

```dotenv
ARCJET_KEY='ajkey_your_site_key'
ARCJET_ENV=development
ARCJET_MODE=DRY_RUN
```

> Get your `ARCJET_KEY` from the [Arcjet Console](https://console.arcjet.com).

### 3. Register modules in AppModule

```typescript
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ArcjetModule, shield } from "@arcjet/nest";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ArcjetModule.forRootAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        key: config.get<string>("ARCJET_KEY")!,
        rules: [shield({ mode: "LIVE" })],
      }),
    }),
  ],
})
export class AppModule {}
```

`ConfigModule.forRoot({ isGlobal: true })` auto-loads `.env`. `forRootAsync` with `useFactory` reads the key from `ConfigService` instead of raw `process.env`.

### 4. Protect routes in a controller

```typescript
import { Inject, Req } from "@nestjs/common";
import { ARCJET, ArcjetNest, slidingWindow, detectBot, validateEmail } from "@arcjet/nest";
import type { Request } from "express";

const rateLimitRule = slidingWindow({ mode: "DRY_RUN", interval: 60, max: 100 });
const botRule = detectBot({ mode: "DRY_RUN", allow: [] });
const emailRule = validateEmail({ mode: "DRY_RUN", deny: ["DISPOSABLE", "FREE"] });

@Controller("user")
export class UserController {
  constructor(
    private readonly userService: UserService,
    @Inject(ARCJET) private readonly arcjet: ArcjetNest,
  ) {}

  @Get()
  async getUsers(@Req() req: Request) {
    const protect = this.arcjet.withRule([rateLimitRule, botRule] as any);
    const decision = await protect.protect(req, {});

    if (decision.isDenied()) {
      throw new HttpException("Forbidden", HttpStatus.FORBIDDEN);
    }

    return this.userService.findAll();
  }

  @Post()
  async createUser(@Req() req: Request, @Body() createUserDto: CreateUserDto) {
    const protect = this.arcjet.withRule(rateLimitRule).withRule(botRule).withRule(emailRule);
    const decision = await protect.protect(req, { email: createUserDto.email });

    if (decision.isDenied()) {
      throw new HttpException("Forbidden", HttpStatus.FORBIDDEN);
    }

    return this.userService.create(createUserDto);
  }
}
```

Key points:
- Use `@Inject(ARCJET)` to inject the Arcjet instance (not `new ArcjetNest()`)
- Chain rules with `.withRule()` — each rule is evaluated
- `protect(req, properties)` requires a second argument: `{}` for routes without email validation, `{ email: ... }` when using `validateEmail`
- Check `decision.isDenied()` and throw an appropriate HTTP exception

### 5. Verify Arcjet is working

```bash
# Start the dev server
pnpm start:dev

# Hit a protected endpoint
curl http://localhost:3000/user

# Check decisions in CLI (replace with your site ID)
npx -y @arcjet/cli@latest requests list --site-id site_01m1nzjnaxfe59emsz8v9tpds3
```

> If endpoints return "Invalid API Key" before reaching Arcjet, check that middleware (e.g., `ApiKeyMiddleware`) isn't blocking requests before they reach the controller.

## Project notes

- Arcjet — prevents SQL injection, cross-site scripting, rate-limiting, and other attacks.
