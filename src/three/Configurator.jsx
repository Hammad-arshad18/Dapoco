import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import gsap from 'gsap';
import { useModel, prepareOnGpu } from './Model';
import { StudioLight } from './Stage';
import { makeDyeMaterial, setFinish } from './dye';
import { PALETTES, finishOf } from '../data/pieces';
import { appState } from './store';
import { Shadow } from './View3D';

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/* ----------------------------------------------------------------------------
   One configurable piece: cloned model, every material patched with the dye /
   scan shader. `cut` is shared with the stage to run the materialise swap.
   -------------------------------------------------------------------------- */
export function DyePiece({ piece, finishes, cut, role = 'idle', onInfo, sweepSpeed = 1.15 }) {
  const { scene } = useModel(piece.id);
  const data = useMemo(() => {
    const root = scene.clone(true);
    const zoneOf = {};
    piece.zones.forEach((zn) => zn.mats.forEach((name) => (zoneOf[name] = zn)));
    const mats = [];
    root.traverse((o) => {
      if (!o.isMesh) return;
      o.castShadow = true;
      o.receiveShadow = true;
      const zn = zoneOf[o.material.name];
      const m = makeDyeMaterial(o.material, { ref: zn?.ref ?? 0.1, detail: zn ? PALETTES[zn.type].detail : 0.6 });
      m.envMapIntensity = 1;
      o.material = m;
      mats.push({ u: m.userData.dye, zone: zn?.key });
    });
    root.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(root);
    const c = box.getCenter(new THREE.Vector3());
    root.position.set(-c.x, -box.min.y, -c.z);
    const group = new THREE.Group();
    group.add(root);
    const size = box.getSize(new THREE.Vector3());
    const radius = Math.hypot(size.x, size.y, size.z) / 2;
    const flat = Math.hypot(size.x, size.z) / 2;
    return { group, mats, size, radius, flat, height: size.y };
  }, [scene, piece]);

  // initial finishes applied instantly; later changes sweep across the piece
  const first = useRef(true);
  const sweeps = useRef({});
  useLayoutEffect(() => {
    piece.zones.forEach((zn) => {
      const f = finishOf(zn, finishes?.[zn.key]);
      const prev = sweeps.current[zn.key];
      if (!first.current && prev?.key === f.key) return;
      const lo = -data.flat - 0.15;
      data.mats.forEach(({ u, zone }) => {
        if (zone !== zn.key) return;
        setFinish(u, f, first.current || appState.reducedMotion);
        if (!first.current && !appState.reducedMotion) u.uSweep.value = lo;
      });
      sweeps.current[zn.key] = { key: f.key, t: first.current || appState.reducedMotion ? 1 : 0 };
    });
    first.current = false;
  }, [finishes, piece, data]);

  // an incoming piece stays hidden until its shaders + textures are on the GPU (see prepareOnGpu),
  // so the frame it first appears in is an ordinary one; only then does the scan start (onInfo)
  const gl = useThree((s) => s.gl);
  const camera = useThree((s) => s.camera);
  const viewScene = useThree((s) => s.scene);
  const ready = useRef(role !== 'in');
  useLayoutEffect(() => {
    if (role !== 'in') {
      onInfo?.(piece.id, data);
      return undefined;
    }
    let alive = true;
    ready.current = false;
    data.group.visible = false;
    prepareOnGpu(gl, data.group, camera, viewScene).then(() => {
      if (!alive) return;
      ready.current = true;
      onInfo?.(piece.id, data);
    });
    return () => {
      alive = false;
    };
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  // the dye materials are per-instance clones — free them with the instance (textures belong to the
  // shared model and are released by useModel once nobody shows it)
  useEffect(() => () => data.group.traverse((o) => o.isMesh && o.material.dispose()), [data]);

  useFrame((_, dt) => {
    const lo = -data.flat - 0.15;
    const hi = data.flat + data.height * 0.4 + 0.2;
    for (const key in sweeps.current) {
      const s = sweeps.current[key];
      if (s.t >= 1) continue;
      s.t = Math.min(1, s.t + dt / sweepSpeed);
      const e = easeInOut(s.t);
      data.mats.forEach(({ u, zone }) => {
        if (zone !== key) return;
        u.uSweep.value = s.t >= 1 ? 1e4 : THREE.MathUtils.lerp(lo, hi, e);
        u.uGlow.value = s.t >= 1 ? 0 : Math.sin(Math.PI * s.t);
      });
    }
    const on = role !== 'idle' && cut?.current.on ? 1 : 0;
    const v = cut?.current.value ?? 0;
    // once the scan has finished, the outgoing piece must stay gone — React only
    // unmounts it on the next commit, and without the cut it would flash back fully
    data.group.visible = ready.current && (role !== 'out' || on === 1);
    for (const { u } of data.mats) {
      u.uCutOn.value = on;
      u.uCut.value = v;
      u.uCutDir.value = role === 'in' ? 1 : -1;
    }
  });

  return <primitive object={data.group} />;
}

/* Thin glowing ring that travels with the scan line */
function ScanRing({ cut, radius }) {
  const mesh = useRef();
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        uniforms: { uColor: { value: new THREE.Color('#c0612c') }, uO: { value: 0 } },
        vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader: `uniform vec3 uColor; uniform float uO; varying vec2 vUv;
          void main(){ float d = length(vUv - 0.5) * 2.0;
            float ring = smoothstep(0.955, 0.985, d) * (1.0 - smoothstep(0.99, 1.0, d));
            float fill = (1.0 - smoothstep(0.0, 1.0, d)) * 0.10;
            float a = (ring + fill) * uO; if (a < 0.003) discard; gl_FragColor = vec4(uColor, a); }`,
      }),
    [],
  );
  useFrame(() => {
    const c = cut.current;
    if (!mesh.current) return;
    mesh.current.visible = c.on;
    mesh.current.position.y = c.value;
    mat.uniforms.uO.value = c.on ? Math.min(1, c.fade) : 0;
    mesh.current.scale.setScalar(Math.max(0.3, radius.current) * 1.12);
  });
  return (
    <mesh ref={mesh} rotation-x={-Math.PI / 2} material={mat} renderOrder={10}>
      <circleGeometry args={[1, 96]} />
    </mesh>
  );
}

