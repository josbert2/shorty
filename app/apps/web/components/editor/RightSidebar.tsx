"use client";

/*
  RightSidebar — clon de .control-panel.layout-panel + .sidebar.camila-right.
  CSS legacy match (scrapp.css):
    .control-panel.layout-panel — 228 wide, bg rgb(28,28,28), radius 16, overflow hidden.
    .layouts-panel-controls-top.minimized-backdrop — absolute top, z-index 20,
      con pseudo-elementos :before (panel bg) y :after (gradient fade).
    .transform-controls-wrapper — flex col gap 8 padding 10.
    .position-controls — flex col gap 16.
    .zoom-tilt-controls — flex col gap 8.
    .zoom-tilt-header — flex space-between, gap 8.
    .v-stack .scroll — overflow-y auto, scrollbar oculto.
    .v-stack-content — gap 10, padding 146 10 100 10 (top deja espacio al
      transform-controls-wrapper absolute).

  Estructura:
    [fixed top]
      - LayoutFilters (3 icon-only)
      - Zoom/Tilt tabs + PrecisionHint
      - ZoomSlider
    [scroll]
      - LayoutPresets grid (6 items)

  Posicionamiento como el left Sidebar: fixed right, top 64 (debajo del topbar).
*/

import { useState } from "react";
import { motion } from "motion/react";
import type { EditorState } from "./Editor";
import { LayoutFilters, type LayoutMode } from "./right-sidebar/LayoutFilters";
import { ZoomTiltTabs, type ZoomTiltTab } from "./right-sidebar/ZoomTiltTabs";
import { PrecisionHint } from "./right-sidebar/PrecisionHint";
import { ZoomSlider } from "./right-sidebar/ZoomSlider";
import { DragPad } from "./right-sidebar/DragPad";
import {
  LayoutPresets,
  type LayoutPresetId,
  PRESET_TRANSFORMS,
} from "./right-sidebar/LayoutPresets";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
const T_PANEL = { duration: 0.3, ease: EASE_OUT_EXPO };
const T_HINT = { duration: 0.15, ease: EASE_OUT_EXPO };

type Props = {
  state: EditorState;
  update: <K extends keyof EditorState>(key: K, value: EditorState[K]) => void;
};

