# Layout sketch for the town map: flat blocks where each building must be, so the painted map lines up with the labels.
from PIL import Image, ImageDraw
import json, base64, io
W, H = 912, 1536
im = Image.new('RGB', (W, H), (236, 226, 204)); d = ImageDraw.Draw(im)
road = (250, 244, 232)
for y in (480, 960): d.rectangle([0, y - 44, W, y + 44], fill=road)
for x in (304, 608): d.rectangle([x - 36, 0, x + 36, H], fill=road)
B = {'escuela': (152, 240, (122, 62, 157)), 'banco': (456, 240, (43, 58, 140)), 'clinica': (760, 240, (46, 157, 122)),
     'restaurante': (152, 720, (228, 0, 124)), 'sitio': (760, 720, (24, 167, 160)),
     'mercado': (152, 1200, (232, 174, 44)), 'casa': (456, 1200, (194, 97, 58))}
out = {}
for k, (cx, cy, col) in B.items():
    d.rectangle([cx - 104, cy - 110, cx + 104, cy + 90], fill=col, outline=(255, 253, 248), width=10)
    out[k] = [cx, cy]
# plaza with bandstand in the middle, garden bottom right
d.ellipse([456 - 120, 720 - 120, 456 + 120, 720 + 120], fill=(244, 236, 216), outline=(200, 190, 170), width=6)
d.ellipse([456 - 54, 720 - 54, 456 + 54, 720 + 54], fill=(194, 97, 58), outline=(255, 253, 248), width=8)
d.rectangle([760 - 110, 1200 - 110, 760 + 110, 1200 + 110], fill=(120, 180, 110))
out['plaza'] = [456, 720]; out['jardin'] = [760, 1200]
im.save('/tmp/claude-0/-home-user-despensa/05c2ff2e-97cb-5007-b688-3f7340e92e3f/scratchpad/art-in/map-sketch.png')
small = im.resize((456, 768)); buf = io.BytesIO(); small.save(buf, 'PNG')
open('/tmp/claude-0/-home-user-despensa/05c2ff2e-97cb-5007-b688-3f7340e92e3f/scratchpad/art-in/map-sketch.b64', 'w').write(base64.b64encode(buf.getvalue()).decode())
print(json.dumps(out), len(buf.getvalue()))
