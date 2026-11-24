import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { appState, glLostBefore } from './store';

/* Photoreal furniture from Poly Haven (CC0), compressed to meshopt + WebP GLB.
   Phones get the `/models/sm/` copies: same meshes, textures at 512px instead of 1024px
   (4× less texture memory; the pieces are a few hundred CSS pixels wide on a phone anyway). */
export const modelUrl = (id) => (appState.isTouch ? `/models/sm/${id}.glb` : `/models/${id}.glb`);

/* ----------------------------------------------------------------------------
   Memory management. Each texture would otherwise live in memory twice (decoded
   image in the tab + its copy on the GPU), and useGLTF caches every model it has
   ever loaded — browsing the Studio piled up hundreds of MB.
   1. On phones, once a texture is on the GPU its decoded ImageBitmap is closed.
   2. Models are reference-counted; one nobody shows for KEEP_MS is disposed (GPU
      buffers + textures) and dropped from the cache. Coming back reloads it from
      the HTTP cache, which is quick.
   -------------------------------------------------------------------------- */
const KEEP_MS = appState.isTouch ? 8000 : 20000;
const users = new Map(); // url → { n, gltf, timer }
const lastRender = new Map(); // url → time a component last rendered it (may not have committed yet)

function freeAfterUpload(tex) {
  const img = tex.image;
  // only ImageBitmaps can be released explicitly (Chrome, Firefox, Safari 17+ — what GLTFLoader uses there)
  if (typeof ImageBitmap !== 'undefined' && img instanceof ImageBitmap) img.close();
  tex.onUpdate = null;
}

function prepare(gltf) {
  // Phones only. A closed image can never be uploaded again (the upload throws, every frame), so on
  // desktop — where memory isn't the constraint — the images are kept and the renderer can always recover.
  // Also skipped once this tab has lost its WebGL context before: then three.js must be able to restore.
  if (!appState.isTouch || glLostBefore() || gltf.userData.__prepared) return;
  gltf.userData.__prepared = true;
  gltf.scene.traverse((o) => {
    if (!o.isMesh) return;
    (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => {
      Object.values(m).forEach((v) => {
        if (v?.isTexture && !v.onUpdate) v.onUpdate = freeAfterUpload;
      });
    });
  });
}

function dispose(gltf) {
  gltf.scene.traverse((o) => {
    if (!o.isMesh) return;
    o.geometry?.dispose();
    (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => {
      Object.values(m).forEach((v) => v?.isTexture && v.dispose());
      m.dispose();
    });
  });
}

function retain(url, gltf) {
  const u = users.get(url) || { n: 0, gltf, timer: 0 };
  clearTimeout(u.timer);
  u.n += 1;
  u.gltf = gltf;
  users.set(url, u);
}

function release(url) {
  const u = users.get(url);
  if (!u) return;
  u.n -= 1;
  if (u.n > 0) return;
  const expire = () => {
    if (u.n > 0) return;
    // a component rendered it recently but hasn't mounted yet (e.g. a Suspense boundary still waiting
    // on other models) — freeing it now would leave that component an untextured model
    const since = performance.now() - (lastRender.get(url) ?? 0);
    if (since < 15000) {
      u.timer = setTimeout(expire, 15000 - since);
      return;
    }
    users.delete(url);
    lastRender.delete(url);
    useGLTF.clear(url);
    dispose(u.gltf);
  };
  u.timer = setTimeout(expire, KEEP_MS);
}

/** useGLTF + texture memory release + automatic unloading when no component shows the model. */
export function useModel(id) {
  const url = modelUrl(id);
  lastRender.set(url, performance.now());
  const gltf = useGLTF(url);
  prepare(gltf);
  useEffect(() => {
    retain(url, gltf);
    return () => release(url);
  }, [url, gltf]);
  return gltf;
}

