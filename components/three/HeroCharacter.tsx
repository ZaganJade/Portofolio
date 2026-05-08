"use client";

import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import type { Group, Mesh, MeshStandardMaterial, Object3D } from "three";
import { clone as cloneSkeletalMesh } from "three/examples/jsm/utils/SkeletonUtils.js";
import { useIsTouchDevice } from "@/lib/hooks/useIsTouchDevice";
import { lerp } from "@/lib/utils";

// CDN-hosted Draco decoder (our GLB is Draco-compressed)
const DRACO_DECODER_PATH = "https://www.gstatic.com/draco/versioned/decoders/1.5.7/";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type BoneRotation = { x?: number; y?: number; z?: number };

/**
 * Normalized skeleton roles. Each rig convention (HSR, MMD, Mixamo, VRoid,
 * Unity Humanoid) uses different bone names; the regex table below resolves
 * them to these roles.
 */
export type PoseTargets = Partial<{
  spine: BoneRotation;
  chest: BoneRotation;
  neck: BoneRotation;
  head: BoneRotation;
  leftShoulder: BoneRotation;
  leftArm: BoneRotation;
  leftForeArm: BoneRotation;
  leftHand: BoneRotation;
  rightShoulder: BoneRotation;
  rightArm: BoneRotation;
  rightForeArm: BoneRotation;
  rightHand: BoneRotation;
}>;

// ─────────────────────────────────────────────────────────────────────────────
// BONE NAME PATTERNS
// Handles HSR exports ("Head_0201"), Mixamo ("mixamorig:Head"),
// Unity Humanoid ("Head"), VRoid ("J_Bip_C_Head"), and MMD Japanese ("頭").
// The `(?![a-z])` lookahead lets the pattern accept numeric suffixes.
// ─────────────────────────────────────────────────────────────────────────────

const BONE_PATTERNS: Record<keyof PoseTargets, RegExp[]> = {
  spine: [/^spine(?![a-z])/i, /^upper[\s_]?body$/i, /^上半身$/, /J_Bip_C_Spine/i],
  chest: [
    /^chest(?![a-z])/i,
    /upperchest/i,
    /^spine[\s_]?0?2(?![a-z])/i,
    /^上半身2$/,
    /J_Bip_C_Chest/i,
  ],
  neck: [/^neck(?![a-z])/i, /^首$/, /J_Bip_C_Neck/i],
  head: [/^head(?![a-z])/i, /^頭$/, /J_Bip_C_Head/i, /mixamorig:?Head/i],

  leftShoulder: [
    /^left[\s_-]shoulder(?![a-z])/i,
    /^shoulder[\s_-]?l(?![a-z])/i,
    /^L[\s_-]?clavicle/i,
    /^左肩$/,
  ],
  leftArm: [
    /^left[\s_-]upper[\s_-]?arm(?![a-z])/i,
    /^left[\s_-]arm(?![a-z])/i,
    /^upper[\s_-]?arm[\s_-]?l(?![a-z])/i,
    /^arm[\s_-]?l(?![a-z])/i,
    /^左腕$/,
    /J_Bip_L_UpperArm/i,
    /mixamorig:?LeftArm(?![a-z])/i,
  ],
  leftForeArm: [
    /^left[\s_-](?:fore|lower)[\s_-]?arm(?![a-z])/i,
    /^left[\s_-]elbow(?![a-z])/i,
    /^(?:fore|lower)[\s_-]?arm[\s_-]?l(?![a-z])/i,
    /^左ひじ$/,
    /J_Bip_L_LowerArm/i,
    /mixamorig:?LeftForeArm/i,
  ],
  leftHand: [
    /^left[\s_-]hand(?![a-z])/i,
    /^left[\s_-]wrist(?![a-z])/i,
    /^hand[\s_-]?l(?![a-z])/i,
    /^左手首$/,
    /J_Bip_L_Hand/i,
    /mixamorig:?LeftHand/i,
  ],

  rightShoulder: [
    /^right[\s_-]shoulder(?![a-z])/i,
    /^shoulder[\s_-]?r(?![a-z])/i,
    /^R[\s_-]?clavicle/i,
    /^右肩$/,
  ],
  rightArm: [
    /^right[\s_-]upper[\s_-]?arm(?![a-z])/i,
    /^right[\s_-]arm(?![a-z])/i,
    /^upper[\s_-]?arm[\s_-]?r(?![a-z])/i,
    /^arm[\s_-]?r(?![a-z])/i,
    /^右腕$/,
    /J_Bip_R_UpperArm/i,
    /mixamorig:?RightArm(?![a-z])/i,
  ],
  rightForeArm: [
    /^right[\s_-](?:fore|lower)[\s_-]?arm(?![a-z])/i,
    /^right[\s_-]elbow(?![a-z])/i,
    /^(?:fore|lower)[\s_-]?arm[\s_-]?r(?![a-z])/i,
    /^右ひじ$/,
    /J_Bip_R_LowerArm/i,
    /mixamorig:?RightForeArm/i,
  ],
  rightHand: [
    /^right[\s_-]hand(?![a-z])/i,
    /^right[\s_-]wrist(?![a-z])/i,
    /^hand[\s_-]?r(?![a-z])/i,
    /^右手首$/,
    /J_Bip_R_Hand/i,
    /mixamorig:?RightHand/i,
  ],
};

