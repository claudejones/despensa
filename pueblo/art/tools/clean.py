import sys, numpy as np
from PIL import Image
src, out, cell, colours = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
im = Image.open(src).convert('RGBA'); a = np.asarray(im).astype(int)
print('size', im.size, 'alpha: min', a[...,3].min(), 'max', a[...,3].max(), 'share fully transparent', round(float((a[...,3]==0).mean()),3), 'share partial', round(float(((a[...,3]>0)&(a[...,3]<250)).mean()),3))
# estimate the pixel-art cell: most common run length of identical colour along rows
g = (a[...,:3]//24).sum(axis=2); runs = {}
for y in range(0, a.shape[0], 7):
    row = g[y]; start = 0
    for x in range(1, len(row)+1):
        if x == len(row) or row[x] != row[start]:
            L = x - start
            if 3 <= L <= 40: runs[L] = runs.get(L, 0) + 1
            start = x
top = sorted(runs.items(), key=lambda kv: -kv[1])[:6]; print('common run lengths', top)
# clean: hard alpha, downsample by cell (median of each cell), quantise
h, w = a.shape[0]//cell, a.shape[1]//cell
b = a[:h*cell, :w*cell].reshape(h, cell, w, cell, 4)
rgb = np.median(b[...,:3].reshape(h, cell, w, cell, 3).transpose(0,2,1,3,4).reshape(h, w, cell*cell, 3), axis=2)
al = b[...,3].transpose(0,2,1,3).reshape(h, w, cell*cell).mean(axis=2)
small = np.dstack([rgb, np.where(al > 200, 255, 0)]).astype('uint8')
sm = Image.fromarray(small, 'RGBA')
q = sm.convert('RGB').quantize(colours, method=Image.MEDIANCUT, dither=Image.NONE).convert('RGBA'); q.putalpha(sm.getchannel('A'))
bbox = q.getbbox(); q = q.crop(bbox) if bbox else q
q.save(out, optimize=True); print('sprite', q.size, 'colours', colours)
big = q.resize((q.width*6, q.height*6), Image.NEAREST); bg = Image.new('RGBA', big.size, (251,247,239,255)); bg.alpha_composite(big); bg.save(out.replace('.png','-view.png'))
import os; print('bytes', os.path.getsize(out))
