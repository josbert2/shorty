"use client";

/*
  Sidebar / ControlPanel — clon de la estructura derecha de shots.so.
  Wrapper flotante 228px con border-radius 16, dentro:
    - panel-tabs (Mockup / Frame) absolute top con active-indicator pill
    - panel-selector con dropdown "Screenshot - Adapts to media" (gradient fade abajo)
    - panel-scroll-view scrolleable con secciones (label + grid)
*/

import { useEffect, useRef, useState } from "react";
import { DEVICES, type Device } from "@/lib/devices";
import { BACKGROUNDS } from "@/lib/backgrounds";
import { cn } from "@/lib/utils";
import { DevicePickerModal } from "./DevicePickerModal";
import { MediaControl } from "./MediaControl";
import { BorderControl } from "./border-control/BorderControl";
import type { EditorState } from "./Editor";

type Tab = "mockup" | "frame";

type Props = {
  state: EditorState;
  update: <K extends keyof EditorState>(key: K, value: EditorState[K]) => void;
  userId: string;
  projectId: string;
};

export function Sidebar({ state, update, userId, projectId }: Props) {
  const [tab, setTab] = useState<Tab>("mockup");
  const device = DEVICES.find((d) => d.id === state.deviceId) ?? DEVICES[0];

  return (
    // Sidebar flotante: position: fixed, NO afecta el layout del Canvas.
    // z-index alto para tapar el MediaPickerPopover (que pasa full-width detrás).
    <aside
      className="fixed flex items-stretch p-3"
      style={{
        top: 64,        // debajo del topbar (h=64)
        left: 0,
        bottom: 0,
        width: 252,
        zIndex: 100,
      }}
    >
      <div
        className="relative flex w-full flex-col overflow-hidden"
        style={{
          width: 228,
          height: "100%",
          background: "rgb(28,28,28)",
          borderRadius: 16,
        }}
      >
        {/* panel-tabs (absolute top) */}
        <div
          className="absolute inset-x-0 top-0 z-[99] flex flex-row justify-between"
          style={{
            height: 52,
            padding: 8,
            background: "rgb(28,28,28)",
            borderRadius: "16px 16px 0 0",
          }}
        >
          <div className="flex flex-row items-center" style={{ gap: 4, width: 212, height: 36 }}>
            <PanelTab active={tab === "mockup"} onClick={() => setTab("mockup")}>
              Mockup
            </PanelTab>
            <PanelTab active={tab === "frame"} onClick={() => setTab("frame")}>
              Frame
            </PanelTab>
          </div>
        </div>

        {/* panel-selector (absolute top 52, gradient fade abajo) */}
        <div
          className="absolute inset-x-0 z-[100]"
          style={{
            top: 52,
            height: 68,
            padding: "0 8px 20px",
            background:
              "linear-gradient(0deg, rgba(28,28,28,0) 0px, rgb(28,28,28) 80%)",
          }}
        >
          <DeviceSelector device={device} onChange={(id) => update("deviceId", id)} />
        </div>

        {/* panel-scroll-view */}
        <div
          className="scrollbar-hidden relative h-full overflow-y-auto overflow-x-hidden"
          style={{ borderRadius: 16 }}
        >
          <div
            className="flex flex-col items-center"
            style={{ gap: 20, padding: "130px 10px 40px" }}
          >
            {tab === "mockup" && (
              <MockupTab state={state} update={update} userId={userId} projectId={projectId} />
            )}
            {tab === "frame" && <FrameTab state={state} update={update} />}
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ──────────────────────────────────────────────────── Tabs (header) ── */

function PanelTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex items-center justify-center transition-colors"
      style={{
        width: 104,
        height: 36,
        padding: 6,
        gap: 6,
        borderRadius: 100,
        font: "500 16px/24px Inter, sans-serif",
        letterSpacing: "-0.6px",
        color: active ? "rgb(240,240,240)" : "rgba(240,240,240,0.6)",
      }}
    >
      <span className="relative z-[1]">{children}</span>
      {active && (
        <span
          className="absolute"
          style={{
            inset: 0,
            background: "rgba(240,240,240,0.06)",
            borderRadius: 100,
            zIndex: 0,
          }}
        />
      )}
    </button>
  );
}

