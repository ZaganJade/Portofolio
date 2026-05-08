"use client";

import { button, folder, Leva, useControls } from "leva";
import { useEffect, useMemo, useRef } from "react";
import { HeroCharacter, type PoseTargets } from "@/components/three/HeroCharacter";

/**
 * HeroPoseTuner
 *
 * A drop-in replacement for <HeroCharacter /> that exposes every bone
 * rotation + scene position/rotation/scale as a live leva GUI panel.
 *
 * USAGE
 *   1. Visit  http://localhost:3000/?tune=1
 *   2. A panel appears in the top-right corner
 *   3. Drag sliders until the pose looks right
 *   4. Click the "Copy pose to clipboard" button
 *   5. Paste the JSON into POSE_HAT_TIP_FLIRTY (or a new preset) in
 *      components/three/HeroCharacter.tsx
 *   6. Remove ?tune=1 from the URL — panel disappears in production
 *
 * The control ranges cover ±π radians (±180°) so you can always
 * reach the far side of any axis. For fine control hold Shift while
 * dragging.
 */
export interface HeroPoseTunerProps {
  url: string;
  hideMeshes?: RegExp[];
  colorPunch?: number;
}

// Default preset values — mirrored from POSE_DOUBLE_PEACE in HeroCharacter.tsx
const DEFAULTS = {
  // Scene
  posX: 0,
  posY: -1.6,
  posZ: -1.3,
  yaw: 0,
  pitch: 0,
  roll: 0,
  scale: 2.0,
  mouseIntensity: 0.45,
  breathIntensity: 1,
  // Bones
  spineX: 0.02,
  spineY: 0,
  spineZ: 0,
  chestX: -0.02,
  chestY: 0,
  chestZ: 0,
  neckX: 0.04,
  neckY: 0,
  neckZ: -0.06,
  headX: 0.08,
  headY: 0,
  headZ: -0.12,
  lShoulderX: 0,
  lShoulderY: 0,
  lShoulderZ: 0.2,
  lArmX: -0.25,
  lArmY: 0.3,
  lArmZ: 1.45,
  lForeArmX: -0.2,
  lForeArmY: -1.55,
  lForeArmZ: 0,
  lHandX: 0,
  lHandY: -0.1,
  lHandZ: 0.15,
  rShoulderX: 0,
  rShoulderY: 0,
  rShoulderZ: -0.2,
  rArmX: -0.25,
  rArmY: -0.3,
  rArmZ: -1.45,
  rForeArmX: -0.2,
  rForeArmY: 1.55,
  rForeArmZ: 0,
  rHandX: 0,
  rHandY: 0.1,
  rHandZ: -0.15,
};

type Vals = typeof DEFAULTS;

const RAD_OPTS = { min: -Math.PI, max: Math.PI, step: 0.01 };
const POS_OPTS = { min: -5, max: 5, step: 0.05 };

function r(n: number): string {
  return Number(n.toFixed(3)).toString();
}

function buildPoseSnippet(v: Vals): string {
  return `// Paste into components/three/HeroCharacter.tsx
export const POSE_TUNED: PoseTargets = {
  spine:         { x: ${r(v.spineX)}, y: ${r(v.spineY)}, z: ${r(v.spineZ)} },
  chest:         { x: ${r(v.chestX)}, y: ${r(v.chestY)}, z: ${r(v.chestZ)} },
  neck:          { x: ${r(v.neckX)}, y: ${r(v.neckY)}, z: ${r(v.neckZ)} },
  head:          { x: ${r(v.headX)}, y: ${r(v.headY)}, z: ${r(v.headZ)} },
  leftShoulder:  { x: ${r(v.lShoulderX)}, y: ${r(v.lShoulderY)}, z: ${r(v.lShoulderZ)} },
  leftArm:       { x: ${r(v.lArmX)}, y: ${r(v.lArmY)}, z: ${r(v.lArmZ)} },
  leftForeArm:   { x: ${r(v.lForeArmX)}, y: ${r(v.lForeArmY)}, z: ${r(v.lForeArmZ)} },
  leftHand:      { x: ${r(v.lHandX)}, y: ${r(v.lHandY)}, z: ${r(v.lHandZ)} },
  rightShoulder: { x: ${r(v.rShoulderX)}, y: ${r(v.rShoulderY)}, z: ${r(v.rShoulderZ)} },
  rightArm:      { x: ${r(v.rArmX)}, y: ${r(v.rArmY)}, z: ${r(v.rArmZ)} },
  rightForeArm:  { x: ${r(v.rForeArmX)}, y: ${r(v.rForeArmY)}, z: ${r(v.rForeArmZ)} },
  rightHand:     { x: ${r(v.rHandX)}, y: ${r(v.rHandY)}, z: ${r(v.rHandZ)} },
};

// Scene placement for HeroScene.tsx:
//   scale={${r(v.scale)}}
//   position={[${r(v.posX)}, ${r(v.posY)}, ${r(v.posZ)}]}
//   baseRotation={[${r(v.pitch)}, ${r(v.yaw)}, ${r(v.roll)}]}
//   breathIntensity={${r(v.breathIntensity)}}
//   mouseIntensity={${r(v.mouseIntensity)}}
`;
}

