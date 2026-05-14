"use client";

/*
  Slider de zoom 75–400% — usa el mismo .slider-component que el RadiusSlider del
  border-control. Diferencia: rango, label "Zoom" y formato del valor (con %).
  DOM real (scrap.html): aria-valuemin="75" aria-valuemax="400", aria-valuenow="100".

  Hold Shift = precision (paso de 1 en vez de 5).
*/

import { useRef } from "react";

const MIN = 75;
const MAX = 400;
const WIDTH = 208;
const HEIGHT = 30;
const THUMB_W = 7;

export function ZoomSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pct = (value - MIN) / (MAX - MIN);

  const updateFromClientX = (clientX: number, shift: boolean) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const raw = MIN + ratio * (MAX - MIN);
    const step = shift ? 1 : 5;
    onChange(Math.max(MIN, Math.min(MAX, Math.round(raw / step) * step)));
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    updateFromClientX(e.clientX, e.shiftKey);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      updateFromClientX(e.clientX, e.shiftKey);
    }
  };

  return (
    <div
      ref={trackRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      role="slider"
      aria-label="Zoom"
      aria-valuemin={MIN}
      aria-valuemax={MAX}
      aria-valuenow={value}
      tabIndex={0}
      onKeyDown={(e) => {
        const step = e.shiftKey ? 1 : 5;
        if (e.key === "ArrowLeft") onChange(Math.max(MIN, value - step));
        if (e.key === "ArrowRight") onChange(Math.min(MAX, value + step));
      }}
      className="relative outline-none"
      style={{
        width: WIDTH,
        height: HEIGHT,
        background: "rgb(13,13,13)",
        borderRadius: 8,
        cursor: "pointer",
        userSelect: "none",
        touchAction: "none",
      }}
    >
      {/* Range fill */}
      <div
        className="pointer-events-none absolute"
        style={{
          top: 0,
          left: 0,
          width: `${pct * 100}%`,
          height: "100%",
          background: "rgba(85,85,85,0.7)",
          borderRadius: 8,
          boxShadow: "0 1.5px 6px -3px rgba(0,0,0,0.4)",
          transition: "width 60ms linear",
        }}
      />

      {/* Thumb */}
      <div
        className="pointer-events-none absolute"
        style={{
          top: 2,
          left: `calc(${pct * 100}% - ${THUMB_W / 2}px)`,
          width: THUMB_W,
          height: HEIGHT - 4,
          background: "rgb(85,85,85)",
          borderRadius: 2.5,
          boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
          transition: "left 60ms linear",
        }}
      />

      {/* Labels overlay */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-between"
        style={{ padding: "0 12px", zIndex: 1 }}
      >
        <span
          style={{
            font: "400 11px/14px Inter, sans-serif",
            letterSpacing: "-0.2px",
            color: "rgba(240,240,240,0.36)",
          }}
        >
          Zoom
        </span>
        <span
          style={{
            font: "400 11px/14px Inter, sans-serif",
            letterSpacing: "-0.2px",
            color: "rgba(240,240,240,0.6)",
          }}
        >
          {value}%
        </span>
      </div>
    </div>
  );
}