function findBone(scene: Object3D, role: keyof PoseTargets): Object3D | null {
  const patterns = BONE_PATTERNS[role];
  let found: Object3D | null = null;
  scene.traverse((child) => {
    if (found) return;
    for (const re of patterns) {
      if (re.test(child.name)) {
        found = child;
        return;
      }
    }
  });
  return found;
}

// ─────────────────────────────────────────────────────────────────────────────
// POSE PRESETS
// Rotations in radians (≈57° per radian). Applied in local bone space.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * LEANING POSE — body clearly tilted, left arm extended forward as if
 * resting on a horizontal surface (the hero text). Values are deliberately
 * large so the pose is unmistakable.
 *
 * TUNE cheat-sheet:
 *   • Body tilts wrong way?      → flip the sign on `spine.z`
 *   • Arm doesn't rise at all?   → swap z↔x on leftArm / rightArm
 *   • Arm clips through chest?   → negate leftArm.z / rightArm.z
 *   • Head facing wrong way?     → change head.y value
 */
export const POSE_LEANING: PoseTargets = {
  // TORSO — strong lean to viewer's right (character's own left)
  spine: { z: 0.35, y: 0.15, x: 0.08 },
  chest: { z: 0.12, y: 0.05 },

  // HEAD — tilted down and to the side, looking at the "surface" she's
  // leaning on; slight turn toward camera to keep the face visible
  neck: { x: 0.1, z: -0.2 },
  head: { x: 0.15, y: 0.25, z: -0.3 },

  // LEFT ARM — raised forward like resting an elbow on a bar/desk
  leftShoulder: { z: 0.2 },
  leftArm: { z: 1.4, y: 0.5, x: -0.3 },
  leftForeArm: { y: -1.2, x: -0.2 },
  leftHand: { z: 0.15, y: -0.1 },

  // RIGHT ARM — relaxed, hanging with a soft elbow
  rightShoulder: { z: -0.08 },
  rightArm: { z: -0.35, x: 0.15 },
  rightForeArm: { y: 0.5, x: -0.15 },
  rightHand: { y: 0.1 },
};

/** Hands-on-chin alt preset kept for easy swap in HeroScene.tsx */
export const POSE_CUTE_HANDS_ON_CHIN: PoseTargets = {
  spine: { z: 0.22, y: 0.1 },
  chest: { z: 0.1, y: 0.05 },
  neck: { z: -0.2, x: -0.15 },
  head: { z: -0.22, x: -0.12, y: -0.1 },
  leftShoulder: { z: 0.15 },
  leftArm: { z: 2.0, y: 0.3, x: -0.4 },
  leftForeArm: { y: -1.9, z: 0.3 },
  leftHand: { z: 0.3 },
  rightShoulder: { z: -0.15 },
  rightArm: { z: -2.0, y: -0.3, x: -0.4 },
  rightForeArm: { y: 1.9, z: -0.3 },
  rightHand: { z: -0.3 },
};

