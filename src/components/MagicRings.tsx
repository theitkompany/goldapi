"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import * as THREE from "three";
import "./MagicRings.css";

export type MagicRingsProps = {
  color?: string;
  colorTwo?: string;
  ringCount?: number;
  speed?: number;
  attenuation?: number;
  lineThickness?: number;
  baseRadius?: number;
  radiusStep?: number;
  scaleRate?: number;
  opacity?: number;
  blur?: number;
  noiseAmount?: number;
  rotation?: number;
  ringGap?: number;
  fadeIn?: number;
  fadeOut?: number;
  followMouse?: boolean;
  mouseInfluence?: number;
  hoverScale?: number;
  parallax?: number;
  clickBurst?: boolean;
  alphaMode?: "luminance" | "coverage";
};

const vertexShader = `void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const fragmentShader = `
precision highp float;
uniform float uTime,uAttenuation,uLineThickness,uBaseRadius,uRadiusStep,uScaleRate,uOpacity,uNoiseAmount,uRotation,uRingGap,uFadeIn,uFadeOut,uMouseInfluence,uHoverAmount,uHoverScale,uParallax,uBurst;
uniform vec2 uResolution,uMouse;
uniform vec3 uColor,uColorTwo;
uniform int uRingCount;
uniform float uCoverageAlpha;
const float HP=1.5707963; const float CYCLE=3.45;
float fade(float t){return t<uFadeIn?smoothstep(0.,uFadeIn,t):1.-smoothstep(uFadeOut,CYCLE-.2,t);}
float ring(vec2 p,float ri,float cut,float t0,float px){float t=mod(uTime+t0,CYCLE);float r=ri+t/CYCLE*uScaleRate;float d=abs(length(p)-r);float a=atan(abs(p.y),abs(p.x))/HP;float th=max(1.-a,.5)*px*uLineThickness;float h=(1.-smoothstep(th,th*1.5,d))+1.;d+=pow(cut*a,3.)*r;return h*exp(-uAttenuation*d)*fade(t);}
void main(){float px=1./min(uResolution.x,uResolution.y);vec2 p=(gl_FragCoord.xy-.5*uResolution.xy)*px;float cr=cos(uRotation),sr=sin(uRotation);p=mat2(cr,-sr,sr,cr)*p;p-=uMouse*uMouseInfluence;float sc=mix(1.,uHoverScale,uHoverAmount)+uBurst*.3;p/=sc;vec3 c=vec3(0.);float coverage=0.;float rcf=max(float(uRingCount)-1.,1.);for(int i=0;i<10;i++){if(i>=uRingCount)break;float fi=float(i);vec2 pr=p-fi*uParallax*uMouse;vec3 rc=mix(uColor,uColorTwo,fi/rcf);float ra=ring(pr,uBaseRadius+fi*uRadiusStep,pow(uRingGap,fi),i==0?0.:2.95*fi,px);c=mix(c,rc,vec3(ra));coverage=max(coverage,ra);}c*=1.+uBurst*2.;float n=fract(sin(dot(gl_FragCoord.xy+uTime*100.,vec2(12.9898,78.233)))*43758.5453);c+=(n-.5)*uNoiseAmount;float intensity=max(c.r,max(c.g,c.b));vec3 emissive=intensity>.0001?clamp(c/intensity,0.,1.):vec3(0.);vec3 outputColor=mix(emissive,clamp(c,0.,1.),uCoverageAlpha);float outputAlpha=mix(intensity,coverage,uCoverageAlpha);gl_FragColor=vec4(outputColor,clamp(outputAlpha*uOpacity,0.,1.));}
`;

export default function MagicRings({
  color = "#b7f34b",
  colorTwo = "#d9ff85",
  ringCount = 6,
  speed = 1,
  attenuation = 10,
  lineThickness = 2,
  baseRadius = 0.35,
  radiusStep = 0.1,
  scaleRate = 0.1,
  opacity = 1,
  blur = 0,
  noiseAmount = 0.1,
  rotation = 0,
  ringGap = 1.5,
  fadeIn = 0.7,
  fadeOut = 0.5,
  followMouse = false,
  mouseInfluence = 0.2,
  hoverScale = 1.2,
  parallax = 0.05,
  clickBurst = false,
  alphaMode = "luminance",
}: MagicRingsProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef({ color, colorTwo, ringCount, speed, attenuation, lineThickness, baseRadius, radiusStep, scaleRate, opacity, noiseAmount, rotation, ringGap, fadeIn, fadeOut, followMouse, mouseInfluence, hoverScale, parallax, clickBurst, alphaMode });
  propsRef.current = { color, colorTwo, ringCount, speed, attenuation, lineThickness, baseRadius, radiusStep, scaleRate, opacity, noiseAmount, rotation, ringGap, fadeIn, fadeOut, followMouse, mouseInfluence, hoverScale, parallax, clickBurst, alphaMode };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      return;
    }
    if (!renderer.capabilities.isWebGL2) { renderer.dispose(); return; }
    renderer.setClearColor(0, 0);
    mount.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 10);
    camera.position.z = 1;
    const uniforms = {
      uTime: { value: 0 }, uAttenuation: { value: 0 }, uResolution: { value: new THREE.Vector2() }, uColor: { value: new THREE.Color() }, uColorTwo: { value: new THREE.Color() }, uLineThickness: { value: 0 }, uBaseRadius: { value: 0 }, uRadiusStep: { value: 0 }, uScaleRate: { value: 0 }, uRingCount: { value: 0 }, uOpacity: { value: 1 }, uNoiseAmount: { value: 0 }, uRotation: { value: 0 }, uRingGap: { value: 1.6 }, uFadeIn: { value: 0.5 }, uFadeOut: { value: 0.75 }, uMouse: { value: new THREE.Vector2() }, uMouseInfluence: { value: 0 }, uHoverAmount: { value: 0 }, uHoverScale: { value: 1 }, uParallax: { value: 0 }, uBurst: { value: 0 }, uCoverageAlpha: { value: 0 },
    };
    const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms, transparent: true });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
    scene.add(quad);
    const resize = () => { const w = mount.clientWidth; const h = mount.clientHeight; const dpr = Math.min(window.devicePixelRatio, 2); renderer.setSize(w, h); renderer.setPixelRatio(dpr); uniforms.uResolution.value.set(w * dpr, h * dpr); };
    resize();
    window.addEventListener("resize", resize);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    const mouse = [0, 0], smoothMouse = [0, 0];
    let hovered = false, burst = 0, frameId = 0, elapsed = 0, lastTime = 0;
    const onMouseMove = (event: MouseEvent) => { const rect = mount.getBoundingClientRect(); mouse[0] = ((event.clientX - rect.left) / rect.width - 0.5) * 2; mouse[1] = -((event.clientY - rect.top) / rect.height - 0.5) * 2; };
    const onEnter = () => { hovered = true; };
    const onLeave = () => { hovered = false; mouse[0] = 0; mouse[1] = 0; };
    const animate = (time: number) => {
      frameId = requestAnimationFrame(animate);
      const p = propsRef.current;
      const dt = lastTime === 0 ? 0 : Math.min(time - lastTime, 100);
      lastTime = time; elapsed += dt * 0.001 * p.speed;
      smoothMouse[0] += (mouse[0] - smoothMouse[0]) * 0.08; smoothMouse[1] += (mouse[1] - smoothMouse[1]) * 0.08;
      uniforms.uTime.value = elapsed; uniforms.uAttenuation.value = p.attenuation; uniforms.uColor.value.set(p.color); uniforms.uColorTwo.value.set(p.colorTwo); uniforms.uLineThickness.value = p.lineThickness; uniforms.uBaseRadius.value = p.baseRadius; uniforms.uRadiusStep.value = p.radiusStep; uniforms.uScaleRate.value = p.scaleRate; uniforms.uRingCount.value = p.ringCount; uniforms.uOpacity.value = p.opacity; uniforms.uNoiseAmount.value = p.noiseAmount; uniforms.uRotation.value = p.rotation * Math.PI / 180; uniforms.uRingGap.value = p.ringGap; uniforms.uFadeIn.value = p.fadeIn; uniforms.uFadeOut.value = p.fadeOut; uniforms.uMouse.value.set(smoothMouse[0], smoothMouse[1]); uniforms.uMouseInfluence.value = p.followMouse ? p.mouseInfluence : 0; uniforms.uHoverAmount.value += ((hovered ? 1 : 0) - uniforms.uHoverAmount.value) * 0.08; uniforms.uHoverScale.value = p.hoverScale; uniforms.uParallax.value = p.parallax; burst *= 0.95; uniforms.uBurst.value = p.clickBurst ? burst : 0; uniforms.uCoverageAlpha.value = p.alphaMode === "coverage" ? 1 : 0;
      renderer.render(scene, camera);
    };
    mount.addEventListener("mousemove", onMouseMove); mount.addEventListener("mouseenter", onEnter); mount.addEventListener("mouseleave", onLeave); mount.addEventListener("click", () => { burst = 1; });
    frameId = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(frameId); resizeObserver.disconnect(); window.removeEventListener("resize", resize); mount.removeEventListener("mousemove", onMouseMove); mount.removeEventListener("mouseenter", onEnter); mount.removeEventListener("mouseleave", onLeave); mount.removeChild(renderer.domElement); renderer.dispose(); quad.geometry.dispose(); material.dispose(); };
  }, []);

  const style: CSSProperties | undefined = blur > 0 ? { filter: `blur(${blur}px)` } : undefined;
  return <div ref={mountRef} className="magic-rings-container" style={style} />;
}
