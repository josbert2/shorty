import { pgTable, text, timestamp, uuid, integer, index } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { projects } from "./projects";

export const renderExports = pgTable(
  "exports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
    format: text("format", { enum: ["png", "webp", "jpeg", "mp4", "gif", "webm"] }).notNull(),
    scale: integer("scale").notNull().default(2),
    fileKey: text("file_key").notNull(),
    fileSize: integer("file_size"),
    status: text("status", { enum: ["pending", "processing", "done", "error"] })
      .notNull()
      .default("pending"),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("exports_user_id_idx").on(t.userId)]
);

export type RenderExport = typeof renderExports.$inferSelect;
