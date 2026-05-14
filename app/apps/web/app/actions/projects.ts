"use server";

import "server-only";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db, projects, eq, and, desc } from "@shotso/db";
import { requireUser } from "@/lib/session";

const CanvasDataSchema = z.object({
  deviceId: z.string(),
  backgroundId: z.string(),
  styleId: z.string(),
  screenshot: z.string().nullable(),
});

type CanvasData = z.infer<typeof CanvasDataSchema>;

export async function listMyProjects() {
  const user = await requireUser();
  return db
    .select()
    .from(projects)
    .where(eq(projects.userId, user.id))
    .orderBy(desc(projects.updatedAt));
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getMyProject(projectId: string) {
  if (!UUID_RE.test(projectId)) return null;
  const user = await requireUser();
  const rows = await db
    .select()
    .from(projects)
    .where(and(eq(projects.userId, user.id), eq(projects.id, projectId)))
    .limit(1);
  return rows[0] ?? null;
}

const CreateInput = z.object({
  name: z.string().min(1).max(120).default("Sin título"),
  canvasData: CanvasDataSchema,
});

export async function createProject(input: z.infer<typeof CreateInput>) {
  const user = await requireUser();
  const parsed = CreateInput.parse(input);
  const [row] = await db
    .insert(projects)
    .values({
      userId: user.id,
      name: parsed.name,
      canvasData: parsed.canvasData,
    })
    .returning();
  revalidatePath("/dashboard");
  return row;
}

const SaveInput = z.object({
  projectId: z.string().uuid(),
  name: z.string().min(1).max(120).optional(),
  canvasData: CanvasDataSchema.optional(),
  thumbnailKey: z.string().nullable().optional(),
});

export async function saveProject(input: z.infer<typeof SaveInput>) {
  const user = await requireUser();
  const parsed = SaveInput.parse(input);

  const patch: Partial<{
    name: string;
    canvasData: CanvasData;
    thumbnailKey: string | null;
    updatedAt: Date;
  }> = { updatedAt: new Date() };
  if (parsed.name !== undefined) patch.name = parsed.name;
  if (parsed.canvasData !== undefined) patch.canvasData = parsed.canvasData;
  if (parsed.thumbnailKey !== undefined) patch.thumbnailKey = parsed.thumbnailKey;

  const [row] = await db
    .update(projects)
    .set(patch)
    .where(and(eq(projects.userId, user.id), eq(projects.id, parsed.projectId)))
    .returning();
  return row ?? null;
}

export async function deleteProject(projectId: string) {
  const user = await requireUser();
  await db
    .delete(projects)
    .where(and(eq(projects.userId, user.id), eq(projects.id, projectId)));
  revalidatePath("/dashboard");
}
