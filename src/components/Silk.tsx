"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import "./Silk.css";

type SilkProps = {
  speed?: number;
  scale?: number;
  color?: string;
  noiseIntensity?: number;
  rotation?: number;
  className?: string;
};

const vertexShader = `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
const fragmentShader = `
precision highp float;
varying vec2 vUv;
uniform float uTime,uSpeed,uScale,uRotation,uNoiseIntensity;
uniform vec3 uColor;
float noise(vec2 p){vec2 r=2.71828*sin(2.71828*p);return fract(r.x*r.y*(1.0+p.x));}
vec2 rotateUvs(vec2 uv,float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c)*uv;}
void main(){float rnd=noise(gl_FragCoord.xy);vec2 uv=rotateUvs(vUv*uScale,uRotation);float t=uSpeed*uTime;uv.y+=.03*sin(8.*uv.x-t);float pattern=.6+.4*sin(5.*(uv.x+uv.y+cos(3.*uv.x+5.*uv.y)+.02*t)+sin(20.*(uv.x+uv.y-.1*t)));float grain=rnd/15.*uNoiseIntensity;vec3 result=uColor*pattern-vec3(grain);gl_FragColor=vec4(clamp(result,0.,1.),1.);}
`;

export default function Silk({ speed = 5, scale = 1, color = "#243f2b", noiseIntensity = 1.5, rotation = 0, className = "" }: SilkProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" }); } catch { return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0, 0);
    mount.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-.5, .5, .5, -.5, .1, 10);
    camera.position.z = 1;
    const uniforms = { uTime: { value: 0 }, uSpeed: { value: speed }, uScale: { value: scale }, uRotation: { value: rotation }, uNoiseIntensity: { value: noiseIntensity }, uColor: { value: new THREE.Color(color) } };
    const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
    scene.add(mesh);
    const resize = () => { renderer.setSize(mount.clientWidth, mount.clientHeight, false); };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    let frame = 0;
    let last = 0;
    const animate = (time: number) => { frame = requestAnimationFrame(animate); uniforms.uTime.value += last ? (time - last) * .001 : 0; last = time; renderer.render(scene, camera); };
    frame = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); mesh.geometry.dispose(); material.dispose(); renderer.dispose(); if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement); };
  }, [color, noiseIntensity, rotation, scale, speed]);

  return <div ref={mountRef} className={`silk-container ${className}`} aria-hidden="true" />;
}
