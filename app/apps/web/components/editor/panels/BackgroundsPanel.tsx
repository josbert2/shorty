"use client";

import { useMemo, useState } from "react";
import { BACKGROUNDS, BACKGROUND_CATEGORIES, type BackgroundCategory } from "@/lib/backgrounds";
import type { EditorState } from "../Editor";
import { cn } from "@/lib/utils";

type Props = {
  state: EditorState;
  update: <K extends keyof EditorState>(key: K, value: EditorState[K]) => void;
};

export function BackgroundsPanel({ state, update }: Props) {
  const [category, setCategory] = useState<BackgroundCategory>("gradient");
  const list = useMemo(() => BACKGROUNDS.filter((b) => b.category === category), [category]);

  return (
    <div className="flex flex-col gap-3 p-3">
      <div className="flex flex-wrap gap-1">
        {BACKGROUND_CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategory(c.id)}
            className={cn(
              "rounded-md px-2 py-1 text-[11.5px] transition-colors",
              category === c.id
                ? "bg-surface-elevated/60 text-foreground"
                : "text-muted hover:bg-surface-elevated/30 hover:text-foreground"
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {list.map((b) => {
          const isActive = state.backgroundId === b.id;
          return (
            <button
              key={b.id}
              type="button"
              title={b.name}
              onClick={() => update("backgroundId", b.id)}
              className={cn(
                "group relative aspect-square overflow-hidden rounded-lg border transition-colors",
                isActive ? "border-accent" : "border-border-faint hover:border-border"
              )}
            >
              <div className="absolute inset-0" style={{ background: b.value }} />
              {isActive && (
                <div className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-accent text-body">
                  <svg viewBox="0 0 10 10" className="size-2.5">
                    <path d="M2 5l2 2 4-5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <p className="px-1 text-[11px] text-faint">
        Tip: arrastrá una imagen al canvas para usarla de fondo.
      </p>
    </div>
  );
}
