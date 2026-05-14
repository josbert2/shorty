import { pgTable, text, timestamp, uuid, boolean, index } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    polarSubscriptionId: text("polar_subscription_id").notNull().unique(),
    polarProductId: text("polar_product_id").notNull(),
    status: text("status", {
      enum: ["trialing", "active", "canceled", "past_due", "incomplete", "unpaid"],
    }).notNull(),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("subscriptions_user_id_idx").on(t.userId)]
);

export type Subscription = typeof subscriptions.$inferSelect;
