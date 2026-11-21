// Generates project/components/<Name>/preview.html and README.md from the specs in tools/specs/*.mjs.
// Usage: node tools/gen-components.mjs
import fs from 'node:fs';
import { GAME } from './specs/game.mjs';
let M3 = [];
try { M3 = (await import('./specs/material.mjs')).MATERIAL; } catch (e) { if (e.code !== 'ERR_MODULE_NOT_FOUND') throw e; }

const FONTS = 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&family=Lilita+One&family=Pixelify+Sans:wght@400;700&display=swap';
const out = new URL('../project/components/', import.meta.url);
let HEIGHTS = {};
try { HEIGHTS = JSON.parse(fs.readFileSync(new URL('./heights.json', import.meta.url), 'utf8')); } catch (e) {}

function preview(c) {
  const w = c.width ? ` width=${c.width}` : '';
  const h = HEIGHTS[c.name] ? HEIGHTS[c.name] + 12 : c.height;
  return `<!-- @dsCard group="${c.group}" height=${h}${w} subtitle="${c.subtitle || ''}" -->
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="${FONTS}" rel="stylesheet">
<style>
  body { margin: 0; background: var(--cal); }
  .stage { padding: 16px; max-width: ${c.max || 412}px; display: grid; gap: 12px; }
  .cap { font-size: 12px; line-height: 16px; font-weight: 700; letter-spacing: .5px; color: var(--ink-muted); }
  .line { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
${c.css || ''}
</style>
</head>
<body>
<div class="pb stage">
${c.html.trim()}
</div>
${c.js ? `<script>\n(function () {\n${c.js.trim()}\n})();\n</script>\n` : ''}</body>
</html>
`;
}

function readme(c) {
  const r = c.doc;
  const sec = (t, v) => (v ? `\n## ${t}\n\n${Array.isArray(v) ? v.map((x) => `- ${x}`).join('\n') : v}\n` : '');
  return `${r.sum}\n` +
    sec('When to use', r.use) + sec('When not to use', r.not) + sec('Anatomy', r.anatomy) + sec('Placement', r.place) +
    sec('States', r.states) + sec('Motion', r.motion) +
    (r.do || r.dont ? `\n## Do and don't\n\n${(r.do || []).map((x) => `- Do: ${x}`).concat((r.dont || []).map((x) => `- Don't: ${x}`)).join('\n')}\n` : '') +
    sec('Accessibility', r.a11y) + sec('What you provide', r.provide) + sec('Source', r.source);
}

let n = 0;
for (const c of [...GAME, ...M3]) {
  if (!/^[A-Z][A-Za-z0-9]+$/.test(c.name)) throw new Error('bad name ' + c.name);
  const dir = new URL(c.name + '/', out);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(new URL('preview.html', dir), preview(c));
  fs.writeFileSync(new URL('README.md', dir), readme(c));
  n++;
}
console.log(n, 'components written');
