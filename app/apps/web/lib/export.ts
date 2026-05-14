import { toPng, toJpeg, toBlob } from "html-to-image";

export type ExportFormat = "png" | "webp" | "jpeg";
export type ExportScale = 1 | 2 | 4;

export interface ExportOptions {
  format: ExportFormat;
  scale: ExportScale;
  filename?: string;
  /** Quality 0-1 para jpeg/webp */
  quality?: number;
}

const MIME: Record<ExportFormat, string> = {
  png: "image/png",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

export async function exportNode(node: HTMLElement, opts: ExportOptions): Promise<Blob> {
  const baseOptions = {
    pixelRatio: opts.scale,
    cacheBust: true,
    skipFonts: false,
    backgroundColor: undefined,
    quality: opts.quality ?? 0.95,
  };

  if (opts.format === "png") {
    const dataUrl = await toPng(node, baseOptions);
    return dataUrlToBlob(dataUrl);
  }

  if (opts.format === "jpeg") {
    const dataUrl = await toJpeg(node, baseOptions);
    return dataUrlToBlob(dataUrl);
  }

  // webp: html-to-image no expone toWebp; usamos toBlob con type webp si el browser lo soporta
  const blob = await toBlob(node, { ...baseOptions, type: "image/webp" });
  if (!blob) throw new Error("No se pudo generar el blob WebP");
  return blob;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function defaultFilename(format: ExportFormat, scale: ExportScale): string {
  const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  return `shotso-${ts}@${scale}x.${format}`;
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [meta, b64] = dataUrl.split(",");
  const mime = meta.match(/data:([^;]+)/)?.[1] ?? "application/octet-stream";
  const bin = atob(b64);
  const len = bin.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

export { MIME };
