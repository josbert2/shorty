/*
  Catálogo de fondos.
  Inspirado en las colecciones reales de shots.so (tahoe, paper-glass, cosmic, mystic-gradients, radiant).
  Cada background se aplica como CSS background sobre el contenedor del canvas.
*/

export type BackgroundCategory = "gradient" | "mesh" | "solid" | "image";

export interface Background {
  id: string;
  name: string;
  category: BackgroundCategory;
  /** Valor CSS para `background` */
  value: string;
  /** Hint sobre si conviene texto blanco o negro encima */
  contrast?: "light" | "dark";
}

export const BACKGROUNDS: Background[] = [
  // Gradientes
  {
    id: "sunset",
    name: "Sunset",
    category: "gradient",
    value: "linear-gradient(135deg, #ff6432 0%, #f94a73 50%, #eb47a7 100%)",
    contrast: "light",
  },
  {
    id: "midnight",
    name: "Midnight",
    category: "gradient",
    value: "linear-gradient(135deg, #0a0a2e 0%, #1a0533 50%, #0d1a3e 100%)",
    contrast: "light",
  },
  {
    id: "violet",
    name: "Violet",
    category: "gradient",
    value: "linear-gradient(135deg, #c893e1 0%, #7b2eff 60%, #202124 100%)",
    contrast: "light",
  },
  {
    id: "coral",
    name: "Coral",
    category: "gradient",
    value: "linear-gradient(135deg, #fb7a53 0%, #ff0065 50%, #7b2eff 100%)",
    contrast: "light",
  },
  {
    id: "aurora",
    name: "Aurora",
    category: "gradient",
    value: "linear-gradient(135deg, #43d25a 0%, #0a84ff 50%, #7b2eff 100%)",
    contrast: "light",
  },

  // Mesh (radial gradients superpuestos)
  {
    id: "mesh-warm",
    name: "Warm Mesh",
    category: "mesh",
    value:
      "radial-gradient(at 20% 30%, #ff6432 0px, transparent 50%), radial-gradient(at 80% 20%, #f94a73 0px, transparent 50%), radial-gradient(at 50% 80%, #eb47a7 0px, transparent 50%), #1a0533",
    contrast: "light",
  },
  {
    id: "mesh-cool",
    name: "Cool Mesh",
    category: "mesh",
    value:
      "radial-gradient(at 25% 25%, #0a84ff 0px, transparent 50%), radial-gradient(at 75% 30%, #7b2eff 0px, transparent 50%), radial-gradient(at 50% 80%, #43d25a 0px, transparent 50%), #0a0a2e",
    contrast: "light",
  },
  {
    id: "mesh-paper",
    name: "Paper Glass",
    category: "mesh",
    value:
      "radial-gradient(at 30% 30%, #d1ccdd 0px, transparent 60%), radial-gradient(at 70% 70%, #c893e1 0px, transparent 60%), #f3eef7",
    contrast: "dark",
  },

  // Solids
  { id: "white", name: "White", category: "solid", value: "#ffffff", contrast: "dark" },
  { id: "black", name: "Black", category: "solid", value: "#0d0d0d", contrast: "light" },
  { id: "neutral", name: "Neutral", category: "solid", value: "#202124", contrast: "light" },

  // Imágenes (los previews reales que copiamos a /public/demo)
  {
    id: "tahoe-dark",
    name: "Tahoe Dark",
    category: "image",
    value: `url('/demo/bg-tahoe.jpg') center/cover no-repeat`,
    contrast: "light",
  },
];

export const BACKGROUND_CATEGORIES: { id: BackgroundCategory; label: string }[] = [
  { id: "gradient", label: "Gradientes" },
  { id: "mesh", label: "Mesh" },
  { id: "solid", label: "Sólidos" },
  { id: "image", label: "Imágenes" },
];

export function getBackground(id: string): Background | undefined {
  return BACKGROUNDS.find((b) => b.id === id);
}
