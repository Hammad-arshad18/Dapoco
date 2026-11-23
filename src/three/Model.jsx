import { useMemo } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';

/* Photoreal furniture from Poly Haven (CC0), compressed to meshopt + WebP GLB. */
export const modelUrl = (id) => `/models/${id}.glb`;

/**
 * Loads a GLB, clones it (so one asset can appear in many views), centres it
 * on X/Z and stands it on the floor (y = 0). Real-world metre scale is kept.
 * `materials` optionally maps material name → replacement material.
 */
export function Model({ id, materials, ...props }) {
  const { scene } = useGLTF(modelUrl(id));
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

export const preloadModels = (ids) => ids.forEach((id) => useGLTF.preload(modelUrl(id)));
