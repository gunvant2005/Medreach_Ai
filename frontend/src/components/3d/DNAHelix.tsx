"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface DNAHelixProps {
  position?: [number, number, number];
  scale?: number;
  speed?: number;
  color1?: string;
  color2?: string;
}

export default function DNAHelix({
  position = [0, 0, 0],
  scale = 1,
  speed = 0.3,
  color1 = "#06d6a0",
  color2 = "#0ea5e9",
}: DNAHelixProps) {
  const groupRef = useRef<THREE.Group>(null);

  const helixData = useMemo(() => {
    const points: Array<{
      pos1: [number, number, number];
      pos2: [number, number, number];
      barPos: [number, number, number];
      barLength: number;
      color: string;
    }> = [];

    const numPoints = 40;
    const radius = 0.6;
    const height = 4;

    for (let i = 0; i < numPoints; i++) {
      const t = i / numPoints;
      const angle = t * Math.PI * 4;
      const y = (t - 0.5) * height;

      const x1 = Math.cos(angle) * radius;
      const z1 = Math.sin(angle) * radius;
      const x2 = Math.cos(angle + Math.PI) * radius;
      const z2 = Math.sin(angle + Math.PI) * radius;

      if (i % 4 === 0) {
        points.push({
          pos1: [x1, y, z1],
          pos2: [x2, y, z2],
          barPos: [(x1 + x2) / 2, y, (z1 + z2) / 2],
          barLength: Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2),
          color: i % 8 === 0 ? color1 : color2,
        });
      }
    }

    return points;
  }, [color1, color2]);

  // Backbone spheres
  const backboneData = useMemo(() => {
    const spheres: Array<{ pos: [number, number, number]; strand: number }> = [];
    const numPoints = 60;
    const radius = 0.6;
    const height = 4;

    for (let i = 0; i < numPoints; i++) {
      const t = i / numPoints;
      const angle = t * Math.PI * 4;
      const y = (t - 0.5) * height;

      spheres.push({
        pos: [Math.cos(angle) * radius, y, Math.sin(angle) * radius],
        strand: 0,
      });
      spheres.push({
        pos: [
          Math.cos(angle + Math.PI) * radius,
          y,
          Math.sin(angle + Math.PI) * radius,
        ],
        strand: 1,
      });
    }
    return spheres;
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += 0.003 * speed;
    groupRef.current.position.y =
      position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Backbone spheres */}
      {backboneData.map((sphere, i) => (
        <mesh key={`bb-${i}`} position={sphere.pos}>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshStandardMaterial
            color={sphere.strand === 0 ? color1 : color2}
            emissive={sphere.strand === 0 ? color1 : color2}
            emissiveIntensity={0.4}
            roughness={0.3}
          />
        </mesh>
      ))}

      {/* Base pair rungs */}
      {helixData.map((pair, i) => (
        <group key={`bp-${i}`}>
          {/* Connection bar */}
          <mesh position={pair.barPos}>
            <cylinderGeometry args={[0.02, 0.02, pair.barLength, 8]} />
            <meshStandardMaterial
              color={pair.color}
              emissive={pair.color}
              emissiveIntensity={0.3}
              transparent
              opacity={0.6}
            />
          </mesh>

          {/* End spheres on each base */}
          <mesh position={pair.pos1}>
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshStandardMaterial
              color={color1}
              emissive={color1}
              emissiveIntensity={0.5}
            />
          </mesh>
          <mesh position={pair.pos2}>
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshStandardMaterial
              color={color2}
              emissive={color2}
              emissiveIntensity={0.5}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
