#!/bin/sh
# Phone copies of every model: same meshes/zones, textures capped at 512px, meshopt re-applied.
# Usage (from tools/model-pipeline): sh mobile.sh            → all of public/models/*.glb
#                                    sh mobile.sh sofa_02    → just one
set -e
SRC=../../public/models
DST=$SRC/sm
TMP=work/mobile
mkdir -p "$DST" "$TMP"
ids="$*"
[ -z "$ids" ] && ids=$(ls $SRC/*.glb | xargs -n1 basename | sed 's/\.glb$//')
for id in $ids; do
  npx gltf-transform resize "$SRC/$id.glb" "$TMP/$id.glb" --width 512 --height 512 >/dev/null 2>&1
  npx gltf-transform meshopt "$TMP/$id.glb" "$DST/$id.glb" >/dev/null 2>&1
  printf '%-34s %6s KB → %6s KB\n' "$id" $(( $(stat -f%z "$SRC/$id.glb") / 1024 )) $(( $(stat -f%z "$DST/$id.glb") / 1024 ))
done
