"use client";

import React, { Suspense, Component, ReactNode, useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import FloatingPill from "./FloatingPill";
import DNAHelix from "./DNAHelix";
import ParticleField from "./ParticleField";

class WebGLErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any) {
    console.warn("WebGL rendering fallback engaged:", error);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export default function MedicalScene3D() {
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      {isVisible ? (
        <WebGLErrorBoundary
          fallback={
            <div className="absolute inset-0 bg-gradient-radial-accent opacity-50" />
          }
        >
          <Canvas
            camera={{ position: [0, 0, 8], fov: 50 }}
            dpr={1}
            gl={{
              antialias: false,
              alpha: true,
              powerPreference: "low-power",
              preserveDrawingBuffer: false,
            }}
            style={{ background: "transparent", pointerEvents: "none" }}
          >
            <Suspense fallback={null}>
              {/* Lighting Setup */}
              <ambientLight intensity={0.4} color="#94a3b8" />
              <directionalLight
                position={[5, 5, 5]}
                intensity={0.6}
                color="#ffffff"
              />
              <pointLight
                position={[-3, 2, 4]}
                intensity={0.7}
                color="#06d6a0"
                distance={15}
              />
              <pointLight
                position={[3, -2, 3]}
                intensity={0.5}
                color="#0ea5e9"
                distance={12}
              />

              {/* Floating Medicine Capsules */}
              <Float speed={1.2} rotationIntensity={0.4} floatIntensity={0.6}>
                <FloatingPill
                  position={[-3.5, 1.5, -1]}
                  color1="#06d6a0"
                  color2="#f0f4ff"
                  scale={0.9}
                  speed={0.8}
                  rotationAxis="y"
                />
              </Float>

              <Float speed={1} rotationIntensity={0.3} floatIntensity={0.8}>
                <FloatingPill
                  position={[3.8, -0.5, -2]}
                  color1="#0ea5e9"
                  color2="#f0f4ff"
                  scale={0.7}
                  speed={0.6}
                  rotationAxis="x"
                />
              </Float>

              <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
                <FloatingPill
                  position={[-2, -1.8, 0]}
                  color1="#a855f7"
                  color2="#f0f4ff"
                  scale={0.5}
                  speed={1}
                  rotationAxis="z"
                />
              </Float>

              {/* DNA Helix */}
              <DNAHelix
                position={[4.5, 0.5, -3]}
                scale={0.55}
                speed={0.4}
                color1="#06d6a0"
                color2="#0ea5e9"
              />

              <DNAHelix
                position={[-4.5, -1, -4]}
                scale={0.35}
                speed={0.3}
                color1="#a855f7"
                color2="#06d6a0"
              />

              {/* Ultra-Fast Particle Field */}
              <ParticleField count={80} spread={12} color="#06d6a0" speed={0.15} size={0.03} />
            </Suspense>
          </Canvas>
        </WebGLErrorBoundary>
      ) : (
        <div className="absolute inset-0 bg-gradient-radial-accent opacity-30" />
      )}
    </div>
  );
}
