import { NextResponse } from "next/server";
import { z } from "zod";
import { presignUpload, projectAssetKey } from "@/lib/r2";
import { env } from "@/lib/env";

const BodySchema = z.object({
  userId: z.string().uuid(),
  projectId: z.string().uuid(),
  kind: z.enum(["screenshot", "thumbnail", "export"]),
  filename: z.string().min(1).max(180).regex(/^[a-zA-Z0-9._-]+$/, "Invalid filename"),
  contentType: z.string().regex(/^(image|video)\/[a-zA-Z0-9.+-]+$/, "Unsupported content type"),
});

const MAX_BYTES = 20 * 1024 * 1024; // 20 MB

export async function POST(req: Request) {
  if (!env.r2.configured) {
    return NextResponse.json(
      { error: "R2 no está configurado en este entorno." },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Payload inválido.", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const key = projectAssetKey(parsed.data);
  const result = await presignUpload({
    key,
    contentType: parsed.data.contentType,
    maxSize: MAX_BYTES,
  });

  return NextResponse.json(result, {
    headers: { "Cache-Control": "no-store" },
  });
}