/* ----------------------------------------------------------------------------
   The configurator stage: swaps pieces with a materialise scan, frames the
   camera smoothly around whatever piece is showing, drag to rotate.
   -------------------------------------------------------------------------- */
export function ConfiguratorScene({ piece, finishes, drag, dir = [0.42, 0.36, 1], margin = 1.12, autoSpin = 0.12 }) {
  const [slots, setSlots] = useState([{ piece, role: 'idle', k: 0 }]);
  const cut = useRef({ value: 0, on: false, fade: 0 });
  const info = useRef({});
  const ringR = useRef(1);
  const tween = useRef(null);
  const counter = useRef(0);
  const target = useRef(piece.id);
  const finishMap = useRef({});
  finishMap.current[piece.id] = finishes;

  // piece change → mount the incoming piece hidden; the scan starts once it has loaded and is on the GPU
  const scanning = useRef(false);
  useEffect(() => {
    target.current = piece.id;
    setSlots((s) => {
      const out = s.find((x) => x.role === 'out');
      const inc = s.find((x) => x.role === 'in');
      const c = cut.current;
      // clicked again before the previous choice had even appeared: keep the piece that is still on
      // screen and just swap what we are waiting for (or go back to it)
      if (out && inc && !scanning.current) {
        if (inc.piece.id === piece.id) return s;
        if (out.piece.id === piece.id) {
          tween.current?.kill();
          c.on = false;
          c.fade = 0;
          return [{ ...out, role: 'idle' }];
        }
        counter.current += 1;
        return [out, { piece, role: 'in', k: counter.current }];
      }
      const cur = inc || s.find((x) => x.role !== 'out') || s[0];
      if (cur.piece.id === piece.id) return s;
      tween.current?.kill();
      scanning.current = false;
      counter.current += 1;
      c.on = true;
      // the scan ring appears on the floor right away (instant feedback) and breathes until the piece is ready
      c.value = -0.08;
      ringR.current = info.current[cur.piece.id]?.flat || ringR.current;
      if (!appState.reducedMotion) {
        tween.current = gsap.fromTo(c, { fade: 0 }, { fade: 0.6, duration: 0.45, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      }
      return [
        { ...cur, role: 'out' },
        { piece, role: 'in', k: counter.current },
      ];
    });
  }, [piece]);

  const onInfo = (id, d) => {
    info.current[id] = d;
    if (id !== target.current) return;
    setSlots((s) => {
      const out = s.find((x) => x.role === 'out');
      const inc = s.find((x) => x.role === 'in');
      if (!inc) return s;
      const hOut = out ? info.current[out.piece.id]?.height || 0 : 0;
      const H = Math.max(d.height, hOut) + 0.12;
      ringR.current = Math.max(d.flat, out ? info.current[out.piece.id]?.flat || 0 : 0);
      if (appState.reducedMotion) {
        cut.current.on = false;
        return [{ ...inc, role: 'idle' }];
      }
      const c = cut.current;
      tween.current?.kill(); // the waiting pulse
      scanning.current = true;
      c.value = -0.08;
      tween.current = gsap
        .timeline({
          onComplete: () => {
            c.on = false;
            scanning.current = false;
            setSlots((ss) => ss.filter((x) => x.role === 'in').map((x) => ({ ...x, role: 'idle' })));
          },
        })
        .to(c, { fade: 1, duration: 0.25, ease: 'power1.out' }, 0)
        .to(c, { value: H, duration: 1.2, ease: 'power2.inOut' }, 0)
        .to(c, { fade: 0, duration: 0.25, ease: 'power1.in' }, 0.95);
      return s;
    });
  };

  // camera framing (smoothly re-frames between pieces of different sizes)
  const cam = useRef();
  const size = useThree((s) => s.size);
  const look = useMemo(() => new THREE.Vector3(), []);
  const goal = useMemo(() => new THREE.Vector3(), []);
  const dirV = useMemo(() => new THREE.Vector3(...dir).normalize(), [dir]);
  const group = useRef();
  const snapped = useRef(false);
  useFrame((_, dt) => {
    const d = info.current[target.current];
    const c = cam.current;
    if (c && d) {
      const vfov = (c.fov * Math.PI) / 180;
      const aspect = size.width / Math.max(1, size.height);
      const hfov = 2 * Math.atan(Math.tan(vfov / 2) * aspect);
      const dist = (d.radius / Math.sin(Math.min(vfov, hfov) / 2)) * margin;
      goal.copy(dirV).multiplyScalar(dist);
      goal.y += d.height * 0.45;
      const lookY = d.height * 0.45;
      if (!snapped.current) {
        c.position.copy(goal);
        look.set(0, lookY, 0);
        snapped.current = true;
      }
      c.position.x = THREE.MathUtils.damp(c.position.x, goal.x, 3, dt);
      c.position.y = THREE.MathUtils.damp(c.position.y, goal.y, 3, dt);
      c.position.z = THREE.MathUtils.damp(c.position.z, goal.z, 3, dt);
      look.y = THREE.MathUtils.damp(look.y, lookY, 3, dt);
      c.near = dist / 40;
      c.far = dist * 12;
      c.updateProjectionMatrix();
      c.lookAt(look);
    }
    // drag rotation with inertia + slow idle spin
    const g = group.current;
    if (g && drag) {
      const s = drag.state.current;
      if (!s.dragging) {
        s.vel *= 0.93;
        s.rot += s.vel + (s.touched || appState.reducedMotion ? 0 : dt * autoSpin);
      }
      g.rotation.y = THREE.MathUtils.damp(g.rotation.y, s.rot, 6, dt);
    }
  });

  return (
    <>
      <PerspectiveCamera ref={cam} makeDefault fov={26} position={[1.5, 1.4, 4]} />
      <StudioLight intensity={1.05} />
      <group ref={group}>
        {slots.map((s) => (
          <Suspense key={`${s.piece.id}-${s.k}`} fallback={null}>
            <DyePiece piece={s.piece} finishes={s.role === 'out' ? finishMap.current[s.piece.id] : finishes} cut={cut} role={s.role} onInfo={onInfo} />
          </Suspense>
        ))}
      </group>
      <ScanRing cut={cut} radius={ringR} />
      <Shadow position={[0, 0.001, 0]} opacity={0.5} scale={7} blur={2.4} far={2} resolution={512} color="#2a2119" />
    </>
  );
}