export function HeroPoseTuner({ url, hideMeshes, colorPunch = 1 }: HeroPoseTunerProps) {
  // The ref holds the current tuner values. Button callbacks read from
  // this ref instead of closing over `c` directly, which avoids the
  // self-reference issue (c isn't defined yet when button() is invoked).
  const liveRef = useRef<Vals>({ ...DEFAULTS });

  // ────────────────────────────────────────────────────────────────────
  // Scene group
  // ────────────────────────────────────────────────────────────────────
  const scene = useControls("Scene", {
    posX: { value: DEFAULTS.posX, ...POS_OPTS, label: "pos x" },
    posY: { value: DEFAULTS.posY, ...POS_OPTS, label: "pos y" },
    posZ: { value: DEFAULTS.posZ, ...POS_OPTS, label: "pos z" },
    yaw: { value: DEFAULTS.yaw, ...RAD_OPTS },
    pitch: { value: DEFAULTS.pitch, ...RAD_OPTS },
    roll: { value: DEFAULTS.roll, ...RAD_OPTS },
    scale: { value: DEFAULTS.scale, min: 0.5, max: 4, step: 0.05 },
    breathIntensity: { value: DEFAULTS.breathIntensity, min: 0, max: 1, step: 0.05 },
    mouseIntensity: { value: DEFAULTS.mouseIntensity, min: 0, max: 1, step: 0.05 },
  });

  const torso = useControls("Torso", {
    spineX: { value: DEFAULTS.spineX, ...RAD_OPTS, label: "spine x" },
    spineY: { value: DEFAULTS.spineY, ...RAD_OPTS, label: "spine y" },
    spineZ: { value: DEFAULTS.spineZ, ...RAD_OPTS, label: "spine z" },
    chestX: { value: DEFAULTS.chestX, ...RAD_OPTS, label: "chest x" },
    chestY: { value: DEFAULTS.chestY, ...RAD_OPTS, label: "chest y" },
    chestZ: { value: DEFAULTS.chestZ, ...RAD_OPTS, label: "chest z" },
  });

  const neckHead = useControls("Neck & Head", {
    neckX: { value: DEFAULTS.neckX, ...RAD_OPTS, label: "neck x" },
    neckY: { value: DEFAULTS.neckY, ...RAD_OPTS, label: "neck y" },
    neckZ: { value: DEFAULTS.neckZ, ...RAD_OPTS, label: "neck z" },
    headX: { value: DEFAULTS.headX, ...RAD_OPTS, label: "head x (tilt F/B)" },
    headY: { value: DEFAULTS.headY, ...RAD_OPTS, label: "head y (turn L/R)" },
    headZ: { value: DEFAULTS.headZ, ...RAD_OPTS, label: "head z (tilt L/R)" },
  });

  const leftArm = useControls("Left Arm", {
    lShoulderX: { value: DEFAULTS.lShoulderX, ...RAD_OPTS, label: "shoulder x" },
    lShoulderY: { value: DEFAULTS.lShoulderY, ...RAD_OPTS, label: "shoulder y" },
    lShoulderZ: { value: DEFAULTS.lShoulderZ, ...RAD_OPTS, label: "shoulder z" },
    lArmX: { value: DEFAULTS.lArmX, ...RAD_OPTS, label: "upper x" },
    lArmY: { value: DEFAULTS.lArmY, ...RAD_OPTS, label: "upper y" },
    lArmZ: { value: DEFAULTS.lArmZ, ...RAD_OPTS, label: "upper z" },
    lForeArmX: { value: DEFAULTS.lForeArmX, ...RAD_OPTS, label: "elbow x" },
    lForeArmY: { value: DEFAULTS.lForeArmY, ...RAD_OPTS, label: "elbow y" },
    lForeArmZ: { value: DEFAULTS.lForeArmZ, ...RAD_OPTS, label: "elbow z" },
    lHandX: { value: DEFAULTS.lHandX, ...RAD_OPTS, label: "hand x" },
    lHandY: { value: DEFAULTS.lHandY, ...RAD_OPTS, label: "hand y" },
    lHandZ: { value: DEFAULTS.lHandZ, ...RAD_OPTS, label: "hand z" },
  });

  const rightArm = useControls("Right Arm", {
    rShoulderX: { value: DEFAULTS.rShoulderX, ...RAD_OPTS, label: "shoulder x" },
    rShoulderY: { value: DEFAULTS.rShoulderY, ...RAD_OPTS, label: "shoulder y" },
    rShoulderZ: { value: DEFAULTS.rShoulderZ, ...RAD_OPTS, label: "shoulder z" },
    rArmX: { value: DEFAULTS.rArmX, ...RAD_OPTS, label: "upper x" },
    rArmY: { value: DEFAULTS.rArmY, ...RAD_OPTS, label: "upper y" },
    rArmZ: { value: DEFAULTS.rArmZ, ...RAD_OPTS, label: "upper z" },
    rForeArmX: { value: DEFAULTS.rForeArmX, ...RAD_OPTS, label: "elbow x" },
    rForeArmY: { value: DEFAULTS.rForeArmY, ...RAD_OPTS, label: "elbow y" },
    rForeArmZ: { value: DEFAULTS.rForeArmZ, ...RAD_OPTS, label: "elbow z" },
    rHandX: { value: DEFAULTS.rHandX, ...RAD_OPTS, label: "hand x" },
    rHandY: { value: DEFAULTS.rHandY, ...RAD_OPTS, label: "hand y" },
    rHandZ: { value: DEFAULTS.rHandZ, ...RAD_OPTS, label: "hand z" },
  });

  // Buttons are mounted in their own useControls group. They read from
  // `liveRef`, which we keep synced below. This avoids the self-reference
  // issue and keeps the action folder separate.
  useControls("Actions", {
    "Copy pose to clipboard": button(() => {
      const snippet = buildPoseSnippet(liveRef.current);
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard
          .writeText(snippet)
          .then(() => {
            console.log(`\u2705 Pose copied to clipboard\n\n${snippet}`);
          })
          .catch((err) => {
            console.error("Clipboard write failed:", err);
          });
      } else {
        console.log(snippet);
      }
    }),
    "Log pose to console": button(() => {
      console.log(buildPoseSnippet(liveRef.current));
    }),
  });

  // Flatten all control groups into a single `c` object. This is the
  // single source of truth we render from and keep the ref synced to.
  const c: Vals = useMemo(
    () => ({
      ...scene,
      ...torso,
      ...neckHead,
      ...leftArm,
      ...rightArm,
    }),
    [scene, torso, neckHead, leftArm, rightArm],
  );

  // Keep the ref fresh for button callbacks
  liveRef.current = c;

  const pose: PoseTargets = useMemo(
    () => ({
      spine: { x: c.spineX, y: c.spineY, z: c.spineZ },
      chest: { x: c.chestX, y: c.chestY, z: c.chestZ },
      neck: { x: c.neckX, y: c.neckY, z: c.neckZ },
      head: { x: c.headX, y: c.headY, z: c.headZ },
      leftShoulder: { x: c.lShoulderX, y: c.lShoulderY, z: c.lShoulderZ },
      leftArm: { x: c.lArmX, y: c.lArmY, z: c.lArmZ },
      leftForeArm: { x: c.lForeArmX, y: c.lForeArmY, z: c.lForeArmZ },
      leftHand: { x: c.lHandX, y: c.lHandY, z: c.lHandZ },
      rightShoulder: { x: c.rShoulderX, y: c.rShoulderY, z: c.rShoulderZ },
      rightArm: { x: c.rArmX, y: c.rArmY, z: c.rArmZ },
      rightForeArm: { x: c.rForeArmX, y: c.rForeArmY, z: c.rForeArmZ },
      rightHand: { x: c.rHandX, y: c.rHandY, z: c.rHandZ },
    }),
    [c],
  );

  useEffect(() => {
    console.log(
      "%c[HeroPoseTuner] live tuner active — adjust panel, then copy to clipboard.",
      "color:#a78bfa;font-weight:bold;",
    );
  }, []);

  // Silence folder/button imports unused warning — they're used implicitly
  // via the control schemas above. Reference them here for clarity.
  void folder;

  return (
    <HeroCharacter
      url={url}
      scale={c.scale}
      position={[c.posX, c.posY, c.posZ]}
      baseRotation={[c.pitch, c.yaw, c.roll]}
      pose={pose}
      breathIntensity={c.breathIntensity}
      mouseIntensity={c.mouseIntensity}
      hideMeshes={hideMeshes}
      colorPunch={colorPunch}
    />
  );
}

