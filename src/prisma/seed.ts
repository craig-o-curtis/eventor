import "dotenv/config";
import type { CreateInput } from "@prisma/orm-postgres/orm-client";
import { db } from "./db.js";
import type { Contract } from "./contract.js";

type UserCreateInput = CreateInput<Contract, "User", "public">;

/**
 * Idempotent seed. Safe to run repeatedly and on every environment.
 *
 * Creates (or promotes) a single ADMIN user from env vars so that
 * routes behind `RoleGuard` are reachable. Without an admin nobody can
 * pass that guard — `role` defaults to `USER` and nothing else grants
 * ADMIN.
 *
 * Required:  ADMIN_EMAIL
 * Optional:  ADMIN_NAME (defaults to "Admin")
 */
async function seed(): Promise<void> {
  const email = process.env["ADMIN_EMAIL"];
  const name = process.env["ADMIN_NAME"] ?? "Admin";

  if (!email) {
    console.warn("[seed] ADMIN_EMAIL not set — skipping admin seed.");
    return;
  }

  const create: UserCreateInput = { email, name, role: "ADMIN" };

  const admin = await db.orm.public.User.upsert({
    create,
    update: { role: "ADMIN" },
    conflictOn: { email },
  });

  console.log(`[seed] admin ready: ${admin.email} (id ${admin.id}, role ${admin.role})`);
}

seed()
  .catch((err: unknown) => {
    console.error("[seed] failed:", err);
    process.exitCode = 1;
  })
  .finally(() => db.close());
