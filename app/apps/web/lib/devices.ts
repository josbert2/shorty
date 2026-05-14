/*
  Catálogo completo de dispositivos.
  Thumbs y variants reales descargados de shots.so a /public/devices/<id>/{thumbs|styles}/...
  aspect-ratio y drop-padding ajustados por device.
*/

export type DeviceCategory = "phone" | "tablet" | "laptop" | "desktop" | "watch" | "essential";

export interface DeviceVariant {
  id: string;
  name: string;
  /** Path desde /public, ej: "/devices/iphone-16-pro/styles/black-titanium.png" */
  src: string;
}

export interface Device {
  id: string;
  name: string;
  category: DeviceCategory;
  /** Si es un mockup "essential" (Screenshot, Browser, etc.) sin device físico */
  isEssential?: boolean;
  /** Dimensiones lógicas del display, ej: "402 / 874". Para Essentials: "Adapts to media". */
  dimensions: string;
  /** Aspect ratio del FRAME completo (W/H) */
  aspectRatio: number;
  /** Offsets del screenshot dentro del frame, [top, right, bottom, left] en % */
  dropPadding: [number, number, number, number];
  /** Border radius de la pantalla en % del width */
  screenRadius: number;
  /** Border radius del chasis en px */
  chassisRadius: number;
  bezelColor: string;
  squircle?: boolean;
  /** Path al thumb (preview en el picker) */
  thumb: string;
  /** Variantes de color/estilo del device */
  variants: DeviceVariant[];
  /** Variant default (el que se usa cuando no se elige otro) */
  defaultVariant: string;
}

function v(deviceId: string, id: string, name: string): DeviceVariant {
  return { id, name, src: `/devices/${deviceId}/styles/${id}.png` };
}

function thumb(deviceId: string): string {
  return `/devices/${deviceId}/thumbs/1.png`;
}

const PHONE_PADDING: [number, number, number, number] = [4.4, 6.4, 6.4, 6.4];
const IPAD_PADDING: [number, number, number, number] = [3, 3, 3, 3];
const LAPTOP_PADDING: [number, number, number, number] = [1.8, 1.8, 19.4, 1.8];
const WATCH_PADDING: [number, number, number, number] = [6, 6, 6, 6];
const DESKTOP_PADDING: [number, number, number, number] = [3, 3, 12, 3];