/** Render the leva panel itself. Mount alongside <Canvas>. */
export function HeroPoseTunerPanel() {
  return (
    <>
      {/* Force the leva panel above our site chrome (navigation sits at
          z-50) and make it obviously scrollable when taller than the
          viewport. Width is bumped so every label + slider fits without
          truncation. */}
      <style jsx global>{`
        #leva__root {
          position: fixed !important;
          top: 16px !important;
          right: 16px !important;
          z-index: 99999 !important;
          width: 360px !important;
          max-height: calc(100vh - 32px) !important;
          overflow-y: auto !important;
          overflow-x: hidden !important;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6) !important;
        }
        #leva__root::-webkit-scrollbar {
          width: 8px;
        }
        #leva__root::-webkit-scrollbar-thumb {
          background: rgba(167, 139, 250, 0.6);
          border-radius: 4px;
        }
      `}</style>
      <Leva
        collapsed={false}
        oneLineLabels={false}
        titleBar={{ title: "Herta Pose Tuner", drag: true, filter: true }}
        theme={{
          sizes: {
            rootWidth: "360px",
            controlWidth: "160px",
            scrubberWidth: "10px",
            scrubberHeight: "14px",
            rowHeight: "24px",
            folderTitleHeight: "24px",
          },
          colors: {
            accent1: "#a78bfa",
            accent2: "#c4b5fd",
            accent3: "#ddd6fe",
            highlight1: "#e0e7ff",
            highlight2: "#c7d2fe",
            highlight3: "#a5b4fc",
          },
        }}
      />
    </>
  );
}
