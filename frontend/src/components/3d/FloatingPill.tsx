"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface FloatingPillProps {
  position?: [number, number, number];
  color1?: string;
  color2?: string;
  scale?: number;
  speed?: number;
  rotationAxis?: "x" | "y" | "z";
}

export default function FloatingPill({
  position = [0, 0, 0],
  color1 = "#06d6a0",
  color2 = "#ffffff",
  scale = 1,
  speed = 1,
  rotationAxis = "y",
}: FloatingPillProps) {
  const groupRef = useRef<THREE.Group>(null);
  const initialY = position[1];

  const capsuleMaterial1 = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: color1,
        roughness: 0.2,
        metalness: 0.3,
        emissive: color1,
        emissiveIntensity: 0.15,
      }),
    [color1]
  );

  const capsuleMaterial2 = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: color2,
        roughness: 0.3,
        metalness: 0.1,
        emissive: color2,
        emissiveIntensity: 0.05,
      }),
    [color2]
  );

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime * speed;

    // Float up and down
    groupRef.current.position.y = initialY + Math.sin(t * 0.8) * 0.3;

    // Gentle rotation
    if (rotationAxis === "x") groupRef.current.rotation.x += 0.003 * speed;
    if (rotationAxis === "y") groupRef.current.rotation.y += 0.005 * speed;
    if (rotationAxis === "z") groupRef.current.rotation.z += 0.004 * speed;
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Top half of capsule */}
      <mesh position={[0, 0.35, 0]} material={capsuleMaterial1}>
        <sphereGeometry args={[0.25, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <mesh position={[0, 0.1, 0]} material={capsuleMaterial1}>
        <cylinderGeometry args={[0.25, 0.25, 0.5, 32]} />
      </mesh>

      {/* Bottom half of capsule */}
      <mesh position={[0, -0.1, 0]} material={capsuleMaterial2}>
        <cylinderGeometry args={[0.25, 0.25, 0.5, 32]} />
      </mesh>
      <mesh
        position={[0, -0.35, 0]}
        rotation={[Math.PI, 0, 0]}
        material={capsuleMaterial2}
      >
        <sphereGeometry args={[0.25, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>

      {/* Capsule band line */}
      <mesh position={[0, 0, 0]}>
        <torusGeometry args={[0.251, 0.008, 8, 32]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.3}
          transparent
          opacity={0.4}
        />
      </mesh>
    </group>
  );
}
