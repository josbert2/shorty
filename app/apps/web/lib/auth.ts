import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@shotso/db";
import * as schema from "@shotso/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [process.env.BETTER_AUTH_URL ?? "http://localhost:3001"],
  advanced: {
    database: {
      // Dejamos que Postgres genere los UUIDs con gen_random_uuid()
      // en vez del id string default de Better Auth.
      generateId: false,
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 días
    updateAge: 60 * 60 * 24,       // refresh diario
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 min de cache local
    },
  },
  user: {
    additionalFields: {
      plan: { type: "string", defaultValue: "free", required: false },
      stripeCustomerId: { type: "string", required: false },
    },
  },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
