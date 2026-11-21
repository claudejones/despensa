// Builds content/mercado.json and checks each headword against the Diccionario del español de México (dem.colmex.mx).
// Usage: node tools/build-mercado.mjs [--no-check]
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { GROUPS } from './mercado-source.mjs';
const check = !process.argv.includes('--no-check');
const cacheFile = new URL('./dem-cache.json', import.meta.url);
let cache = {}; try { cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8')); } catch (e) {}
const strip = (s) => s.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
function lookup(w) {
  if (cache[w]) return cache[w];
  let html = '';
  try { html = execFileSync('curl', ['-s', '--max-time', '25', '-A', 'Mozilla/5.0 (compatible; vocabulary-check)', 'https://dem.colmex.mx/Ver/' + encodeURIComponent(w)], { encoding: 'utf8', maxBuffer: 1 << 24 }); } catch (e) { return { ok: false, err: 'fetch failed' }; }
  const cats = [...html.matchAll(/id="MainContent_repeater_lblCategoria_\d+">([^<]*)</g)].map((m) => strip(m[1])).filter(Boolean);
  const defs = [...html.matchAll(/id="MainContent_repeater_lblDefinicion_\d+">([\s\S]*?)<\/span>/g)].map((m) => strip(m[1])).filter(Boolean);
  const r = { ok: cats.length + defs.length > 0, cats: [...new Set(cats)], def: (defs[0] || '').slice(0, 160) };
  cache[w] = r; fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 1));
  execFileSync('sleep', ['0.4']);
  return r;
}
const items = []; const report = [];
for (const [gid, g] of Object.entries(GROUPS)) {
  for (const [es, art, pl, en, sold, level, price, icon, head, note] of g.rows) {
    const it = { id: es.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ñ/g, 'n').replace(/\s+/g, '-'), es, article: art, plural: pl, en, group: gid, level, sold, icon, note: note || undefined };
    if (price) it.price = { pesos: price[0], kind: price[1], source: price[1] === 'known' ? 'Chedraui receipts, Aug-Nov 2026' : 'Chosen for the game' };
    if (check && head) {
      const r = lookup(head);
      const want = art === 'el' ? 'm' : 'f';
      const genders = (r.cats || []).filter((c) => /^s\b/.test(c)).map((c) => c.replace(/^s\s*/, ''));
      let status = !r.ok ? 'NOT FOUND' : head !== es ? 'head noun only' : genders.some((x) => x.split(/\s|y/).includes(want)) ? 'ok' : genders.length ? 'GENDER?' : 'no noun entry';
      it.dictionary = { headword: head, found: !!r.ok, categories: r.cats || [], checked: status === 'ok' };
      report.push([status, es, art, head, (r.cats || []).join(', '), r.def || r.err || '']);
    } else if (check) report.push(['no headword', es, art, '-', '', '']);
    items.push(it);
  }
}
const out = { place: 'mercado', version: 1, builtFrom: 'tools/mercado-source.mjs', groups: Object.fromEntries(Object.entries(GROUPS).map(([k, g]) => [k, { es: g.es, en: g.en }])), items };
fs.writeFileSync(new URL('../mercado.json', import.meta.url), JSON.stringify(out, null, 1) + '\n');
const ids = items.map((i) => i.id); const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
console.log(items.length, 'items;', 'duplicates:', dup.join(' ') || 'none');
if (check) { const by = {}; report.forEach((r) => (by[r[0]] = (by[r[0]] || 0) + 1)); console.log(JSON.stringify(by));
  report.filter((r) => r[0] !== 'ok').forEach((r) => console.log(r.join(' | ')));
  fs.writeFileSync(new URL('./mercado-check.txt', import.meta.url), report.map((r) => r.join(' | ')).join('\n') + '\n'); }
