"use client";

/*
  Device picker — dropdown anclado al selector del sidebar.
  Estructura (matching imagen):
    Header  : device actual (thumb + name + dimensions + chevron)
    Tabs    : All | phone | tablet | laptop | desktop | watch
    Body    : sections con "See all" + grid de cards 2 cols cuando filter=all
              o un solo grid plano cuando hay filtro
  Animación: entry con scale + blur + fade
*/

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { DEVICES, type Device, type DeviceCategory } from "@/lib/devices";

type Filter = "all" | DeviceCategory;

type Props = {
  open: boolean;
  onClose: () => void;
  currentId: string;
  onSelect: (deviceId: string) => void;
  anchorRect?: DOMRect | null;
};

const FILTERS: { id: Filter; icon: React.ReactNode; label: string }[] = [
  { id: "all", icon: null, label: "All" },
  { id: "phone", icon: <PhoneIcon />, label: "Phone" },
  { id: "tablet", icon: <TabletIcon />, label: "Tablet" },
  { id: "laptop", icon: <LaptopIcon />, label: "Laptop" },
  { id: "desktop", icon: <DesktopIcon />, label: "Desktop" },
  { id: "watch", icon: <WatchIcon />, label: "Wearable" },
];

export function DevicePickerModal({
  open,
  onClose,
  currentId,
  onSelect,
  anchorRect,
}: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = DEVICES.find((d) => d.id === currentId) ?? DEVICES[0];

  // Mantenemos el componente montado mientras la animación de OUT corre
  useEffect(() => {
    if (open) {
      setVisible(true);
      requestAnimationFrame(() => setMounted(true));
    } else {
      setMounted(false);
      const t = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const sections = useMemo(() => buildSections(filter), [filter]);

  if (!visible) return null;
  if (typeof document === "undefined") return null;

  const top = anchorRect ? anchorRect.top : 80;
  const left = anchorRect ? anchorRect.right + 8 : 260;

  const content = (
    <div
      ref={ref}
      className="fixed flex flex-col overflow-hidden"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      style={{
        top,
        left,
        width: 460,
        maxHeight: `calc(100vh - ${top + 16}px)`,
        background: "rgb(28,28,28)",
        borderRadius: 16,
        boxShadow: "0 24px 64px -16px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)",
        zIndex: 1500,
        transformOrigin: "top left",
        opacity: mounted ? 1 : 0,
        transform: mounted
          ? "scale(1) translateY(0)"
          : "scale(0.94) translateY(-6px)",
        filter: mounted ? "blur(0)" : "blur(8px)",
        transition:
          "opacity 240ms cubic-bezier(0.16, 1, 0.3, 1), transform 280ms cubic-bezier(0.16, 1, 0.3, 1), filter 220ms cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* Header con device actual */}
      <header
        className="flex shrink-0 items-center"
        style={{
          padding: "12px 14px",
          gap: 10,
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <div
          className="relative shrink-0 overflow-hidden"
          style={{ width: 40, height: 40, background: "#0d0d0d", borderRadius: 8 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={current.thumb} alt={current.name} className="h-full w-full object-cover" />
        </div>
        <div className="flex flex-1 flex-col" style={{ gap: 2 }}>
          <span
            style={{
              font: "500 16px/22px Inter, sans-serif",
              letterSpacing: "-0.3px",
              color: "rgb(240,240,240)",
            }}
          >
            {current.name}
          </span>
          <span
            style={{
              font: "400 11px/14px Inter, sans-serif",
              letterSpacing: "-0.2px",
              color: "rgba(240,240,240,0.36)",
            }}
          >
            {current.dimensions}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex size-6 items-center justify-center rounded-md text-muted transition-colors hover:bg-white/5 hover:text-foreground"
          aria-label="Cerrar"
        >
          <svg viewBox="0 0 16 16" className="size-3.5" fill="none">
            <path d="M4 10l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </header>

      {/* Filter tabs con motion: el activo se expande para mostrar el label */}
      <div
        className="flex shrink-0 items-center"
        style={{
          gap: 4,
          padding: "10px 14px",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        {FILTERS.map((f) => (
          <FilterTab
            key={f.id}
            active={filter === f.id}
            iconOnly={!!f.icon && filter !== f.id}
            icon={f.icon}
            label={f.label}
            onClick={() => setFilter(f.id)}
          />
        ))}
      </div>

      {/* Body: sections con grid */}
      <div className="scrollbar-hidden flex-1 overflow-y-auto" style={{ padding: "16px 14px 14px" }}>
        {sections.map((section) => (
          <SectionBlock
            key={section.title}
            title={section.title}
            devices={section.devices}
            currentId={currentId}
            onSelect={(id) => onSelect(id)}
          />
        ))}
        {sections.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted">
            <p className="text-[13px]">Sin resultados.</p>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

/* ────────────────────────────────────────────────── Filter tab ── */

function FilterTab({
  active,
  iconOnly,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  iconOnly: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  // "All" no tiene icono → siempre muestra label
  // Los demás: muestran label SOLO cuando activos, sino solo icono
  const showLabel = !iconOnly;
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex shrink-0 items-center justify-center"
      style={{
        height: 36,
        minWidth: 36,
        paddingLeft: showLabel ? 14 : 0,
        paddingRight: showLabel ? 14 : 0,
        borderRadius: 100,
        background: active ? "rgba(255,255,255,0.10)" : "transparent",
        color: active ? "rgb(240,240,240)" : "rgba(240,240,240,0.6)",
        font: "500 13px/18px Inter, sans-serif",
        letterSpacing: "-0.2px",
        outline: active ? "1px solid rgba(255,255,255,0.06)" : "none",
        outlineOffset: -1,
        overflow: "hidden",
        transition:
          "padding-left 320ms cubic-bezier(0.32, 0.72, 0, 1), padding-right 320ms cubic-bezier(0.32, 0.72, 0, 1), background-color 200ms ease, color 200ms ease, outline-color 200ms ease",
      }}
    >
      {icon && (
        <span
          className="inline-flex shrink-0 items-center justify-center"
          style={{ width: 18, height: 18 }}
        >
          {icon}
        </span>
      )}
      <span
        style={{
          display: "inline-block",
          overflow: "hidden",
          whiteSpace: "nowrap",
          maxWidth: showLabel ? 160 : 0,
          marginLeft: showLabel && icon ? 6 : 0,
          opacity: showLabel ? 1 : 0,
          transition:
            "max-width 320ms cubic-bezier(0.32, 0.72, 0, 1), margin-left 320ms cubic-bezier(0.32, 0.72, 0, 1), opacity 200ms ease 60ms",
        }}
      >
        {label}
      </span>
    </button>
  );
}

/* ──────────────────────────────────────────────────────── Section ── */

function SectionBlock({
  title,
  devices,
  currentId,
  onSelect,
}: {
  title: string;
  devices: Device[];
  currentId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <section style={{ marginBottom: 20 }}>
      <header
        className="flex items-end justify-between"
        style={{ marginBottom: 10, padding: "0 2px" }}
      >
        <h3
          style={{
            font: "500 18px/22px Inter, sans-serif",
            letterSpacing: "-0.4px",
            color: "rgb(240,240,240)",
            margin: 0,
          }}
        >
          {title}
        </h3>
        {devices.length > 4 && (
          <button
            type="button"
            style={{
              font: "500 12px/16px Inter, sans-serif",
              letterSpacing: "-0.2px",
              color: "rgba(240,240,240,0.6)",
              background: "transparent",
            }}
            className="transition-colors hover:text-foreground"
          >
            See all
          </button>
        )}
      </header>
      <div
        className="grid"
        style={{ gridTemplateColumns: "1fr 1fr", gap: 10 }}
      >
        {devices.slice(0, 4).map((d) => (
          <DeviceCard
            key={d.id}
            device={d}
            active={d.id === currentId}
            onClick={() => onSelect(d.id)}
          />
        ))}
      </div>
    </section>
  );
}

function DeviceCard({
  device,
  active,
  onClick,
}: {
  device: Device;
  active: boolean;
  onClick: () => void;
}) {
  const extra = Math.max(0, device.variants.length - 3);
  const isNew = device.name.includes("17");

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex flex-col overflow-hidden text-left transition-all"
      style={{
        gap: 6,
        padding: 12,
        height: 240,
        background: active ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.04)",
        borderRadius: 14,
        outline: active ? "1.5px solid rgba(255,255,255,0.5)" : "none",
        outlineOffset: -1,
      }}
    >
      {/* Title row con badge NEW */}
      <div className="flex items-start justify-between" style={{ width: "100%", gap: 6 }}>
        <div className="flex min-w-0 flex-col" style={{ gap: 2 }}>
          <span
            className="block truncate"
            style={{
              font: "500 14px/20px Inter, sans-serif",
              letterSpacing: "-0.3px",
              color: "rgb(240,240,240)",
              maxWidth: 160,
            }}
          >
            {device.name}
          </span>
          <span
            style={{
              font: "400 11px/14px Inter, sans-serif",
              letterSpacing: "-0.2px",
              color: "rgba(240,240,240,0.36)",
            }}
          >
            {device.dimensions}
          </span>
        </div>
        {isNew && (
          <span
            className="shrink-0"
            style={{
              padding: "2px 5px",
              background: "rgb(240,240,240)",
              color: "rgb(0,0,0)",
              borderRadius: 5,
              font: "500 10px/12px Inter, sans-serif",
              letterSpacing: "-0.1px",
            }}
          >
            New
          </span>
        )}
      </div>

      {/* Thumb — grande, centrado */}
      <div
        className="relative flex flex-1 items-center justify-center overflow-hidden"
        style={{ width: "100%", marginTop: 4 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={device.thumb}
          alt={device.name}
          className="max-h-full max-w-full object-contain"
          style={{ height: "100%" }}
          loading="lazy"
        />
      </div>

      {/* Variants 4-grid */}
      <div
        className="grid w-full"
        style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: 4, marginTop: 2 }}
      >
        {device.variants.slice(0, 3).map((variant) => (
          <div
            key={variant.id}
            className="overflow-hidden"
            style={{
              aspectRatio: "40 / 32",
              borderRadius: 6,
              background: "rgba(0,0,0,0.3)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={variant.src}
              alt={variant.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        ))}
        {extra > 0 ? (
          <div
            className="flex items-center justify-center"
            style={{
              aspectRatio: "40 / 32",
              borderRadius: 6,
              background: "rgba(255,255,255,0.04)",
              font: "400 11px/14px Inter, sans-serif",
              color: "rgba(240,240,240,0.36)",
            }}
          >
            +{extra}
          </div>
        ) : (
          <div />
        )}
      </div>
    </button>
  );
}

/* ──────────────────────────────────────────── Section builder ── */

function buildSections(filter: Filter): { title: string; devices: Device[] }[] {
  const list = filter === "all" ? DEVICES : DEVICES.filter((d) => d.category === filter);
  if (list.length === 0) return [];

  const groups = new Map<string, Device[]>();
  for (const d of list) {
    const key = getLineup(d);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(d);
  }

  // Order: Essentials primero (mockup types), después newest first por lineup
  const order = [
    "Essentials",
    "iPhone 17 Lineup",
    "iPhone 16 Lineup",
    "iPhone 15 Lineup",
    "iPhone 14 Lineup",
    "Android Phones",
    "iPad",
    "MacBook",
    "Desktop",
    "Apple Watch",
  ];
  const sections: { title: string; devices: Device[] }[] = [];
  for (const title of order) {
    const devices = groups.get(title);
    if (devices?.length) sections.push({ title, devices });
  }
  for (const [title, devices] of groups) {
    if (!order.includes(title)) sections.push({ title, devices });
  }

  return sections;
}

function getLineup(d: Device): string {
  if (d.isEssential) return "Essentials";
  const m = d.name.match(/^iPhone (\d+)/);
  if (m) return `iPhone ${m[1]} Lineup`;
  if (d.id.startsWith("pixel") || d.id.startsWith("nothing")) return "Android Phones";
  if (d.category === "tablet") return "iPad";
  if (d.category === "laptop") return "MacBook";
  if (d.category === "desktop") return "Desktop";
  if (d.category === "watch") return "Apple Watch";
  return d.name;
}

/* ───────────────────────────────────────────── Iconos categoría ── */

function PhoneIcon() {
  return (
    <svg viewBox="0 0 20 20" width={16} height={16} fill="none">
      <rect x="6" y="2.5" width="8" height="15" rx="1.6" stroke="currentColor" strokeWidth="1.4" />
      <path d="M9 15h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
function TabletIcon() {
  return (
    <svg viewBox="0 0 20 20" width={18} height={18} fill="none">
      <rect x="3.5" y="3" width="13" height="14" rx="1.6" stroke="currentColor" strokeWidth="1.4" />
      <path d="M9 15h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
function LaptopIcon() {
  return (
    <svg viewBox="0 0 24 20" width={22} height={18} fill="none">
      <rect x="4" y="3" width="16" height="11" rx="1.4" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2 16h20" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
function DesktopIcon() {
  return (
    <svg viewBox="0 0 24 20" width={22} height={18} fill="none">
      <rect x="3" y="2.5" width="18" height="12" rx="1.6" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10 17h4M12 14.5v2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
function WatchIcon() {
  return (
    <svg viewBox="0 0 20 20" width={14} height={14} fill="none">
      <rect x="6" y="5" width="8" height="10" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 5l1-2.5h2L12 5M8 15l1 2.5h2L12 15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
