import sys, numpy as np
from PIL import Image, ImageFilter
import potrace
src, out = sys.argv[1], sys.argv[2]
box = tuple(int(v) for v in sys.argv[3].split(','))  # x0,y0,x1,y1
S = 4
im = Image.open(src).convert('L').crop(box)
im = im.resize((im.width*S, im.height*S), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.2))
a = np.array(im)
bm = potrace.Bitmap(a >= 128)
plist = bm.trace(turdsize=40, alphamax=1.0, opticurve=True, opttolerance=0.2)
def f(v): return f"{v/S:.2f}".rstrip('0').rstrip('.')
d = []
for c in plist:
    p = c.start_point; d.append(f"M{f(p.x)} {f(p.y)}")
    for seg in c.segments:
        if seg.is_corner:
            d.append(f"L{f(seg.c.x)} {f(seg.c.y)}L{f(seg.end_point.x)} {f(seg.end_point.y)}")
        else:
            d.append(f"C{f(seg.c1.x)} {f(seg.c1.y)} {f(seg.c2.x)} {f(seg.c2.y)} {f(seg.end_point.x)} {f(seg.end_point.y)}")
    d.append('Z')
w, h = box[2]-box[0], box[3]-box[1]
path = ''.join(d)
open(out,'w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}"><path fill-rule="evenodd" d="{path}"/></svg>')
print(out, len(plist), 'paths', len(path), 'chars')
