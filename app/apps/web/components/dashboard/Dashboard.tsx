"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Project } from "@shotso/db";
import { createProject, deleteProject } from "@/app/actions/projects";
import { AppNavbar } from "./AppNavbar";
import { ProjectCard } from "./ProjectCard";
import { NewProjectButton } from "./NewProjectButton";

type Props = {
  initialProjects: Project[];
  user: { name: string; email: string };
};

export function Dashboard({ initialProjects, user }: Props) {
  const router = useRouter();
  const [projects, setProjects] = useState(initialProjects);
  const [pending, startTransition] = useTransition();

  const handleCreate = () => {
    startTransition(async () => {
      const project = await createProject({
        name: "Sin título",
        canvasData: {
          deviceId: "iphone-16-pro",
          backgroundId: "violet",
          styleId: "default",
          screenshot: null,
        },
      });
      if (project) router.push(`/editor/${project.id}`);
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("¿Eliminar este proyecto? Esta acción no se puede deshacer.")) return;
    setProjects((prev) => prev.filter((p) => p.id !== id));
    startTransition(async () => {
      await deleteProject(id);
      router.refresh();
    });
  };

  return (
    <>
      <AppNavbar user={user} />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-[32px] font-medium leading-none tracking-[-0.025em]">
              Tus proyectos
            </h1>
            <p className="mt-2 text-[14px] text-muted">
              {projects.length === 0
                ? "Todavía no creaste ninguno."
                : `${projects.length} proyecto${projects.length === 1 ? "" : "s"}`}
            </p>
          </div>
          <NewProjectButton onClick={handleCreate} disabled={pending} />
        </header>

        {projects.length === 0 ? (
          <EmptyState onCreate={handleCreate} pending={pending} />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                onOpen={() => router.push(`/editor/${p.id}`)}
                onDelete={() => handleDelete(p.id)}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}

function EmptyState({ onCreate, pending }: { onCreate: () => void; pending: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-border-faint bg-surface/30 py-20 text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-surface-elevated">
        <svg viewBox="0 0 24 24" className="size-6 text-muted">
          <rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path d="M9 11l2 2 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      </div>
      <div className="max-w-xs">
        <h3 className="text-[16px] font-medium">Empezá tu primer mockup</h3>
        <p className="mt-1 text-[13px] text-muted">
          Subí un screenshot, elegí un device, fondo y estilo. Exportás en segundos.
        </p>
      </div>
      <button
        type="button"
        onClick={onCreate}
        disabled={pending}
        className="rounded-pill bg-primary px-5 py-2.5 text-[13px] font-medium text-body transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
      >
        {pending ? "Creando…" : "Crear proyecto"}
      </button>
    </div>
  );
}
