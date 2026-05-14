"use client";

import { useMemo } from "react";
import type { Project } from "@shotso/db";
import { getBackground } from "@/lib/backgrounds";

type Props = {
  project: Project;
  onOpen: () => void;
  onDelete: () => void;
};

interface CanvasData {
  deviceId: string;
  backgroundId: string;
  styleId: string;
  screenshot: string | null;
}

export function ProjectCard({ project, onOpen, onDelete }: Props) {
  const canvas = project.canvasData as CanvasData;
  const background = useMemo(() => getBackground(canvas.backgroundId), [canvas.backgroundId]);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border-faint bg-surface/40 transition-colors hover:border-border">
      <button
        type="button"
        onClick={onOpen}
        className="relative aspect-[4/3] w-full overflow-hidden"
        style={{ background: background?.value ?? "#1c1c1e" }}
      >
        {project.thumbnailKey ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={publicUrl(project.thumbnailKey)}
            alt={project.name}
            className="absolute inset-0 h-full w-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[12px] text-white/60">
            <span className="rounded-md border border-white/10 bg-black/30 px-2.5 py-1 backdrop-blur-sm">
              Sin preview todavía
            </span>
          </div>
        )}
      </button>

      <footer className="flex items-center justify-between gap-2 border-t border-border-faint px-4 py-3 text-[13px]">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-medium text-foreground" title={project.name}>
            {project.name}
          </h3>
          <p className="mt-0.5 text-[11.5px] text-muted">
            {formatRelative(new Date(project.updatedAt).getTime())}
          </p>
        </div>

        <button
          type="button"
          onClick={onDelete}
          className="flex size-7 shrink-0 items-center justify-center rounded-md text-faint opacity-0 transition-all hover:bg-danger/10 hover:text-danger group-hover:opacity-100"
          title="Eliminar"
          aria-label="Eliminar proyecto"
        >
          <svg viewBox="0 0 16 16" className="size-3.5">
            <path d="M3 5h10M6 5V3.5a1 1 0 011-1h2a1 1 0 011 1V5M5 5l1 8a1 1 0 001 1h2a1 1 0 001-1l1-8" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </footer>
    </article>
  );
}

function publicUrl(key: string): string {
  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "https://pub-5ad14bf9b5e143b0af5153b86b9e4cea.r2.dev";
  return `${base}/${key}`;
}

function formatRelative(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "Hace un instante";
  if (m < 60) return `Hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Hace ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `Hace ${d} d`;
  return new Date(ts).toLocaleDateString();
}
