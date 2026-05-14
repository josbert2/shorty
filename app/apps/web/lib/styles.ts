/*
  Catálogo de "styles" — el tratamiento visual que se aplica sobre el screenshot dentro del device.
  IDs derivados directamente de los PNGs reales de shots.so/mockups/Screenshot/styles/.
  Cada style se renderiza como combinación de border-radius + box-shadow + overlay + filter.
*/

export interface ScreenshotStyle {
  id: string;
  name: string;
  /** Inset border (CSS box-shadow inset o border) */
  border?: string;
  /** Sombra externa del screenshot */
  shadow?: string;
  /** Overlay aplicado encima del screenshot (linear-gradient, etc.) */
  overlay?: string;
  /** Filter CSS (blur, saturate, etc.) */
  filter?: string;
  /** Backdrop-filter del wrapper */
  backdropFilter?: string;
  /** Glass effect — background semitransparente alrededor */
  glassBackground?: string;
}

export const STYLES: ScreenshotStyle[] = [
  {
    id: "default",
    name: "Default",
    shadow: "0 20px 60px -20px rgba(0,0,0,0.5)",
  },
  {
    id: "border",
    name: "Border",
    border: "inset 0 0 0 1px rgba(255,255,255,0.18)",
    shadow: "0 20px 60px -20px rgba(0,0,0,0.5)",
  },
  {
    id: "outline",
    name: "Outline",
    border: "inset 0 0 0 4px rgba(255,255,255,0.12), inset 0 0 0 5px rgba(0,0,0,0.25)",
    shadow: "0 24px 48px -12px rgba(0,0,0,0.6)",
  },
  {
    id: "glass-light",
    name: "Glass Light",
    glassBackground: "rgba(255,255,255,0.18)",
    backdropFilter: "blur(20px) saturate(140%) contrast(115%)",
    border: "inset 0 0 0 1px rgba(255,255,255,0.35)",
    shadow: "0 20px 60px -20px rgba(0,0,0,0.4)",
  },
  {
    id: "glass-dark",
    name: "Glass Dark",
    glassBackground: "rgba(0,0,0,0.25)",
    backdropFilter: "blur(20px) saturate(140%) brightness(95%)",
    border: "inset 0 0 0 1px rgba(255,255,255,0.10)",
    shadow: "0 20px 60px -20px rgba(0,0,0,0.6)",
  },
  {
    id: "liquid-glass",
    name: "Liquid Glass",
    glassBackground: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(2em) saturate(200%) contrast(150%) brightness(105%)",
    border: "inset 0 0 0 1px rgba(255,255,255,0.20)",
    shadow: "0 24px 64px -16px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)",
  },
  {
    id: "inset-light",
    name: "Inset Light",
    glassBackground: "rgba(255,255,255,0.06)",
    border: "inset 0 0 0 1px rgba(255,255,255,0.10)",
    shadow: "inset 0 1px 0 rgba(255,255,255,0.15), 0 16px 32px -8px rgba(0,0,0,0.4)",
  },
  {
    id: "inset-dark",
    name: "Inset Dark",
    glassBackground: "rgba(0,0,0,0.40)",
    border: "inset 0 0 0 1px rgba(0,0,0,0.30)",
    shadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 16px 32px -8px rgba(0,0,0,0.6)",
  },
];

export function getStyle(id: string): ScreenshotStyle | undefined {
  return STYLES.find((s) => s.id === id);
}
