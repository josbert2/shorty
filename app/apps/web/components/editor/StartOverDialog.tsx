"use client";

/*
  Start Over — clon fiel del .start-new-component de shots.so, con MORPH:
  el botón es el panel. Un solo div absoluto interpola width/height/radius/shadow
  entre el estado cerrado (≈95×32, radius 12) y abierto (320×292, radius 32).

  Layers cruzados:
    A) label "Start Over" — visible en closed, fade-out al abrir
    B) panel (imagen + textos + botones) — fade-in al abrir, blur(6) → blur(0)

  Background no cambia: bg-surface = rgb(28,28,28) = el mismo del panel.
*/

import { useEffect, useRef, useState } from "react";

type Phase = "closed" | "opening" | "open" | "closing";

const CLOSED_W = 95;
const CLOSED_H = 32;
const OPEN_W = 320;
const OPEN_H = 292;

export function StartOverDialog({ onConfirm }: { onConfirm: () => void }) {
  const [phase, setPhase] = useState<Phase>("closed");
  const [hover, setHover] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // FSM
  useEffect(() => {
    if (phase === "opening") {
      const id = requestAnimationFrame(() => setPhase("open"));
      return () => cancelAnimationFrame(id);
    }
    if (phase === "closing") {
      const t = setTimeout(() => setPhase("closed"), 520);
      return () => clearTimeout(t);
    }
  }, [phase]);

  // Outside click + keyboard
  useEffect(() => {
    if (phase === "closed") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPhase("closing");
      if (e.key === "Enter" && phase === "open") {
        onConfirm();
        setPhase("closing");
      }
    };
    const onClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current?.contains(e.target as Node)) return;
      setPhase("closing");
    };
    window.addEventListener("keydown", onKey);
    const t = setTimeout(() => {
      window.addEventListener("mousedown", onClickOutside);
    }, 0);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
      window.removeEventListener("mousedown", onClickOutside);
    };
  }, [phase, onConfirm]);

  const isClosed = phase === "closed";
  const isOpen = phase === "open";

  const handleMorphClick = () => {
    if (isClosed) setPhase("opening");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isClosed) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setPhase("opening");
    }
  };

  return (
    <div ref={wrapperRef} className="relative ml-1 flex flex-col items-center">
      {/* Layout reservation — placeholder con dims del estado cerrado */}
      <div style={{ width: CLOSED_W, height: CLOSED_H }} aria-hidden />

      {/* Morpher — botón y panel a la vez */}
      <div
        role={isClosed ? "button" : "dialog"}
        tabIndex={isClosed ? 0 : -1}
        aria-label={isClosed ? "Start Over" : undefined}
        aria-modal={!isClosed ? "false" : undefined}
        onClick={handleMorphClick}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="absolute overflow-hidden"
        style={{
          top: 0,
          left: "50%",
          width: isOpen ? OPEN_W : CLOSED_W,
          height: isOpen ? OPEN_H : CLOSED_H,
          borderRadius: isOpen ? 32 : 12,
          background: "rgb(28,28,28)",
          boxShadow: isOpen
            ? "0 24px 56px -16px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.06)"
            : hover && isClosed
              ? "0 0 0 1px rgba(255,255,255,0.04)"
              : "none",
          cursor: isClosed ? "pointer" : "default",
          transformOrigin: "top center",
          transform: `translateX(-50%) scale(${isClosed && hover ? 1.02 : 1})`,
          transition: [
            "width 460ms cubic-bezier(0.22, 1.15, 0.36, 1)",
            "height 460ms cubic-bezier(0.22, 1.15, 0.36, 1)",
            "border-radius 420ms cubic-bezier(0.16,1,0.3,1)",
            "box-shadow 320ms cubic-bezier(0.16,1,0.3,1)",
            "transform 280ms cubic-bezier(0.22, 1.15, 0.36, 1)",
          ].join(", "),
          zIndex: isClosed ? 1 : 700,
        }}
      >
        {/* Layer A: button label — visible en closed */}
        <div
          aria-hidden={!isClosed}
          className="absolute inset-0 flex items-center justify-center"
          style={{
            opacity: isClosed ? 1 : 0,
            transition: isClosed
              ? "opacity 240ms cubic-bezier(0.16,1,0.3,1) 240ms"
              : "opacity 140ms cubic-bezier(0.16,1,0.3,1)",
            pointerEvents: "none",
            color: "rgb(240,240,240)",
            font: "500 13px/16px Inter, sans-serif",
            letterSpacing: "-0.2px",
          }}
        >
          Start Over
        </div>

        {/* Layer B: panel — visible cuando open */}
        <div
          aria-hidden={!isOpen}
          className="absolute inset-0 flex flex-col items-center justify-end"
          style={{
            padding: 14,
            gap: 20,
            opacity: isOpen ? 1 : 0,
            filter: isOpen ? "blur(0px)" : "blur(6px)",
            transition: isOpen
              ? "opacity 280ms cubic-bezier(0.16,1,0.3,1) 220ms, filter 240ms cubic-bezier(0.16,1,0.3,1) 220ms"
              : "opacity 160ms cubic-bezier(0.16,1,0.3,1), filter 160ms cubic-bezier(0.16,1,0.3,1)",
            pointerEvents: isOpen ? "auto" : "none",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/start-over.png"
            alt=""
            style={{ width: 120, height: 91.5 }}
          />

          <div
            className="flex flex-col text-center"
            style={{ gap: 6, width: "100%" }}
          >
            <h2
              style={{
                font: "500 28px/38px Inter, sans-serif",
                letterSpacing: "-1px",
                color: "rgb(240,240,240)",
                margin: 0,
              }}
            >
              Start Over?
            </h2>
            <p
              style={{
                font: "400 12.5px/20px Inter, sans-serif",
                letterSpacing: "-0.2px",
                color: "rgba(240,240,240,0.6)",
                margin: 0,
              }}
            >
              Your current progress will be lost.
            </p>
          </div>

          <div className="flex" style={{ gap: 10, width: "100%", marginTop: 4 }}>
            <DialogButton
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                setPhase("closing");
              }}
            >
              Cancel
            </DialogButton>
            <DialogButton
              variant="primary"
              autoFocus={isOpen}
              onClick={(e) => {
                e.stopPropagation();
                onConfirm();
                setPhase("closing");
              }}
            >
              Start Over
            </DialogButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function DialogButton({
  variant,
  onClick,
  children,
  autoFocus,
}: {
  variant: "primary" | "secondary";
  onClick: (e: React.MouseEvent) => void;
  children: React.ReactNode;
  autoFocus?: boolean;
}) {
  const isPrimary = variant === "primary";
  return (
    <button
      type="button"
      onClick={onClick}
      autoFocus={autoFocus}
      className="relative flex items-center justify-center overflow-hidden transition-transform hover:scale-[1.03] active:scale-[0.97]"
      style={{
        flex: 1,
        height: 48,
        padding: "14px 16px",
        gap: 8,
        borderRadius: 100,
        background: isPrimary ? "rgb(240,240,240)" : "rgba(240,240,240,0.06)",
        color: isPrimary ? "rgb(0,0,0)" : "rgb(240,240,240)",
        font: "500 15px/20px Inter, sans-serif",
        letterSpacing: "-0.4px",
        transitionDuration: "320ms",
        transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      <span>{children}</span>
    </button>
  );
}
