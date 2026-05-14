/*
  Composición Remotion: render fiel del mockup que mostramos en el editor.
  Es un componente puro — no usa hooks de cliente ni accede al DOM.
  Toda la geometría sale del catálogo de devices/backgrounds/styles.
*/

import { AbsoluteFill, Img, staticFile } from "remotion";
import { DEVICES, paddingFromDrop, type Device } from "../lib/devices";
import { BACKGROUNDS, type Background } from "../lib/backgrounds";
import { STYLES, type ScreenshotStyle } from "../lib/styles";

export type MockupProps = {
  deviceId: string;
  backgroundId: string;
  styleId: string;
  /** Data URL o URL pública del screenshot. null = sin screenshot. */
  screenshot: string | null;
};

export const defaultMockupProps: MockupProps = {
  deviceId: "iphone-16-pro",
  backgroundId: "violet",
  styleId: "default",
  screenshot: null,
};

export function Mockup({ deviceId, backgroundId, styleId, screenshot }: MockupProps) {
  const device = DEVICES.find((d) => d.id === deviceId) ?? DEVICES[0];
  const background = BACKGROUNDS.find((b) => b.id === backgroundId) ?? BACKGROUNDS[0];
  const style = STYLES.find((s) => s.id === styleId) ?? STYLES[0];

  return (
    <AbsoluteFill style={{ background: background.value }}>
      <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 80 }}>
        <DeviceFrame device={device} style={style} screenshot={screenshot} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

function DeviceFrame({
  device,
  style,
  screenshot,
}: {
  device: Device;
  style: ScreenshotStyle;
  screenshot: string | null;
}) {
  const isLaptop = device.category === "laptop";
  const sizeBase = isLaptop ? { width: "70%" } : { height: "85%" };

  return (
    <div
      style={{
        position: "relative",
        aspectRatio: String(device.aspectRatio),
        ...sizeBase,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: device.bezelColor,
          borderRadius: device.chassisRadius,
          boxShadow:
            "0 32px 80px -20px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.4)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: device.chassisRadius,
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.03) 100%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: paddingFromDrop(device.dropPadding),
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            overflow: "hidden",
            borderRadius: `${device.screenRadius}%`,
            background: style.glassBackground ?? "#0a0a0a",
            boxShadow: [style.shadow, style.border].filter(Boolean).join(", "),
          }}
        >
          {screenshot ? (
            <Img
              src={screenshot}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                background: "linear-gradient(160deg, #0a0a2e, #1a0533, #0d1a3e)",
              }}
            />
          )}

          {style.overlay && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: style.overlay,
                mixBlendMode: "overlay",
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Mantener para que Remotion no remueva el import de staticFile si lo usamos en futuro
export { staticFile };
