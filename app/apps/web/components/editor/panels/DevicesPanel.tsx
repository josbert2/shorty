"use client";

import { useMemo, useState } from "react";
import { DEVICES, DEVICE_CATEGORIES, type DeviceCategory } from "@/lib/devices";
import type { EditorState } from "../Editor";
import { cn } from "@/lib/utils";

type Props = {
  state: EditorState;
  update: <K extends keyof EditorState>(key: K, value: EditorState[K]) => void;
};

export function DevicesPanel({ state, update }: Props) {
  const [category, setCategory] = useState<DeviceCategory>("phone");
  const list = useMemo(() => DEVICES.filter((d) => d.category === category), [category]);

  return (
    <div className="flex flex-col gap-3 p-3">
      <div className="flex flex-wrap gap-1">
        {DEVICE_CATEGORIES.map((c) => (
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

      <div className="grid grid-cols-2 gap-2">
        {list.map((d) => {
          const isActive = state.deviceId === d.id;
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => update("deviceId", d.id)}
              className={cn(
                "group flex flex-col items-center gap-2 rounded-lg border p-3 text-[11.5px] transition-colors",
                isActive
                  ? "border-accent bg-accent/10 text-foreground"
                  : "border-border-faint bg-surface/50 text-muted hover:border-border hover:text-foreground"
              )}
            >
              <div
                className="relative w-full"
                style={{ aspectRatio: d.aspectRatio }}
              >
                <div
                  className="absolute inset-0 border"
                  style={{
                    borderRadius: Math.min(d.chassisRadius / 3, 8),
                    background: d.bezelColor,
                    borderColor: "rgba(255,255,255,0.08)",
                  }}
                />
                <div
                  className="absolute"
                  style={{
                    inset: `${d.dropPadding[0]}% ${d.dropPadding[1]}% ${d.dropPadding[2]}% ${d.dropPadding[3]}%`,
                    background: "linear-gradient(160deg, #0a0a2e, #1a0533)",
                    borderRadius: Math.min(d.chassisRadius / 6, 4),
                  }}
                />
              </div>
              <span className="line-clamp-1 text-center">{d.name}</span>
            </button>
          );
        })}
        {list.length === 0 && (
          <div className="col-span-2 rounded-lg border border-dashed border-border-faint p-6 text-center text-[12px] text-muted">
            Próximamente
          </div>
        )}
      </div>
    </div>
  );
}