export const DEVICES: Device[] = [
  // ─── Essentials (mockup types sin device físico) ──────────────────────
  {
    id: "screenshot",
    name: "Screenshot",
    category: "essential",
    isEssential: true,
    dimensions: "Adapts to media",
    aspectRatio: 16 / 10,
    dropPadding: [0, 0, 0, 0],
    screenRadius: 0,
    chassisRadius: 0,
    bezelColor: "transparent",
    thumb: "/devices/screenshot/thumbs/1.png",
    variants: [
      { id: "default", name: "Default", src: "/devices/screenshot/styles/default.png" },
      { id: "glass-light", name: "Glass Light", src: "/devices/screenshot/styles/glass-light.png" },
      { id: "glass-dark", name: "Glass Dark", src: "/devices/screenshot/styles/glass-dark.png" },
      { id: "liquid-glass", name: "Liquid Glass", src: "/devices/screenshot/styles/liquid-glass.png" },
      { id: "outline", name: "Outline", src: "/devices/screenshot/styles/outline.png" },
      { id: "border", name: "Border", src: "/devices/screenshot/styles/border.png" },
      { id: "inset-light", name: "Inset Light", src: "/devices/screenshot/styles/inset-light.png" },
      { id: "inset-dark", name: "Inset Dark", src: "/devices/screenshot/styles/inset-dark.png" },
    ],
    defaultVariant: "default",
  },
  {
    id: "browser",
    name: "Browser",
    category: "essential",
    isEssential: true,
    dimensions: "Adapts to media",
    aspectRatio: 16 / 10,
    dropPadding: [4, 0, 0, 0],
    screenRadius: 0,
    chassisRadius: 12,
    bezelColor: "#202124",
    thumb: "/devices/browser/thumbs/1.png",
    variants: [
      { id: "safari-light", name: "Safari Light", src: "/devices/browser/styles/safari-light.png" },
      { id: "chrome-light", name: "Chrome Light", src: "/devices/browser/styles/chrome-light.png" },
      { id: "arc-light", name: "Arc Light", src: "/devices/browser/styles/arc-light.png" },
      { id: "safari-dark", name: "Safari Dark", src: "/devices/browser/styles/safari-dark.png" },
      { id: "chrome-dark", name: "Chrome Dark", src: "/devices/browser/styles/chrome-dark.png" },
      { id: "arc-dark", name: "Arc Dark", src: "/devices/browser/styles/arc-dark.png" },
    ],
    defaultVariant: "safari-light",
  },
  {
    id: "minimal-desktop",
    name: "Minimal Desktop",
    category: "essential",
    isEssential: true,
    dimensions: "Adapts to media",
    aspectRatio: 16 / 10,
    dropPadding: [3, 3, 3, 3],
    screenRadius: 2,
    chassisRadius: 16,
    bezelColor: "#0d0d0d",
    thumb: "/devices/minimal-desktop/thumbs/1.png",
    variants: [
      { id: "default", name: "Default", src: "/devices/minimal-desktop/styles/default.png" },
    ],
    defaultVariant: "default",
  },

  // ─── iPhone (8) ──────────────────────────────────────────────────────
  {
    id: "iphone-17-pro-max",
    name: "iPhone 17 Pro Max",
    category: "phone",
    dimensions: "440 / 956",
    aspectRatio: 440 / 956,
    dropPadding: PHONE_PADDING,
    screenRadius: 12,
    chassisRadius: 56,
    bezelColor: "#1a1a1a",
    squircle: true,
    thumb: thumb("iphone-17-pro-max"),
    variants: [
      v("iphone-17-pro-max", "cosmic-orange", "Cosmic Orange"),
      v("iphone-17-pro-max", "deep-blue", "Deep Blue"),
      v("iphone-17-pro-max", "silver", "Silver"),
    ],
    defaultVariant: "deep-blue",
  },
  {
    id: "iphone-17-pro",
    name: "iPhone 17 Pro",
    category: "phone",
    dimensions: "402 / 874",
    aspectRatio: 402 / 874,
    dropPadding: PHONE_PADDING,
    screenRadius: 12,
    chassisRadius: 48,
    bezelColor: "#1a1a1a",
    squircle: true,
    thumb: thumb("iphone-17-pro"),
    variants: [
      v("iphone-17-pro", "cosmic-orange", "Cosmic Orange"),
      v("iphone-17-pro", "deep-blue", "Deep Blue"),
      v("iphone-17-pro", "silver", "Silver"),
    ],
    defaultVariant: "deep-blue",
  },
  {
    id: "iphone-17-air",
    name: "iPhone 17 Air",
    category: "phone",
    dimensions: "393 / 852",
    aspectRatio: 393 / 852,
    dropPadding: PHONE_PADDING,
    screenRadius: 12,
    chassisRadius: 48,
    bezelColor: "#1a1a1a",
    squircle: true,
    thumb: thumb("iphone-17-air"),
    variants: [
      v("iphone-17-air", "light-gold", "Light Gold"),
      v("iphone-17-air", "sky-blue", "Sky Blue"),
      v("iphone-17-air", "space-black", "Space Black"),
    ],
    defaultVariant: "space-black",
  },
  {
    id: "iphone-17",
    name: "iPhone 17",
    category: "phone",
    dimensions: "390 / 844",
    aspectRatio: 390 / 844,
    dropPadding: PHONE_PADDING,
    screenRadius: 12,
    chassisRadius: 46,
    bezelColor: "#1a1a1a",
    squircle: true,
    thumb: thumb("iphone-17"),
    variants: [
      v("iphone-17", "black", "Black"),
      v("iphone-17", "lavender", "Lavender"),
      v("iphone-17", "sage", "Sage"),
    ],
    defaultVariant: "black",
  },
  {
    id: "iphone-16-pro-max",
    name: "iPhone 16 Pro Max",
    category: "phone",
    dimensions: "440 / 956",
    aspectRatio: 440 / 956,
    dropPadding: PHONE_PADDING,
    screenRadius: 12,
    chassisRadius: 56,
    bezelColor: "#1a1a1a",
    squircle: true,
    thumb: thumb("iphone-16-pro-max"),
    variants: [
      v("iphone-16-pro-max", "black-titanium", "Black Titanium"),
      v("iphone-16-pro-max", "natural-titanium", "Natural Titanium"),
      v("iphone-16-pro-max", "white-titanium", "White Titanium"),
    ],
    defaultVariant: "natural-titanium",
  },
  {
    id: "iphone-16-pro",
    name: "iPhone 16 Pro",
    category: "phone",
    dimensions: "402 / 874",
    aspectRatio: 402 / 874,
    dropPadding: PHONE_PADDING,
    screenRadius: 12,
    chassisRadius: 48,
    bezelColor: "#1a1a1a",
    squircle: true,
    thumb: thumb("iphone-16-pro"),
    variants: [
      v("iphone-16-pro", "black-titanium", "Black Titanium"),
      v("iphone-16-pro", "natural-titanium", "Natural Titanium"),
      v("iphone-16-pro", "white-titanium", "White Titanium"),
    ],
    defaultVariant: "natural-titanium",
  },
  {
    id: "iphone-16-plus",
    name: "iPhone 16 Plus",
    category: "phone",
    dimensions: "430 / 932",
    aspectRatio: 430 / 932,
    dropPadding: PHONE_PADDING,
    screenRadius: 12,
    chassisRadius: 54,
    bezelColor: "#1a1a1a",
    squircle: true,
    thumb: thumb("iphone-16-plus"),
    variants: [
      v("iphone-16-plus", "black", "Black"),
      v("iphone-16-plus", "ultramarine", "Ultramarine"),
      v("iphone-16-plus", "white", "White"),
    ],
    defaultVariant: "ultramarine",
  },
  {
    id: "iphone-16",
    name: "iPhone 16",
    category: "phone",
    dimensions: "393 / 852",
    aspectRatio: 393 / 852,
    dropPadding: PHONE_PADDING,
    screenRadius: 12,
    chassisRadius: 48,
    bezelColor: "#1a1a1a",
    squircle: true,
    thumb: thumb("iphone-16"),
    variants: [
      v("iphone-16", "black", "Black"),
      v("iphone-16", "ultramarine", "Ultramarine"),
      v("iphone-16", "white", "White"),
    ],
    defaultVariant: "ultramarine",
  },
  {
    id: "iphone-15-pro-max",
    name: "iPhone 15 Pro Max",
    category: "phone",
    dimensions: "430 / 932",
    aspectRatio: 430 / 932,
    dropPadding: PHONE_PADDING,
    screenRadius: 12,
    chassisRadius: 54,
    bezelColor: "#1a1a1a",
    squircle: true,
    thumb: thumb("iphone-15-pro-max"),
    variants: [
      v("iphone-15-pro-max", "black-titanium", "Black Titanium"),
      v("iphone-15-pro-max", "dark-blue", "Dark Blue"),
      v("iphone-15-pro-max", "natural-titanium", "Natural Titanium"),
    ],
    defaultVariant: "natural-titanium",
  },
  {
    id: "iphone-15-pro",
    name: "iPhone 15 Pro",
    category: "phone",
    dimensions: "393 / 852",
    aspectRatio: 393 / 852,
    dropPadding: PHONE_PADDING,
    screenRadius: 12,
    chassisRadius: 48,
    bezelColor: "#1a1a1a",
    squircle: true,
    thumb: thumb("iphone-15-pro"),
    variants: [
      v("iphone-15-pro", "black-titanium", "Black Titanium"),
      v("iphone-15-pro", "dark-blue", "Dark Blue"),
      v("iphone-15-pro", "natural-titanium", "Natural Titanium"),
    ],
    defaultVariant: "natural-titanium",
  },
  {
    id: "iphone-15-plus",
    name: "iPhone 15 Plus",
    category: "phone",
    dimensions: "428 / 926",
    aspectRatio: 428 / 926,
    dropPadding: PHONE_PADDING,
    screenRadius: 12,
    chassisRadius: 54,
    bezelColor: "#1a1a1a",
    squircle: true,
    thumb: thumb("iphone-15-plus"),
    variants: [
      v("iphone-15-plus", "black", "Black"),
      v("iphone-15-plus", "blue", "Blue"),
      v("iphone-15-plus", "green", "Green"),
    ],
    defaultVariant: "blue",
  },
  {
    id: "iphone-15",
    name: "iPhone 15",
    category: "phone",
    dimensions: "390 / 844",
    aspectRatio: 390 / 844,
    dropPadding: PHONE_PADDING,
    screenRadius: 12,
    chassisRadius: 48,
    bezelColor: "#1a1a1a",
    squircle: true,
    thumb: thumb("iphone-15"),
    variants: [
      v("iphone-15", "black", "Black"),
      v("iphone-15", "blue", "Blue"),
      v("iphone-15", "green", "Green"),
    ],
    defaultVariant: "blue",
  },
  {
    id: "iphone-14-pro-max",
    name: "iPhone 14 Pro Max",
    category: "phone",
    dimensions: "430 / 932",
    aspectRatio: 430 / 932,
    dropPadding: PHONE_PADDING,
    screenRadius: 12,
    chassisRadius: 52,
    bezelColor: "#1a1a1a",
    squircle: true,
    thumb: thumb("iphone-14-pro-max"),
    variants: [
      v("iphone-14-pro-max", "deep-purple", "Deep Purple"),
      v("iphone-14-pro-max", "silver", "Silver"),
      v("iphone-14-pro-max", "space-black", "Space Black"),
    ],
    defaultVariant: "deep-purple",
  },
  {
    id: "iphone-14-pro",
    name: "iPhone 14 Pro",
    category: "phone",
    dimensions: "393 / 852",
    aspectRatio: 393 / 852,
    dropPadding: PHONE_PADDING,
    screenRadius: 12,
    chassisRadius: 48,
    bezelColor: "#1a1a1a",
    squircle: true,
    thumb: thumb("iphone-14-pro"),
    variants: [
      v("iphone-14-pro", "deep-purple", "Deep Purple"),
      v("iphone-14-pro", "silver", "Silver"),
      v("iphone-14-pro", "space-black", "Space Black"),
    ],
    defaultVariant: "deep-purple",
  },
  {
    id: "iphone-14-plus",
    name: "iPhone 14 Plus",
    category: "phone",
    dimensions: "428 / 926",
    aspectRatio: 428 / 926,
    dropPadding: PHONE_PADDING,
    screenRadius: 12,
    chassisRadius: 52,
    bezelColor: "#1a1a1a",
    squircle: true,
    thumb: thumb("iphone-14-plus"),
    variants: [
      v("iphone-14-plus", "blue", "Blue"),
      v("iphone-14-plus", "midnight", "Midnight"),
      v("iphone-14-plus", "purple", "Purple"),
    ],
    defaultVariant: "purple",
  },
  {
    id: "iphone-14",
    name: "iPhone 14",
    category: "phone",
    dimensions: "390 / 844",
    aspectRatio: 390 / 844,
    dropPadding: PHONE_PADDING,
    screenRadius: 12,
    chassisRadius: 48,
    bezelColor: "#1a1a1a",
    squircle: true,
    thumb: thumb("iphone-14"),
    variants: [
      v("iphone-14", "blue", "Blue"),
      v("iphone-14", "midnight", "Midnight"),
      v("iphone-14", "purple", "Purple"),
    ],
    defaultVariant: "purple",
  },
  // ─── Android phones (2) ───────────────────────────────────────────────
  {
    id: "pixel-7-pro",
    name: "Pixel 7 Pro",
    category: "phone",
    dimensions: "412 / 892",
    aspectRatio: 412 / 892,
    dropPadding: PHONE_PADDING,
    screenRadius: 8,
    chassisRadius: 44,
    bezelColor: "#222",
    thumb: thumb("pixel-7-pro"),
    variants: [
      v("pixel-7-pro", "hazel", "Hazel"),
      v("pixel-7-pro", "obsidian", "Obsidian"),
      v("pixel-7-pro", "snow", "Snow"),
    ],
    defaultVariant: "obsidian",
  },
  {
    id: "nothing-phone",
    name: "Nothing Phone",
    category: "phone",
    dimensions: "412 / 892",
    aspectRatio: 412 / 892,
    dropPadding: PHONE_PADDING,
    screenRadius: 8,
    chassisRadius: 44,
    bezelColor: "#202020",
    thumb: thumb("nothing-phone"),
    variants: [
      v("nothing-phone", "black", "Black"),
      v("nothing-phone", "display", "Display"),
      v("nothing-phone", "white", "White"),
    ],
    defaultVariant: "black",
  },
  // ─── iPad (4) ─────────────────────────────────────────────────────────
  {
    id: "ipad-pro-13",
    name: 'iPad Pro 13"',
    category: "tablet",
    dimensions: "1024 / 1366",
    aspectRatio: 1024 / 1366,
    dropPadding: IPAD_PADDING,
    screenRadius: 4,
    chassisRadius: 32,
    bezelColor: "#1a1a1a",
    squircle: true,
    thumb: thumb("ipad-pro-13"),
    variants: [
      v("ipad-pro-13", "display", "Display"),
      v("ipad-pro-13", "silver", "Silver"),
      v("ipad-pro-13", "space-gray", "Space Gray"),
    ],
    defaultVariant: "space-gray",
  },
  {
    id: "ipad-pro-11",
    name: 'iPad Pro 11"',
    category: "tablet",
    dimensions: "834 / 1194",
    aspectRatio: 834 / 1194,
    dropPadding: IPAD_PADDING,
    screenRadius: 4,
    chassisRadius: 28,
    bezelColor: "#1a1a1a",
    squircle: true,
    thumb: thumb("ipad-pro-11"),
    variants: [
      v("ipad-pro-11", "display", "Display"),
      v("ipad-pro-11", "silver", "Silver"),
      v("ipad-pro-11", "space-gray", "Space Gray"),
    ],
    defaultVariant: "space-gray",
  },
  {
    id: "ipad-air",
    name: "iPad Air",
    category: "tablet",
    dimensions: "820 / 1180",
    aspectRatio: 820 / 1180,
    dropPadding: IPAD_PADDING,
    screenRadius: 4,
    chassisRadius: 24,
    bezelColor: "#1a1a1a",
    thumb: thumb("ipad-air"),
    variants: [
      v("ipad-air", "blue", "Blue"),
      v("ipad-air", "space-gray", "Space Gray"),
      v("ipad-air", "starlight", "Starlight"),
    ],
    defaultVariant: "blue",
  },
  {
    id: "ipad-mini",
    name: "iPad Mini",
    category: "tablet",
    dimensions: "744 / 1133",
    aspectRatio: 744 / 1133,
    dropPadding: IPAD_PADDING,
    screenRadius: 4,
    chassisRadius: 22,
    bezelColor: "#1a1a1a",
    thumb: thumb("ipad-mini"),
    variants: [
      v("ipad-mini", "pink", "Pink"),
      v("ipad-mini", "space-gray", "Space Gray"),
      v("ipad-mini", "starlight", "Starlight"),
    ],
    defaultVariant: "space-gray",
  },
  // ─── Laptops (3) ──────────────────────────────────────────────────────
  {
    id: "macbook-pro-16",
    name: 'MacBook Pro 16"',
    category: "laptop",
    dimensions: "3456 / 2234",
    aspectRatio: 3456 / 2234,
    dropPadding: [2, 2, 20.6, 2],
    screenRadius: 1,
    chassisRadius: 16,
    bezelColor: "#0d0d0d",
    thumb: thumb("macbook-pro-16"),
    variants: [
      v("macbook-pro-16", "display", "Display"),
      v("macbook-pro-16", "silver", "Silver"),
    ],
    defaultVariant: "silver",
  },
  {
    id: "macbook-air-m2",
    name: "MacBook Air M2",
    category: "laptop",
    dimensions: "2560 / 1664",
    aspectRatio: 2560 / 1664,
    dropPadding: [1.8, 1.8, 19.4, 1.8],
    screenRadius: 1,
    chassisRadius: 14,
    bezelColor: "#0d0d0d",
    thumb: thumb("macbook-air-m2"),
    variants: [
      v("macbook-air-m2", "midnight", "Midnight"),
      v("macbook-air-m2", "silver", "Silver"),
      v("macbook-air-m2", "space-gray", "Space Gray"),
    ],
    defaultVariant: "midnight",
  },
  {
    id: "macbook-air-13",
    name: 'MacBook Air 13"',
    category: "laptop",
    dimensions: "2560 / 1600",
    aspectRatio: 2560 / 1600,
    dropPadding: LAPTOP_PADDING,
    screenRadius: 1,
    chassisRadius: 14,
    bezelColor: "#0d0d0d",
    thumb: thumb("macbook-air-13"),
    variants: [
      v("macbook-air-13", "gold", "Gold"),
      v("macbook-air-13", "silver", "Silver"),
      v("macbook-air-13", "space-gray", "Space Gray"),
    ],
    defaultVariant: "silver",
  },
  // ─── Desktop (3) ──────────────────────────────────────────────────────
  {
    id: "imac-24",
    name: 'iMac 24"',
    category: "desktop",
    dimensions: "4480 / 2520",
    aspectRatio: 4480 / 2520,
    dropPadding: DESKTOP_PADDING,
    screenRadius: 0,
    chassisRadius: 12,
    bezelColor: "#f5f5f5",
    thumb: thumb("imac-24"),
    variants: [
      v("imac-24", "silver", "Silver"),
      v("imac-24", "blue", "Blue"),
      v("imac-24", "orange", "Orange"),
      v("imac-24", "purple", "Purple"),
      v("imac-24", "red", "Red"),
    ],
    defaultVariant: "silver",
  },
  {
    id: "imac-pro",
    name: "iMac Pro",
    category: "desktop",
    dimensions: "5120 / 2880",
    aspectRatio: 5120 / 2880,
    dropPadding: DESKTOP_PADDING,
    screenRadius: 0,
    chassisRadius: 12,
    bezelColor: "#0d0d0d",
    thumb: thumb("imac-pro"),
    variants: [
      v("imac-pro", "display", "Display"),
      v("imac-pro", "space-gray", "Space Gray"),
    ],
    defaultVariant: "space-gray",
  },
  {
    id: "pro-display-xdr",
    name: "Pro Display XDR",
    category: "desktop",
    dimensions: "6016 / 3384",
    aspectRatio: 6016 / 3384,
    dropPadding: [4, 2.5, 8, 2.5],
    screenRadius: 0,
    chassisRadius: 12,
    bezelColor: "#0d0d0d",
    thumb: thumb("pro-display-xdr"),
    variants: [
      v("pro-display-xdr", "display", "Display"),
      v("pro-display-xdr", "silver", "Silver"),
    ],
    defaultVariant: "silver",
  },
  // ─── Watch (3) ────────────────────────────────────────────────────────
  {
    id: "apple-watch-10-46mm",
    name: "Apple Watch 10 (46mm)",
    category: "watch",
    dimensions: "224 / 274",
    aspectRatio: 224 / 274,
    dropPadding: WATCH_PADDING,
    screenRadius: 16,
    chassisRadius: 56,
    bezelColor: "#1a1a1a",
    squircle: true,
    thumb: thumb("apple-watch-10-46mm"),
    variants: [
      v("apple-watch-10-46mm", "display", "Display"),
      v("apple-watch-10-46mm", "jet-black", "Jet Black"),
      v("apple-watch-10-46mm", "rose-gold", "Rose Gold"),
    ],
    defaultVariant: "jet-black",
  },
  {
    id: "apple-watch-10-42mm",
    name: "Apple Watch 10 (42mm)",
    category: "watch",
    dimensions: "208 / 248",
    aspectRatio: 208 / 248,
    dropPadding: WATCH_PADDING,
    screenRadius: 16,
    chassisRadius: 52,
    bezelColor: "#1a1a1a",
    squircle: true,
    thumb: thumb("apple-watch-10-42mm"),
    variants: [
      v("apple-watch-10-42mm", "display", "Display"),
      v("apple-watch-10-42mm", "jet-black", "Jet Black"),
      v("apple-watch-10-42mm", "rose-gold", "Rose Gold"),
    ],
    defaultVariant: "jet-black",
  },
  {
    id: "apple-watch-ultra",
    name: "Apple Watch Ultra",
    category: "watch",
    dimensions: "228 / 282",
    aspectRatio: 228 / 282,
    dropPadding: WATCH_PADDING,
    screenRadius: 16,
    chassisRadius: 56,
    bezelColor: "#1a1a1a",
    squircle: true,
    thumb: thumb("apple-watch-ultra"),
    variants: [
      v("apple-watch-ultra", "black-ocean-band-navy", "Black + Ocean Band"),
      v("apple-watch-ultra", "black-titanium-loop", "Black Titanium Loop"),
      v("apple-watch-ultra", "black-trail-loop-black", "Black + Trail Loop"),
    ],
    defaultVariant: "black-titanium-loop",
  },
];

export const DEVICE_CATEGORIES: { id: DeviceCategory; label: string }[] = [
  { id: "phone", label: "Phones" },
  { id: "laptop", label: "Laptops" },
  { id: "tablet", label: "Tablets" },
  { id: "desktop", label: "Desktop" },
  { id: "watch", label: "Watch" },
];

export function getDevice(id: string): Device | undefined {
  return DEVICES.find((d) => d.id === id);
}

export function getVariant(device: Device, variantId?: string): DeviceVariant | undefined {
  const id = variantId ?? device.defaultVariant;
  return device.variants.find((v) => v.id === id);
}

export function paddingFromDrop(drop: Device["dropPadding"]): string {
  const [t, r, b, l] = drop;
  return `${t}% ${r}% ${b}% ${l}%`;
}
