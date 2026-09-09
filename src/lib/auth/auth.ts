import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "../../prisma/db.js";
import { ROLE } from "../../common/constants/roles.js";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: ROLE.USER,
        input: false,
      },
    },
  },
  baseURL: process.env.BETTER_AUTH_URL,
  basePath: "/api/auth",
});
