"use client";

/*
  .precision-hint — "Hold ⇧ for precision".
  CSS legacy (scrapp.css:8332):
    opacity 0 default, visible class → opacity 1 + translate(0)
    transition: opacity .15s, transform .15s
    transform: translate(4px) por default
    .hint-key { 14×14, bg #ffffff1f, radius 3, font 600 9.5px Inter, color rgba(primary,.36) }
    .hint-text { font 9.5px/12px Inter, color rgba(primary,.36) }
*/

import { useEffect, useState } from "react";

export function PrecisionHint() {
  const [shiftDown, setShiftDown] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift") setShiftDown(true);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") setShiftDown(false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  return (
    <div
      className="flex items-center"
      style={{
        gap: 4,
        opacity: shiftDown ? 0.7 : 0.55,
        transform: shiftDown ? "translateX(0)" : "translateX(4px)",
        transition: "opacity 150ms, transform 150ms",
        pointerEvents: "none",
      }}
    >
      <span
        style={{
          color: "rgba(240,240,240,0.36)",
          font: "9.5px/12px Inter, sans-serif",
          letterSpacing: 0,
          whiteSpace: "nowrap",
        }}
      >
        Hold
      </span>
      <span
        style={{
          display: "grid",
          placeItems: "center",
          width: 14,
          height: 14,
          background: "rgba(255,255,255,0.12)",
          borderRadius: 3,
          color: "rgba(240,240,240,0.36)",
          font: "600 9.5px/12px Inter, sans-serif",
          letterSpacing: 0,
        }}
      >
        ⇧
      </span>
      <span
        style={{
          color: "rgba(240,240,240,0.36)",
          font: "9.5px/12px Inter, sans-serif",
          letterSpacing: 0,
          whiteSpace: "nowrap",
        }}
      >
        for precision
      </span>
    </div>
  );
}
