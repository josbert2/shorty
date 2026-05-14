/**
 * Client-side helper para subir un blob a R2 vía URL presigned.
 * Uso típico:
 *   const blob = await fetch(dataUrl).then(r => r.blob());
 *   const { publicUrl } = await uploadToR2({ blob, kind: "screenshot", userId, projectId });
 */

export type UploadKind = "screenshot" | "thumbnail" | "export";

export interface UploadInput {
  blob: Blob;
  userId: string;
  projectId: string;
  kind: UploadKind;
  filename?: string;
}

export interface UploadResult {
  publicUrl: string;
  key: string;
}

export async function uploadToR2(input: UploadInput): Promise<UploadResult> {
  const filename = input.filename ?? inferFilename(input.blob, input.kind);
  const presignRes = await fetch("/api/upload/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: input.userId,
      projectId: input.projectId,
      kind: input.kind,
      filename,
      contentType: input.blob.type || "application/octet-stream",
    }),
  });

  if (!presignRes.ok) {
    const detail = await presignRes.text();
    throw new Error(`No se pudo obtener URL presigned: ${detail}`);
  }

  const { uploadUrl, publicUrl, key } = (await presignRes.json()) as {
    uploadUrl: string;
    publicUrl: string;
    key: string;
  };

  const putRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": input.blob.type },
    body: input.blob,
  });

  if (!putRes.ok) {
    throw new Error(`Falló el upload a R2: ${putRes.status} ${putRes.statusText}`);
  }

  return { publicUrl, key };
}

function inferFilename(blob: Blob, kind: UploadKind): string {
  const ext = (blob.type.split("/")[1] ?? "bin").split("+")[0];
  const ts = Date.now();
  return `${kind}-${ts}.${ext}`;
}
