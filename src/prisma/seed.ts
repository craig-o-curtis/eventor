import "dotenv/config";
import { db } from "./db.js";
import { auth } from "../lib/auth/auth.js";
import { ROLE } from "../common/constants/roles.js";

/**
 * Idempotent seed. Safe to run repeatedly and on every environment.
 *
 * Creates (or promotes) a single ADMIN user from env vars, going through
 * Better Auth's real sign-up flow so the user gets a proper `Account` row
 * with a hashed password and can actually sign in. Routes decorated with
 * `@Roles([ROLE.ADMIN])` are otherwise unreachable — `role` defaults to
 * `USER` and nothing else grants ADMIN.
 *
 * Required:  ADMIN_EMAIL, ADMIN_PASSWORD (only needed the first time)
 * Optional:  ADMIN_NAME (defaults to "Admin")
 */
async function seed(): Promise<void> {
  const email = process.env["ADMIN_EMAIL"];
  const name = process.env["ADMIN_NAME"] ?? "Admin";
  const password = process.env["ADMIN_PASSWORD"];

  if (!email) {
    console.warn("[seed] ADMIN_EMAIL not set — skipping admin seed.");
    return;
  }

  const existing = await db.orm.public.User.where({ email }).first();

  if (!existing) {
    if (!password) {
      console.warn("[seed] ADMIN_PASSWORD not set — cannot create a new admin. Skipping.");
      return;
    }
    await auth.api.signUpEmail({ body: { email, name, password } });
  }

  const admin = await db.orm.public.User.where({ email }).update({ role: ROLE.ADMIN });
  if (!admin) {
    throw new Error(`[seed] failed to promote ${email} to admin — user not found after sign-up`);
  }

  console.log(`[seed] admin ready: ${admin.email} (id ${admin.id}, role ${admin.role})`);
}

seed()
  .catch((err: unknown) => {
    console.error("[seed] failed:", err);
    process.exitCode = 1;
  })
  .finally(() => db.close());
