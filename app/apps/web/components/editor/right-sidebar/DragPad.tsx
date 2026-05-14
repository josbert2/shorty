"use client";

/*
  .position-pad-safearea + .drag-pad-wrapper.zoom-pad — pad 2D arriba del slider de zoom.
  CSS legacy match (scrapp.css):
    .position-pad-safearea  → bg panel-dim, radius 14, flex col align-center.
    .drag-pad-wrapper       → bg panel-dim, radius 14, overflow hidden.
    .drag-pad-wrapper .pad-preview → z-index 0, absolute inset 0.
    .drag-pad-wrapper.zoom-pad .pad-preview → filter: brightness(40%)  [DESACTIVADO para
                                                  match exacto del screenshot que dejaste].
    .drag-pad-wrapper.zoom-pad .default-viewfinder → backdrop-filter brightness(200%),
                                                      bg #64646433, radius 14.
    .drag-pad           → position relative, drag area real.
    .drag-pad .drag-handle → cursor grab, z 2, absolute.
    .drag-pad .drag-handle:after → bg panel-active, círculo blanco, scale 1.1.

  Comportamiento:
    - El preview (gradient + iPhone) refleja el preset de layout activo.
    - El drag-handle representa el centro de la cámara — se arrastra para mover el .component
      del canvas via positionX/positionY (-1..1).
    - Hold Shift = lock al eje dominante.
    - Tamaño del handle = inversamente proporcional al zoom (más zoom → más chico).
*/

import { useRef, useState } from "react";
import { PreviewPlaceholder } from "./PreviewPlaceholder";

const WRAPPER_W = 208;
const PAD_W = 200;
const PAD_H = 148;
const HANDLE_BASE_W = 200; // a zoom 100% el handle ocupa todo el pad
const HANDLE_BASE_H = 148;

const GRADIENT =
  "linear-gradient(140deg, rgb(255, 100, 50) 12.8%, rgb(255, 0, 101) 43.52%, rgb(123, 46, 255) 84.34%)";

type Props = {
  positionX: number; // -1..1
  positionY: number; // -1..1
  zoom: number; // 75..400
  presetTransform: string;
  deviceId: string;
  onPositionChange: (x: number, y: number) => void;
};

export function DragPad({
  positionX,
  positionY,
  zoom,
  presetTransform,
  deviceId,
  onPositionChange,
}: Props) {
  const padRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Handle size: a 100% ocupa el pad entero; a 200% se reduce a la mitad.
  const zoomScale = 100 / zoom;
  const handleW = Math.max(20, HANDLE_BASE_W * zoomScale);
  const handleH = Math.max(15, HANDLE_BASE_H * zoomScale);

  // Cuanto puede moverse el handle desde el centro
  const maxX = (PAD_W - handleW) / 2;
  const maxY = (PAD_H - handleH) / 2;
  const handleX = positionX * maxX;
  const handleY = positionY * maxY;

  const isCentered =
    Math.abs(positionX) < 0.001 && Math.abs(positionY) < 0.001;

  const updateFromPointer = (
    clientX: number,
    clientY: number,
    shift: boolean,
  ) => {
    const rect = padRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const halfW = rect.width / 2 - handleW / 2;
    const halfH = rect.height / 2 - handleH / 2;
    if (halfW <= 0 || halfH <= 0) return;
    const rawX = (clientX - cx) / halfW;
    const rawY = (clientY - cy) / halfH;
    const x = Math.max(-1, Math.min(1, rawX));
    const y = Math.max(-1, Math.min(1, rawY));

    if (shift) {
      if (Math.abs(x) > Math.abs(y)) onPositionChange(x, 0);
      else onPositionChange(0, y);
    } else {
      onPositionChange(x, y);
    }
  };

  return (
    <div
      className="relative flex items-end justify-center"
      style={{
        width: WRAPPER_W,
        background: "rgb(13,13,13)",
        borderRadius: 14,
        padding: 4,
        overflow: "hidden",
      }}
    >
      {/* drag-pad-wrapper.zoom-pad */}
      <div
        className="relative"
        style={{
          width: PAD_W,
          height: PAD_H,
          borderRadius: 11,
          overflow: "hidden",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* pad-preview — gradient + iPhone con transform del preset activo */}
        <div className="pointer-events-none absolute inset-0">
          <div
            aria-hidden
            className="absolute inset-0"
            style={{ background: GRADIENT }}
          />
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transform: presetTransform,
              transformOrigin: "center center",
              transition: "transform 200ms cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            <PreviewPlaceholder deviceId={deviceId} />
          </div>
        </div>

        {/* drag-pad — área activa */}
        <div
          ref={padRef}
          className="absolute inset-0"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            setDragging(true);
            updateFromPointer(e.clientX, e.clientY, e.shiftKey);
          }}
          onPointerMove={(e) => {
            if (e.currentTarget.hasPointerCapture(e.pointerId)) {
              updateFromPointer(e.clientX, e.clientY, e.shiftKey);
            }
          }}
          onPointerUp={(e) => {
            e.currentTarget.releasePointerCapture(e.pointerId);
            setDragging(false);
          }}
          onDoubleClick={() => onPositionChange(0, 0)}
          style={{
            cursor: dragging ? "grabbing" : "grab",
            touchAction: "none",
          }}
        >
          {/* drag-handle + viewfinder-div (highlighta el viewport visible) */}
          <div
            className="pointer-events-none absolute"
            style={{
              left: "50%",
              top: "50%",
              width: handleW,
              height: handleH,
              transform: `translate(calc(-50% + ${handleX}px), calc(-50% + ${handleY}px))`,
              transition: dragging
                ? "none"
                : "transform 200ms cubic-bezier(0.16,1,0.3,1), width 200ms, height 200ms",
              borderRadius: 8,
              background: "rgba(100,100,100,0.2)",
              backdropFilter: "brightness(180%)",
              WebkitBackdropFilter: "brightness(180%)",
              border: `1px solid rgba(255,255,255,${dragging ? 0.5 : 0.2})`,
              opacity: dragging || hovered || !isCentered ? 1 : 0.65,
            }}
          />
        </div>
      </div>
    </div>
  );
}

