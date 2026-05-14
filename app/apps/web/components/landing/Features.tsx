"use client";

import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Feature = {
  id: string;
  tag: string;
  title: string;
  description: string;
  span: "wide" | "normal";
  preview: ReactNode;
};

const features: Feature[] = [
  {
    id: "devices",
    tag: "Mockups",
    title: "14 dispositivos reales",
    description:
      "iPhone, MacBook, iPad, Pixel, Apple Watch. Aspect ratios y drop paddings al pixel, como los usaríamos los diseñadores de Apple.",
    span: "wide",
    preview: <DevicesStack />,
  },
  {
    id: "backgrounds",
    tag: "Fondos",
    title: "Backgrounds curados",
    description:
      "Tahoe, Paper Glass, Cosmic, Mystic. Un click y tu screenshot deja de verse hecho a las apuradas.",
    span: "normal",
    preview: <BackgroundsGrid />,
  },
  {
    id: "styles",
    tag: "Styles",
    title: "8 estilos de screenshot",
    description: "Glass, Outline, Border, Liquid Glass, Inset, Default. Combinables con cualquier fondo.",
    span: "normal",
    preview: <StylesRow />,
  },
  {
    id: "render",
    tag: "Render",
    title: "Server-side con Remotion",
    description:
      "PNG, WebP, MP4 y GIF en 1x/2x/4x. El render corre en el servidor con FFmpeg nativo, no en tu navegador.",
    span: "wide",
    preview: <RenderBars />,
  },
  {
    id: "effects",
    tag: "Effects",
    title: "Grano, VHS, glitch",
    description: "Filtros cinematográficos sin entrar a Photoshop. Reversible siempre.",
    span: "normal",
    preview: <EffectChips />,
  },
  {
    id: "export",
    tag: "Export",
    title: "Listo para redes",
    description: "Presets de tamaño para X, Instagram, LinkedIn, Product Hunt. Sin cropear a mano.",
    span: "normal",
    preview: <ExportPresets />,
  },
];

export function Features() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-6xl px-6">
        <header className="mb-12 max-w-2xl">
          <span className="text-[12px] font-medium uppercase tracking-[0.18em] text-muted">
            Todo en uno
          </span>
          <h2 className="mt-3 text-[clamp(32px,5vw,56px)] font-medium leading-[1.05] tracking-[-0.03em]">
            Hecho para que el screenshot
            <br className="hidden md:block" /> deje de ser el cuello de botella.
          </h2>
        </header>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {features.map((f) => (
            <FeatureCard key={f.id} feature={f} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ feature }: { feature: Feature }) {
  const ref = useRef<HTMLDivElement>(null);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border-faint bg-surface/60 p-6 transition-colors duration-300 hover:border-border",
        feature.span === "wide" && "md:col-span-2"
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(380px circle at var(--mx) var(--my), rgb(10 132 255 / 0.10), transparent 60%)",
        }}
      />

      <div className="relative flex flex-col">
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
          {feature.tag}
        </span>
        <h3 className="mt-2 text-[20px] font-medium tracking-[-0.01em] text-foreground">
          {feature.title}
        </h3>
        <p className="mt-2 max-w-md text-[14px] leading-relaxed text-muted">
          {feature.description}
        </p>

        <div className="mt-7">{feature.preview}</div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────── previews ── */

function DevicesStack() {
  return (
    <div className="relative h-32 [perspective:800px]">
      <div className="absolute left-4 top-2 h-24 w-16 rounded-xl border border-border-strong bg-gradient-to-b from-[#2a2a2a] to-[#101012] [transform:rotateY(18deg)]" />
      <div className="absolute left-20 top-0 h-28 w-20 rounded-2xl border border-border-strong bg-gradient-to-b from-[#1f1f1f] to-[#0d0d0d] [transform:rotateY(8deg)]" />
      <div className="absolute left-40 top-3 h-24 w-32 rounded-md border border-border-strong bg-gradient-to-b from-[#1f1f1f] to-[#0d0d0d] [transform:rotateY(-12deg)]">
        <div className="m-1 h-[88%] rounded-sm bg-surface-elevated" />
      </div>
    </div>
  );
}

function BackgroundsGrid() {
  const swatches = [
    "linear-gradient(135deg,#ff6432,#f94a73,#eb47a7)",
    "linear-gradient(135deg,#0a0a2e,#1a0533,#0d1a3e)",
    "linear-gradient(135deg,#c893e1,#7b2eff,#202124)",
    "linear-gradient(135deg,#fb7a53,#ff0065,#7b2eff)",
    "linear-gradient(135deg,#d1ccdd,#a0a0a0,#555)",
    "linear-gradient(135deg,#43d25a,#0a84ff,#7b2eff)",
  ];
  return (
    <div className="grid grid-cols-3 gap-2">
      {swatches.map((bg, i) => (
        <div
          key={i}
          className="aspect-square rounded-lg border border-border-faint"
          style={{ background: bg }}
        />
      ))}
    </div>
  );
}

function StylesRow() {
  const labels = ["Default", "Glass", "Outline", "Border"];
  return (
    <div className="flex flex-wrap gap-2">
      {labels.map((l) => (
        <span
          key={l}
          className="rounded-full border border-border-faint bg-surface-elevated/40 px-3 py-1 text-[12px] text-muted"
        >
          {l}
        </span>
      ))}
    </div>
  );
}

function RenderBars() {
  const rows = [
    { label: "PNG", w: "100%", time: "0.4s" },
    { label: "WebP", w: "82%", time: "0.3s" },
    { label: "MP4", w: "62%", time: "3.1s" },
    { label: "GIF", w: "48%", time: "5.0s" },
  ];
  return (
    <div className="flex flex-col gap-2">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-3 text-[12px]">
          <span className="w-10 text-muted">{r.label}</span>
          <div className="flex-1 overflow-hidden rounded-pill bg-surface-dim">
            <div
              className="h-1.5 rounded-pill bg-gradient-to-r from-accent to-warning"
              style={{ width: r.w }}
            />
          </div>
          <span className="w-10 text-right tabular-nums text-muted">{r.time}</span>
        </div>
      ))}
    </div>
  );
}

function EffectChips() {
  const chips = ["Grain", "VHS", "Glitch", "Noise", "Bloom"];
  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((c) => (
        <span
          key={c}
          className="rounded-md border border-border-faint bg-surface-elevated/40 px-2.5 py-1 text-[12px] text-muted"
        >
          {c}
        </span>
      ))}
    </div>
  );
}

function ExportPresets() {
  const items = [
    { label: "X / Twitter", size: "1600×900" },
    { label: "Instagram", size: "1080×1350" },
    { label: "LinkedIn", size: "1200×627" },
  ];
  return (
    <div className="flex flex-col gap-1.5 text-[12px]">
      {items.map((i) => (
        <div key={i.label} className="flex items-center justify-between">
          <span className="text-muted">{i.label}</span>
          <span className="tabular-nums text-foreground/70">{i.size}</span>
        </div>
      ))}
    </div>
  );
}