export function RightSidebar({ state, update }: Props) {
  // UI-only — tab activo y modo de layout filter (visual por ahora).
  const [zoomTiltTab, setZoomTiltTab] = useState<ZoomTiltTab>("zoom");
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("single");
  // Estado de minimizado del panel — se activa al scrollear el v-stack.
  const [minimized, setMinimized] = useState(false);

  return (
    <aside
      className="fixed flex items-stretch p-3"
      style={{
        top: 64,
        right: 0,
        bottom: 0,
        width: 252,
        zIndex: 100,
      }}
    >
      <div
        className="relative flex w-full flex-col overflow-hidden"
        style={{
          width: 228,
          height: "100%",
          background: "rgb(28,28,28)",
          borderRadius: 16,
        }}
      >
        {/* layouts-panel-controls-top — DOM real:
             initial → height: max-content (~306)
             minimized → height: 146 exacto (scrap_State.html:3303). */}
        <motion.div
          className="absolute inset-x-0 top-0 z-[20] overflow-hidden"
          initial={false}
          animate={{ height: minimized ? 146 : 306 }}
          transition={T_PANEL}
        >
          {/* ::after del original — backdrop SOLO en minimized.
              Match a scrapp.css:2715:
                .layouts-panel-controls-top.minimized-backdrop::after {
                  background: linear-gradient(rgb(28,28,28) 30%, transparent 100%);
                  height: 100px; top: 0; z-index: -1;
                }
              En state initial NO existe — los componentes internos (drag-pad-wrapper,
              switch con bg rgb(13,13,13)) ya tapan visualmente todo el panel. */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-x-0"
            style={{
              top: 0,
              height: 130,
              background:
                "linear-gradient(180deg, rgb(28,28,28) 55%, transparent 100%), linear-gradient(180deg, rgb(28,28,28) 55%, transparent 100%)",
              zIndex: -1,
            }}
            initial={false}
            animate={{ opacity: minimized ? 1 : 0 }}
            transition={T_PANEL}
          />

          {/* transform-controls-wrapper */}
          <div
            className="flex flex-col"
            style={{ gap: 8, padding: 10 }}
          >
            {/* position-controls — valores exactos del DOM real (scrap_State.html:3303):
                  transform: translateY(-82.4px) scale(0.4)
                  filter: drop-shadow(0 10px 10px rgba(0,0,0,0.6)). */}
            <motion.div
              className="flex flex-col"
              style={{ gap: 16, willChange: "transform, filter" }}
              animate={{
                scale: minimized ? 0.4 : 1,
                y: minimized ? -82.4 : 0,
                filter: minimized
                  ? "drop-shadow(0 10px 10px rgba(0,0,0,0.6))"
                  : "drop-shadow(0 0 0 rgba(0,0,0,0))",
              }}
              transition={T_PANEL}
            >
              {/* LayoutFilters */}
              <div className="flex" style={{ gap: 4 }}>
                <LayoutFilters value={layoutMode} onChange={setLayoutMode} />
              </div>

              {/* zoom-tilt-controls */}
              <div className="flex flex-col" style={{ gap: 8 }}>
                {/* zoom-tilt-header */}
                <div
                  className="flex items-center justify-between"
                  style={{ gap: 8 }}
                >
                  <ZoomTiltTabs value={zoomTiltTab} onChange={setZoomTiltTab} />
                  <motion.div
                    animate={{
                      opacity: minimized ? 0 : 1,
                      x: minimized ? 4 : 0,
                    }}
                    transition={T_HINT}
                  >
                    <PrecisionHint />
                  </motion.div>
                </div>

                {/* panel-control.zoom-panel-control — DOM real (scrap_State.html CSS):
                    transform: matrix(1, 0, 0, 1, 0, -30). */}
                <motion.div
                  className="flex flex-col"
                  style={{ gap: 8, width: 208 }}
                  animate={{ y: minimized ? -30 : 0 }}
                  transition={T_PANEL}
                >
                  <DragPad
                    positionX={state.positionX}
                    positionY={state.positionY}
                    zoom={state.zoom}
                    deviceId={state.deviceId}
                    presetTransform={
                      PRESET_TRANSFORMS[state.layoutPresetId as LayoutPresetId] ??
                      PRESET_TRANSFORMS.center
                    }
                    onPositionChange={(x, y) => {
                      update("positionX", x);
                      update("positionY", y);
                    }}
                  />
                  <motion.div
                    initial={false}
                    animate={{ opacity: minimized ? 0 : 1 }}
                    transition={T_HINT}
                  >
                    <ZoomSlider
                      value={state.zoom}
                      onChange={(v) => update("zoom", v)}
                    />
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* v-stack .scroll — el scroll dispara el minimizado del panel superior. */}
        <div
          className="scrollbar-hidden relative h-full overflow-y-auto overflow-x-hidden"
          style={{ borderRadius: 16 }}
          onScroll={(e) => setMinimized(e.currentTarget.scrollTop > 4)}
        >
          <motion.div
            className="flex flex-col items-center"
            style={{ gap: 10, paddingLeft: 10, paddingRight: 10, paddingBottom: 40 }}
            initial={false}
            animate={{ paddingTop: minimized ? 170 : 320 }}
            transition={T_PANEL}
          >
            <LayoutPresets
              value={state.layoutPresetId as LayoutPresetId}
              deviceId={state.deviceId}
              onChange={(id) => update("layoutPresetId", id)}
            />
          </motion.div>
        </div>
      </div>
    </aside>
  );
}
