"use client";

import { PreviewPlaceholder } from "./PreviewPlaceholder";

/*
  .layout-item — grid de presets de layout. Cada item 208×156, radius 12.
  CSS legacy (scrapp.css:7867):
    bg rgba(primary, .06), cursor pointer, radius 12, position relative, overflow hidden.
    .layout-item:after — border-light-after (1px ring sutil).
    .layout-item.active — ring más fuerte.

  Cada preset aplica un transform al .component dentro del frame:
    - "center": translate(0,0) scale(1)
    - "tilted":  rotateZ(-8deg)
    - "zoom-top-1": translate(0,-40%) scale(1.8)
    - "zoom-top-2": translate(0,-66%) scale(2.5)
    - "zoom-bot-1": translate(0,40%)  scale(1.8)
    - "zoom-bot-2": translate(0,66%)  scale(2.5)

  Por ahora los previews son placeholders (gradient + posición). En el próximo
  paso meto el iPhone real con mask + transform aplicado al .component.
*/

export type LayoutPresetId =
  | "center"
  | "tilted"
  | "zoom-top-1"
  | "zoom-top-2"
  | "zoom-bot-1"
  | "zoom-bot-2";

/*
  Transforms verbatim del .component de shots.so.
  El "tilted" usa el matrix3d real que sale de combinar:
    perspective(30em) rotateX(~22°) rotateY(~-20°) rotateZ(~-8°)
  → matriz 4×4 con foreshortening (m14, m24, m34 negativos pequeños).
*/
/*
  Scales reducidos vs. el canvas real (1.8 / 2.5 originales) — en la miniatura
  el zoom agresivo deja el screenshot tocando los bordes y se ve "muy cerca".
  Acá usamos 1.3 / 1.6 que conservan el INTENT (top vs. bottom, leve vs. fuerte)
  pero mantienen el device contenido dentro del frame 208×156.
*/
export const PRESET_TRANSFORMS: Record<LayoutPresetId, string> = {
  center: "translate(0%, 0%) scale(1) rotateZ(0deg)",
  tilted:
    "matrix3d(0.907061, 0.134673, 0.398878, -0.00109582, -0.26181, 0.922409, 0.283931, -0.00078003, -0.329691, -0.361973, 0.87194, -0.00239544, 0, 0, 0, 1)",
  "zoom-top-1": "translate(0%, -22%) scale(1.3) rotateZ(0deg)",
  "zoom-top-2": "translate(0%, -36%) scale(1.6) rotateZ(0deg)",
  "zoom-bot-1": "translate(0%, 22%) scale(1.3) rotateZ(0deg)",
  "zoom-bot-2": "translate(0%, 36%) scale(1.6) rotateZ(0deg)",
};

const PRESETS: { id: LayoutPresetId; transform: string }[] = (
  Object.entries(PRESET_TRANSFORMS) as [LayoutPresetId, string][]
).map(([id, transform]) => ({ id, transform }));

const GRADIENT =
  "linear-gradient(140deg, rgb(255, 100, 50) 12.8%, rgb(255, 0, 101) 43.52%, rgb(123, 46, 255) 84.34%)";

export function LayoutPresets({
  value,
  deviceId,
  onChange,
}: {
  value: LayoutPresetId;
  deviceId: string;
  onChange: (id: LayoutPresetId) => void;
}) {
  return (
    <div
      className="flex flex-col"
      style={{ gap: 8, width: 208 }}
    >
      <span
        style={{
          font: "600 11px/16px Inter, sans-serif",
          letterSpacing: "0.4px",
          color: "rgba(240,240,240,0.36)",
          textTransform: "uppercase",
        }}
      >
        Layout presets
      </span>

      <div className="flex flex-col" style={{ gap: 10 }}>
        {PRESETS.map((preset) => (
          <LayoutItem
            key={preset.id}
            active={value === preset.id}
            transform={preset.transform}
            deviceId={deviceId}
            onClick={() => onChange(preset.id)}
          />
        ))}
      </div>
    </div>
  );
}

function LayoutItem({
  active,
  transform,
  deviceId,
  onClick,
}: {
  active: boolean;
  transform: string;
  deviceId: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative overflow-hidden"
      style={{
        width: 208,
        height: 156,
        background: "rgba(240,240,240,0.06)",
        borderRadius: 12,
        cursor: "pointer",
        outline: active ? "1.5px solid rgba(240,240,240,0.6)" : "none",
        outlineOffset: -1.5,
        transition: "outline-color 200ms",
      }}
    >
      {/* Frame: background gradient + .component con transform aplicado */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: GRADIENT }}
      />
      {/* .component (outer) aplica el preset transform al device.
          El rotateZ-8 + perspective sólo aplica al iPhone (.devices) en shots.so;
          para screenshot el "tilt" ya viene baked en el matrix3d del preset. */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          transform,
          transformOrigin: "center center",
          transition: "transform 0.125s linear",
        }}
      >
        <PreviewPlaceholder deviceId={deviceId} />
      </div>

      {/* Border-light-after ring sutil — .layout-item:after del legacy */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          borderRadius: 12,
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05)",
        }}
      />
    </button>
  );
}
