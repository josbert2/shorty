import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

declare global {
  // eslint-disable-next-line no-var
  var __shotsoDb: ReturnType<typeof createDb> | undefined;
}

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL no está definida. Levantá Postgres con `docker compose up -d db` y copiá .env.example a .env."
    );
  }
  const client = postgres(url, {
    max: process.env.NODE_ENV === "production" ? 10 : 1,
    idle_timeout: 20,
  });
  return drizzle(client, { schema });
}

export const db = globalThis.__shotsoDb ?? createDb();
if (process.env.NODE_ENV !== "production") globalThis.__shotsoDb = db;

export type Database = typeof db;
