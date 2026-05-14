import { NextResponse } from "next/server";
import { z } from "zod";
import { renderMockupImage } from "@/lib/remotion-render";
import { requireUser } from "@/lib/session";
import { checkQuota, logRender } from "@/lib/usage";
import { PLAN_LIMITS } from "@/lib/polar";

export const runtime = "nodejs";
export const maxDuration = 60;

const BodySchema = z.object({
  inputProps: z.object({
    deviceId: z.string(),
    backgroundId: z.string(),
    styleId: z.string(),
    screenshot: z.string().nullable(),
  }),
  scale: z.union([z.literal(1), z.literal(2), z.literal(4)]).default(2),
  format: z.enum(["png", "jpeg"]).default("png"),
  jpegQuality: z.number().int().min(1).max(100).optional(),
});

export async function POST(req: Request) {
  const user = await requireUser();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload inválido", issues: parsed.error.issues }, { status: 400 });
  }

  // Quota gate
  const quota = await checkQuota(user.id);
  if (quota.exceeded) {
    return NextResponse.json(
      {
        error: "Llegaste al límite de exports del plan",
        plan: quota.plan,
        used: quota.used,
        limit: quota.limit,
        upgrade: "/pricing",
      },
      { status: 402 }
    );
  }

  // Plan scale gate (free no puede pedir 4×)
  const maxScale = PLAN_LIMITS[quota.plan].maxScale;
  if (parsed.data.scale > maxScale) {
    return NextResponse.json(
      {
        error: `Tu plan permite hasta ${maxScale}×. Pasate a Pro para 4×.`,
        plan: quota.plan,
        upgrade: "/pricing",
      },
      { status: 402 }
    );
  }

  try {
    const buf = await renderMockupImage({
      inputProps: parsed.data.inputProps,
      scale: parsed.data.scale,
      imageFormat: parsed.data.format,
      jpegQuality: parsed.data.jpegQuality,
    });

    // Log async — no bloqueamos la respuesta si falla
    logRender({
      userId: user.id,
      format: parsed.data.format,
      scale: parsed.data.scale,
      fileSize: buf.byteLength,
    }).catch((e) => console.error("logRender failed:", e));

    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": parsed.data.format === "png" ? "image/png" : "image/jpeg",
        "Content-Disposition": `inline; filename="mockup.${parsed.data.format}"`,
        "Cache-Control": "no-store",
        "X-Shotso-Plan": quota.plan,
        "X-Shotso-Usage": `${quota.used + 1}/${quota.limit === Infinity ? "unlimited" : quota.limit}`,
      },
    });
  } catch (e) {
    console.error("Remotion render failed:", e);
    const message = e instanceof Error ? e.message : "Render failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
