import { NextResponse } from "next/server";
import { db, user as userTable, eq } from "@shotso/db";
import { requireUser } from "@/lib/session";
import { getPolar } from "@/lib/polar";
import { env } from "@/lib/env";

export async function POST() {
  if (!env.polar.accessToken) {
    return NextResponse.json(
      { error: "Polar no está configurado en este entorno." },
      { status: 503 }
    );
  }

  const session = await requireUser();
  const rows = await db
    .select({ polarCustomerId: userTable.polarCustomerId })
    .from(userTable)
    .where(eq(userTable.id, session.id))
    .limit(1);
  const customerId = rows[0]?.polarCustomerId;

  if (!customerId) {
    return NextResponse.json(
      { error: "No tenés una suscripción activa todavía." },
      { status: 400 }
    );
  }

  const polar = getPolar();
  const portalSession = await polar.customerSessions.create({
    customerId,
  });

  return NextResponse.json({ url: portalSession.customerPortalUrl });
}
