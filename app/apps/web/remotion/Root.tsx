import { Composition } from "remotion";
import { Mockup, defaultMockupProps } from "./Mockup";
import { MockupAnimated, defaultMockupAnimatedProps } from "./MockupAnimated";

export const COMPOSITION_STILL = "Mockup";
export const COMPOSITION_VIDEO = "MockupAnimated";

const VIDEO_FPS = 30;
const VIDEO_DURATION_SECONDS = 4;

export function RemotionRoot() {
  return (
    <>
      <Composition
        id={COMPOSITION_STILL}
        component={Mockup}
        durationInFrames={1}
        fps={30}
        width={1600}
        height={1000}
        defaultProps={defaultMockupProps}
      />
      <Composition
        id={COMPOSITION_VIDEO}
        component={MockupAnimated}
        durationInFrames={VIDEO_FPS * VIDEO_DURATION_SECONDS}
        fps={VIDEO_FPS}
        width={1600}
        height={1000}
        defaultProps={defaultMockupAnimatedProps}
      />
    </>
  );
}
