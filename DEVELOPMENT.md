# Development Cheatsheet

## Generate module

```bash
nest g module user
```

## Generate controller

```bash
nest g controller user
```

## Generate service

```bash
nest g service user
```

## Generate resource

```bash
nest g resource user
```

## Generate class

```bash
nest g class user
```

## Generate interface

```bash
nest g interface user
```

## Generate filter

```bash
nest g filter user
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

## Generate pipe

```bash
nest g pipe user
```

## Generate guard

```bash
nest g guard guards/role --flat
```

## Generate middleware

```bash
nest g middleware middleware/api-key --flat
```

## Generate decorator

```bash
nest g decorator user
```

## Generate interceptor

```bash
nest g interceptor utils/transform --flat
```

## Generate exception

```bash
nest g exception user
```

## Generate library

```bash
nest g library user
```

## Generate application

```bash
nest new user
```

## Generate library

```bash
nest g library user
```
~
## Generate configuration

```bash
nest g config user
```

## Generate provider

```bash
nest g provider user
```

## Generate gateway

```bash
nest g gateway user
```

## Generate microservice

```bash
nest g microservice user
```



## Project notes

- Arcjet  - prevents SQL injection, cross-site scripting, rate-limiting, and other attacks.
