"use client";

import { MeshDistortMaterial } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import type { Mesh } from "three";
import { useIsTouchDevice } from "@/lib/hooks/useIsTouchDevice";
import { lerp } from "@/lib/utils";

/**
 * The hero's abstract 3D subject: a distorted icosahedron that reacts to
 * cursor position. On touch devices it auto-rotates.
 */
export function HeroGeometry() {
  const meshRef = useRef<Mesh>(null);
  const { viewport, pointer } = useThree();
  const isTouch = useIsTouchDevice();
  const targetRot = useRef({ x: 0, y: 0 });

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    if (isTouch) {
      // Auto-rotate fallback for touch devices
      mesh.rotation.y += delta * 0.25;
      mesh.rotation.x += delta * 0.1;
    } else {
      // Cursor-reactive rotation with smoothing
      targetRot.current.x = pointer.y * 0.3;
      targetRot.current.y = pointer.x * 0.3;
      mesh.rotation.x = lerp(mesh.rotation.x, targetRot.current.x, 0.05);
      mesh.rotation.y = lerp(mesh.rotation.y, targetRot.current.y, 0.05);
    }

    // Gentle floating motion
    mesh.position.y = Math.sin(performance.now() * 0.0005) * 0.08;
  });

  // Scale relative to viewport so it feels consistent at any size
  const scale = Math.min(viewport.width, viewport.height) * 0.3;

  return (
    <mesh ref={meshRef} scale={scale}>
      <icosahedronGeometry args={[1, 4]} />
      <MeshDistortMaterial
        color="#6366f1"
        roughness={0.2}
        metalness={0.7}
        distort={0.45}
        speed={1.5}
        emissive="#1e1b4b"
        emissiveIntensity={0.6}
      />
    </mesh>
  );
}
