"use client";

import { useRef, useState } from "react";
import type { Project } from "@shotso/db";
import { EditorTopbar } from "./EditorTopbar";
import { Canvas } from "./Canvas";
import { Sidebar } from "./Sidebar";
import { RightSidebar } from "./RightSidebar";
import { ExportDialog } from "./ExportDialog";
import { useHistory } from "./useHistory";
import { useAutosave } from "./useAutosave";

export type EditorState = {
  deviceId: string;
  backgroundId: string;
  styleId: string;
  /** URL pública del screenshot (en R2) o data URL (fallback). null = sin screenshot. */
  screenshot: string | null;
  /** Border radius del screenshot en px. 0 = sharp, 40 = round. */
  screenshotRadius: number;
  /** Zoom del canvas en %. Rango 75–400, default 100. */
  zoom: number;
  /** Preset de layout (center | tilted | zoom-top-1 | zoom-top-2 | zoom-bot-1 | zoom-bot-2). */
  layoutPresetId: string;
  /** Posición X del .component en el canvas. -1..1, 0 = centro. */
  positionX: number;
  /** Posición Y del .component en el canvas. -1..1, 0 = centro. */
  positionY: number;
};

function fromProject(p: Project): EditorState {
  const data = p.canvasData as Partial<EditorState>;
  return {
    deviceId: data.deviceId ?? "iphone-16-pro",
    backgroundId: data.backgroundId ?? "violet",
    styleId: data.styleId ?? "default",
    screenshot: data.screenshot ?? null,
    screenshotRadius: typeof data.screenshotRadius === "number" ? data.screenshotRadius : 32,
    zoom: typeof data.zoom === "number" ? data.zoom : 100,
    layoutPresetId: data.layoutPresetId ?? "tilted",
    positionX: typeof data.positionX === "number" ? data.positionX : 0,
    positionY: typeof data.positionY === "number" ? data.positionY : 0,
  };
}

const INITIAL_STATE: EditorState = {
  deviceId: "iphone-16-pro",
  backgroundId: "violet",
  styleId: "default",
  screenshot: null,
  screenshotRadius: 32,
  zoom: 100,
  layoutPresetId: "tilted",
  positionX: 0,
  positionY: 0,
};

export function Editor({ project, userId }: { project: Project; userId: string }) {
  const { state, set, undo, redo, canUndo, canRedo } = useHistory<EditorState>(fromProject(project));
  const [name, setName] = useState(project.name);
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement | null>(null);

  const saveStatus = useAutosave(project.id, state, name);

  const update = <K extends keyof EditorState>(key: K, value: EditorState[K]) =>
    set((s) => ({ ...s, [key]: value }));

  const handleReset = () => {
    set(INITIAL_STATE);
    setName("Sin título");
  };

  return (
    <div className="flex h-screen flex-col">
      <EditorTopbar
        onExport={() => setExportOpen(true)}
        onUndo={undo}
        onRedo={redo}
        onReset={handleReset}
        canUndo={canUndo}
        canRedo={canRedo}
        saveStatus={saveStatus}
      />
      <div className="relative flex flex-1 overflow-hidden">
        {/* Sidebar es position:fixed — no toma espacio del flex. */}
        <Sidebar
          state={state}
          update={update}
          userId={userId}
          projectId={project.id}
        />
        {/* Canvas ocupa todo el ancho. Padding L+R para no quedar tapado por los sidebars. */}
        <div className="flex-1" style={{ paddingLeft: 252, paddingRight: 252 }}>
          <Canvas
            state={state}
            update={update}
            exportRef={exportRef}
            userId={userId}
            projectId={project.id}
          />
        </div>
        <RightSidebar state={state} update={update} />
      </div>

      <ExportDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        targetRef={exportRef}
        projectId={project.id}
        state={state}
      />
    </div>
  );
}
