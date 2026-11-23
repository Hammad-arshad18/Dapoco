import * as THREE from 'three';

/* ============================================================================
   Dye + scan material
   Patches a glTF PBR material so that:
   • a zone can be re-dyed live while keeping the original texture's detail
     (the texture's luminance relative to its average modulates the new colour);
   • a new finish *sweeps* across the piece behind a glowing seam;
   • a whole piece can *materialise* / dissolve behind a rising scan line.
   All patched materials share one shader program (only uniforms differ).
   ========================================================================== */

const DECL = /* glsl */ `
uniform vec3 uDyeA; uniform vec3 uDyeB;
uniform float uUseA; uniform float uUseB;
uniform vec2 uMRA; uniform vec2 uMRB;
uniform float uRef; uniform float uDetail;
uniform float uSweep; uniform float uSweepW; uniform float uGlow;
uniform float uCut; uniform float uCutDir; uniform float uCutOn;
uniform vec3 uEdge;
varying vec3 vDpW;
float dpHash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float dpNoise(vec3 x) {
  vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(dpHash(i), dpHash(i + vec3(1, 0, 0)), f.x), mix(dpHash(i + vec3(0, 1, 0)), dpHash(i + vec3(1, 1, 0)), f.x), f.y),
             mix(mix(dpHash(i + vec3(0, 0, 1)), dpHash(i + vec3(1, 0, 1)), f.x), mix(dpHash(i + vec3(0, 1, 1)), dpHash(i + vec3(1, 1, 1)), f.x), f.y), f.z);
}
`;

const CUT = /* glsl */ `
#include <clipping_planes_fragment>
float dpN = dpNoise(vDpW * 16.0) * 0.045 + dpNoise(vDpW * 4.0) * 0.06;
float dpCd = vDpW.y + dpN - uCut;
if (uCutOn > 0.5 && dpCd * uCutDir > 0.0) discard;
float dpEdge = uCutOn * (1.0 - smoothstep(0.0, 0.04, abs(dpCd)));
`;

const DYE = /* glsl */ `
#include <map_fragment>
vec3 dpTex = diffuseColor.rgb;
float dpL = dot(dpTex, vec3(0.2126, 0.7152, 0.0722));
float dpK = clamp(pow(clamp(dpL / max(uRef, 1e-4), 0.02, 8.0), uDetail), 0.1, 2.8);
vec3 dpOld = uUseA > 0.5 ? uDyeA * dpK : dpTex;
vec3 dpNew = uUseB > 0.5 ? uDyeB * dpK : dpTex;
float dpCoord = vDpW.x + vDpW.y * 0.4 + dpN * 0.8;
float dpS = smoothstep(uSweep - uSweepW, uSweep + uSweepW, dpCoord);
diffuseColor.rgb = mix(dpNew, dpOld, dpS);
float dpLine = uGlow * (1.0 - smoothstep(0.0, uSweepW * 1.6, abs(dpCoord - uSweep)));
`;

const ROUGH = /* glsl */ `
#include <roughnessmap_fragment>
float dpRA = uMRA.y >= 0.0 ? mix(roughnessFactor, uMRA.y, 0.8) : roughnessFactor;
float dpRB = uMRB.y >= 0.0 ? mix(roughnessFactor, uMRB.y, 0.8) : roughnessFactor;
roughnessFactor = mix(dpRB, dpRA, dpS);
`;

const METAL = /* glsl */ `
#include <metalnessmap_fragment>
float dpMA = uMRA.x >= 0.0 ? uMRA.x : metalnessFactor;
float dpMB = uMRB.x >= 0.0 ? uMRB.x : metalnessFactor;
metalnessFactor = mix(dpMB, dpMA, dpS);
`;

const EMIT = /* glsl */ `
#include <emissivemap_fragment>
totalEmissiveRadiance += uEdge * (dpEdge * 3.2 + dpLine * 1.4);
`;

export function makeDyeMaterial(src, { ref = 0.1, detail = 0.6 } = {}) {
  const m = src.clone();
  const u = {
    uDyeA: { value: new THREE.Color(1, 1, 1) },
    uDyeB: { value: new THREE.Color(1, 1, 1) },
    uUseA: { value: 0 },
    uUseB: { value: 0 },
    uMRA: { value: new THREE.Vector2(-1, -1) },
    uMRB: { value: new THREE.Vector2(-1, -1) },
    uRef: { value: ref },
    uDetail: { value: detail },
    uSweep: { value: 1e4 },
    uSweepW: { value: 0.05 },
    uGlow: { value: 0 },
    uCut: { value: 0 },
    uCutDir: { value: 1 },
    uCutOn: { value: 0 },
    uEdge: { value: new THREE.Color('#ff9a52') },
  };
  m.userData.dye = u;
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, u);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vDpW;')
      .replace('#include <fog_vertex>', '#include <fog_vertex>\nvDpW = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>\n${DECL}`)
      .replace('#include <clipping_planes_fragment>', CUT)
      .replace('#include <map_fragment>', DYE)
      .replace('#include <roughnessmap_fragment>', ROUGH)
      .replace('#include <metalnessmap_fragment>', METAL)
      .replace('#include <emissivemap_fragment>', EMIT);
  };
  m.customProgramCacheKey = () => 'dapoco-dye-1';
  return m;
}

/* Set the *target* finish of a dye material (B). If `instant`, A = B as well. */
export function setFinish(u, finish, instant) {
  if (!instant) {
    // what is on screen now becomes A, sweeping to the new B
    u.uDyeA.value.copy(u.uDyeB.value);
    u.uUseA.value = u.uUseB.value;
    u.uMRA.value.copy(u.uMRB.value);
  }
  if (finish?.color) {
    u.uDyeB.value.set(finish.color);
    u.uUseB.value = 1;
  } else {
    u.uDyeB.value.set('#ffffff');
    u.uUseB.value = 0;
  }
  const mr = finish?.mr || [-1, -1];
  u.uMRB.value.set(mr[0], mr[1]);
  if (instant) {
    u.uDyeA.value.copy(u.uDyeB.value);
    u.uUseA.value = u.uUseB.value;
    u.uMRA.value.copy(u.uMRB.value);
    u.uSweep.value = 1e4;
    u.uGlow.value = 0;
  }
}
