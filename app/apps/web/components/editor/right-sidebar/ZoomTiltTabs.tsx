"use client";

/*
  .switch.zoom-tilt-tabs — switch label-only (Zoom / Tilt).
  CSS legacy (scrapp.css:8157):
    --radius: 10px; --gap: 2px; --label-button-padding: 3px 8px;
    width: fit-content
    .switch-button { justify-content: center; min-width: 42px }
    .switch-button p { letter-spacing: -.2px; font: 500 11px/14px Inter }
*/

export type ZoomTiltTab = "zoom" | "tilt";

const TABS: { id: ZoomTiltTab; label: string }[] = [
  { id: "zoom", label: "Zoom" },
  { id: "tilt", label: "Tilt" },
];

const BTN_GAP = 2;

export function ZoomTiltTabs({
  value,
  onChange,
}: {
  value: ZoomTiltTab;
  onChange: (tab: ZoomTiltTab) => void;
}) {
  const activeIdx = TABS.findIndex((t) => t.id === value);

  return (
    <div
      className="relative flex flex-row"
      style={{
        height: 26,
        padding: 2,
        gap: BTN_GAP,
        background: "rgb(13,13,13)",
        borderRadius: 10,
        width: "fit-content",
      }}
    >
      {/* Active indicator */}
      <div
        aria-hidden
        className="absolute"
        style={{
          top: 2,
          left: 2,
          width: `calc(50% - ${BTN_GAP / 2}px)`,
          height: 22,
          background: "rgb(85,85,85)",
          borderRadius: 8,
          boxShadow: "0 2px 4px -2px rgba(0,0,0,0.24)",
          transform: `translateX(calc(${activeIdx * 100}% + ${activeIdx * BTN_GAP}px))`,
          transition: "transform 320ms cubic-bezier(0.22, 1.15, 0.36, 1)",
        }}
      />

      {TABS.map(({ id, label }, idx) => {
        const isActive = idx === activeIdx;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className="relative flex items-center justify-center"
            style={{
              minWidth: 42,
              height: 22,
              padding: "3px 8px",
              borderRadius: 8,
              zIndex: 1,
              cursor: "pointer",
            }}
          >
            <p
              style={{
                margin: 0,
                font: "500 11px/14px Inter, sans-serif",
                letterSpacing: "-0.2px",
                color: "rgb(240,240,240)",
                opacity: isActive ? 1 : 0.5,
                transition: "opacity 200ms cubic-bezier(0.16,1,0.3,1)",
                textTransform: "capitalize",
              }}
            >
              {label}
            </p>
          </button>
        );
      })}
    </div>
  );
}
