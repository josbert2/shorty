import { NextResponse } from "next/server";
import { z } from "zod";
import { db, projects, eq, and } from "@shotso/db";
import { requireUser } from "@/lib/session";

const BodySchema = z.object({
  projectId: z.string().uuid(),
  name: z.string().min(1).max(120).optional(),
  canvasData: z
    .object({
      deviceId: z.string(),
      backgroundId: z.string(),
      styleId: z.string(),
      screenshot: z.string().nullable(),
    })
    .optional(),
  thumbnailKey: z.string().nullable().optional(),
});

/**
 * Endpoint de autosave del editor.
 * Usa API route (no Server Action) para evitar que Next dispare revalidación
 * implícita que tiraría el state local del cliente (ej: dropdowns abiertos).
 */
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
    return NextResponse.json(
      { error: "Payload inválido", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { projectId, name, canvasData, thumbnailKey } = parsed.data;

  const patch: Partial<{
    name: string;
    canvasData: typeof canvasData;
    thumbnailKey: string | null;
    updatedAt: Date;
  }> = { updatedAt: new Date() };
  if (name !== undefined) patch.name = name;
  if (canvasData !== undefined) patch.canvasData = canvasData;
  if (thumbnailKey !== undefined) patch.thumbnailKey = thumbnailKey;

  const [row] = await db
    .update(projects)
    .set(patch)
    .where(and(eq(projects.userId, user.id), eq(projects.id, projectId)))
    .returning();

  return NextResponse.json({ ok: true, project: row ?? null });
}