/**
 * POSE_TUNED — user-tuned pose captured from the live leva tuner.
 * Updated 2026-05-08 (rev 2). Do not modify without explicit user request.
 */
export const POSE_TUNED: PoseTargets = {
  spine: { x: 0.14, y: -0.08, z: 0.08 },
  chest: { x: -0.02, y: 0.04, z: 0.4 },
  neck: { x: -0.04, y: 0.24, z: 0.12 },
  head: { x: 0.16, y: 0, z: -0.28 },
  leftShoulder: { x: 0.13, y: -3.142, z: 1.62 },
  leftArm: { x: -0.27, y: 0.27, z: 1.3 },
  leftForeArm: { x: 0.68, y: -0.1, z: -2.18 },
  leftHand: { x: -2.6, y: -1.95, z: -3.142 },
  rightShoulder: { x: 0.13, y: -3.142, z: -1.48 },
  rightArm: { x: 0.23, y: 0.81, z: -1.45 },
  rightForeArm: { x: -2.04, y: -1.02, z: -0.4 },
  rightHand: { x: 0.48, y: -1.25, z: 0.68 },
};

/**
 * DOUBLE PEACE — both hands raised in front, elbows sharply bent ~90°,
 * hands near shoulder/face level with palms facing camera. Body is
 * frontal to camera for maximum "hello world" energy.
 *
 * Classic anime / gacha character pose: cheerful, confident, playful.
 */
export const POSE_DOUBLE_PEACE: PoseTargets = {
  // ── TORSO: frontal, neutral, tiny forward lean ──
  spine: { x: 0.02, y: 0, z: 0 },
  chest: { x: -0.02, y: 0, z: 0 },

  // ── HEAD: slight cute tilt toward frame-right, chin tuck ──
  neck: { x: 0.04, y: 0, z: -0.06 },
  head: { x: 0.08, y: 0, z: -0.12 },

  // ── LEFT ARM: raised, elbow bent 90°, hand near left cheek ──
  // Shoulder lifts slightly; upper arm rotates up + slightly forward;
  // forearm folds back so hand sits near shoulder/face height.
  leftShoulder: { z: 0.2 },
  leftArm: { z: 1.45, y: 0.3, x: -0.25 },
  leftForeArm: { y: -1.55, x: -0.2 },
  leftHand: { z: 0.15, y: -0.1 },

  // ── RIGHT ARM: mirror of left ──
  rightShoulder: { z: -0.2 },
  rightArm: { z: -1.45, y: -0.3, x: -0.25 },
  rightForeArm: { y: 1.55, x: -0.2 },
  rightHand: { z: -0.15, y: 0.1 },
};

/**
 * HAT-TIP FLIRTY — Herta’s splash-art greeting pose:
 *
 *   • Body twisted ~30° to one side (contrapposto S-curve)
 *   • Right arm raised, elbow bent ~60°, hand pinching hat brim
 *     next to the cheek (the iconic “tip of the hat” gesture)
 *   • Left arm relaxed down along the hip, slight forward angle
 *   • Asymmetric shoulders — right shoulder rides up, left drops
 *   • Head counter-rotated back toward camera for eye contact
 *   • Chin tuck so the eyes read as a flirty upward gaze
 *
 * Tuning signs are written assuming the HSR rig convention used by this
 * Madam Herta GLB: `arm.z` lifts the arm laterally, `foreArm.y` bends the
 * elbow, mirrored positive/negative between left and right.
 */
