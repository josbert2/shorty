"use client";

/*
  Border control — panel completo del .panel-control "camila" de shots.so.
  CSS real:
    .panel-control       { flex-col gap 8, width 208 }
    .label.gray-text     { 11px/16 600 Inter, letter-spacing 0.4, uppercase,
                           color rgba(240,240,240,0.36) }
    .controls            { flex-col gap 8, width 208, height 100 (62+30+gap 8) }
    .panel-control-grid.col-1 { grid, cols 208, rows 62px 30px, gap 8 }

  Compone: label "Border" → ShapeSwitch → RadiusSlider.
*/

import { ShapeSwitch } from "./ShapeSwitch";
import { RadiusSlider } from "./RadiusSlider";

export function BorderControl({
  radius,
  onChange,
}: {
  radius: number;
  onChange: (value: number) => void;
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
        Border
      </span>

      <div className="flex flex-col" style={{ gap: 8 }}>
        <ShapeSwitch radius={radius} onChange={onChange} />
        <RadiusSlider value={radius} onChange={onChange} />
      </div>
    </div>
  );
}