/**
 * Loads a GLB, clones it (so one asset can appear in many views), centres it
 * on X/Z and stands it on the floor (y = 0). Real-world metre scale is kept.
 * `materials` optionally maps material name → replacement material.
 */
export function Model({ id, materials, ...props }) {
  const { scene } = useModel(id);
  const obj = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
        if (o.material) o.material.envMapIntensity = 1;
      }
    });
    c.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(c);
    const center = box.getCenter(new THREE.Vector3());
    c.position.set(-center.x, -box.min.y, -center.z);
    const g = new THREE.Group();
    g.add(c);
    return g;
  }, [scene]);

  // live material overrides (used by the material studio)
  useMemo(() => {
    if (!materials) return;
    obj.traverse((o) => {
      if (!o.isMesh) return;
      const key = o.userData.__origMat?.name ?? o.material.name;
      if (!o.userData.__origMat) o.userData.__origMat = o.material;
      o.material = materials[key] || o.userData.__origMat;
    });
  }, [obj, materials]);

  return <primitive object={obj} {...props} />;
}

/* ----------------------------------------------------------------------------
   Prefetch = download into the HTTP cache only (no parsing, no memory held).
   The network is the slow part of showing a new piece; parsing a cached file is quick.
   -------------------------------------------------------------------------- */
const fetched = new Set();
export function prefetchModel(id) {
  const url = modelUrl(id);
  if (fetched.has(url) || users.has(url)) return;
  if (typeof navigator !== 'undefined' && navigator.connection?.saveData) return;
  fetched.add(url);
  fetch(url, { priority: 'low' })
    .then((r) => r.arrayBuffer())
    .catch(() => fetched.delete(url));
}
export const preloadModels = (ids) => ids.forEach(prefetchModel);

/* ----------------------------------------------------------------------------
   Get a freshly cloned piece ready on the GPU *before* it is shown: compile its
   shaders without blocking (KHR_parallel_shader_compile) and upload its textures
   one per frame. Otherwise all of that happens inside the frame it first appears
   in — the hitch you see when a new piece swaps in (much longer on phones).

   This is only an optimisation and must NEVER be able to keep a piece hidden: it
   always resolves, within PREP_BUDGET at most. (It used to wait on three's
   compileAsync, which polls the driver's "program linked" flag with no time limit;
   on machines where that flag never turns true — seen on Windows — the hero chair
   never appeared and every piece swap hung with the old piece on screen.)
   Whatever isn't ready when the budget runs out is simply finished on first draw.
   -------------------------------------------------------------------------- */
const PREP_BUDGET = 1500; // ms
// next animation frame, or 120 ms if frames aren't being produced (background tab / window)
const nextFrame = () =>
  new Promise((resolve) => {
    let done = false;
    const go = () => {
      if (done) return;
      done = true;
      resolve();
    };
    requestAnimationFrame(go);
    setTimeout(go, 120);
  });

export async function prepareOnGpu(gl, object, camera, scene, budget = PREP_BUDGET) {
  const deadline = performance.now() + budget;
  try {
    if (gl.getContext().isContextLost()) return;
    // starts compiling + linking (in the background where the browser supports it)
    const materials = gl.compile(object, camera, scene);
    const linking = () => {
      for (const m of materials) {
        const program = gl.properties.get(m).currentProgram;
        if (program && !program.isReady()) return true;
      }
      return false;
    };
    while (linking() && performance.now() < deadline) await nextFrame();

    const textures = new Set();
    object.traverse((o) => {
      if (!o.isMesh) return;
      (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => {
        Object.values(m).forEach((v) => v?.isTexture && textures.add(v));
      });
    });
    for (const t of textures) {
      if (performance.now() > deadline) break;
      gl.initTexture(t); // no-op if already on the GPU
      await nextFrame();
    }
  } catch (err) {
    // show the piece anyway — the renderer does the same work when it first draws it
    if (import.meta.env.DEV) console.warn('prepareOnGpu:', err);
  }
}
