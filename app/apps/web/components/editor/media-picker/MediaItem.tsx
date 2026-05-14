"use client";

/*
  Card de un media en el Media Picker.
  CSS real:
    .media-item.is-landscape { aspect-ratio: 5/4; width: 100px }
    .media-item.is-portrait  { aspect-ratio: 3/4; width: 76px }
    .media-item              { cursor: pointer; border-radius: 14; padding: 8 }
    .media-safearea          { width: 100%; height: 100%; position: relative }
    .media-display           { max-height: 100%; margin: auto; position: absolute; inset: 0 }
    .media-display img       { outline: 1px solid rgba(primary, 0.12); outline-offset: -1; border-radius: 8 }
    .media-item.is-active .media-display img { outline-offset: 5px !important }
    .remove-button           { z-index: 1; bg modal; color danger;
                               position: absolute; top: -10; left: 0; right: 0;
                               width: 40; margin: 0 auto }
*/

type Props = {
  src: string;
  onRemove: () => void;
  uploading?: boolean;
  active?: boolean;
  orientation?: "landscape" | "portrait";
};

export function MediaItem({
  src,
  onRemove,
  uploading = false,
  active = false,
  orientation = "landscape",
}: Props) {
  const dimensions =
    orientation === "landscape"
      ? { aspectRatio: "5 / 4", width: 100, minWidth: 100 }
      : { aspectRatio: "3 / 4", width: 76, minWidth: 76 };

  return (
    <div
      className="group relative cursor-pointer"
      style={{
        ...dimensions,
        padding: 8,
        borderRadius: 14,
      }}
    >
      <RemoveButton onClick={onRemove} />

      <div className="relative h-full w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          className="absolute inset-0 m-auto h-full w-full object-contain transition-[outline-offset]"
          style={{
            borderRadius: 8,
            outline: "1px solid rgba(240,240,240,0.12)",
            outlineOffset: active ? 5 : -1,
            transitionDuration: "220ms",
            transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />
        {uploading && <UploadingOverlay />}
      </div>
    </div>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="absolute opacity-0 transition-opacity group-hover:opacity-100"
      style={{
        top: -10,
        left: 0,
        right: 0,
        margin: "0 auto",
        width: 40,
        height: 26,
        padding: 5,
        background: "rgb(38,38,38)",
        borderRadius: 100,
        color: "rgb(255,68,68)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1,
        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
      }}
      aria-label="Quitar"
    >
      <svg viewBox="0 0 24 24" width={14} height={14} fill="currentColor">
        <path d="M9.298 19.148c.313 0 .509-.195.502-.477l-.291-9.827c-.007-.29-.215-.471-.501-.471-.302 0-.51.189-.502.478l.29 9.823c.008.29.208.474.502.474m2.687 0c.309 0 .517-.192.517-.477v-9.82c0-.286-.208-.478-.517-.478-.306 0-.518.192-.518.478v9.82c0 .285.212.477.518.477m2.691.007c.289 0 .497-.187.505-.477l.282-9.824c.008-.289-.196-.477-.502-.477-.29 0-.497.188-.505.47l-.282 9.827c-.008.282.192.481.502.481M8.078 6.023h1.264V4.105c0-.562.381-.912.972-.912h3.33c.586 0 .967.35.967.912v1.918h1.273V4.025c0-1.256-.82-2.025-2.168-2.025h-3.482c-1.337 0-2.156.769-2.156 2.025zm-4.182.632h16.178a.594.594 0 0 0 .592-.601c0-.337-.271-.6-.592-.6H3.896a.61.61 0 0 0-.597.6c0 .334.283.601.597.601M7.875 22h8.227c1.225 0 2.08-.817 2.144-2.05l.485-13.142h-1.262l-.478 12.949c-.022.582-.42.985-.987.985H8.078c-.564 0-.962-.408-.988-.985l-.452-12.95H5.39l.486 13.143c.057 1.247.912 2.05 2 2.05" />
      </svg>
    </button>
  );
}

function UploadingOverlay() {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{
        background: "rgba(28,28,28,0.5)",
        borderRadius: 8,
        outline: "1px solid rgba(240,240,240,0.06)",
        outlineOffset: -1,
        zIndex: 1,
      }}
    >
      <svg viewBox="0 0 16 16" className="size-3.5 animate-spin" style={{ color: "white" }}>
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.25" />
        <path d="M14 8a6 6 0 00-6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
}
