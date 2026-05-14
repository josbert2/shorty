"use client";

/*
  Media control del sidebar — drop zone 208×88 con preview de device 83×64.
  Click abre el MediaPickerPopover.
  Drop directo: upload + asignar como screenshot.
*/

import { useState } from "react";
import { uploadToR2 } from "@/lib/upload";
import { MediaPickerPopover } from "./media-picker/MediaPickerPopover";

type UploadStatus = "idle" | "uploading" | "error";

type Props = {
  screenshot: string | null;
  onChange: (url: string | null) => void;
  userId: string;
  projectId: string;
};

export function MediaControl({ screenshot, onChange, userId, projectId }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [pickerOpen, setPickerOpen] = useState(false);

  const onFileDrop = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setStatus("uploading");
    const preview = await blobToDataUrl(file);
    onChange(preview);

    try {
      const ext = (file.type.split("/")[1] ?? "png").split("+")[0];
      const { publicUrl } = await uploadToR2({
        blob: file,
        userId,
        projectId,
        kind: "screenshot",
        filename: `screenshot-${Date.now()}.${ext}`,
      });
      onChange(publicUrl);
      setStatus("idle");
    } catch (err) {
      console.warn("R2 upload failed:", err);
      setStatus("error");
    }
  };

  const openPicker = () => setPickerOpen(true);

  return (
    <>
      <div data-media-control className="flex flex-col" style={{ width: 208, gap: 8 }}>
        <SectionLabel>media</SectionLabel>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file) void onFileDrop(file);
          }}
          onClick={openPicker}
          className="relative flex cursor-pointer flex-col items-center justify-center"
          style={{
            width: 208,
            height: 88,
            padding: 12,
            gap: 12,
            background: "rgb(13,13,13)",
            borderRadius: 10,
          }}
        >
          {dragOver && <DropIndicator />}
          <DevicePreviewThumb screenshot={screenshot} uploading={status === "uploading"} />
        </div>

        <Footnote>Drop media or click to choose</Footnote>
      </div>

      <MediaPickerPopover
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        screenshot={screenshot}
        onChange={onChange}
        userId={userId}
        projectId={projectId}
      />
    </>
  );
}

/* ──────────────────────────────────────────── Subcomponents ── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        font: "600 11px/16px Inter, sans-serif",
        letterSpacing: "0.4px",
        color: "rgba(240,240,240,0.36)",
        textTransform: "uppercase",
      }}
    >
      {children}
    </span>
  );
}

function Footnote({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        font: "400 11px/14px Inter, sans-serif",
        letterSpacing: "-0.2px",
        color: "rgba(240,240,240,0.36)",
        textAlign: "center",
      }}
    >
      {children}
    </span>
  );
}

function DropIndicator() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background: "rgb(13,13,13)",
        border: "1px dashed rgb(240,240,240)",
        borderRadius: 10,
        zIndex: 1,
        pointerEvents: "none",
      }}
    />
  );
}

function DevicePreviewThumb({
  screenshot,
  uploading,
}: {
  screenshot: string | null;
  uploading: boolean;
}) {
  return (
    <div className="relative" style={{ width: 83, height: 64, maxWidth: "45%" }}>
      <div
        className="relative h-full w-full overflow-hidden"
        style={{ borderRadius: 4, margin: "1px 0" }}
      >
        {screenshot ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={screenshot}
            alt="Screenshot"
            className="h-full w-full object-cover"
            style={{ borderRadius: 4 }}
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ background: "rgb(85,85,85)", borderRadius: 4 }}
          >
            <svg
              viewBox="0 0 24 24"
              width={18}
              height={18}
              fill="currentColor"
              style={{ color: "rgba(255,255,255,0.95)" }}
            >
              <path d="M4 11.664a.96.96 0 0 0 .949.949h5.765v5.765c0 .504.434.95.95.95.515 0 .937-.446.937-.95v-5.765h5.777a.96.96 0 0 0 .938-.949.96.96 0 0 0-.938-.95h-5.777V4.949c0-.504-.422-.949-.937-.949a.97.97 0 0 0-.95.949v5.765H4.949a.96.96 0 0 0-.949.95" />
            </svg>
          </div>
        )}
      </div>

      {uploading && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.5)", borderRadius: 4 }}
        >
          <svg viewBox="0 0 16 16" className="size-3 animate-spin" style={{ color: "white" }}>
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.25" />
            <path d="M14 8a6 6 0 00-6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        </div>
      )}
    </div>
  );
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
