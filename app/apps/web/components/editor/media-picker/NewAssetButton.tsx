"use client";

/*
  Botón "+ Add media" del Media Picker.
  CSS real:
    .new-asset {
      aspect-ratio: 1;
      background: rgba(primary, 0.12);
      place-content: center;
      width: 62; margin: 4 12;
      display: grid; position: relative;
    }
    .new-asset svg { width: 28; height: 28; color: rgba(primary, 0.6) }
    .new-asset > span {
      text-align: center; color: rgba(primary, 0.6);
      pointer-events: none; margin: 0 auto;
      position: absolute; bottom: -26; left: 0; right: 0;
    }
*/

export function NewAssetButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative grid transition-transform hover:scale-[1.04] active:scale-[0.98]"
      style={{
        aspectRatio: "1",
        width: 62,
        margin: "4px 12px",
        background: "rgba(240,240,240,0.12)",
        placeContent: "center",
        borderRadius: 14,
        color: "rgba(240,240,240,0.6)",
      }}
    >
      <svg viewBox="0 0 24 24" width={28} height={28} fill="currentColor">
        <path d="M4 11.664a.96.96 0 0 0 .949.949h5.765v5.765c0 .504.434.95.95.95.515 0 .937-.446.937-.95v-5.765h5.777a.96.96 0 0 0 .938-.949.96.96 0 0 0-.938-.95h-5.777V4.949c0-.504-.422-.949-.937-.949a.97.97 0 0 0-.95.949v5.765H4.949a.96.96 0 0 0-.949.95" />
      </svg>
      <span
        className="pointer-events-none"
        style={{
          position: "absolute",
          bottom: -26,
          left: 0,
          right: 0,
          margin: "0 auto",
          textAlign: "center",
          font: "400 12.5px/20px Inter, sans-serif",
          letterSpacing: "-0.2px",
          color: "rgba(240,240,240,0.6)",
        }}
      >
        Add media
      </span>
    </button>
  );
}
