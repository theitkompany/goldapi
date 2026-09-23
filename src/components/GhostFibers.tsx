"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import "./GhostFibers.css";

type GhostFibersProps = {
  className?: string;
  color?: string;
  glowColor?: string;
  speed?: number;
  scale?: number;
  opacity?: number;
};

const vertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform float uSpeed;
uniform float uScale;
uniform float uOpacity;
uniform float uAspect;
uniform vec3 uColor;
uniform vec3 uGlowColor;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float fiber(vec2 p, float offset, float frequency) {
  float wave = sin(
    p.x * frequency +
    offset +
    sin(p.x * 2.2 + uTime * 0.35) * 0.7
  );

  float center =
    wave * 0.13 +
    sin(p.x * 1.4 + offset) * 0.06;

  return exp(-abs(p.y - center) * 34.0);
}

void main() {
  vec2 p = vUv * 2.0 - 1.0;

  // Correct for the canvas/container aspect ratio
  p.x *= uAspect;
  p.x *= uScale;

  float time = uTime * uSpeed;

  float field = 0.0;
  float glow = 0.0;

  for (int i = 0; i < 7; i++) {
    float fi = float(i);

    float layer = fiber(
      vec2(
        p.x,
        p.y + fi * 0.08 - 0.26
      ),
      time * (0.7 + fi * 0.08) + fi * 0.9,
      2.8 + fi * 0.55
    );

    field += layer * (0.55 - fi * 0.045);
    glow += layer * (0.3 - fi * 0.02);
  }

  float vignette = smoothstep(
    1.35,
    0.12,
    length(p)
  );

  float grain =
    (hash(gl_FragCoord.xy + time) - 0.5) * 0.025;

  vec3 color =
    uColor * field +
    uGlowColor * glow * 0.65 +
    grain;

  gl_FragColor = vec4(
    max(color, vec3(0.0)),
    clamp(
      (field + glow) * vignette * uOpacity,
      0.0,
      1.0
    )
  );
`;

export default function GhostFibers({
  className = "",
  color = "#315c35",
  glowColor = "#8fbe78",
  speed = 0.2,
  scale = 1.6,
  opacity = 0.22,
}: GhostFibersProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;

    if (!mount) return;

    let renderer: THREE.WebGLRenderer;

    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
      });
    } catch {
      return;
    }

    // Prevent high-DPI devices from creating an unnecessarily huge canvas
    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 1.5)
    );

    renderer.setClearColor(0, 0);

    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    const camera = new THREE.OrthographicCamera(
      -0.5,
      0.5,
      0.5,
      -0.5,
      0.1,
      10
    );

    camera.position.z = 1;

    const uniforms = {
      uTime: {
        value: 0,
      },

      uSpeed: {
        value: speed,
      },

      uScale: {
        value: scale,
      },

      uOpacity: {
        value: opacity,
      },

      uAspect: {
        value: 1,
      },

      uColor: {
        value: new THREE.Color(color),
      },

      uGlowColor: {
        value: new THREE.Color(glowColor),
      },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      depthWrite: false,
    });

    const geometry = new THREE.PlaneGeometry(1, 1);

    const mesh = new THREE.Mesh(
      geometry,
      material
    );

    scene.add(mesh);

    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;

      if (width === 0 || height === 0) return;

      renderer.setSize(
        width,
        height,
        false
      );

      // Tell the shader about the actual container aspect ratio
      uniforms.uAspect.value = width / height;
    };

    resize();

    const observer = new ResizeObserver(resize);

    observer.observe(mount);

    let frame = 0;
    let last = 0;

    const animate = (time: number) => {
      frame = requestAnimationFrame(animate);

      uniforms.uTime.value +=
        last
          ? (time - last) * 0.001
          : 0;

      last = time;

      renderer.render(
        scene,
        camera
      );
    };

    frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);

      observer.disconnect();

      geometry.dispose();
      material.dispose();
      renderer.dispose();

      if (
        mount.contains(
          renderer.domElement
        )
      ) {
        mount.removeChild(
          renderer.domElement
        );
      }
    };
  }, [
    color,
    glowColor,
    opacity,
    scale,
    speed,
  ]);

  return (
    <div
      ref={mountRef}
      className={`ghost-fibers-container ${className}`}
      aria-hidden="true"
    />
  );
}