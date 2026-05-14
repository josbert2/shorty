import { NextResponse } from "next/server";
import { z } from "zod";
import { renderMockupVideo } from "@/lib/remotion-render";
import { requireUser } from "@/lib/session";
import { checkQuota, logRender } from "@/lib/usage";

export const runtime = "nodejs";
export const maxDuration = 300;

const BodySchema = z.object({
  inputProps: z.object({
    deviceId: z.string(),
    backgroundId: z.string(),
    styleId: z.string(),
    screenshot: z.string().nullable(),
    animation: z.enum(["float", "zoom-in", "pan-left", "static"]).default("float"),
  }),
  format: z.enum(["mp4", "gif", "webm"]).default("mp4"),
  scale: z.union([z.literal(1), z.literal(2)]).default(1),
  crf: z.number().int().min(0).max(51).optional(),
});

const MIME: Record<"mp4" | "gif" | "webm", string> = {
  mp4: "video/mp4",
  gif: "image/gif",
  webm: "video/webm",
};

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

  // Video gate: solo pro/team
  if (!quota.hasVideoExports) {
    return NextResponse.json(
      {
        error: "El export en video está disponible solo en el plan Pro.",
        plan: quota.plan,
        upgrade: "/pricing",
      },
      { status: 402 }
    );
  }

  try {
    const buf = await renderMockupVideo({
      inputProps: parsed.data.inputProps,
      format: parsed.data.format,
      scale: parsed.data.scale,
      crf: parsed.data.crf,
    });

    logRender({
      userId: user.id,
      format: parsed.data.format,
      scale: parsed.data.scale,
      fileSize: buf.byteLength,
    }).catch((e) => console.error("logRender failed:", e));

    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": MIME[parsed.data.format],
        "Content-Disposition": `inline; filename="mockup.${parsed.data.format}"`,
        "Cache-Control": "no-store",
        "X-Shotso-Plan": quota.plan,
        "X-Shotso-Usage": `${quota.used + 1}/${quota.limit === Infinity ? "unlimited" : quota.limit}`,
      },
    });
  } catch (e) {
    console.error("Remotion video render failed:", e);
    const message = e instanceof Error ? e.message : "Render failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
