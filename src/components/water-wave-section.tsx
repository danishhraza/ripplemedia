"use client";

import React, { useRef, useState } from "react";
import { Canvas, useFrame, useThree, extend } from "@react-three/fiber";
import { Text, shaderMaterial, OrthographicCamera, useFBO } from "@react-three/drei";
import * as THREE from "three";

// --- Custom Shader Material ---
const WaterRippleMaterial = shaderMaterial(
  {
    uTime: 0,
    uMouse: new THREE.Vector2(0, 0),
    uResolution: new THREE.Vector2(0, 0),
    uTexture: null,
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform float uTime;
    uniform vec2 uMouse;
    uniform vec2 uResolution;
    uniform sampler2D uTexture;
    varying vec2 vUv;

    void main() {
      vec2 uv = vUv;
      
      // --- Wavy Top Edge ---
      // Amplitude: 0.03, Frequency: 10.0, Speed: 0.8 (Slower)
      // Base height: 0.9 (so it's near the top)
      float waveHeight = 0.9 + 0.03 * sin(uv.x * 12.0 + uTime * 0.8);
      
      // Discard pixels above the wave to create the shape
      if (uv.y > waveHeight) discard;

      // --- Ripple Distortion ---
      vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
      vec2 mouseUV = uMouse * 0.5 + 0.5; 
      vec2 distVec = (uv - mouseUV) * aspect;
      float dist = length(distVec);

      // Wave parameters
      float wave = sin(dist * 40.0 - uTime * 5.0) * exp(-dist * 8.0);
      float ambient = sin(uv.x * 10.0 + uTime) * cos(uv.y * 10.0 + uTime) * 0.005;
      float strength = 0.03;
      
      vec2 distortedUV = uv + (distVec / (dist + 0.001)) * wave * strength + ambient;

      // --- Colors ---
      // Sample the FBO texture (the text/bubbles)
      vec4 texColor = texture2D(uTexture, distortedUV);
      
      // Water Body Color: Transparent Green (Less Yellow)
      // RGB: 0.1, 0.9, 0.2 (Vibrant Green)
      vec4 waterColor = vec4(0.816, 0.996, 0.090, 0.85);
      
      // Border Color: Opaque Green
      vec4 borderColor = vec4(0.1, 0.9, 0.2, 1.0);
      
      // Calculate Border Mask
      // Thinner edge: 0.005 instead of 0.02
      float borderMask = smoothstep(0.005, 0.0, waveHeight - uv.y);
      
      // Mix Water and Border
      vec4 finalColor = mix(waterColor, borderColor, borderMask);
      
      // Composite with Text/Bubbles
      // If text is present (alpha > 0), blend it in.
      // We want the text to look submerged, so we keep the water tint on top.
      vec3 mixedRGB = mix(finalColor.rgb, texColor.rgb, texColor.a * 0.9);
      float mixedAlpha = max(finalColor.a, texColor.a);
      
      // Ensure border stays opaque
      mixedAlpha = mix(mixedAlpha, 1.0, borderMask);

      gl_FragColor = vec4(mixedRGB, mixedAlpha);
    }
  `
);

extend({ WaterRippleMaterial });

// --- Scene Component ---
const SceneContent = () => {
  const { size, pointer, viewport } = useThree();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const materialRef = useRef<any>(null);
  const planeRef = useRef<THREE.Mesh>(null);
  const contentRef = useRef<THREE.Group>(null);
  const renderTarget = useFBO();
  const { gl, scene, camera } = useThree();

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uTime = state.clock.elapsedTime;
      materialRef.current.uMouse.lerp(pointer, 0.1);
      materialRef.current.uResolution.set(size.width, size.height);
    }

    // --- Pass 1: Render Content to FBO ---
    if (planeRef.current) planeRef.current.visible = false;
    if (contentRef.current) contentRef.current.visible = true;

    gl.setRenderTarget(renderTarget);
    gl.clear(); // Clear FBO to transparent
    gl.render(scene, camera);
    gl.setRenderTarget(null);

    // --- Pass 2: Render Water Plane to Screen ---
    if (planeRef.current) planeRef.current.visible = true;
    if (contentRef.current) contentRef.current.visible = false;

    if (materialRef.current) {
      materialRef.current.uTexture = renderTarget.texture;
    }
  });

  return (
    <>
      {/* Content Group (Text + Bubbles) - Rendered to FBO */}
      <group ref={contentRef}>
        <Text
          position={[0, 0, 0]}
          fontSize={viewport.width > 6 ? 1 : 0.35}
          color="black"
          anchorX="center"
          anchorY="middle"
          // Using Coolvetica font
          font="/fonts/Coolvetica Rg.otf"
        >
          Stories. In Motion.
        </Text>
        <Text
          position={[0, -0.6, 0]}
          fontSize={viewport.width > 6 ? 0.2 : 0.1}
          color="#a3a3a3"
          anchorX="center"
          anchorY="top"
          font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
          fontWeight="medium"
        >
          @ripplemedia.us
        </Text>

        {/* Bubbles */}
        {Array.from({ length: 6 }).map((_, i) => (
          <Bubble key={i} viewport={viewport} />
        ))}
      </group>

      {/* Post-Processing Plane - Rendered to Screen */}
      <mesh ref={planeRef} position={[0, 0, 1]}>
        <planeGeometry args={[viewport.width, viewport.height]} />
        {/* @ts-expect-error - waterRippleMaterial is not a standard element */}
        <waterRippleMaterial ref={materialRef} transparent />
      </mesh>
    </>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Bubble = ({ viewport }: { viewport: any }) => {
  const ref = useRef<THREE.Mesh>(null);
  const [speed] = useState(() => Math.random() * 2 + 1);
  const [x] = useState(() => (Math.random() - 0.5) * viewport.width);

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y += speed * 0.01;
      ref.current.position.x = x + Math.sin(state.clock.elapsedTime + x) * 0.2;
      if (ref.current.position.y > viewport.height / 2) {
        ref.current.position.y = -viewport.height / 2;
      }
    }
  });

  return (
    <mesh ref={ref} position={[x, -viewport.height / 2, 0]}>
      <circleGeometry args={[Math.random() * 0.05 + 0.02, 16]} />
      <meshBasicMaterial color="#4ade80" opacity={0.6} transparent />
    </mesh>
  );
};

export const WaterWaveSection: React.FC = () => {
  return (
    <section className="relative h-[50vh] w-full overflow-hidden bg-white">
      <Canvas dpr={[1, 2]} gl={{ alpha: true }}>
        <OrthographicCamera makeDefault position={[0, 0, 5]} zoom={100} />
        <SceneContent />
      </Canvas>
    </section>
  );
};