import { useEffect, useState } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { View, PerformanceMonitor } from '@react-three/drei';
import { appState, glLostBefore, markGlLost } from './store';

function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    const ctx = window.WebGL2RenderingContext && c.getContext('webgl2');
    // free the probe straight away — it must not sit next to the real context
    ctx?.getExtension('WEBGL_lose_context')?.loseContext();
    return !!ctx;
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
      // powerPreference stays at the browser default on purpose. Asking for 'high-performance' makes
      // laptops with a dedicated GPU switch graphics cards for this canvas; the switch drops the WebGL
      // context, and on those machines the models never rendered. These scenes don't need the big GPU.
      gl={{ antialias: true, alpha: true }}
      onCreated={(state) => {
        const { gl } = state;
        gl.toneMapping = THREE.NeutralToneMapping;
        gl.toneMappingExposure = 1.0;
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.setClearColor(0x000000, 0);
        // The context came back after being lost. First time in this tab: start fresh (phones have
        // released their texture images, see Model.jsx, and environment maps / static shadows are gone).
        // If it happens again we do NOT reload — on a machine that keeps dropping the context that was
        // an endless reload with no models; three.js restores in place instead (images are kept from
        // then on). If a form has text in it, wait for the next page change instead of reloading now.
        gl.domElement.addEventListener('webglcontextrestored', () => {
          if (glLostBefore()) return;
          markGlLost();
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
