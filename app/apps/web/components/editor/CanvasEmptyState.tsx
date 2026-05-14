"use client";

/*
  Empty state del lienzo cuando no hay screenshot — "Select Media / Open Media Picker".
  Clon del estado por defecto que se ve en shots.so antes de subir nada.

  Tipografía:
    Title    "Select Media"      → 500 28px/36px Inter, color rgba(240,240,240,0.4)
    Subtitle "Open Media Picker" → 400 13px/18px Inter, color rgba(240,240,240,0.32)
    Icon     image-plus 48px     → color rgba(240,240,240,0.55)

  Click sobre cualquier parte del black area → abre file picker.
*/

export function CanvasEmptyState({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute inset-0 flex flex-col items-center justify-center transition-opacity hover:opacity-90"
      style={{
        background: "transparent",
        border: "none",
        cursor: "pointer",
        gap: 14,
      }}
      aria-label="Open Media Picker"
    >
      <SelectMediaIcon />
      <div className="flex flex-col items-center" style={{ gap: 6 }}>
        <h2
          style={{
            font: "500 28px/36px Inter, sans-serif",
            letterSpacing: "-0.8px",
            color: "rgba(240,240,240,0.42)",
            margin: 0,
          }}
        >
          Select Media
        </h2>
        <p
          style={{
            font: "400 13px/18px Inter, sans-serif",
            letterSpacing: "-0.2px",
            color: "rgba(240,240,240,0.3)",
            margin: 0,
          }}
        >
          Open Media Picker
        </p>
      </div>
    </button>
  );
}

function SelectMediaIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={48}
      height={48}
      style={{ color: "rgba(240,240,240,0.55)" }}
    >
      {/* image frame */}
      <rect
        x="3"
        y="6"
        width="20"
        height="18"
        rx="4.5"
        fill="currentColor"
      />
      {/* sun */}
      <circle cx="9" cy="12" r="2" fill="rgb(13,13,13)" />
      {/* landscape line */}
      <path
        d="M4 22 L10 16 L14 19 L18 15 L22 20"
        stroke="rgb(13,13,13)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* + circle top-right — separado del frame con borde dark */}
      <circle
        cx="24.5"
        cy="7.5"
        r="5"
        fill="currentColor"
        stroke="rgb(13,13,13)"
        strokeWidth="1.6"
      />
      <path
        d="M24.5 4.5 V10.5 M21.5 7.5 H27.5"
        stroke="rgb(13,13,13)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
