import { NextResponse } from "next/server";
import { db, user as userTable, eq } from "@shotso/db";
import { requireUser } from "@/lib/session";
import { getPolar } from "@/lib/polar";
import { env } from "@/lib/env";

export async function POST() {
  if (!env.polar.accessToken || !env.polar.proProductId) {
    return NextResponse.json(
      { error: "Polar no está configurado en este entorno." },
      { status: 503 }
    );
  }

  const session = await requireUser();

  const rows = await db
    .select({
      polarCustomerId: userTable.polarCustomerId,
      email: userTable.email,
      name: userTable.name,
    })
    .from(userTable)
    .where(eq(userTable.id, session.id))
    .limit(1);
  const row = rows[0];

  const polar = getPolar();

  // Si el user ya tiene un customer en Polar, pasamos su id (ya tiene email guardado allá).
  // Sino, pre-llenamos email/name pero solo si parecen reales — Polar rechaza dominios
  // reservados como `.test`.
  const looksReal = (row?.email ?? "").match(/@.+\.(?!test|example|localhost)[a-z]+$/i);
  const prefill =
    !row?.polarCustomerId && looksReal
      ? {
          customerEmail: row?.email ?? session.email,
          customerName: row?.name ?? session.name ?? undefined,
        }
      : {};

  const checkout = await polar.checkouts.create({
    products: [env.polar.proProductId],
    ...(row?.polarCustomerId ? { customerId: row.polarCustomerId } : prefill),
    successUrl: `${env.appUrl}/dashboard?subscribed=1&checkout_id={CHECKOUT_ID}`,
    metadata: { userId: session.id },
    customerMetadata: { userId: session.id },
    allowDiscountCodes: true,
  });

  return NextResponse.json({ url: checkout.url });
}
