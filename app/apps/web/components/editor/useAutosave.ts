"use client";

import { useEffect, useRef, useState } from "react";
import type { EditorState } from "./Editor";

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function useAutosave(
  projectId: string,
  state: EditorState,
  name: string,
  delayMs = 800
) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstRunRef = useRef(true);

  useEffect(() => {
    if (firstRunRef.current) {
      firstRunRef.current = false;
      return;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    setStatus("saving");
    timerRef.current = setTimeout(async () => {
      try {
        // API route (no Server Action) para evitar revalidación implícita de Next
        // que tira el state local de los componentes (ej: dropdowns abiertos).
        const res = await fetch("/api/projects/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId, canvasData: state, name }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setStatus("saved");
        const idleTimer = setTimeout(() => setStatus("idle"), 1200);
        return () => clearTimeout(idleTimer);
      } catch (err) {
        console.error("Autosave failed:", err);
        setStatus("error");
      }
    }, delayMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [projectId, state, name, delayMs]);

  return status;
}
