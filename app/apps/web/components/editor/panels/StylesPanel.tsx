"use client";

import { STYLES } from "@/lib/styles";
import type { EditorState } from "../Editor";
import { cn } from "@/lib/utils";

type Props = {
  state: EditorState;
  update: <K extends keyof EditorState>(key: K, value: EditorState[K]) => void;
};

export function StylesPanel({ state, update }: Props) {
  return (
    <div className="flex flex-col gap-2 p-3">
      <h3 className="px-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
        Tratamiento del screenshot
      </h3>

      <div className="grid grid-cols-2 gap-2">
        {STYLES.map((s) => {
          const isActive = state.styleId === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => update("styleId", s.id)}
              className={cn(
                "group flex flex-col items-stretch gap-2 rounded-lg border p-2.5 text-[11.5px] transition-colors",
                isActive
                  ? "border-accent bg-accent/10 text-foreground"
                  : "border-border-faint bg-surface/50 text-muted hover:border-border hover:text-foreground"
              )}
            >
              <div
                className="aspect-[4/3] w-full overflow-hidden rounded-md bg-gradient-to-br from-[#0a0a2e] via-[#1a0533] to-[#0d1a3e]"
                style={{
                  background: s.glassBackground ?? "linear-gradient(160deg, #0a0a2e, #1a0533, #0d1a3e)",
                  backdropFilter: s.backdropFilter,
                  WebkitBackdropFilter: s.backdropFilter,
                  boxShadow: [s.shadow, s.border].filter(Boolean).join(", "),
                }}
              />
              <span className="text-center">{s.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
