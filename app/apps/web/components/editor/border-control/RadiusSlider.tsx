"use client";

/*
  Slider de radius 0–40 — clon del .slider-component de shots.so.
  CSS real (scrap.html):
    .slider-component { 208×30, radius 8 }
    .SliderTrack      { 208×30, bg rgb(13,13,13), radius 8 }
    .SliderRange      { absolute fill, bg rgba(85,85,85,0.7), shadow 0 1.5px 6px -3px,
                        ancho según valor (left:0 right:%) }
    .SliderThumb      { 7×26, margin 2 0, bg rgb(85,85,85), radius 2.5,
                        box-shadow 0 1px 3px rgba(0,0,0,0.15) }
    .labels           { absolute fill, padding 0 12, justify space-between, align center,
                        z-index 1, pointer-events none }
    label             { 11px/14 Inter 400, letter-spacing -0.2, color rgba(240,240,240,0.36) }

  Drag con pointer events para mouse + touch.
*/

import { useRef } from "react";

const MIN = 0;
const MAX = 40;
const WIDTH = 208;
const HEIGHT = 30;
const THUMB_W = 7;

export function RadiusSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pct = (value - MIN) / (MAX - MIN);

  const updateFromClientX = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    onChange(Math.round(MIN + ratio * (MAX - MIN)));
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    updateFromClientX(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      updateFromClientX(e.clientX);
    }
  };

  return (
    <div
      ref={trackRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      role="slider"
      aria-label="Radius"
      aria-valuemin={MIN}
      aria-valuemax={MAX}
      aria-valuenow={value}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") onChange(Math.max(MIN, value - 1));
        if (e.key === "ArrowRight") onChange(Math.min(MAX, value + 1));
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
      {/* Range / rail fill */}
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
          transition: "width 80ms linear",
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
          transition: "left 80ms linear, background 0.2s",
        }}
      />

      {/* Labels overlay (Radius + value) */}
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
          Radius
        </span>
        <span
          style={{
            font: "400 11px/14px Inter, sans-serif",
            letterSpacing: "-0.2px",
            color: "rgba(240,240,240,0.6)",
          }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}
