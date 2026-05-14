"use client";

/*
  Media picker popover — clon fiel del .dropzone-edit-popover de shots.so.
  CSS real:
    .dropzone-edit-popover {
      box-shadow: none; background: 0 0; overflow: visible;
      width: calc(100vw - 488px)!important; margin: 0 auto;
      left: 228px; right: 228px;
    }
    .dropzone-edit-popover:before {
      content: ""; z-index: -1; pointer-events: none; position: absolute;
      inset: 0 0 -80%;  // se extiende 80% del height hacia abajo
      background: linear-gradient(0deg, transparent 0, var(--bg) 80%) ×2;
    }
*/

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { uploadToR2 } from "@/lib/upload";
import { MediaItem } from "./MediaItem";
import { NewAssetButton } from "./NewAssetButton";

type Props = {
  open: boolean;
  onClose: () => void;
  screenshot: string | null;
  onChange: (url: string | null) => void;
  userId: string;
  projectId: string;
};

export function MediaPickerPopover({
  open,
  onClose,
  screenshot,
  onChange,
  userId,
  projectId,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"closed" | "opening" | "open" | "closing">("closed");
  const [uploading, setUploading] = useState(false);

  // FSM: closed → opening → open → closing → closed
  // El "mounted" visual = open || closing (anima IN) vs opening || closed (anima OUT)
  useEffect(() => {
    if (open) {
      // Si estamos cerrando, abortar y abrir
      setPhase((p) => (p === "closed" || p === "closing" ? "opening" : p));
      // En frame siguiente → "open" (dispara animación in)
      const id = requestAnimationFrame(() => {
        setPhase((p) => (p === "opening" ? "open" : p));
      });
      return () => cancelAnimationFrame(id);
    } else {
      // open false → ir a "closing" (anima OUT). El transitionend disparará el "closed".
      setPhase((p) => (p === "open" || p === "opening" ? "closing" : p));
      // Fallback: si transitionend no dispara en 600ms, forzamos cierre
      const t = setTimeout(() => {
        setPhase((p) => (p === "closing" ? "closed" : p));
      }, 600);
      return () => clearTimeout(t);
    }
  }, [open]);

  const mounted = phase === "open";
  const visible = phase !== "closed";

  // Cuando termina la transition del wrapper, marcamos como closed
  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    // Solo escuchamos transitions del wrapper, no de hijos
    if (e.target !== e.currentTarget) return;
    if (phase === "closing") setPhase("closed");
  };

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const onClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (popoverRef.current?.contains(target)) return;
      const inMediaControl = (target as Element)?.closest?.("[data-media-control]");
      if (inMediaControl) return;
      onClose();
    };

    window.addEventListener("keydown", onKey);
    const t = setTimeout(() => {
      window.addEventListener("mousedown", onClickOutside);
    }, 0);

    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
      window.removeEventListener("mousedown", onClickOutside);
    };
  }, [open, onClose]);

  if (!visible) return null;
  if (typeof document === "undefined") return null;

  const onFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setUploading(true);
    const preview = await blobToDataUrl(file);
    onChange(preview);
    try {
      const ext = (file.type.split("/")[1] ?? "png").split("+")[0];
      const { publicUrl } = await uploadToR2({
        blob: file,
        userId,
        projectId,
        kind: "screenshot",
        filename: `screenshot-${Date.now()}.${ext}`,
      });
      onChange(publicUrl);
    } catch (err) {
      console.warn("R2 upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const content = (
    <div
      ref={popoverRef}
      onTransitionEnd={handleTransitionEnd}
      className="pointer-events-none fixed"
      style={{
        // Full width del viewport, DETRÁS del sidebar (que tiene z-index mayor).
        // El sidebar lo tapa visualmente del lado izquierdo.
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        // overflow visible: el ::before se extiende afuera del popover
        overflow: "visible",
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(-8px)",
        filter: mounted ? "blur(0)" : "blur(8px)",
        transition:
          "opacity 220ms cubic-bezier(0.16,1,0.3,1), transform 260ms cubic-bezier(0.16,1,0.3,1), filter 200ms cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      {/* ::before fade — capa que se extiende 80% del height hacia abajo */}
      <FadeOverlay />

      {/* .content */}
      <div
        className="pointer-events-auto relative flex flex-col items-center"
        style={{
          gap: 16,
          padding: 16,
          zIndex: 1,
        }}
      >
        <Title>Media Picker</Title>

        <div className="flex items-center" style={{ gap: 12 }}>
          {screenshot && (
            <MediaItem
              src={screenshot}
              active
              onRemove={() => onChange(null)}
              uploading={uploading}
            />
          )}
          <NewAssetButton onClick={() => inputRef.current?.click()} />
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
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

/* ──────────────────────────────────────────── Subcomponents ── */

function FadeOverlay() {
  // inset: 0 0 -80% del CSS real, doblamos el gradient para más opacidad.
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute"
      style={{
        top: 0,
        left: 0,
        right: 0,
        bottom: "-80%",
        background:
          "linear-gradient(0deg, transparent 0%, rgb(13,13,13) 80%), linear-gradient(0deg, transparent 0%, rgb(13,13,13) 80%)",
        zIndex: -1,
      }}
    />
  );
}

function Title({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        font: "500 17px/24px Inter, sans-serif",
        letterSpacing: "-0.6px",
        color: "rgb(240,240,240)",
      }}
    >
      {children}
    </span>
  );
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
