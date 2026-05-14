import "server-only";
import path from "node:path";
import os from "node:os";
import { mkdir, readFile, unlink } from "node:fs/promises";
import { bundle } from "@remotion/bundler";
import {
  selectComposition,
  renderStill,
  renderMedia,
  type RenderStillOptions,
  type RenderMediaOptions,
} from "@remotion/renderer";

const ENTRY = path.join(process.cwd(), "remotion", "index.ts");

const COMP_STILL = "Mockup";
const COMP_VIDEO = "MockupAnimated";

declare global {
  // eslint-disable-next-line no-var
  var __remotionBundlePromise: Promise<string> | undefined;
}

function getBundle(): Promise<string> {
  if (!globalThis.__remotionBundlePromise) {
    globalThis.__remotionBundlePromise = bundle({ entryPoint: ENTRY });
  }
  return globalThis.__remotionBundlePromise;
}

/* ──────────────────────────────────────────────────────────── still ── */

export interface RenderImageInput {
  inputProps: Record<string, unknown>;
  scale?: 1 | 2 | 4;
  imageFormat?: "png" | "jpeg";
  jpegQuality?: number;
}

export async function renderMockupImage(input: RenderImageInput): Promise<Buffer> {
  const serveUrl = await getBundle();

  const composition = await selectComposition({
    serveUrl,
    id: COMP_STILL,
    inputProps: input.inputProps,
  });

  const tmpDir = path.join(os.tmpdir(), "shotso-remotion");
  await mkdir(tmpDir, { recursive: true });
  const output = path.join(
    tmpDir,
    `still-${Date.now()}-${rand()}.${input.imageFormat ?? "png"}`
  );

  const options: RenderStillOptions = {
    composition,
    serveUrl,
    output,
    inputProps: input.inputProps,
    imageFormat: input.imageFormat ?? "png",
    scale: input.scale ?? 1,
    jpegQuality: input.jpegQuality,
  };

  await renderStill(options);

  const buf = await readFile(output);
  await unlink(output).catch(() => {});
  return buf;
}

/* ──────────────────────────────────────────────────────────── video ── */

export type VideoFormat = "mp4" | "gif" | "webm";

export interface RenderVideoInput {
  inputProps: Record<string, unknown>;
  format: VideoFormat;
  /** Multiplicador de resolución. Default 1 (1600x1000) */
  scale?: 1 | 2;
  /** CRF para mp4/webm. 0=mejor, 51=peor. Default 22. */
  crf?: number;
}

export async function renderMockupVideo(input: RenderVideoInput): Promise<Buffer> {
  const serveUrl = await getBundle();

  const composition = await selectComposition({
    serveUrl,
    id: COMP_VIDEO,
    inputProps: input.inputProps,
  });

  const tmpDir = path.join(os.tmpdir(), "shotso-remotion");
  await mkdir(tmpDir, { recursive: true });
  const ext = input.format === "mp4" ? "mp4" : input.format === "webm" ? "webm" : "gif";
  const output = path.join(tmpDir, `video-${Date.now()}-${rand()}.${ext}`);

  const codec: RenderMediaOptions["codec"] =
    input.format === "mp4" ? "h264" : input.format === "webm" ? "vp8" : "gif";

  const options: RenderMediaOptions = {
    composition,
    serveUrl,
    codec,
    outputLocation: output,
    inputProps: input.inputProps,
    scale: input.scale ?? 1,
    crf: input.format !== "gif" ? input.crf ?? 22 : undefined,
    everyNthFrame: input.format === "gif" ? 2 : undefined, // baja peso del GIF
    numberOfGifLoops: input.format === "gif" ? null : undefined, // loop infinito
  };

  await renderMedia(options);

  const buf = await readFile(output);
  await unlink(output).catch(() => {});
  return buf;
}

function rand() {
  return Math.random().toString(36).slice(2, 8);
}
