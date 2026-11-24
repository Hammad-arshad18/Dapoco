# Model pipeline (offline)

Scripts used to produce `public/models/*.glb`, `public/thumbs/*.webp`, `public/images/*.webp`
and `src/data/zoneHex.json`. **Not part of the web build** — run them only when adding or
re-processing assets. Install once: `cd tools/model-pipeline && npm install`.

All 3D models are Poly Haven **CC0** assets (https://polyhaven.com/models). Photos are Unsplash.

## Adding a new configurable piece (end to end)

1. **Download** the 1k glTF from Poly Haven:
   `python3 fetch_ph.py ./raw <polyhaven_id> [...more ids]`
2. **Compress** to GLB (meshopt geometry, 1024px WebP textures):
   `npx gltf-transform optimize raw/<id>/<id>_1k.gltf work/<id>.glb --compress meshopt --texture-compress webp --texture-size 1024`
   Keep this un-split copy — it is the input for step 3.
3. **Split into colour zones** (so each zone can be re-dyed independently):
   `node zones.mjs work/<id>.glb public/models/<id>.glb <k> [heightThreshold] >> zones.jsonl`
   - Splits each primitive by UV island, clusters islands by texture colour with k-means (`k`, usually 2).
   - Optional 4th arg splits by height instead (0–1 of the piece height; e.g. `0.25` = legs vs body).
   - Strips `COLOR_0` (vertex colours turned some models black once the dye shader ran).
   - Renames materials to `<originalName>__z0`, `__z1`, … and prints a JSON report with each zone's
     average hex / luminance / area share. Pass `-` as the output to only analyse.
   - Use `node inspect.mjs <file.glb>` to list materials and bounds.
4. **Register zones**: add each `<mat>__zN → hex` from the report to `src/data/zoneHex.json`
   (drives the "Signature" swatch colour) and add the piece to `PIECES` in `src/data/pieces.js`
   with `zones: [{ key, label, type, mats: ['<mat>__z0'], ref }]`. `ref` ≈ the zone's average
   luminance from the report (used by the dye shader to keep texture detail).
5. **Thumbnail**: take a transparent/white-background render (Poly Haven's asset thumbnail works),
   `node unmat.mjs in.png cut.png` (removes white matte), then `node thumb.mjs cut.png public/thumbs/<id>.webp`
   (trim + 320×320 WebP). `node sheet.mjs <dir> sheet.png` makes a contact sheet to eyeball them.

6. **Phone copy**: `sh mobile.sh <id>` → `public/models/sm/<id>.glb` (textures 512px, meshopt re-applied).
   The site loads these on touch devices, so every model needs one. `sh mobile.sh` with no id rebuilds all.

## Photos
`node webp.mjs <dirOfJpgs> public/images` → `<key>.webp` (2000px) and `<key>-sm.webp` (900px).
