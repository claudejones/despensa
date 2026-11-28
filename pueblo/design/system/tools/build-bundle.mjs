// Builds project/components/bundle.js from Lucide SVG files and src/behaviours.js.
// Usage: node tools/build-bundle.mjs <path to lucide-static/icons>
import fs from 'node:fs';
const dir = process.argv[2];
const names = `citrus banana carrot apple cherry coins check x volume-2 shopping-basket lightbulb chevron-left chevron-right store utensils car-taxi-front cross house trees school landmark map languages sparkles book-open list-checks settings pause wallet timer
lock star award mic info plus minus delete eye eye-off users rotate-ccw play banknote receipt scale clock captions hand search circle-help shirt grape egg milk wheat fish bean smile frown meh zap flag gift trophy arrow-right undo-2`.split(/\s+/);
const icons = {}; const missing = [];
for (const n of names) { const p = `${dir}/${n}.svg`; if (!fs.existsSync(p)) { missing.push(n); continue; }
  const s = fs.readFileSync(p, 'utf8'); icons[n] = s.slice(s.indexOf('>', s.indexOf('<svg')) + 1, s.lastIndexOf('</svg>')).replace(/\s*\n\s*/g, '').trim(); }
const js = `/* @ds-bundle: {"format":4,"namespace":"Pueblo","components":[]} */
/* Icons: Lucide 0.460.0 (ISC licence), SVG bodies embedded. No network calls. */
(function(){
var ICONS=${JSON.stringify(icons)};
function icon(name,size,sw){var b=ICONS[name];if(!b)return "";size=size||24;
return "<svg class=\\"pb-ic\\" xmlns=\\"http://www.w3.org/2000/svg\\" width=\\""+size+"\\" height=\\""+size+"\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\""+(sw||2)+"\\" stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\" aria-hidden=\\"true\\">"+b+"</svg>";}
function hydrate(root){(root||document).querySelectorAll("[data-ic]").forEach(function(el){if(el.firstChild)return;el.innerHTML=icon(el.getAttribute("data-ic"),+el.getAttribute("data-size")||24,+el.getAttribute("data-sw")||2);});}
window.Pueblo={icons:ICONS,icon:icon,hydrate:hydrate};
if(document.readyState!=="loading")hydrate();else document.addEventListener("DOMContentLoaded",function(){hydrate();});
})();
` + fs.readFileSync(new URL('../src/behaviours.js', import.meta.url), 'utf8');
fs.writeFileSync(new URL('../project/components/bundle.js', import.meta.url), js);
console.log(Object.keys(icons).length, 'icons;', 'missing:', missing.join(' ') || 'none;', js.length, 'bytes');
