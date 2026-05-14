"use client";

/*
  Switch de 3 botones — Sharp / Curved / Round.
  CSS real (de scrap.html):
    .switch          { 208×62, padding 3, gap 3, bg rgb(13,13,13), radius 12 }
    .switch-button   { 65.34×56, padding 8 0, gap 6, radius 9, flex-col, items+justify center }
    .switch-button-active-indicator { absolute 65.34×56, bg rgb(85,85,85), radius 9,
                                       shadow 0 3px 6px -3px rgba(0,0,0,0.24) }
    .visual / .icon-wrapper { 20×20 }
    svg              { opacity 0.5 (inactive), 1 (active) }
    p.text-capitalize { 11px/14px, letter-spacing -0.2px, opacity 0.5/1 }

  Indicator anima X con transform — FLIP slide entre los 3 botones.
*/

import { SharpIcon, CurvedIcon, RoundIcon } from "./icons";

const BTN_WIDTH = 65.34;
const BTN_GAP = 3;
const SHAPES = [
  { id: "sharp", label: "Sharp", radius: 0, Icon: SharpIcon },
  { id: "curved", label: "Curved", radius: 20, Icon: CurvedIcon },
  { id: "round", label: "Round", radius: 40, Icon: RoundIcon },
] as const;

function getActiveIndex(radius: number): 0 | 1 | 2 {
  if (radius <= 0) return 0;
  if (radius >= 40) return 2;
  return 1;
}

export function ShapeSwitch({
  radius,
  onChange,
}: {
  radius: number;
  onChange: (value: number) => void;
}) {
  const activeIdx = getActiveIndex(radius);

  return (
    <div
      className="relative flex flex-row overflow-hidden"
      style={{
        width: 208,
        height: 62,
        padding: 3,
        gap: BTN_GAP,
        background: "rgb(13,13,13)",
        borderRadius: 12,
      }}
    >
      {/* Active indicator — desliza entre botones via translateX */}
      <div
        aria-hidden
        className="absolute"
        style={{
          top: 3,
          left: 3,
          width: BTN_WIDTH,
          height: 56,
          background: "rgb(85,85,85)",
          borderRadius: 9,
          boxShadow: "0 3px 6px -3px rgba(0,0,0,0.24)",
          transform: `translateX(${activeIdx * (BTN_WIDTH + BTN_GAP)}px)`,
          transition: "transform 380ms cubic-bezier(0.22, 1.15, 0.36, 1)",
        }}
      />

      {SHAPES.map((shape, idx) => {
        const isActive = idx === activeIdx;
        return (
          <button
            key={shape.id}
            type="button"
            onClick={() => onChange(shape.radius)}
            className="relative flex flex-col items-center justify-center"
            style={{
              flex: 1,
              height: 56,
              gap: 6,
              padding: "8px 0",
              borderRadius: 9,
              zIndex: 1,
              cursor: "pointer",
            }}
          >
            <span
              style={{
                display: "grid",
                placeItems: "center",
                width: 20,
                height: 20,
                color: "rgb(240,240,240)",
                opacity: isActive ? 1 : 0.5,
                transition: "opacity 200ms cubic-bezier(0.16,1,0.3,1)",
              }}
            >
              <shape.Icon />
            </span>
            <p
              style={{
                margin: 0,
                font: "400 11px/14px Inter, sans-serif",
                letterSpacing: "-0.2px",
                color: "rgb(240,240,240)",
                opacity: isActive ? 1 : 0.5,
                transition: "opacity 200ms cubic-bezier(0.16,1,0.3,1)",
                textTransform: "capitalize",
              }}
            >
              {shape.label}
            </p>
          </button>
        );
      })}
    </div>
  );
}
