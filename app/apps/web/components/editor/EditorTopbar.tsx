"use client";

import { StartOverDialog } from "./StartOverDialog";

/*
  Editor topbar — clon visual del bar de shots.so.
  Estructura del original:
    [Logo] > [Templates icon] [Templates] > [45% OFF] >    ⇆ ↶ ↷ ⌘ [Start Over] ⤢ ! ◐    [↑ Export 1x · PNG] [⊟] [≡]
*/

import Link from "next/link";
import { cn } from "@/lib/utils";

type SaveStatus = "idle" | "saving" | "saved" | "error";

type Props = {
  onExport: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  canUndo: boolean;
  canRedo: boolean;
  saveStatus: SaveStatus;
};

export function EditorTopbar({
  onExport,
  onUndo,
  onRedo,
  onReset,
  canUndo,
  canRedo,
  saveStatus,
}: Props) {
  return (
    <header
      className="flex shrink-0 items-center justify-between border-b border-white/[0.06] bg-[rgb(13,13,13)] px-3"
      style={{ height: 64 }}
    >
      {/* Left navbar pill — clon exacto del cluster izquierdo de shots.so */}
      <nav
        className="relative flex flex-row items-center justify-between"
        style={{
          width: 244,
          height: 52,
          padding: 5,
          background: "rgb(28, 28, 28)",
          borderRadius: 16,
          zIndex: 100,
        }}
      >
        {/* Botón 1: logo + chevron */}
        <Link
          href="/dashboard"
          className="group relative flex items-center justify-center overflow-hidden"
          style={{
            width: 64,
            height: 42,
            padding: "2px 6px",
            gap: 3,
            borderRadius: 12,
            transition:
              "background-color 380ms cubic-bezier(0.34, 1.56, 0.64, 1), transform 480ms cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.06)";
            e.currentTarget.style.transform = "scale(1.04)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.transform = "scale(1)";
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.96)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
          aria-label="Dashboard"
          title="Volver al dashboard"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/welcome/shots-logo.png"
            alt="Shotso"
            style={{
              width: 34,
              height: 34,
              marginRight: 2,
              transition: "transform 520ms cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
            className="group-hover:rotate-[-6deg]"
          />
          <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, color: "rgba(240,240,240,0.6)" }} fill="currentColor">
            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>

        {/* Right side del navbar */}
        <div
          className="flex flex-row items-center justify-end"
          style={{ flex: 1, height: 42, gap: 6, marginLeft: 4 }}
        >
          {/* Botón Templates con row-reverse */}
          <button
            type="button"
            className="group relative flex items-center justify-center overflow-hidden"
            style={{
              width: "auto",
              minWidth: 142,
              height: 42,
              padding: "2px 8px",
              gap: 3,
              borderRadius: 12,
              flexDirection: "row-reverse",
              transition:
                "background-color 200ms cubic-bezier(0.16,1,0.3,1), transform 240ms cubic-bezier(0.16,1,0.3,1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              e.currentTarget.style.transform = "scale(1.02)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.transform = "scale(1)";
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
            title="Templates"
          >
            <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, color: "rgba(240,240,240,0.6)" }} fill="currentColor">
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span
              style={{
                color: "rgb(240,240,240)",
                font: "500 15px/22px Inter, sans-serif",
                letterSpacing: "-0.4px",
              }}
            >
              Templates
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/welcome/templates-icon.png"
              alt=""
              style={{
                width: 36,
                height: 33,
                marginRight: 2,
                transition: "transform 520ms cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
              className="group-hover:scale-110"
            />
          </button>
        </div>
      </nav>

      {/* Sale badge — clon exacto de .sale-commandbar-button */}
      <SaleBadge label="45% OFF" />

      {/* Save chip — discreto, sin nombre/id visibles (igual que shots.so) */}
      <SaveChip status={saveStatus} />

      {/* Center: edit controls */}
      <div className="flex items-center gap-1">
        <IconButton title="Deshacer (⌘Z)" onClick={onUndo} disabled={!canUndo}>
          <UndoIcon />
        </IconButton>
        <IconButton title="Rehacer (⌘⇧Z)" onClick={onRedo} disabled={!canRedo}>
          <RedoIcon />
        </IconButton>
        <IconButton title="Shortcuts (⌘K)">
          <CommandIcon />
        </IconButton>

        {/* Morph: el componente trae su propio trigger (.start-new-placeholder) */}
        <StartOverDialog onConfirm={onReset} />

        <IconButton title="Pantalla completa">
          <ExpandIcon />
        </IconButton>
        <IconButton title="Reportar bug">
          <AlertIcon dot />
        </IconButton>
        <IconButton title="Tema">
          <ThemeIcon />
        </IconButton>
      </div>

      {/* Right: export */}
      <div className="flex items-center gap-1">
        <div
          className="flex items-center divide-x divide-white/[0.06] rounded-xl bg-surface"
          style={{ border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <button
            type="button"
            onClick={onExport}
            className="flex items-center gap-2 px-3 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:bg-surface-elevated/40"
            style={{ letterSpacing: "-0.2px" }}
          >
            <UploadIcon />
            <span>Export</span>
            <span className="text-faint" style={{ font: "400 11.5px/16px Inter" }}>
              1× · PNG
            </span>
          </button>
          <button
            type="button"
            className="flex size-8 items-center justify-center text-muted transition-colors hover:bg-surface-elevated/40 hover:text-foreground"
            title="Copiar link"
          >
            <CopyIcon />
          </button>
          <button
            type="button"
            className="flex size-8 items-center justify-center text-muted transition-colors hover:bg-surface-elevated/40 hover:text-foreground"
            title="Más opciones"
          >
            <SlidersIcon />
          </button>
        </div>
      </div>
    </header>
  );
}

/* ──────────────────────────────────────────────────────── Pieces ── */

function SaleBadge({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="relative flex items-center justify-center overflow-hidden transition-transform hover:scale-[1.02] active:scale-[0.98]"
      style={{
        height: 28,
        padding: "0 6px 0 4px",
        background: "rgba(240, 240, 240, 0.06)",
        borderRadius: 100,
        flexDirection: "row-reverse",
        gap: 4,
        font: "500 15px/20px Inter, sans-serif",
        letterSpacing: "-0.4px",
        color: "rgb(240,240,240)",
      }}
      title={label}
    >
      {/* Chevron (visualmente a la derecha por row-reverse) */}
      <svg viewBox="0 0 24 24" style={{ width: 18, height: 18 }} fill="currentColor">
        <path
          d="M9 6l6 6-6 6"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Pill rojo (visualmente a la izquierda) */}
      <div
        style={{
          display: "grid",
          placeItems: "center",
          height: 22,
          padding: "4px 8px",
          background: "rgba(255, 42, 42, 0.18)",
          borderRadius: 100,
        }}
      >
        <span
          style={{
            color: "rgb(255, 91, 91)",
            font: "400 11px/14px Inter, sans-serif",
            letterSpacing: "-0.2px",
            display: "flex",
            alignItems: "center",
          }}
        >
          {label}
        </span>
      </div>
    </button>
  );
}

function SaveChip({ status }: { status: SaveStatus }) {
  if (status === "idle") return null;
  return (
    <span
      className={cn(
        "ml-1 inline-flex items-center gap-1.5 rounded-pill px-2 py-0.5 text-[11px]",
        status === "saving" && "bg-surface text-muted",
        status === "saved" && "bg-surface text-success",
        status === "error" && "bg-danger/15 text-danger"
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          status === "saving" && "animate-pulse bg-warning",
          status === "saved" && "bg-success",
          status === "error" && "bg-danger"
        )}
      />
      {status === "saving" ? "Guardando" : status === "saved" ? "Guardado" : "Error"}
    </span>
  );
}

function IconButton({
  children,
  title,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  title: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex size-9 items-center justify-center rounded-xl transition-colors",
        disabled
          ? "text-faint/50"
          : "text-muted hover:bg-surface-elevated/40 hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

function Chevron() {
  return (
    <svg viewBox="0 0 16 16" className="size-4 text-faint" fill="none">
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShotsLogo() {
  return (
    <svg viewBox="0 0 24 24" className="size-5">
      <defs>
        <linearGradient id="logogr" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#43d25a" />
          <stop offset="100%" stopColor="#0a84ff" />
        </linearGradient>
      </defs>
      <path
        d="M4 8 C4 5.8 5.8 4 8 4 H16 C18.2 4 20 5.8 20 8 V16 C20 18.2 18.2 20 16 20 H8 C5.8 20 4 18.2 4 16 Z"
        fill="url(#logogr)"
      />
    </svg>
  );
}

function UndoIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-[18px]" fill="none">
      <path d="M7 5L3 9l4 4M3 9h11a3 3 0 010 6h-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RedoIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-[18px]" fill="none">
      <path d="M13 5l4 4-4 4M17 9H6a3 3 0 000 6h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CommandIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-[18px]" fill="none">
      <path
        d="M6 4a2 2 0 100 4h8a2 2 0 100-4h0a2 2 0 100 4M6 16a2 2 0 110-4h8a2 2 0 110 4h0a2 2 0 110-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-[18px]" fill="none">
      <path d="M4 4h5M4 4v5M16 16h-5M16 16v-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M4 4l5 5M16 16l-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function AlertIcon({ dot }: { dot?: boolean }) {
  return (
    <span className="relative">
      <svg viewBox="0 0 20 20" className="size-[18px]" fill="none">
        <path d="M10 3L17 16H3L10 3Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M10 9v3M10 14.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      {dot && <span className="absolute right-0 top-0 size-1.5 rounded-full bg-danger" />}
    </span>
  );
}

function ThemeIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-[18px]" fill="none">
      <circle cx="10" cy="10" r="6" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10 4a6 6 0 010 12V4z" fill="currentColor" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-4" fill="none">
      <path d="M10 4v9M6 7l4-4 4 4M4 16h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-4" fill="none">
      <rect x="5" y="5" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 13h-1V4a1 1 0 011-1h8a1 1 0 011 1v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function SlidersIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-4" fill="none">
      <path d="M4 6h12M4 10h7M4 14h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="13" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.4" fill="currentColor" />
      <circle cx="7" cy="14" r="1.5" stroke="currentColor" strokeWidth="1.4" fill="currentColor" />
    </svg>
  );
}
