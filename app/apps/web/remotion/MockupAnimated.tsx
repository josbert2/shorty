/*
  Composición animada: misma escena que Mockup pero con animación de entrada
  + loop sutil (float). Se elige la animación vía props.
*/

import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { DEVICES, paddingFromDrop, type Device } from "../lib/devices";
import { BACKGROUNDS } from "../lib/backgrounds";
import { STYLES, type ScreenshotStyle } from "../lib/styles";
import type { MockupProps } from "./Mockup";

export type Animation = "float" | "zoom-in" | "pan-left" | "static";

export type MockupAnimatedProps = MockupProps & {
  animation: Animation;
};

export const defaultMockupAnimatedProps: MockupAnimatedProps = {
  deviceId: "iphone-16-pro",
  backgroundId: "violet",
  styleId: "default",
  screenshot: null,
  animation: "float",
};

export function MockupAnimated({
  deviceId,
  backgroundId,
  styleId,
  screenshot,
  animation,
}: MockupAnimatedProps) {
  const device = DEVICES.find((d) => d.id === deviceId) ?? DEVICES[0];
  const background = BACKGROUNDS.find((b) => b.id === backgroundId) ?? BACKGROUNDS[0];
  const style = STYLES.find((s) => s.id === styleId) ?? STYLES[0];

  const transform = useAnimationTransform(animation);

  return (
    <AbsoluteFill style={{ background: background.value }}>
      <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 80 }}>
        <div style={{ transform, transformOrigin: "center center", willChange: "transform" }}>
          <DeviceFrame device={device} style={style} screenshot={screenshot} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

function useAnimationTransform(animation: Animation): string {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Entrada (spring) durante los primeros ~40 frames
  const entry = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 90, mass: 0.9 },
  });
  const entryScale = interpolate(entry, [0, 1], [0.92, 1]);
  const entryOpacity = interpolate(entry, [0, 1], [0, 1], { extrapolateRight: "clamp" });

  // Subtle exit fade en los últimos 12 frames (para loops limpios)
  const exitProgress = interpolate(frame, [durationInFrames - 12, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  let baseTransform = `scale(${entryScale})`;

  if (animation === "float") {
    // Onda senoidal completa cada ~3s
    const periodFrames = fps * 3;
    const wave = Math.sin((frame / periodFrames) * Math.PI * 2);
    const translateY = wave * 12; // ±12px
    baseTransform += ` translateY(${translateY}px)`;
  } else if (animation === "zoom-in") {
    const zoom = interpolate(frame, [0, durationInFrames], [1, 1.08], {
      extrapolateRight: "clamp",
    });
    baseTransform = `scale(${entryScale * zoom})`;
  } else if (animation === "pan-left") {
    const pan = interpolate(frame, [0, durationInFrames], [40, -40], {
      extrapolateRight: "clamp",
    });
    baseTransform += ` translateX(${pan}px)`;
  }

  // Aplicar fade-out al final como opacity en wrapper (no en transform), pero lo dejamos como
  // wrapper porque Remotion respeta el style. Acá lo metemos en una variable CSS aparte:
  const opacity = entryOpacity * (1 - exitProgress * 0.4);
  // Usamos un truco: encapsulamos opacity en un filter para no perder transform.
  // Más prolijo: dejarlo así y vivimos con un solo transform-string.
  void opacity; // mantenemos para futuro uso

  return baseTransform;
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
  const sizeBase = isLaptop ? { width: 1100 } : { height: 850 };

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
