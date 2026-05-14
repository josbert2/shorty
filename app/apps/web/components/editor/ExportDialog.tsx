"use client";

import { useEffect, useState, type RefObject } from "react";
import { toBlob } from "html-to-image";
import {
  defaultFilename,
  downloadBlob,
  exportNode,
  type ExportFormat,
  type ExportScale,
} from "@/lib/export";
import { uploadToR2 } from "@/lib/upload";
import { getSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import type { EditorState } from "./Editor";

type Engine = "client" | "server";
type Kind = "image" | "video";
type VideoFormat = "mp4" | "gif" | "webm";
type Animation = "float" | "zoom-in" | "pan-left" | "static";

type Props = {
  open: boolean;
  onClose: () => void;
  targetRef: RefObject<HTMLDivElement | null>;
  projectId: string;
  state: EditorState;
};

const IMAGE_FORMATS: { id: ExportFormat; label: string }[] = [
  { id: "png", label: "PNG" },
  { id: "webp", label: "WebP" },
  { id: "jpeg", label: "JPEG" },
];

const VIDEO_FORMATS: { id: VideoFormat; label: string; hint: string }[] = [
  { id: "mp4", label: "MP4", hint: "H.264 — universal" },
  { id: "gif", label: "GIF", hint: "Para Twitter / Slack" },
  { id: "webm", label: "WebM", hint: "VP8 — más liviano" },
];

const ANIMATIONS: { id: Animation; label: string; hint: string }[] = [
  { id: "float", label: "Float", hint: "Sube y baja suave" },
  { id: "zoom-in", label: "Zoom in", hint: "Acercamiento lento" },
  { id: "pan-left", label: "Pan", hint: "Desplazamiento horizontal" },
  { id: "static", label: "Estático", hint: "Solo fade-in" },
];

const SCALES: ExportScale[] = [1, 2, 4];

export function ExportDialog({ open, onClose, targetRef, projectId, state }: Props) {
  const [kind, setKind] = useState<Kind>("image");
  const [imageFormat, setImageFormat] = useState<ExportFormat>("png");
  const [videoFormat, setVideoFormat] = useState<VideoFormat>("mp4");
  const [animation, setAnimation] = useState<Animation>("float");
  const [scale, setScale] = useState<ExportScale>(2);
  const [engine, setEngine] = useState<Engine>("server");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const isVideo = kind === "video";
  const effectiveEngine: Engine = isVideo ? "server" : engine;

  const handleExport = async () => {
    setBusy(true);
    setError(null);
    try {
      let blob: Blob;
      let filename: string;

      if (isVideo) {
        const res = await fetch("/api/render-video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            inputProps: { ...state, animation },
            format: videoFormat,
            scale: scale === 4 ? 2 : scale, // 4× sería muy pesado para video
          }),
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text.slice(0, 200));
        }
        blob = await res.blob();
        filename = videoFilename(videoFormat);
      } else if (effectiveEngine === "server") {
        if (imageFormat === "webp") {
          throw new Error("WebP en alta fidelidad llega pronto. Probá PNG o JPEG.");
        }
        const res = await fetch("/api/render-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            inputProps: state,
            scale,
            format: imageFormat === "jpeg" ? "jpeg" : "png",
          }),
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text.slice(0, 200));
        }
        blob = await res.blob();
        filename = defaultFilename(imageFormat, scale);
      } else {
        const node = targetRef.current;
        if (!node) throw new Error("No encuentro el canvas para exportar.");
        blob = await exportNode(node, { format: imageFormat, scale });
        filename = defaultFilename(imageFormat, scale);
      }

      downloadBlob(blob, filename);

      // Best-effort: thumbnail a R2 + save en DB
      try {
        const node = targetRef.current;
        if (node) {
          const thumb = await toBlob(node, { pixelRatio: 0.4, cacheBust: true, type: "image/jpeg" });
          if (thumb) {
            const userId = await getCurrentUserId();
            if (userId) {
              const { key } = await uploadToR2({
                blob: thumb,
                userId,
                projectId,
                kind: "thumbnail",
                filename: `thumb-${Date.now()}.jpg`,
              });
              await fetch("/api/projects/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ projectId, thumbnailKey: key }),
              });
            }
          }
        }
      } catch {
        // Thumbnail no es bloqueante
      }

      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falló el export.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-body/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-[min(480px,90vw)] overflow-hidden rounded-2xl border border-border bg-modal shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-border-faint px-5 py-4">
          <h2 className="text-[15px] font-medium">Exportar</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted transition-colors hover:bg-surface-elevated hover:text-foreground"
          >
            <svg viewBox="0 0 16 16" className="size-4">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </svg>
          </button>
        </header>

        {/* Tabs Imagen / Video */}
        <div className="border-b border-border-faint px-5 pt-4">
          <div className="inline-flex items-center gap-1 rounded-pill border border-border-faint bg-surface-dim p-1">
            <TabBtn active={kind === "image"} onClick={() => setKind("image")}>
              Imagen
            </TabBtn>
            <TabBtn active={kind === "video"} onClick={() => setKind("video")}>
              Video
              <span className="rounded-full bg-warning/15 px-1.5 py-0.5 text-[10px] font-medium text-warning">
                Beta
              </span>
            </TabBtn>
          </div>
        </div>

        <div className="flex flex-col gap-5 p-5">
          {kind === "image" && (
            <>
              <Section title="Calidad">
                <div className="grid grid-cols-2 gap-2">
                  <EngineCard
                    active={engine === "server"}
                    onClick={() => setEngine("server")}
                    title="Alta fidelidad"
                    hint="Render server-side. Backdrop-filter perfecto."
                    badge="Recomendado"
                  />
                  <EngineCard
                    active={engine === "client"}
                    onClick={() => setEngine("client")}
                    title="Rápido"
                    hint="Captura DOM en el navegador. Instantáneo."
                  />
                </div>
              </Section>

              <Section title="Formato">
                <div className="grid grid-cols-3 gap-2">
                  {IMAGE_FORMATS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setImageFormat(f.id)}
                      className={cn(
                        "rounded-lg border px-3 py-2.5 text-[13px] font-medium transition-colors",
                        imageFormat === f.id
                          ? "border-accent bg-accent/10 text-foreground"
                          : "border-border-faint bg-surface/50 text-muted hover:border-border hover:text-foreground"
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </Section>

              <Section title="Tamaño">
                <div className="grid grid-cols-3 gap-2">
                  {SCALES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setScale(s)}
                      className={cn(
                        "flex flex-col items-center gap-0.5 rounded-lg border px-3 py-3 transition-colors",
                        scale === s
                          ? "border-accent bg-accent/10 text-foreground"
                          : "border-border-faint bg-surface/50 text-muted hover:border-border hover:text-foreground"
                      )}
                    >
                      <span className="font-medium">{s}×</span>
                      <span className="text-[11px]">{s === 1 ? "HD" : s === 2 ? "Retina" : "4K"}</span>
                    </button>
                  ))}
                </div>
              </Section>
            </>
          )}

          {kind === "video" && (
            <>
              <Section title="Animación">
                <div className="grid grid-cols-2 gap-2">
                  {ANIMATIONS.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setAnimation(a.id)}
                      className={cn(
                        "flex flex-col gap-0.5 rounded-lg border px-3 py-2.5 text-left transition-colors",
                        animation === a.id
                          ? "border-accent bg-accent/10"
                          : "border-border-faint bg-surface/50 hover:border-border"
                      )}
                    >
                      <span className="text-[13px] font-medium text-foreground">{a.label}</span>
                      <span className="text-[11.5px] text-muted">{a.hint}</span>
                    </button>
                  ))}
                </div>
              </Section>

              <Section title="Formato">
                <div className="flex flex-col gap-1.5">
                  {VIDEO_FORMATS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setVideoFormat(f.id)}
                      className={cn(
                        "flex items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-colors",
                        videoFormat === f.id
                          ? "border-accent bg-accent/10"
                          : "border-border-faint bg-surface/50 hover:border-border"
                      )}
                    >
                      <span className="font-medium text-foreground">{f.label}</span>
                      <span className="text-[12px] text-muted">{f.hint}</span>
                    </button>
                  ))}
                </div>
              </Section>

              <Section title="Tamaño">
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setScale(s as ExportScale)}
                      className={cn(
                        "flex flex-col items-center gap-0.5 rounded-lg border px-3 py-3 transition-colors",
                        scale === s
                          ? "border-accent bg-accent/10 text-foreground"
                          : "border-border-faint bg-surface/50 text-muted hover:border-border hover:text-foreground"
                      )}
                    >
                      <span className="font-medium">{s}×</span>
                      <span className="text-[11px]">{s === 1 ? "HD" : "Retina"}</span>
                    </button>
                  ))}
                </div>
              </Section>

              <p className="rounded-md bg-surface-dim/60 px-3 py-2 text-[11.5px] leading-relaxed text-muted">
                El render de video corre en el servidor con Remotion + FFmpeg.
                Duración fija: 4 segundos a 30 fps.
              </p>
            </>
          )}

          {error && (
            <p className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-[12.5px] text-danger">
              {error}
            </p>
          )}
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-border-faint bg-surface-dim/60 px-5 py-3.5">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-pill px-4 py-2 text-[13px] text-muted transition-colors hover:bg-surface-elevated hover:text-foreground disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-pill bg-primary px-5 py-2 text-[13px] font-medium text-body transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
          >
            {busy && (
              <svg viewBox="0 0 16 16" className="size-3.5 animate-spin">
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.25" />
                <path d="M14 8a6 6 0 00-6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
              </svg>
            )}
            {busy ? (isVideo ? "Renderizando video…" : "Renderizando…") : "Descargar"}
          </button>
        </footer>
      </div>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill px-4 py-1.5 text-[13px] transition-colors",
        active ? "bg-surface-elevated text-foreground" : "text-muted hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

function EngineCard({
  active,
  onClick,
  title,
  hint,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  hint: string;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex flex-col gap-1 rounded-lg border px-3 py-3 text-left transition-colors",
        active ? "border-accent bg-accent/10" : "border-border-faint bg-surface/50 hover:border-border"
      )}
    >
      {badge && (
        <span className="absolute right-2 top-2 rounded-full bg-accent/20 px-1.5 py-0.5 text-[9.5px] font-medium text-accent">
          {badge}
        </span>
      )}
      <span className="text-[13px] font-medium text-foreground">{title}</span>
      <span className="text-[11.5px] leading-snug text-muted">{hint}</span>
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">{title}</h3>
      {children}
    </div>
  );
}

function videoFilename(format: VideoFormat): string {
  const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  return `shotso-${ts}.${format}`;
}

async function getCurrentUserId(): Promise<string | null> {
  try {
    const session = await getSession();
    return session?.data?.user?.id ?? null;
  } catch {
    return null;
  }
}
