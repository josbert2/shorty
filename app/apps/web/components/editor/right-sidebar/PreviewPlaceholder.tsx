"use client";

/*
  Placeholder del device activo dentro de un preview (DragPad o LayoutItem).
  Decide visual según deviceId:
    - "screenshot" → ScreenshotPlaceholder (4:3 black rect + "Drop or Paste" empty state)
    - resto → PhonePlaceholder (silueta iPhone vertical)

  Match contra scrapp.css:
    .devices.screenshot.default  → 156×117 (4:3)
    .empty-state.start-state     → flex col center, full size
    .icons / .icon / .image-icon / .video-icon → 3 SVGs fanned out con tilt -8°/0°/8°
    .title    → 9.1px/9.1px Inter 500, color rgba(240,240,240,.36)
    .subtitle → 4.55px/4.55px Inter 500, color rgba(240,240,240,.36)
    .shadow-layer → 0 1px 3px rgba(0,0,0,.4), 0 3px 9px rgba(0,0,0,.4)
*/

export function PreviewPlaceholder({ deviceId }: { deviceId: string }) {
  if (deviceId === "screenshot") return <ScreenshotPlaceholder />;
  return <PhonePlaceholder />;
}

/* ─────────────────────────────────────── Screenshot (4:3) ── */

export function ScreenshotPlaceholder() {
  return (
    <div
      aria-hidden
      style={{
        width: 108,
        height: 81,
        background: "rgb(13,13,13)",
        borderRadius: 5.46,
        boxShadow:
          "0 1px 3px rgba(0,0,0,0.4), 0 3px 9px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.03)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Browser impone min-font-size (~12px). Wrapper con scale(0.5) bypassa
          el clamp y rinde el 9.1px / 4.55px del original sin distorsión. */}
      <div style={{ transform: "scale(0.5)", transformOrigin: "center center" }}>
        <ScreenshotEmptyState />
      </div>
    </div>
  );
}

function ScreenshotEmptyState() {
  return (
    <div
      className="relative flex flex-col items-center justify-center"
      style={{ position: "relative" }}
    >
      {/* Icons cluster: image (-8°) + plus (centro) + video (+8°) */}
      <div className="relative" style={{ width: 12.73, height: 12.73 }}>
        {/* Image icon — absolute izquierda, rotada -8° */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          style={{
            position: "absolute",
            width: 16.37,
            height: 16.37,
            top: -8.73,
            left: -10.19,
            transform: "rotate(-8deg)",
            color: "rgba(240,240,240,0.36)",
            zIndex: 0,
          }}
        >
          <path
            fill="currentColor"
            d="M15.9 3C18.95 3 21 5.14 21 8.325v7.35C21 18.859 18.95 21 15.899 21h-7.8C5.049 21 3 18.859 3 15.675v-7.35C3 5.14 5.049 3 8.099 3zm.992 9.495c-.964-.602-1.709.243-1.91.513-.194.261-.36.549-.536.837-.429.711-.92 1.53-1.771 2.006-1.236.685-2.175.054-2.85-.405a5 5 0 0 0-.745-.44c-.604-.261-1.148.036-1.955 1.062-.424.536-.844 1.067-1.269 1.596-.255.317-.194.806.149 1.017.548.337 1.216.519 1.97.519h7.585c.428 0 .857-.059 1.266-.193a3.33 3.33 0 0 0 2.035-1.9c.322-.765.479-1.694.177-2.467-.1-.256-.25-.495-.461-.705-.553-.549-1.07-1.061-1.685-1.44M8.848 6.6a2.251 2.251 0 0 0 0 4.5c1.24 0 2.25-1.01 2.25-2.25 0-1.241-1.01-2.25-2.25-2.25"
          />
        </svg>

        {/* Plus icon — centro, z-index 1 (encima) */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          style={{
            position: "relative",
            width: 12.73,
            height: 12.73,
            color: "rgba(240,240,240,0.48)",
            zIndex: 1,
          }}
        >
          <path
            fill="currentColor"
            fillRule="evenodd"
            d="M12.97 11.16h3.88c.46 0 .83.37.83.83s-.38.83-.84.83h-3.89v3.88c0 .46-.38.83-.84.83-.47 0-.84-.38-.84-.84V12.8H7.38c-.47 0-.84-.38-.84-.84 0-.47.37-.84.83-.84h3.88V7.23a.83.83 0 1 1 1.66-.01v3.88ZM5.06 4.92c-3.91 3.9-3.91 10.23 0 14.14 3.9 3.9 10.23 3.9 14.14 0 3.9-3.91 3.9-10.24 0-14.15a10 10 0 0 0-14.15 0Z"
          />
        </svg>

        {/* Video icon — absolute derecha, rotada +8° */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          style={{
            position: "absolute",
            width: 16.37,
            height: 16.37,
            top: -8.73,
            left: 6.55,
            transform: "rotate(8deg)",
            color: "rgba(240,240,240,0.36)",
            zIndex: 0,
          }}
        >
          <path
            fill="currentColor"
            d="M4.599 18.5h8.628c1.616 0 2.6-.928 2.6-2.517V8.016c0-1.589-.891-2.516-2.497-2.516H4.599C3.077 5.5 2 6.427 2 8.016v7.967c0 1.589.983 2.517 2.599 2.517m12.429-4.137 2.962 2.557c.28.245.622.398.912.398.663 0 1.098-.479 1.098-1.152V7.833c0-.673-.435-1.152-1.098-1.152-.29 0-.632.153-.912.398l-2.962 2.557z"
          />
        </svg>
      </div>

      <span
        style={{
          marginTop: 4.55,
          marginBottom: 0,
          color: "rgba(240,240,240,0.36)",
          font: "500 9.1px/9.1px Inter, sans-serif",
          letterSpacing: "-0.182px",
          whiteSpace: "nowrap",
        }}
      >
        Drop or Paste
      </span>
      <span
        style={{
          marginTop: 5.46,
          color: "rgba(240,240,240,0.36)",
          font: "500 4.55px/4.55px Inter, sans-serif",
          letterSpacing: "-0.0455px",
          whiteSpace: "nowrap",
        }}
      >
        Images & Videos
      </span>
    </div>
  );
}

/* ─────────────────────────────────────── Phone (iPhone) ── */

export function PhonePlaceholder() {
  return (
    <div
      aria-hidden
      style={{
        width: 44,
        height: 92,
        background: "rgb(18,18,20)",
        borderRadius: 8,
        boxShadow:
          "0 6px 18px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)",
        position: "relative",
      }}
    >
      {/* dynamic island */}
      <div
        style={{
          position: "absolute",
          top: 4,
          left: "50%",
          transform: "translateX(-50%)",
          width: 14,
          height: 3,
          background: "rgb(10,10,12)",
          borderRadius: 2,
        }}
      />
    </div>
  );
}
