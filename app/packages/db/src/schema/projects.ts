import { pgTable, text, timestamp, uuid, jsonb, boolean, index } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull().default("Sin título"),
    thumbnailKey: text("thumbnail_key"),
    canvasData: jsonb("canvas_data").notNull(),
    isPublic: boolean("is_public").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("projects_user_id_idx").on(t.userId),
    index("projects_updated_at_idx").on(t.updatedAt),
  ]
);

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