/* ─────────────────────────────────────────────────── Device selector ── */

function DeviceSelector({
  device,
  onChange,
}: {
  device: Device;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => {
          if (btnRef.current) setAnchorRect(btnRef.current.getBoundingClientRect());
          setOpen(true);
        }}
        className="flex items-center transition-colors hover:bg-surface-elevated/30"
        style={{
          width: 212,
          height: 48,
          gap: 10,
          padding: "10px 12px",
          background: "rgb(38,38,38)",
          borderRadius: 12,
          boxShadow: "0 5px 15px -5px rgba(0,0,0,0.16)",
          font: "500 15px/20px Inter, sans-serif",
          letterSpacing: "-0.4px",
        }}
      >
        {/* device thumb real */}
        <div
          className="relative flex shrink-0 items-center justify-center overflow-hidden"
          style={{ width: 56, height: 32, background: "#0d0d0d", borderRadius: 6 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={device.thumb}
            alt={device.name}
            className="h-full w-full object-cover"
          />
        </div>
        <div
          className="flex flex-col items-start overflow-hidden"
          style={{ flex: 1, height: 48, justifyContent: "center" }}
        >
          <p
            className="block truncate text-left"
            style={{
              width: "100%",
              font: "500 14px/20px Inter, sans-serif",
              letterSpacing: "-0.4px",
              color: "rgb(240,240,240)",
              margin: 0,
            }}
          >
            {device.name}
          </p>
          <span
            style={{
              font: "500 10px/14px Inter, sans-serif",
              letterSpacing: "-0.4px",
              color: "rgba(240,240,240,0.36)",
            }}
          >
            {labelForCategory(device.category)}
          </span>
        </div>
        <svg viewBox="0 0 24 24" width={12} height={12} fill="none" style={{ color: "rgba(240,240,240,0.36)", flexShrink: 0 }}>
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <DevicePickerModal
        open={open}
        onClose={() => setOpen(false)}
        currentId={device.id}
        onSelect={onChange}
        anchorRect={anchorRect}
      />
    </>
  );
}

function labelForCategory(cat: Device["category"]): string {
  switch (cat) {
    case "phone": return "Adapts to media";
    case "laptop": return "Adapts to image";
    case "tablet": return "Adapts to image";
    case "desktop": return "Adapts to image";
    case "watch": return "Adapts to media";
    default: return "";
  }
}

/* ─────────────────────────────────────────────────── Tab content ── */

function MockupTab({
  state,
  update,
  userId,
  projectId,
}: {
  state: EditorState;
  update: <K extends keyof EditorState>(key: K, value: EditorState[K]) => void;
  userId: string;
  projectId: string;
}) {
  // Device actual (con sus variants)
  const device = DEVICES.find((d) => d.id === state.deviceId) ?? DEVICES[0];

  // Si el styleId actual no matchea ningún variant del device → reset al defaultVariant.
  // Pasa cuando cambiás de device (ej: iPhone → Browser).
  useEffect(() => {
    const exists = device.variants.some((v) => v.id === state.styleId);
    if (!exists) update("styleId", device.defaultVariant);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device.id]);

  return (
    <>
      <MediaControl
        screenshot={state.screenshot}
        onChange={(url) => update("screenshot", url)}
        userId={userId}
        projectId={projectId}
      />

      <BorderControl
        radius={state.screenshotRadius}
        onChange={(v) => update("screenshotRadius", v)}
      />

      {/* Styles = variants del device actual (cambian según device:
          Browser → safari-light, chrome-light, ...
          iPhone 16 Pro → black-titanium, natural-titanium, ...
          Screenshot → default, glass-light, glass-dark, ...) */}
      <PanelSection label="style">
        <PanelGrid cols={3}>
          {device.variants.map((variant) => (
            <PanelButton
              key={variant.id}
              active={state.styleId === variant.id}
              onClick={() => update("styleId", variant.id)}
              label={variant.name}
              previewImage={variant.src}
            />
          ))}
        </PanelGrid>
      </PanelSection>

      <PanelSection label="device">
        <PanelGrid cols={2}>
          {DEVICES.slice(0, 10).map((d) => (
            <PanelButton
              key={d.id}
              active={state.deviceId === d.id}
              onClick={() => update("deviceId", d.id)}
              label={d.name}
              labelWidth={104}
              preview={
                <div
                  style={{
                    position: "absolute",
                    inset: `${d.dropPadding[0]}% ${d.dropPadding[1]}% ${d.dropPadding[2]}% ${d.dropPadding[3]}%`,
                    background: "linear-gradient(160deg, #0a0a2e, #1a0533)",
                    borderRadius: Math.min(d.chassisRadius / 6, 4),
                  }}
                />
              }
              previewBg={d.bezelColor}
            />
          ))}
        </PanelGrid>
      </PanelSection>
    </>
  );
}

function FrameTab({
  state,
  update,
}: {
  state: EditorState;
  update: <K extends keyof EditorState>(key: K, value: EditorState[K]) => void;
}) {
  return (
    <>
      <PanelSection label="background">
        <PanelGrid cols={3}>
          {BACKGROUNDS.map((b) => (
            <PanelButton
              key={b.id}
              active={state.backgroundId === b.id}
              onClick={() => update("backgroundId", b.id)}
              label={b.name}
              preview={
                <div className="absolute inset-0" style={{ background: b.value }} />
              }
            />
          ))}
        </PanelGrid>
      </PanelSection>
    </>
  );
}

/* ─────────────────────────────────────────────────── Section + Grid ── */

function PanelSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      className="flex flex-col"
      style={{ gap: 8, width: 208 }}
    >
      <span
        className="block"
        style={{
          font: "600 11px/16px Inter, sans-serif",
          letterSpacing: "0.4px",
          color: "rgba(240,240,240,0.36)",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <div className="flex flex-col" style={{ gap: 8 }}>
        {children}
      </div>
    </div>
  );
}

function PanelGrid({
  cols,
  children,
}: {
  cols: 2 | 3;
  children: React.ReactNode;
}) {
  return (
    <div
      className="grid"
      style={{
        gap: 8,
        gridTemplateColumns: cols === 3 ? "repeat(3, 1fr)" : "repeat(2, 1fr)",
        width: 208,
      }}
    >
      {children}
    </div>
  );
}

function PanelButton({
  active,
  onClick,
  label,
  labelWidth,
  preview,
  previewImage,
  previewBg,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  labelWidth?: number;
  preview?: React.ReactNode;
  previewImage?: string;
  previewBg?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex flex-col transition-transform hover:scale-[1.03] active:scale-[0.98]"
      style={{
        height: 68,
        padding: "0 0 20px",
        transitionDuration: "320ms",
        transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      <div
        className="relative overflow-hidden"
        style={{
          width: "100%",
          height: 48,
          background: previewBg ?? "rgb(13,13,13)",
          borderRadius: 11,
          outline: active ? "1px solid rgba(240,240,240,0.5)" : "none",
        }}
      >
        {previewImage ? (
          <div className="relative h-full w-full overflow-hidden" style={{ borderRadius: 11 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewImage}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
            {/* ::after del scrap real: border interno sutil */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                borderRadius: 11,
                border: "1px solid rgba(100,100,100,0.15)",
              }}
            />
          </div>
        ) : (
          preview
        )}
      </div>
      <div
        className="absolute flex items-center overflow-hidden"
        style={{
          inset: "50px 0 0",
          height: 18,
          padding: "4px 4px 0",
          width: labelWidth ?? "100%",
        }}
      >
        <span
          className="truncate"
          style={{
            font: "400 11px/14px Inter, sans-serif",
            letterSpacing: "-0.2px",
            color: active ? "rgba(240,240,240,0.8)" : "rgba(240,240,240,0.6)",
            width: "100%",
            textAlign: "left",
          }}
        >
          {label}
        </span>
      </div>
    </button>
  );
}

