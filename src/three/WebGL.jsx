import { useEffect, useState } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { View } from '@react-three/drei';
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
export default function WebGL() {
  const [ok] = useState(webglAvailable);
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
      dpr={appState.isTouch ? [1, 1.5] : [1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.NeutralToneMapping;
        gl.toneMappingExposure = 1.0;
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.setClearColor(0x000000, 0);
      }}
    >
      <View.Port />
    </Canvas>
  );
}
