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

type Props = {
  state: EditorState;
  update: <K extends keyof EditorState>(key: K, value: EditorState[K]) => void;
};

export function RightSidebar({ state, update }: Props) {
  // UI-only — tab activo y modo de layout filter (visual por ahora).
  const [zoomTiltTab, setZoomTiltTab] = useState<ZoomTiltTab>("zoom");
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("single");

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
        {/* layouts-panel-controls-top.minimized-backdrop — fixed inside */}
        <div
          className="absolute inset-x-0 top-0 z-[20]"
          style={{
            paddingBottom: 0,
          }}
        >
          {/* :before pseudo — panel bg para tapar el contenido bajo */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0"
            style={{
              top: 0,
              bottom: 0,
              background: "rgb(28,28,28)",
              zIndex: -1,
            }}
          />

          {/* :after pseudo — gradient fade abajo para que el scroll desaparezca suave */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0"
            style={{
              top: "100%",
              height: 100,
              background:
                "linear-gradient(180deg, rgb(28,28,28) 30%, transparent 100%)",
              zIndex: -1,
            }}
          />

          {/* transform-controls-wrapper */}
          <div
            className="flex flex-col"
            style={{ gap: 8, padding: 10 }}
          >
            {/* position-controls — flex col gap 16 */}
            <div className="flex flex-col" style={{ gap: 16 }}>
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
                  <PrecisionHint />
                </div>

                {/* panel-control.zoom-panel-control — drag-pad arriba, slider abajo */}
                <div className="flex flex-col" style={{ gap: 8, width: 208 }}>
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
                  <ZoomSlider
                    value={state.zoom}
                    onChange={(v) => update("zoom", v)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* v-stack .scroll */}
        <div
          className="scrollbar-hidden relative h-full overflow-y-auto overflow-x-hidden"
          style={{ borderRadius: 16 }}
        >
          <div
            className="flex flex-col items-center"
            style={{
              gap: 10,
              padding: "210px 10px 40px",
            }}
          >
            <LayoutPresets
              value={state.layoutPresetId as LayoutPresetId}
              deviceId={state.deviceId}
              onChange={(id) => update("layoutPresetId", id)}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
