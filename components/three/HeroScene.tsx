"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import { ACESFilmicToneMapping, SRGBColorSpace } from "three";
import { HeroCharacter, POSE_TUNED } from "@/components/three/HeroCharacter";
import { HeroGeometry } from "@/components/three/HeroGeometry";
import { HeroPoseTuner, HeroPoseTunerPanel } from "@/components/three/HeroPoseTuner";

/**
 * Hero 3D stage.
 *
 * ╔═════════════════════════════════════════════════════════════════════╗
 * ║  🔒 POSE LOCKED — 2026-05-08                                           ║
 * ║  Pose/position/scale values below are FINAL.                          ║
 * ╚═════════════════════════════════════════════════════════════════════╝
 *
 * Performance notes (measured via Lighthouse diagnose):
 *   • `@react-three/drei` imports add ~270ms long task when loaded
 *     during hydration. Only import Drei helpers that are strictly
 *     required. Float/useProgress were removed for this reason.
 *   • HeroCharacter already has breathing + cursor follow + Y bob
 *     built into its own useFrame loop, so <Float> is redundant.
 *   • Ready signal is dispatched via a custom useFrame-based probe
 *     instead of Drei's useProgress — saves the progress tracker
 *     chunk from the initial parse.
 *
 * Compatibility notes:
 *   • Model uses meshopt compression only (no Draco/WASM) for maximum
 *     device support. Falls back to animated icosahedron if loading fails.
 */

const USE_CHARACTER = true;
const MODEL_URL = "/models/madam_herta.glb";
const DEBUG_SKELETON = false;

function useTuneMode(): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const q = new URLSearchParams(window.location.search).get("tune");
    setOn(q === "1" || q === "true");
  }, []);
  return on;
}

export interface HeroSceneProps {
  /**
   * Fires ONCE after the first successful render of the scene.
   * Used by Hero.tsx to coordinate text/3D reveal timing. Implemented
   * via a one-shot useFrame callback inside the Canvas so we don't
   * pull in Drei's heavier useProgress implementation.
   */
  onReady?: () => void;
}

/** Fires onReady on the first rendered frame after Suspense resolves. */
function FirstFrameSignal({ onReady }: { onReady?: () => void }) {
  const { gl } = useThree();
  useEffect(() => {
    if (!onReady) return;
    const id = requestAnimationFrame(() => {
      void gl;
      onReady();
    });
    return () => cancelAnimationFrame(id);
  }, [gl, onReady]);
  return null;
}

/**
 * Wraps HeroCharacter with a timeout-based fallback to HeroGeometry.
 * If the GLB fails to load (network error, decode error, OOM, etc.),
 * we silently swap to the animated icosahedron instead of showing nothing.
 */
function CharacterWithFallback({ url, posX, posY }: { url: string; posX: number; posY: number }) {
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    // If model hasn't loaded in 8s, fall back to geometry.
    // This handles cases where the download stalls or device is very slow.
    const timer = window.setTimeout(() => setUseFallback(true), 8000);
    return () => window.clearTimeout(timer);
  }, []);

  if (useFallback) {
    console.warn("[HeroScene] Model load timed out — falling back to HeroGeometry");
    return <HeroGeometry />;
  }

  return (
    <ErrorCatcher onFallback={() => setUseFallback(true)}>
      <HeroCharacter
        url={url}
        scale={2.05}
        position={[posX, posY, -1.3]}
        baseRotation={[0, -0.48, 0.03]}
        pose={POSE_TUNED}
        breathIntensity={1}
        mouseIntensity={0.45}
        hideMeshes={[/Avatar_Show/i, /showcase/i, /nameplate/i]}
        colorPunch={1}
        debug={DEBUG_SKELETON}
      />
    </ErrorCatcher>
  );
}

/**
 * Minimal error boundary that catches GLTFLoader errors (network failures,
 * decode errors, OOM) inside the Canvas R3F tree and falls back gracefully.
 */
import { Component, type ErrorInfo, type ReactNode } from "react";

interface ECProps {
  children: ReactNode;
  onFallback: () => void;
}
interface ECState {
  error: Error | null;
}

class ErrorCatcher extends Component<ECProps, ECState> {
  state: ECState = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[HeroScene] Character failed to load:", error.message, info.componentStack);
    this.props.onFallback();
  }

  render() {
    if (this.state.error) return null;
    return this.props.children;
  }
}

export function HeroScene({ onReady }: HeroSceneProps = {}) {
  const tune = useTuneMode();

  // Responsive position: center + higher on mobile, offset right on desktop
  const [posX, setPosX] = useState(
    typeof window !== "undefined" && window.innerWidth < 640 ? 0 : 1.7,
  );
  const [posY, setPosY] = useState(
    typeof window !== "undefined" && window.innerWidth < 640 ? -0.1 : -1.95,
  );

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 640;
      setPosX(isMobile ? 0 : 1.7);
      setPosY(isMobile ? -0.1 : -1.95);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {tune ? <HeroPoseTunerPanel /> : null}

      <Canvas
        camera={{ position: [0, 0.2, 5.5], fov: 38 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          toneMapping: ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
          outputColorSpace: SRGBColorSpace,
        }}
      >
        <Suspense fallback={null}>
          <FirstFrameSignal onReady={onReady} />

          <ambientLight intensity={0.55} />
          <directionalLight position={[4, 5, 4]} intensity={1.5} color="#a5b4fc" />
          <directionalLight position={[-5, 1, -4]} intensity={1.0} color="#22d3ee" />
          <pointLight position={[0, 1, 3]} intensity={0.6} color="#ffffff" />

          {tune ? (
            USE_CHARACTER ? (
              <HeroPoseTuner
                url={MODEL_URL}
                hideMeshes={[/Avatar_Show/i, /showcase/i, /nameplate/i]}
                colorPunch={1}
              />
            ) : (
              <HeroGeometry />
            )
          ) : USE_CHARACTER ? (
            <CharacterWithFallback url={MODEL_URL} posX={posX} posY={posY} />
          ) : (
            <HeroGeometry />
          )}
        </Suspense>
      </Canvas>
    </>
  );
}

export default HeroScene;
