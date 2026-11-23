// Analyse (and optionally split) GLB primitives into colour zones by UV island.
// usage: node zones.mjs <in.glb> <out.glb|-> <k> 
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import sharp from 'sharp';
await MeshoptDecoder.ready; await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });
const [, , inp, out, kArg] = process.argv;
const BELOW = process.argv[5] ? Number(process.argv[5]) : null;
const K = BELOW != null ? 2 : Number(kArg || 1);
const doc = await io.read(inp);
const root = doc.getRoot();
const s2l = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const hex = (c) => '#' + c.map((v) => Math.round(Math.max(0, Math.min(1, v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055)) * 255).toString(16).padStart(2, '0')).join('');
const imgCache = new Map();
async function img(tex) {
  if (imgCache.has(tex)) return imgCache.get(tex);
  const { data, info } = await sharp(Buffer.from(tex.getImage())).resize(512, 512, { fit: 'fill' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const r = { data, w: info.width, h: info.height };
  imgCache.set(tex, r); return r;
}
function sample(im, u, v) {
  u = u - Math.floor(u); v = v - Math.floor(v);
  const x = Math.min(im.w - 1, Math.floor(u * im.w)), y = Math.min(im.h - 1, Math.floor(v * im.h));
  const i = (y * im.w + x) * 3;
  return [s2l(im.data[i]), s2l(im.data[i + 1]), s2l(im.data[i + 2])];
}
const lum = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
// perceptual-ish feature: sqrt of linear (roughly gamma) + chroma emphasis
const feat = (c) => { const g = c.map(Math.sqrt); const m = (g[0] + g[1] + g[2]) / 3; return [m, (g[0] - m) * 2.2, (g[1] - m) * 2.2, (g[2] - m) * 2.2]; };
const dist = (a, b) => a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0);
const report = { model: inp.split('/').pop().replace('.glb', ''), zones: [] };
const matsDone = new Map();
for (const mesh of root.listMeshes()) {
  for (const prim of [...mesh.listPrimitives()]) {
    const col0 = prim.getAttribute('COLOR_0'); if (col0) { prim.setAttribute('COLOR_0', null); }
    const mat = prim.getMaterial();
    const tex = mat?.getBaseColorTexture();
    const idxA = prim.getIndices(); const uvA = prim.getAttribute('TEXCOORD_0'); const posA = prim.getAttribute('POSITION');
    if (!tex || !idxA || !uvA) { continue; }
    const im = await img(tex);
    const idx = idxA.getArray(); const nT = idx.length / 3;
    const nV = posA.getCount();
    const parent = new Int32Array(nV).map((_, i) => i);
    const find = (a) => { while (parent[a] !== a) { parent[a] = parent[parent[a]]; a = parent[a]; } return a; };
    for (let t = 0; t < nT; t++) { const a = find(idx[3 * t]), b = find(idx[3 * t + 1]), c = find(idx[3 * t + 2]); parent[b] = a; parent[find(c)] = a; }
    const comps = new Map(); const triComp = new Int32Array(nT); const triCol = []; const triArea = new Float32Array(nT);
    const p = [[0,0,0],[0,0,0],[0,0,0]], uv = [[0,0],[0,0],[0,0]];
    let yMin = Infinity, yMax = -Infinity;
    for (let t = 0; t < nT; t++) {
      for (let k = 0; k < 3; k++) { posA.getElement(idx[3 * t + k], p[k]); uvA.getElement(idx[3 * t + k], uv[k]); yMin = Math.min(yMin, p[k][1]); yMax = Math.max(yMax, p[k][1]); }
      const e1 = p[1].map((v, i) => v - p[0][i]), e2 = p[2].map((v, i) => v - p[0][i]);
      const cr = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
      const area = Math.hypot(...cr) / 2 + 1e-9;
      const pts = [[(uv[0][0] + uv[1][0] + uv[2][0]) / 3, (uv[0][1] + uv[1][1] + uv[2][1]) / 3], ...uv.map((q, k) => [(q[0] * 2 + uv[(k + 1) % 3][0] + uv[(k + 2) % 3][0]) / 4, (q[1] * 2 + uv[(k + 1) % 3][1] + uv[(k + 2) % 3][1]) / 4])];
      const col = [0, 0, 0]; for (const q of pts) { const c = sample(im, q[0], q[1]); col[0] += c[0] / 4; col[1] += c[1] / 4; col[2] += c[2] / 4; }
      const r = find(idx[3 * t]); triComp[t] = r; triCol.push(col); triArea[t] = area;
      if (!comps.has(r)) comps.set(r, { area: 0, col: [0, 0, 0], y: 0 });
      const C = comps.get(r); C.y += ((p[0][1] + p[1][1] + p[2][1]) / 3) * area; C.area += area; C.col[0] += col[0] * area; C.col[1] += col[1] * area; C.col[2] += col[2] * area;
    }
    const list = [...comps.entries()].map(([id, c]) => ({ id, area: c.area, y: c.y / c.area, col: c.col.map((v) => v / c.area) }));
    list.forEach((c) => (c.f = feat(c.col)));
    let assign = new Map(list.map((c) => [c.id, 0]));
    if (BELOW != null) {
      let hi = yMax;
      const y0 = yMin;
      for (const c of list) assign.set(c.id, (c.y - y0) / (hi - y0) < BELOW ? 1 : 0);
      if (process.env.DBG) console.error(list.length, y0, hi, list.map((c) => ((c.y - y0) / (hi - y0)).toFixed(2) + ":" + c.area.toFixed(3)).join(" "));
    } else if (K >= 2 && list.length > 1) {
      // farthest-point init weighted by area, then k-means
      const big = [...list].sort((a, b) => b.area - a.area);
      const C = [big[0].f];
      while (C.length < K) C.push(list.reduce((best, c) => { const d = Math.min(...C.map((q) => dist(c.f, q))) * Math.sqrt(c.area); return d > best.d ? { d, f: c.f } : best; }, { d: -1, f: null }).f);
      for (let it = 0; it < 40; it++) {
        const acc = C.map(() => [0, 0, 0, 0, 0]);
        for (const c of list) { let z = 0; C.forEach((q, j) => { if (dist(c.f, q) < dist(c.f, C[z])) z = j; }); assign.set(c.id, z); c.f.forEach((v, i) => (acc[z][i] += v * c.area)); acc[z][4] += c.area; }
        acc.forEach((a, j) => { if (a[4]) C[j] = a.slice(0, 4).map((v) => v / a[4]); });
      }
    }
    // per-zone stats over triangles
    const zs = Array.from({ length: K }, () => ({ area: 0, col: [0, 0, 0], lum: 0, tris: [] }));
    for (let t = 0; t < nT; t++) { const z = assign.get(triComp[t]) ?? 0; const Z = zs[z]; Z.area += triArea[t]; Z.lum += lum(triCol[t]) * triArea[t]; triCol[t].forEach((v, i) => (Z.col[i] += v * triArea[t])); Z.tris.push(t); }
    const tot = zs.reduce((s, z) => s + z.area, 0);
    const base = mat.getName();
    if (K >= 2 && zs.filter((z) => z.tris.length).length > 1) {
      for (let z = 0; z < K; z++) {
        if (!zs[z].tris.length) continue;
        const m = mat.clone().setName(`${base}__z${z}`);
        const arr = new (idx.constructor)(zs[z].tris.length * 3);
        zs[z].tris.forEach((t, j) => { arr[3 * j] = idx[3 * t]; arr[3 * j + 1] = idx[3 * t + 1]; arr[3 * j + 2] = idx[3 * t + 2]; });
        const np = z === 0 ? prim : prim.clone();
        if (z !== 0) mesh.addPrimitive(np);
        np.setIndices(doc.createAccessor().setType('SCALAR').setArray(arr).setBuffer(idxA.getBuffer())).setMaterial(m);
        report.zones.push({ mat: `${base}__z${z}`, hex: hex(zs[z].col.map((v) => v / zs[z].area)), lum: +(zs[z].lum / zs[z].area).toFixed(4), share: +(zs[z].area / tot).toFixed(3) });
      }
    } else {
      const key = base;
      const prev = matsDone.get(key) || { area: 0, lum: 0, col: [0, 0, 0] };
      prev.area += zs[0].area; prev.lum += zs[0].lum; zs[0].col.forEach((v, i) => (prev.col[i] += v)); matsDone.set(key, prev);
    }
  }
}
for (const [k, v] of matsDone) report.zones.push({ mat: k, hex: hex(v.col.map((c) => c / v.area)), lum: +(v.lum / v.area).toFixed(4), share: 1 });
if (out !== '-') {
  // drop now-unused original materials
  for (const m of root.listMaterials()) if (!m.listParents().some((p) => p.propertyType === 'Primitive')) m.dispose();
  await io.write(out, doc);
}
console.log(JSON.stringify(report));