export const POSE_HAT_TIP_FLIRTY: PoseTargets = {
  // ── TORSO: gentle S-curve, twist left then counter-twist up top ──
  // spine twists hips slightly left of frame; chest counter-rotates
  // toward camera so the bust line reads three-quarter, not profile.
  spine: { y: -0.18, z: -0.06, x: 0.02 },
  chest: { y: 0.22, z: 0.08 },

  // ── NECK + HEAD: counter-turn back to camera, tilt right, chin tuck ──
  // y positive pulls face back toward the lens after torso twist.
  // z negative tilts the crown toward character-right (left of frame).
  // x positive = chin tuck → upward "peekaboo" gaze.
  neck: { y: 0.18, z: -0.08, x: 0.05 },
  head: { y: 0.12, z: -0.22, x: 0.14 },

  // ── RIGHT ARM: the hero of the pose — raised to hat brim ──
  // rightShoulder z negative = shoulder lifts toward the ear
  // rightArm    z negative = upper arm rotates up and across the chest
  // rightArm    y negative = upper arm also swings forward
  // rightForeArm y positive = sharp elbow bend bringing hand to face
  // rightHand   z negative + y positive = wrist curls inward toward cheek
  rightShoulder: { z: -0.28 },
  rightArm: { z: -1.85, y: -0.45, x: 0.25 },
  rightForeArm: { y: 1.55, x: -0.25 },
  rightHand: { z: -0.25, y: 0.22, x: -0.1 },

  // ── LEFT ARM: relaxed, dropping along the hip with a tiny bend ──
  // leftShoulder z positive small = shoulder eases down
  // leftArm      small z,x = hangs naturally, fractionally forward
  // leftForeArm  y negative = subtle elbow bend (not stiff)
  leftShoulder: { z: 0.06 },
  leftArm: { z: 0.18, y: 0.12, x: 0.08 },
  leftForeArm: { y: -0.28, x: -0.05 },
  leftHand: { z: 0.05 },
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export interface HeroCharacterProps {
  url: string;
  /** Overall scale multiplier (auto-scales to viewport underneath this) */
  scale?: number;
  /** World position [x, y, z] */
  position?: [number, number, number];
  /** Base rotation in radians [x, y, z] — applied before cursor reactivity */
  baseRotation?: [number, number, number];
  /** Static bone pose applied on mount */
  pose?: PoseTargets;
  /** Strength of the idle breathing motion (0 = off, 1 = exaggerated) */
  breathIntensity?: number;
  /** Strength of cursor-reactive body rotation (0 = off, 1 = max) */
  mouseIntensity?: number;
  /**
   * Regex patterns for mesh / node names to hide on mount. Useful for
   * stripping "showcase nameplate" meshes baked into some Sketchfab
   * exports (e.g. HSR models ship with an `Avatar_Show_*` banner).
   */
  hideMeshes?: RegExp[];
  /**
   * Punch up color saturation / contrast on the model's materials.
   * 0 = no change, 1 = subtle, 2 = strong, 3 = anime-poster mode.
   */
  colorPunch?: number;
  /** Dump the bone tree + match results to the browser console */
  debug?: boolean;
}

/**
 * Loads a rigged glTF character, applies a static pose by mapping
 * role-based bone patterns to the model's actual bone names, then animates
 * it with subtle breathing, shoulder micro-sway, cursor-following, and an
 * entrance scale-up. Handles touch devices with an auto-rotate fallback.
 */
export function HeroCharacter({
  url,
  scale = 1,
  position = [0, -1, 0],
  baseRotation = [0, 0, 0],
  pose,
  breathIntensity = 1,
  mouseIntensity = 1,
  hideMeshes,
  colorPunch = 0,
  debug = false,
}: HeroCharacterProps) {
  const groupRef = useRef<Group>(null);
  const { scene, animations } = useGLTF(url, DRACO_DECODER_PATH);
  const { viewport, pointer } = useThree();
  const isTouch = useIsTouchDevice();

  // CRITICAL: SkeletonUtils.clone retargets bone references properly
  // for skinned meshes. Plain scene.clone(true) leaves the clone's
  // SkinnedMeshes still referencing the original skeleton, so rotating
  // the cloned bones does nothing visible. This was the "pose didn't
  // apply at all" bug.
  const cloned = useMemo(() => cloneSkeletalMesh(scene) as Object3D, [scene]);
  const { actions } = useAnimations(animations, cloned);

  // Cache bone refs + baseline rotations so breathing can modulate ON TOP
  // of the pose without re-traversing the tree every frame.
  const boneRefs = useRef<Partial<Record<keyof PoseTargets, Object3D>>>({});
  const baseRot = useRef<Partial<Record<keyof PoseTargets, { x: number; y: number; z: number }>>>(
    {},
  );

  // Smooth cursor tracking state
  const cursorRot = useRef({ x: 0, y: 0 });
  const cursorVel = useRef({ x: 0, y: 0 });

  // Entrance scale ramp
  const currentScale = useRef(0.82);

  // ── Apply pose + cache bones (runs once per scene clone) ────────────────
  useEffect(() => {
    // Stop any bundled clips so they don't overwrite our pose each frame
    if (actions) {
      for (const key of Object.keys(actions)) actions[key]?.stop();
    }

    // Developer aid
    if (debug) {
      const bones: string[] = [];
      cloned.traverse((c) => {
        if (c.type === "Bone" || (c as { isBone?: boolean }).isBone) {
          bones.push(c.name);
        }
      });
      // biome-ignore lint/suspicious/noConsole: intentional developer aid
      console.groupCollapsed("[HeroCharacter] Skeleton");
      // biome-ignore lint/suspicious/noConsole: intentional developer aid
      console.log(`${bones.length} bones:`, bones);
      if (pose) {
        const matched: Record<string, string> = {};
        for (const role of Object.keys(pose) as (keyof PoseTargets)[]) {
          const b = findBone(cloned, role);
          matched[role] = b ? b.name : "✗ NO MATCH";
        }
        // biome-ignore lint/suspicious/noConsole: intentional developer aid
        console.table(matched);
      }
      // biome-ignore lint/suspicious/noConsole: intentional developer aid
      console.groupEnd();
    }

    // Apply pose rotations
    if (pose) {
      for (const role of Object.keys(pose) as (keyof PoseTargets)[]) {
        const rot = pose[role];
        if (!rot) continue;
        const bone = findBone(cloned, role);
        if (!bone) continue;
        if (rot.x !== undefined) bone.rotation.x = rot.x;
        if (rot.y !== undefined) bone.rotation.y = rot.y;
        if (rot.z !== undefined) bone.rotation.z = rot.z;
      }
    }

    // Hide unwanted meshes (showcase nameplates, watermarks, etc.)
    if (hideMeshes && hideMeshes.length > 0) {
      cloned.traverse((child) => {
        for (const re of hideMeshes) {
          if (re.test(child.name)) {
            child.visible = false;
            if (debug) {
              // biome-ignore lint/suspicious/noConsole: intentional developer aid
              console.log(`[HeroCharacter] Hiding mesh: ${child.name}`);
            }
            return;
          }
        }
      });
    }

    // Punch up material colors. Anime / cel-shaded exports often have
    // flat diffuse maps that look muted under modern PBR tone mapping.
    // We slightly drop roughness for sharper highlights and raise the
    // map anisotropy for crisper texel-level detail. We intentionally
    // do NOT touch emissive — setting emissive makes the material
    // self-lit and causes it to blow out against dark backgrounds.
    if (colorPunch > 0) {
      cloned.traverse((child) => {
        const mesh = child as Mesh;
        if (!mesh.isMesh) return;
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        for (const m of materials) {
          const mat = m as MeshStandardMaterial;
          if (!mat || !("roughness" in mat)) continue;
          // Lower roughness → sharper highlights
          mat.roughness = Math.max(0.35, (mat.roughness ?? 0.8) - 0.15 * colorPunch);
          // Tiny metallic bump → richer speculars on hair/eyes/cloth
          mat.metalness = Math.min(0.2, (mat.metalness ?? 0) + 0.05 * colorPunch);
          // Tight anisotropy on textures → crisp edges at oblique angles
          if (mat.map) mat.map.anisotropy = 8;
          mat.needsUpdate = true;
        }
      });
    }

    // Cache refs for the roles we'll animate in useFrame
    for (const role of ["chest", "leftShoulder", "rightShoulder", "head"] as const) {
      const bone = findBone(cloned, role);
      if (bone) {
        boneRefs.current[role] = bone;
        baseRot.current[role] = {
          x: bone.rotation.x,
          y: bone.rotation.y,
          z: bone.rotation.z,
        };
      }
    }
  }, [cloned, pose, actions, hideMeshes, colorPunch, debug]);

  // ── Per-frame animation loop ────────────────────────────────────────────
  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const t = state.clock.elapsedTime;

    // ── IDLE BREATHING — chest rises/falls gently ─────────────────────
    // TUNE: change 1.3 for breath frequency, 0.025 for amplitude
    const chest = boneRefs.current.chest;
    const chestBase = baseRot.current.chest;
    if (chest && chestBase) {
      const breath = Math.sin(t * 1.3) * 0.025 * breathIntensity;
      chest.rotation.x = chestBase.x + breath;
    }

    // ── SHOULDER MICRO-MOTION — asymmetric sway keeps her "alive" ────
    // Different phase & frequency per side so it never feels mechanical
    const ls = boneRefs.current.leftShoulder;
    const lsBase = baseRot.current.leftShoulder;
    if (ls && lsBase) {
      ls.rotation.y = lsBase.y + Math.sin(t * 0.9 + 0.4) * 0.012 * breathIntensity;
    }
    const rs = boneRefs.current.rightShoulder;
    const rsBase = baseRot.current.rightShoulder;
    if (rs && rsBase) {
      rs.rotation.y = rsBase.y + Math.sin(t * 0.85 + 1.2) * 0.012 * breathIntensity;
    }

    // ── HEAD LIFE — slow drift toward a shifting look-point ──────────
    const head = boneRefs.current.head;
    const headBase = baseRot.current.head;
    if (head && headBase) {
      head.rotation.y = headBase.y + Math.sin(t * 0.45) * 0.04 * breathIntensity;
      head.rotation.x = headBase.x + Math.sin(t * 0.35 + 0.8) * 0.025 * breathIntensity;
    }

    // ── CURSOR TRACKING — spring-smoothed whole-body turn ────────────
    // TUNE: raise `springStrength` to snap faster, `damping` to settle faster
    // Clamp delta to prevent physics explosion after tab returns from background
    const clampedDelta = Math.min(delta, 0.1);
    if (!isTouch) {
      const targetY = baseRotation[1] + pointer.x * 0.25 * mouseIntensity;
      const targetX = baseRotation[0] + pointer.y * 0.12 * mouseIntensity;

      const springStrength = 40;
      const damping = 8;
      cursorVel.current.x +=
        (targetX - cursorRot.current.x) * springStrength * clampedDelta -
        cursorVel.current.x * damping * clampedDelta;
      cursorVel.current.y +=
        (targetY - cursorRot.current.y) * springStrength * clampedDelta -
        cursorVel.current.y * damping * clampedDelta;
      cursorRot.current.x += cursorVel.current.x * clampedDelta;
      cursorRot.current.y += cursorVel.current.y * clampedDelta;

      group.rotation.x = cursorRot.current.x;
      group.rotation.y = cursorRot.current.y;
    } else {
      // Touch: keep fixed pose, no auto-rotate
      group.rotation.x = baseRotation[0];
      group.rotation.y = baseRotation[1];
    }

    // ── IDLE FLOAT — gentle Y bob ────────────────────────────────────
    group.position.y = position[1] + Math.sin(t * 0.5) * 0.035;

    // ── ENTRANCE RAMP — scale from 0.82 → autoScale over ~1.2s ───────
    currentScale.current = lerp(currentScale.current, 1, 0.04);
    const final = autoScale * currentScale.current;
    group.scale.set(final, final, final);
  });

  // Viewport-relative scale keeps the character sized consistently
  // across screen sizes. TUNE: 0.28 is the world-units-per-viewport ratio
  const autoScale = Math.min(viewport.width, viewport.height) * 0.28 * scale;

  return (
    <group ref={groupRef} position={position} rotation={baseRotation}>
      <primitive object={cloned} />
    </group>
  );
}

// NOTE: We intentionally do NOT call useGLTF.preload at module level —
// that would start the ~1MB Draco download during initial page load and
// hurt LCP. Hero.tsx gates the mount behind setTimeout for this reason.
