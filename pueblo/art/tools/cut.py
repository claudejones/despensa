# Cut a transparent sheet into items by alpha gaps, clean each into a true pixel sprite with its own palette.
import sys, numpy as np, os
from PIL import Image
src, outdir, cell, colours = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4]); names = sys.argv[5:]
a = np.asarray(Image.open(src).convert('RGBA')).astype(int)
solid = (a[...,3] > 200).any(axis=0); spans = []; s = None
for x, v in enumerate(list(solid) + [False]):
    if v and s is None: s = x
    if not v and s is not None:
        if x - s > 20: spans.append((s, x))
        s = None
print('items found', len(spans))
for (x0, x1), name in zip(spans, names):
    x0 -= x0 % cell; part = a[:, x0:x1 + cell]
    h, w = part.shape[0]//cell, part.shape[1]//cell
    b = part[:h*cell, :w*cell].reshape(h, cell, w, cell, 4).transpose(0,2,1,3,4).reshape(h, w, cell*cell, 4)
    rgb = np.median(b[...,:3], axis=2); al = b[...,3].mean(axis=2)
    sm = Image.fromarray(np.dstack([rgb, np.where(al > 200, 255, 0)]).astype('uint8'), 'RGBA')
    q = sm.convert('RGB').quantize(colours, method=Image.MEDIANCUT, dither=Image.NONE).convert('RGBA'); q.putalpha(sm.getchannel('A'))
    q = q.crop(q.getbbox()); p = os.path.join(outdir, name + '.png'); q.save(p, optimize=True); print(name, q.size, os.path.getsize(p), 'bytes')
