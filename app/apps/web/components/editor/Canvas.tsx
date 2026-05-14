"use client";

import { useRef, useState, type RefObject } from "react";
import { getDevice, paddingFromDrop } from "@/lib/devices";
import { getBackground } from "@/lib/backgrounds";
import { getStyle } from "@/lib/styles";
import { uploadToR2 } from "@/lib/upload";
import type { EditorState } from "./Editor";
import { cn } from "@/lib/utils";
import {
  PRESET_TRANSFORMS,
  type LayoutPresetId,
} from "./right-sidebar/LayoutPresets";
import { CanvasEmptyState } from "./CanvasEmptyState";

type Props = {
  state: EditorState;
  update: <K extends keyof EditorState>(key: K, value: EditorState[K]) => void;
  exportRef?: RefObject<HTMLDivElement | null>;
  userId: string;
  projectId: string;
};

type UploadStatus = "idle" | "uploading" | "error";

export function Canvas({ state, update, exportRef, userId, projectId }: Props) {
  const device = getDevice(state.deviceId);
  const background = getBackground(state.backgroundId);
  const style = getStyle(state.styleId);

  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!device || !background || !style) return null;

  const onFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setStatus("uploading");
    setErrorMsg(null);

    // Vista previa optimista: dataURL local primero para feedback instantáneo
    const previewUrl = await blobToDataUrl(file);
    update("screenshot", previewUrl);

    try {
      const ext = (file.type.split("/")[1] ?? "png").split("+")[0];
      const { publicUrl } = await uploadToR2({
        blob: file,
        userId,
        projectId,
        kind: "screenshot",
        filename: `screenshot-${Date.now()}.${ext}`,
      });
      // Swap del dataURL por la URL pública R2
      update("screenshot", publicUrl);
      setStatus("idle");
    } catch (err) {
      // Si R2 falla, dejamos el dataURL como fallback (el editor sigue usable
      // pero el render server-side va a recibir un dataURL pesado).
      console.warn("R2 upload failed, manteniendo dataURL local:", err);
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "No se pudo subir a R2.");
    }
  };

  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-body">

      <div
        ref={exportRef}
        data-export-target
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files[0];
          if (file) void onFile(file);
        }}
        className={cn(
          "relative aspect-[4/3] w-[min(78%,1140px)] overflow-hidden rounded-[24px] transition-[box-shadow,outline] duration-200",
          dragOver && "outline outline-2 outline-accent"
        )}
        style={{
          background: background.value,
          boxShadow: "0 20px 60px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center p-8 md:p-16">
          {/* User-controlled layer: zoom + position (de la DragPad + ZoomSlider) */}
          <div
            className="relative flex h-full w-full items-center justify-center"
            style={{
              transform: `translate(${state.positionX * 50}%, ${state.positionY * 50}%) scale(${state.zoom / 100})`,
              transformOrigin: "center center",
              transition: "transform 240ms cubic-bezier(0.16,1,0.3,1)",
              willChange: "transform",
            }}
          >
            {/* Layout preset layer: el transform del .component de shots.so */}
            <div
              className="relative flex h-full w-full items-center justify-center"
              style={{
                transform:
                  PRESET_TRANSFORMS[state.layoutPresetId as LayoutPresetId] ??
                  PRESET_TRANSFORMS.center,
                transformOrigin: "center center",
                transition: "transform 280ms cubic-bezier(0.16,1,0.3,1)",
                willChange: "transform",
              }}
            >
              <DeviceFrame
                device={device}
                style={style}
                screenshot={state.screenshot}
                screenshotRadius={state.screenshotRadius}
                uploading={status === "uploading"}
                onPickFile={() => inputRef.current?.click()}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <div className="flex items-center gap-2 rounded-pill border border-white/10 bg-surface/90 px-3.5 py-1.5 text-[12px] text-muted shadow-[0_4px_30px_rgba(0,0,0,0.3)] backdrop-blur-xl">
          {status === "uploading" ? (
            <>
              <span className="inline-block size-1.5 animate-pulse rounded-full bg-accent" />
              Subiendo a R2…
            </>
          ) : state.screenshot ? (
            <button
              type="button"
              onClick={() => update("screenshot", null)}
              className="text-foreground hover:text-danger"
            >
              Quitar screenshot
            </button>
          ) : (
            <>
              <span>Arrastrá una imagen o</span>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="text-accent hover:underline"
              >
                subila desde tu disco
              </button>
            </>
          )}
        </div>
        {errorMsg && (
          <p className="mt-2 max-w-xs rounded-md border border-warning/30 bg-warning/10 px-3 py-1.5 text-center text-[11.5px] text-warning">
            {errorMsg} — guardado local como fallback.
          </p>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void onFile(file);
          e.target.value = "";
        }}
      />
    </main>
  );
}

function DeviceFrame({
  device,
  style,
  screenshot,
  screenshotRadius,
  uploading,
  onPickFile,
}: {
  device: ReturnType<typeof getDevice> & {};
  style: ReturnType<typeof getStyle> & {};
  screenshot: string | null;
  screenshotRadius: number;
  uploading: boolean;
  onPickFile: () => void;
}) {
  const isLaptop = device.category === "laptop";
  // Para "screenshot" (sin frame) usamos el radius del user en px directo.
  // Para devices con frame, mantenemos el screenRadius% del device.
  const isBareScreenshot = device.id === "screenshot";
  const innerRadius = isBareScreenshot
    ? `${screenshotRadius}px`
    : `${device.screenRadius}%`;

  return (
    <div
      className={cn("relative", isLaptop ? "w-full max-w-3xl" : "h-full max-h-[80vh]")}
      style={{ aspectRatio: device.aspectRatio }}
    >
      <div
        className={cn("absolute inset-0", device.squircle && "squircle squircle-iphone")}
        style={{
          background: device.bezelColor,
          borderRadius: device.chassisRadius,
          boxShadow:
            "var(--shadow-device), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.4)",
        }}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          borderRadius: device.chassisRadius,
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.03) 100%)",
        }}
      />

      <button
        type="button"
        onClick={onPickFile}
        className="absolute overflow-hidden"
        style={{
          inset: 0,
          padding: paddingFromDrop(device.dropPadding),
        }}
      >
        <div
          className="relative h-full w-full overflow-hidden"
          style={{
            borderRadius: innerRadius,
            background: style.glassBackground ?? "#0a0a0a",
            backdropFilter: style.backdropFilter,
            WebkitBackdropFilter: style.backdropFilter,
            boxShadow: [style.shadow, style.border].filter(Boolean).join(", "),
            transition: "border-radius 280ms cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          {screenshot ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={screenshot}
              alt="Screenshot"
              className="h-full w-full object-cover"
              draggable={false}
              crossOrigin="anonymous"
            />
          ) : (
            <CanvasEmptyState onClick={onPickFile} />
          )}

          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="flex items-center gap-2 rounded-md bg-surface px-3 py-2 text-[12px] text-foreground">
                <svg viewBox="0 0 16 16" className="size-3.5 animate-spin">
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.25" />
                  <path d="M14 8a6 6 0 00-6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
                </svg>
                Subiendo…
              </div>
            </div>
          )}

          {style.overlay && (
            <div
              aria-hidden
              className="absolute inset-0 mix-blend-overlay"
              style={{ background: style.overlay }}
            />
          )}
        </div>
      </button>
    </div>
  );
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
