/**
 * Cliente S3 apuntando a Cloudflare R2 + helpers de presign.
 * Solo para uso server-side.
 */
import "server-only";
import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "./env";

let _client: S3Client | null = null;

function getClient(): S3Client {
  if (_client) return _client;
  if (!env.r2.configured) {
    throw new Error(
      "R2 no está configurado. Completá R2_ACCESS_KEY_ID y R2_SECRET_ACCESS_KEY en apps/web/.env.local"
    );
  }
  _client = new S3Client({
    region: "auto",
    endpoint: env.r2.endpoint,
    credentials: {
      accessKeyId: env.r2.accessKeyId,
      secretAccessKey: env.r2.secretAccessKey,
    },
    // R2 no soporta el checksum CRC32 que AWS SDK v3 incluye por default
    // en presigned URLs → "SignatureDoesNotMatch". Lo desactivamos.
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
  return _client;
}

export interface PresignUploadInput {
  /** Key dentro del bucket. Ejemplo: "users/abc/projects/xyz/screenshot.png" */
  key: string;
  /** MIME type del archivo */
  contentType: string;
  /** Tamaño máximo permitido (bytes), opcional */
  maxSize?: number;
  /** TTL del link (segundos) */
  expiresIn?: number;
}

export interface PresignUploadResult {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

export async function presignUpload(input: PresignUploadInput): Promise<PresignUploadResult> {
  const client = getClient();
  // No incluimos ContentLength en la firma: si lo firmamos, el cliente debe mandar
  // exactamente ese tamaño o R2 devuelve SignatureDoesNotMatch.
  // El maxSize se aplica de otra forma (validación previa al presign, o reglas del bucket).
  const command = new PutObjectCommand({
    Bucket: env.r2.bucket,
    Key: input.key,
    ContentType: input.contentType,
  });
  // input.maxSize se mantiene en la firma del tipo, pero ya no se usa en el presign.
  void input.maxSize;
  const uploadUrl = await getSignedUrl(client, command, {
    expiresIn: input.expiresIn ?? 60 * 5, // 5 min
  });
  return {
    uploadUrl,
    publicUrl: `${env.r2.publicUrl}/${input.key}`,
    key: input.key,
  };
}

export async function deleteObject(key: string): Promise<void> {
  const client = getClient();
  await client.send(new DeleteObjectCommand({ Bucket: env.r2.bucket, Key: key }));
}

export async function objectExists(key: string): Promise<boolean> {
  try {
    const client = getClient();
    await client.send(new HeadObjectCommand({ Bucket: env.r2.bucket, Key: key }));
    return true;
  } catch {
    return false;
  }
}

export function publicUrlFor(key: string): string {
  return `${env.r2.publicUrl}/${key}`;
}

/**
 * Genera una key estable para un asset de un proyecto.
 * Patrón: users/<userId>/projects/<projectId>/<kind>/<filename>
 */
export function projectAssetKey(args: {
  userId: string;
  projectId: string;
  kind: "screenshot" | "thumbnail" | "export";
  filename: string;
}): string {
  return `users/${args.userId}/projects/${args.projectId}/${args.kind}/${args.filename}`;
}
