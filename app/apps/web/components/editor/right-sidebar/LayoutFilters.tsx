"use client";

/*
  .layout-filters — switch de 3 botones icon-only (Single / Double / Triple).
  CSS legacy (scrapp.css:7850):
    .layout-panel .layout-filters { gap: 4px; display: flex }
  Switch base (scrapp.css:3567+): .switch.switch-button.icon-only — width 42px del active
    indicator, layouts comparten estilo del switch genérico.

  El indicator anima X via translateX (mismo patrón que ShapeSwitch del border-control).
*/

import { SingleLayoutIcon, DoubleLayoutIcon, TripleLayoutIcon } from "./icons";

export type LayoutMode = "single" | "double" | "triple";

const FILTERS = [
  { id: "single", Icon: SingleLayoutIcon },
  { id: "double", Icon: DoubleLayoutIcon },
  { id: "triple", Icon: TripleLayoutIcon },
] as const;

const BTN_WIDTH = 64;
const BTN_GAP = 4;

export function LayoutFilters({
  value,
  onChange,
}: {
  value: LayoutMode;
  onChange: (mode: LayoutMode) => void;
}) {
  const activeIdx = FILTERS.findIndex((f) => f.id === value);

  return (
    <div
      className="relative flex flex-1 flex-row"
      style={{
        height: 42,
        padding: 3,
        gap: BTN_GAP,
        background: "rgb(13,13,13)",
        borderRadius: 12,
      }}
    >
      {/* Active indicator */}
      <div
        aria-hidden
        className="absolute"
        style={{
          top: 3,
          left: 3,
          width: BTN_WIDTH,
          height: 36,
          background: "rgb(85,85,85)",
          borderRadius: 9,
          boxShadow: "0 3px 6px -3px rgba(0,0,0,0.24)",
          transform: `translateX(${activeIdx * (BTN_WIDTH + BTN_GAP)}px)`,
          transition: "transform 380ms cubic-bezier(0.22, 1.15, 0.36, 1)",
        }}
      />

      {FILTERS.map(({ id, Icon }, idx) => {
        const isActive = idx === activeIdx;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id as LayoutMode)}
            className="relative flex items-center justify-center"
            style={{
              flex: 1,
              height: 36,
              borderRadius: 9,
              zIndex: 1,
              cursor: "pointer",
              color: "rgb(240,240,240)",
              opacity: isActive ? 1 : 0.5,
              transition: "opacity 200ms cubic-bezier(0.16,1,0.3,1)",
            }}
            aria-label={id}
          >
            <Icon />
          </button>
        );
      })}
    </div>
  );
}
