import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { getBounds } from '@gltf-transform/core';
import { MeshoptDecoder } from 'meshoptimizer';
import sharp from 'sharp';
await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
for (const f of process.argv.slice(2)) {
  const doc = await io.read(f);
  const root = doc.getRoot();
  const b = getBounds(root.listScenes()[0]);
  const size = b.max.map((v, i) => (v - b.min[i]).toFixed(2));
  const out = [];
  for (const m of root.listMaterials()) {
    const t = m.getBaseColorTexture();
    let avg = '';
    if (t) { try { const st = await sharp(Buffer.from(t.getImage())).stats(); avg = '#' + st.channels.slice(0,3).map(c => Math.round(c.mean).toString(16).padStart(2,'0')).join(''); } catch(e) { avg='?'; } }
    out.push(`${m.getName()}[${avg || 'f'+m.getBaseColorFactor().slice(0,3).map(v=>v.toFixed(2)).join(',')} m${m.getMetallicFactor()}${m.getMetallicRoughnessTexture()?'T':''}]`);
  }
  console.log(f.split('/').pop().replace('.glb',''), 'size', size.join('x'), '\n   ', out.join('  '));
}
