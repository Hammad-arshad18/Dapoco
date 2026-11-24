import { Suspense, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { PerspectiveCamera, RoundedBox } from '@react-three/drei';
import gsap from 'gsap';
import { Model } from './Model';
import { StudioLight } from './Stage';
import { DyePiece } from './Configurator';
import { PIECE_MAP } from '../data/pieces';
import { appState, onReady } from './store';
import { Shadow } from './View3D';

const ease = (t) => 1 - Math.pow(1 - t, 3);
const fit = (aspect, base = 1.2, k = 0.85) => (aspect < base ? Math.pow(base / aspect, k) : 1);

/* ================================ HERO ================================
   A single photoreal lounge chair on the page itself. Headlines sit behind it. */
export function HeroScene({ progress }) {
  const cam = useRef();
  const chair = useRef();
  const intro = useRef(appState.reducedMotion ? 1 : 0);
  const t = useRef(0);
  // the chair materialises behind a rising scan line once the preloader has
  // lifted AND the model has loaded (whichever happens last)
  const cut = useRef({ value: -0.2, on: !appState.reducedMotion && !appState.ready, fade: 0 });
  const gate = useRef({ ready: appState.ready, loaded: false, started: appState.ready || appState.reducedMotion, tw: null });
  const tryScan = () => {
    const g = gate.current;
    if (g.started || !g.ready || !g.loaded) return;
    g.started = true;
    g.tw = gsap.fromTo(cut.current, { value: -0.1 }, { value: 1.3, duration: 2.2, ease: 'power2.inOut', delay: 0.1, onComplete: () => (cut.current.on = false) });
  };
  useEffect(() => {
    const off = onReady(() => {
      gate.current.ready = true;
      tryScan();
    });
    return () => {
      off();
      gate.current.tw?.kill();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const onLoaded = () => {
    gate.current.loaded = true;
    tryScan();
  };
  useFrame((state, dt) => {
    if (appState.ready) intro.current = Math.min(1, intro.current + dt * 0.45);
    t.current += dt;
    const i = ease(intro.current);
    const p = progress?.current ?? 0;
    const { width, height } = state.size;
    const f = fit(width / height, 1.1, 0.9);
    const c = cam.current;
    if (c) {
      c.position.set(appState.pointer.x * 0.12, 0.95 + appState.pointer.y * 0.06 + p * 0.5, (4.9 + p * 0.6) * f);
      c.lookAt(0, 0.56 + p * 0.25, 0);
    }
    const g = chair.current;
    if (g) {
      const idle = Math.sin(t.current * 0.22) * 0.18;
      const target = THREE.MathUtils.lerp(-2.4, -0.55, i) + idle + p * Math.PI * 1.1;
      g.rotation.y = THREE.MathUtils.damp(g.rotation.y, target, 4, dt);
      g.position.y = THREE.MathUtils.lerp(-0.25, 0, i) + p * 0.05;
      const s = THREE.MathUtils.lerp(0.86, 1, i);
      g.scale.setScalar(s);
    }
  });

  return (
    <>
      <PerspectiveCamera ref={cam} makeDefault fov={24} position={[0, 0.95, 4.9]} />
      <StudioLight intensity={1.05} warm />
      <group ref={chair}>
        <Suspense fallback={null}>
          <DyePiece piece={PIECE_MAP.mid_century_lounge_chair} cut={cut} role="in" onInfo={onLoaded} />
        </Suspense>
      </group>
      <Shadow position={[0, 0.001, 0]} opacity={0.55} scale={4} blur={2.4} far={1.6} resolution={512} color="#3a2c20" />
    </>
  );
}

/* ============================== SHOWROOM ==============================
   A full living-room vignette assembled from real models; the camera orbits
   as the visitor scrolls through the pinned section. */
function Rug() {
  return (
    <RoundedBox args={[4.6, 0.012, 3.2]} radius={0.005} smoothness={2} position={[0, 0.006, -0.1]} receiveShadow>
      <meshStandardMaterial color="#b9a78d" roughness={1} />
    </RoundedBox>
  );
}

export function ShowroomScene({ progress }) {
  const cam = useRef();
  const look = useMemo(() => new THREE.Vector3(-0.55, 0.45, -0.1), []);
  useFrame((state, dt) => {
    const p = progress?.current ?? 0;
    const aspect = state.size.width / state.size.height;
    const f = fit(aspect, 1.3, 0.7);
    look.x = aspect < 1 ? 0 : -0.55;
    const angle = THREE.MathUtils.lerp(-0.8, 0.85, p);
    const radius = THREE.MathUtils.lerp(7.6, 6.1, Math.sin(p * Math.PI) * 0.6 + p * 0.4) * f;
    const y = THREE.MathUtils.lerp(3.2, 1.9, p) * (aspect < 1 ? 1.35 : 1);
    const c = cam.current;
    if (!c) return;
    c.position.x = THREE.MathUtils.damp(c.position.x, Math.sin(angle) * radius, 5, dt);
    c.position.z = THREE.MathUtils.damp(c.position.z, Math.cos(angle) * radius, 5, dt);
    c.position.y = THREE.MathUtils.damp(c.position.y, y, 5, dt);
    c.lookAt(look);
  });
  return (
    <>
      <PerspectiveCamera ref={cam} makeDefault fov={30} position={[-4, 3, 6]} />
      <StudioLight intensity={0.85} warm />
      <pointLight position={[0, 1.45, 0.35]} intensity={1.4} distance={3.5} decay={2} color="#ffd6a0" />
      <Rug />
      <Suspense fallback={null}>
        <Model id="sofa_02" position={[0, 0.012, -0.75]} />
        <Model id="coffee_table_round_01" position={[0, 0.012, 0.35]} scale={0.72} />
        <Model id="brass_vase_02" position={[0.16, 0.365, 0.3]} scale={0.8} />
        <Model id="modern_arm_chair_01" position={[1.5, 0.012, 0.3]} rotation={[0, -1.15, 0]} />
        <Model id="Ottoman_01" position={[-1.45, 0.012, 0.5]} rotation={[0, 0.35, 0]} scale={0.9} />
        <Model id="side_table_tall_01" position={[1.3, 0.012, -0.8]} />
        <Model id="ceramic_vase_03" position={[1.3, 0.773, -0.8]} />
        <Model id="potted_plant_02" position={[-1.6, 0.012, -0.9]} />
        <Model id="modern_ceiling_lamp_01" position={[0, 1.5, 0.35]} />
        {/* the room never moves, only the camera: render its floor shadow once (inside Suspense = after the models load) */}
        <Shadow position={[0, 0.014, 0]} opacity={0.7} scale={8} blur={2.2} far={2.4} resolution={1024} frames={1} color="#000000" />
      </Suspense>
    </>
  );
}
