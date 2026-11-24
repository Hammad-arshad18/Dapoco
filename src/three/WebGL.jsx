import { useEffect, useState } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { View, PerformanceMonitor } from '@react-three/drei';
import { appState } from './store';

function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGL2RenderingContext && c.getContext('webgl2'));
  } catch {
    return false;
  }
}

/* One fixed, full-screen, transparent canvas that sits ABOVE the page.
   Every 3D scene is a drei <View> rendered inside the rectangle of its DOM
   element — so furniture can sit in front of headlines and cast shadows
   onto the page itself. Pointer events pass straight through. */
// pixel-ratio range: phones start at 1.5 (a full-screen canvas at 3x is far too much fill for a phone GPU)
const DPR_MAX = typeof window === 'undefined' ? 1 : Math.min(window.devicePixelRatio || 1, appState.isTouch ? 1.5 : 2);
const DPR_MIN = 1;
const step = (v) => Math.round(v * 4) / 4; // quarter steps → few canvas reallocations

export default function WebGL() {
  const [ok] = useState(webglAvailable);
  const [dpr, setDpr] = useState(DPR_MAX);
  const [root, setRoot] = useState(null);
  useEffect(() => {
    setRoot(document.getElementById('root'));
    document.documentElement.classList.toggle('no-webgl', !ok);
  }, [ok]);
  if (!ok || !root) return null;
  return (
    <Canvas
      className="webgl"
      eventSource={root}
      eventPrefix="client"
      frameloop="never"
      shadows={false}
      dpr={dpr}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={(state) => {
        const { gl } = state;
        gl.toneMapping = THREE.NeutralToneMapping;
        gl.toneMappingExposure = 1.0;
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.setClearColor(0x000000, 0);
        // textures release their decoded images after upload (see Model.jsx), so a restored context
        // can't re-upload them — start fresh instead (rare: phones drop WebGL under memory pressure).
        // If a form has text in it (e.g. a half-written message), wait for the next page change instead.
        gl.domElement.addEventListener('webglcontextrestored', () => {
          const typing = [...document.querySelectorAll('input, textarea')].some((f) => f.value && f.type !== 'hidden');
          if (typing) appState.needsReload = true;
          else window.location.reload();
        });
        if (import.meta.env.DEV) window.__r3f = state; // dev-only handle for perf checks (renderer.info)
      }}
    >
      {/* adaptive resolution: drops the pixel ratio when frames run slow, raises it back when there is headroom */}
      <PerformanceMonitor
        factor={1}
        flipflops={6}
        onChange={({ factor }) => setDpr(step(DPR_MIN + (DPR_MAX - DPR_MIN) * factor))}
        // keeps see-sawing (e.g. hitches while models stream in) → settle in the middle and stop measuring
        onFallback={() => setDpr(step((DPR_MIN + DPR_MAX) / 2))}
      />
      <View.Port />
    </Canvas>
  );
}
