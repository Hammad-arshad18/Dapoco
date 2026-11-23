import { useCallback, useRef, Suspense } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, ContactShadows, Environment } from '@react-three/drei';
import { Model } from './Model';

export const HDRI = '/hdri/studio_small_08.hdr';

/* Image-based studio lighting (real HDRI) + a soft key for crisp highlights */
export function StudioLight({ intensity = 1, warm = false }) {
  return (
    <>
      <Environment files={HDRI} environmentIntensity={intensity} environmentRotation={[0, Math.PI * 0.35, 0]} />
      <directionalLight position={[2.5, 4, 3]} intensity={warm ? 1.1 : 0.7} color={warm ? '#ffe2c4' : '#ffffff'} />
    </>
  );
}

/* ---------------- drag-to-rotate (DOM pointer events, with inertia) ---------------- */
export function useDragRotate(initial = 0) {
  const state = useRef({ rot: initial, vel: 0, dragging: false, lastX: 0, touched: false });
  const onPointerDown = useCallback((e) => {
    // let buttons/links inside the stage (prev/next arrows) receive their click:
    // capturing the pointer here would retarget the click to the stage itself
    if (e.target.closest?.('button, a, input, select, textarea, label')) return;
    const s = state.current;
    s.dragging = true;
    s.touched = true;
    s.lastX = e.clientX;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }, []);
  const onPointerMove = useCallback((e) => {
    const s = state.current;
    if (!s.dragging) return;
    const dx = e.clientX - s.lastX;
    s.lastX = e.clientX;
    s.vel = dx * 0.006;
    s.rot += s.vel;
  }, []);
  const end = useCallback(() => {
    state.current.dragging = false;
  }, []);
  return { state, bind: { onPointerDown, onPointerMove, onPointerUp: end, onPointerCancel: end, onPointerLeave: end } };
}

/* Frames the camera around whatever is inside `target` once it has loaded,
   from a given direction. Re-fits when the viewport size changes. */
export function FitCamera({ target, dir = [0.9, 0.55, 1.6], margin = 1.08, lift = 0 }) {
  const cam = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const st = useRef({ key: '', fitted: 0 });
  const tmp = useRef({ box: new THREE.Box3(), sphere: new THREE.Sphere(), d: new THREE.Vector3() });
  useFrame(() => {
    const t = target.current;
    if (!t) return;
    const key = `${size.width}x${size.height}`;
    if (st.current.key !== key) {
      st.current.key = key;
      st.current.fitted = 0;
    }
    if (st.current.fitted > 2) return;
    const rotY = t.rotation.y;
    t.rotation.y = 0;
    t.updateMatrixWorld(true);
    const { box, sphere, d } = tmp.current;
    box.setFromObject(t);
    t.rotation.y = rotY;
    t.updateMatrixWorld(true);
    if (box.isEmpty()) return;
    box.getBoundingSphere(sphere);
    const vfov = (cam.fov * Math.PI) / 180;
    const aspect = size.width / Math.max(1, size.height);
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * aspect);
    const dist = (sphere.radius / Math.sin(Math.min(vfov, hfov) / 2)) * margin;
    d.set(...dir).normalize();
    cam.position.copy(sphere.center).addScaledVector(d, dist);
    cam.near = dist / 50;
    cam.far = dist * 10;
    cam.updateProjectionMatrix();
    cam.lookAt(sphere.center.x, sphere.center.y + lift, sphere.center.z);
    st.current.fitted++;
  });
  return null;
}

/* Generic product stage: one or more models, auto-framed, gentle sway + drag. */
export function ProductStage({ items, drag, dir, margin, sway = 0.35, shadow = 0.5, intensity = 1 }) {
  const group = useRef();
  const t0 = useRef(Math.random() * 10);
  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    t0.current += dt;
    let target = Math.sin(t0.current * 0.25) * sway;
    if (drag) {
      const s = drag.state.current;
      if (!s.dragging) {
        s.vel *= 0.93;
        s.rot += s.vel;
      }
      target = s.touched ? s.rot : target + s.rot;
    }
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, target, 3.5, dt);
  });
  return (
    <>
      <PerspectiveCamera makeDefault fov={28} position={[3, 2, 5]} />
      <StudioLight intensity={intensity} />
      <group ref={group}>
        <Suspense fallback={null}>
          {items.map((it, i) => (
            <Model key={`${it.id}-${i}`} id={it.id} position={it.p || [0, 0, 0]} rotation={[0, it.r || 0, 0]} scale={it.s || 1} />
          ))}
        </Suspense>
      </group>
      <FitCamera target={group} dir={dir} margin={margin} />
      <ContactShadows position={[0, 0.001, 0]} opacity={shadow} scale={8} blur={2.6} far={2} resolution={512} color="#2a2119" />
    </>
  );
}

/* Model compositions (real-world metre scale) */
export const SCENES = {
  office: [{ id: 'modern_arm_chair_01', r: Math.PI - 0.35 }],
  home: [{ id: 'sofa_02' }],
  hospitality: [{ id: 'ArmChair_01', r: -0.3 }],
  outdoor: [{ id: 'outdoor_table_chair_set_01', r: 0.9 }],
  education: [
    { id: 'SchoolDesk_01' },
    { id: 'SchoolChair_01', p: [0.05, 0, 0.5], r: Math.PI + 0.25 },
  ],
  healthcare: [{ id: 'mid_century_lounge_chair', r: -0.4 }],
  storage: [
    { id: 'modern_wooden_cabinet' },
    { id: 'ceramic_vase_03', p: [-0.75, 0.68, 0] },
    { id: 'brass_vase_02', p: [0.85, 0.68, 0.02] },
  ],
  kids: [{ id: 'wooden_display_shelves_01', r: -Math.PI / 2 }],
  decor: [
    { id: 'ClassicConsole_01' },
    { id: 'marble_bust_01', p: [0, 0.949, -0.02] },
    { id: 'brass_vase_02', p: [0.48, 0.949, 0] },
    { id: 'ceramic_vase_03', p: [-0.48, 0.949, 0] },
  ],
  bespoke: [{ id: 'GreenChair_01', r: -0.35 }],
  lounge: [{ id: 'mid_century_lounge_chair', r: -0.5 }],
};
