import "server-only";
import { db, user, renderExports, eq, and, sql } from "@shotso/db";
import { PLAN_LIMITS, type Plan } from "./polar";

/**
 * Devuelve el plan actual del user, leyendo la columna `plan` de la tabla `user`.
 * Se mantiene sincronizado por los webhooks de Stripe.
 */
export async function getUserPlan(userId: string): Promise<Plan> {
  const rows = await db.select({ plan: user.plan }).from(user).where(eq(user.id, userId)).limit(1);
  return (rows[0]?.plan as Plan) ?? "free";
}

/**
 * Cuenta los exports del user en el mes corriente (UTC).
 */
export async function getMonthlyUsage(userId: string): Promise<number> {
  const now = new Date();
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(renderExports)
    .where(
      and(
        eq(renderExports.userId, userId),
        sql`${renderExports.createdAt} >= ${startOfMonth.toISOString()}`
      )
    );

  return Number(result[0]?.count ?? 0);
}

export interface QuotaCheck {
  plan: Plan;
  used: number;
  limit: number;
  remaining: number;
  exceeded: boolean;
  hasVideoExports: boolean;
}

export async function checkQuota(userId: string): Promise<QuotaCheck> {
  const plan = await getUserPlan(userId);
  const used = await getMonthlyUsage(userId);
  const limit = PLAN_LIMITS[plan].monthlyExports;
  return {
    plan,
    used,
    limit,
    remaining: Math.max(0, limit - used),
    exceeded: used >= limit,
    hasVideoExports: PLAN_LIMITS[plan].videoExports,
  };
}

/**
 * Registra un export en la tabla `exports`. Llamar después de un render exitoso.
 */
export async function logRender(args: {
  userId: string;
  projectId?: string | null;
  format: "png" | "webp" | "jpeg" | "mp4" | "gif" | "webm";
  scale?: number;
  fileKey?: string;
  fileSize?: number;
}) {
  await db.insert(renderExports).values({
    userId: args.userId,
    projectId: args.projectId ?? null,
    format: args.format,
    scale: args.scale ?? 1,
    fileKey: args.fileKey ?? `inline-${Date.now()}`,
    fileSize: args.fileSize,
    status: "done",
  });
}
