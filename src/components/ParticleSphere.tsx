"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type ParticleSphereProps = {
  className?: string;
};

export default function ParticleSphere({ className = "" }: ParticleSphereProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.z = 3.15;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
    } catch {
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const isMobile = window.matchMedia("(max-width: 640px)").matches;
    const particleCount = isMobile ? 700 : 1500;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const color = new THREE.Color();
    const radius = 1.05;

    for (let index = 0; index < particleCount; index += 1) {
      const y = 1 - (index / (particleCount - 1)) * 2;
      const ringRadius = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = Math.PI * (3 - Math.sqrt(5)) * index;
      const depthJitter = (Math.random() - 0.5) * 0.055;
      const particleRadius = radius + depthJitter;
      const offset = index * 3;

      positions[offset] = Math.cos(theta) * ringRadius * particleRadius;
      positions[offset + 1] = y * particleRadius;
      positions[offset + 2] = Math.sin(theta) * ringRadius * particleRadius;

      const depthLight = 0.48 + Math.max(0, positions[offset + 2] / radius) * 0.38;
      const variation = 0.86 + Math.random() * 0.14;
      color.setRGB(depthLight * variation, depthLight * variation, depthLight * variation * 1.04);
      colors[offset] = color.r;
      colors[offset + 1] = color.g;
      colors[offset + 2] = color.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: isMobile ? 0.026 : 0.021,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.78,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);

    let frameId = 0;
    let lastTime = 0;
    const animate = (time: number) => {
      frameId = requestAnimationFrame(animate);
      const delta = lastTime === 0 ? 0 : Math.min(time - lastTime, 100);
      lastTime = time;

      if (!reducedMotion.matches) {
        points.rotation.y += delta * 0.00012;
        points.rotation.x = Math.sin(time * 0.00015) * 0.035;
      }
      renderer.render(scene, camera);
    };
    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className={`h-full w-full ${className}`} aria-hidden="true" />;
}
