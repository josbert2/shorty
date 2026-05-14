import "server-only";
import { NextResponse } from "next/server";
import { Webhook, WebhookVerificationError } from "standardwebhooks";
import { db, user, subscriptions, eq } from "@shotso/db";
import { productIdToPlan } from "@/lib/polar";
import { env } from "@/lib/env";

export const runtime = "nodejs";

/*
  Webhook handler que verifica la firma (con la misma convención que @polar-sh/sdk:
  base64-encode del secret completo) y procesa eventos sin parseo strict del schema
  de Polar — esto evita romper si Polar agrega campos nuevos.

  Eventos suscritos: subscription.* y checkout.*
*/

type SubStatus = "trialing" | "active" | "canceled" | "past_due" | "incomplete" | "unpaid";

interface PolarSubscriptionLike {
  id: string;
  status: string;
  productId?: string;
  product_id?: string;
  customerId?: string | null;
  customer_id?: string | null;
  currentPeriodEnd?: string | Date | null;
  current_period_end?: string | Date | null;
  cancelAtPeriodEnd?: boolean | null;
  cancel_at_period_end?: boolean | null;
  metadata?: Record<string, unknown> | null;
}

interface PolarCheckoutLike {
  customerId?: string | null;
  customer_id?: string | null;
  metadata?: Record<string, unknown> | null;
}

interface PolarEvent {
  type: string;
  data: PolarSubscriptionLike | PolarCheckoutLike;
}

export async function POST(req: Request) {
  if (!env.polar.configured) {
    return NextResponse.json({ error: "Polar no configurado" }, { status: 503 });
  }

  const raw = await req.text();
  const headers = Object.fromEntries(req.headers.entries());

  // Firma: Polar usa el secret completo base64-encoded antes de pasar a standardwebhooks.
  const base64Secret = Buffer.from(env.polar.webhookSecret, "utf-8").toString("base64");
  const wh = new Webhook(base64Secret);

  let event: PolarEvent;
  try {
    event = wh.verify(raw, headers) as PolarEvent;
  } catch (err) {
    if (err instanceof WebhookVerificationError) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  console.log("[Polar webhook]", event.type, "data keys:", Object.keys(event.data ?? {}));
  if (event.type.startsWith("subscription.")) {
    const d = event.data as PolarSubscriptionLike;
    console.log("  metadata.userId:", d.metadata?.userId);
    console.log("  productId:", d.productId, "product_id:", d.product_id);
    console.log("  status:", d.status);
  }

  try {
    switch (event.type) {
      case "subscription.created":
      case "subscription.updated":
      case "subscription.active":
      case "subscription.revoked":
      case "subscription.canceled":
      case "subscription.uncanceled":
        await syncSubscription(event.data as PolarSubscriptionLike);
        break;
      case "checkout.created":
      case "checkout.updated":
        await syncCheckoutCustomer(event.data as PolarCheckoutLike);
        break;
      default:
        // Evento desconocido — devolvemos 200 para que Polar no lo reintente
        break;
    }
    return NextResponse.json({ received: true });
  } catch (e) {
    console.error("Polar webhook handler failed:", e);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }
}

function pick<T>(obj: PolarSubscriptionLike, camel: keyof PolarSubscriptionLike, snake: keyof PolarSubscriptionLike): T | undefined {
  return (obj[camel] ?? obj[snake]) as T | undefined;
}

async function syncSubscription(sub: PolarSubscriptionLike) {
  const userId = (sub.metadata?.userId as string | undefined) ?? null;
  if (!userId) return;

  const productId = pick<string>(sub, "productId", "product_id");
  const customerId = pick<string | null>(sub, "customerId", "customer_id") ?? null;
  const periodEndRaw = pick<string | Date | null>(sub, "currentPeriodEnd", "current_period_end");
  const cancelAt = pick<boolean | null>(sub, "cancelAtPeriodEnd", "cancel_at_period_end") ?? false;

  if (!productId) return;

  const plan = productIdToPlan(productId);
  const status = sub.status as SubStatus;
  const periodEnd = periodEndRaw ? new Date(periodEndRaw as string) : null;

  await db
    .insert(subscriptions)
    .values({
      userId,
      polarSubscriptionId: sub.id,
      polarProductId: productId,
      status,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: cancelAt,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: subscriptions.polarSubscriptionId,
      set: {
        polarProductId: productId,
        status,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: cancelAt,
        updatedAt: new Date(),
      },
    });

  const newPlan = status === "active" || status === "trialing" ? plan : "free";
  const updates: { plan: typeof newPlan; updatedAt: Date; polarCustomerId?: string } = {
    plan: newPlan,
    updatedAt: new Date(),
  };
  if (customerId) updates.polarCustomerId = customerId;
  await db.update(user).set(updates).where(eq(user.id, userId));
}

async function syncCheckoutCustomer(checkout: PolarCheckoutLike) {
  const userId = (checkout.metadata?.userId as string | undefined) ?? null;
  const customerId =
    (checkout.customerId as string | undefined) ?? (checkout.customer_id as string | undefined);
  if (!userId || !customerId) return;
  await db.update(user).set({ polarCustomerId: customerId }).where(eq(user.id, userId));
}
