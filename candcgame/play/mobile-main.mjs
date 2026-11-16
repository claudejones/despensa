import {setupGlobalGame} from './global-game.mjs';
import {AssetLoader} from './asset-loader.mjs';
import {runtimeSnapshot,PlayRuntime,runtimeAssetKeys} from './play-runtime.mjs';
import {loadLevel,drawLevel} from './level-runtime.mjs';
import {paintGameHud} from './game-hud.mjs';
import {AttractPlayback} from './attract-mode.mjs';
import {sharedAudio} from './audio-engine.mjs';
const $=id=>document.getElementById(id),panel=$('game'),surface=$('surface'),canvas=$('run-canvas'),portrait=matchMedia('(orientation: portrait)');
const loader=new AssetLoader(),limit=24,originalLoad=loader.load.bind(loader);
loader.load=source=>{const p=originalLoad(source);loader.cache.delete(source);loader.cache.set(source,p);while(loader.cache.size>limit)loader.cache.delete(loader.cache.keys().next().value);return p;};
let run=null,images={},ui=null,last=null,request=0,generation=0,auto=null;
let qaSpeed=1,qaImmortal=false;// set only by QA mode (test builds)
const slidePointers=new Set();
// Version label (owner rule: visible on the title and Options). tools/public-build.mjs empties BUILD for the public game.
export const VERSION='1.1.1',BUILD='';
$('version').textContent='v'+VERSION+(BUILD?' · '+BUILD:'');
// Desktop: menu screens are laid out as if the window were at most ~960×600 and zoomed as one piece (up to 3×; 2× left big monitors half empty) to fill
// bigger windows, like Pulse Kart's uiScale. Gameplay is untouched. --uiz is used by mobile.css.
function uiScale(){const d=document.documentElement;if(!d||typeof innerWidth!=='number')return;/* host-qa.mjs runs this in Node */const z=Math.max(1,Math.min(innerWidth/960,innerHeight/600,3));d.style.setProperty('--uiz',z.toFixed(3));d.classList.toggle('uiz',z>1);}
uiScale();addEventListener('resize',uiScale);
// World map labels shrink with the map picture (the map is not zoomed: it sizes itself with screen-height units). At the
// normal phone size the picture is ~740 px wide; on shorter phone windows (Safari with its bars, ~320-350 px tall) the
// labels overlapped in the original game (fit.mjs 2026-11-15: Europe/Africa, South America/Antarctica).
if(typeof ResizeObserver==='function'&&typeof MutationObserver==='function'){let art=null;const sizer=new ResizeObserver(es=>{for(const e of es)panel.style.setProperty('--map-k',Math.min(1,e.contentRect.width/740).toFixed(3));});
 new MutationObserver(()=>{const a=panel.querySelector('.global-map-art');if(a!==art){sizer.disconnect();art=a;if(a)sizer.observe(a);}}).observe(panel,{childList:true,subtree:true});}
function release(){slidePointers.clear();run?.holdSlide?.(false);}
function pause(){release();run?.pause();last=null;if(ui?.presenting())sharedAudio.setPaused(true);}
function interrupt(){pause();sharedAudio.visibility(document.hidden||portrait.matches);}
function rotation(){ $('rotate').hidden=!portrait.matches;panel.inert=portrait.matches;if(portrait.matches)interrupt();else{sharedAudio.visibility(document.hidden);last=null;} }
function paint(){
 if(!run)return;drawLevel(canvas,run,images,window.CC_LANDSCAPE_CONTRACT,{reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches});paintGameHud($('run-hud'),run);
 for(const a of ['jump','slide'])$('run-'+a).disabled=run.status!=='playing';
 $('run-pause').disabled=!['playing','paused'].includes(run.status);$('run-pause').textContent=run.status==='playing'?'PAUSE':'RESUME';$('run-pause').setAttribute('aria-label',run.status==='playing'?'Pause game':'Resume game');ui?.update(run);
}
function tick(now){request=0;if(!document.hidden&&!portrait.matches&&run&&ui?.presenting()){if(last!==null){const dt=Math.min(.1,(now-last)/1000)*qaSpeed;if(auto)auto.advance(dt);else run.advance(dt);}paint();}last=now;request=requestAnimationFrame(tick);}
function toggle(){if(ui?.blocked()||!run||portrait.matches)return;ui.audio.unlock();if(run.status==='playing')pause();else if(run.status==='paused'){release();run.start();sharedAudio.setPaused(false);last=null;}paint();}
function action(a,held=false){if(ui?.blocked()||run?.status!=='playing'||portrait.matches)return;ui.audio.unlock();if(a==='slide'&&held&&ui.store.state.settings.continuousSlide)run.holdSlide(true);else run.action(a);}
for(const a of ['jump','slide']){const b=$('run-'+a);b.onpointerdown=e=>{if(e.button!==0)return;e.preventDefault();if(a==='slide')slidePointers.add(e.pointerId);action(a,a==='slide');try{b.setPointerCapture?.(e.pointerId);}catch{}paint();};b.onclick=e=>{if(e.detail===0)action(a);};}
for(const event of ['pointerup','pointercancel','lostpointercapture'])$('run-slide').addEventListener(event,e=>{slidePointers.delete(e.pointerId);if(!slidePointers.size)run?.holdSlide?.(false);});
$('run-pause').onpointerdown=e=>{if(e.button!==0)return;e.preventDefault();toggle();};$('run-pause').onclick=e=>{if(e.detail===0)toggle();};
// Keys (How to Play → Controls lists them): Space/↑/W jump, ↓/S slide, P or Esc pause/resume, M game menu.
addEventListener('keydown',e=>{if(['INPUT','SELECT','TEXTAREA','BUTTON'].includes(e.target.tagName)||e.repeat)return;const a=['ArrowDown','KeyS'].includes(e.code)?'slide':['Space','ArrowUp','KeyW'].includes(e.code)?'jump':null;if(a||e.code==='KeyP'||e.code==='Escape'){e.preventDefault();if(a)action(a,a==='slide');else toggle();}
 else if(e.code==='KeyM'&&run&&ui&&!ui.blocked()&&!portrait.matches){e.preventDefault();document.querySelector('.global-run-menu button')?.click();}});
addEventListener('keyup',e=>{if(['ArrowDown','KeyS'].includes(e.code))release();});addEventListener('blur',interrupt);addEventListener('pagehide',interrupt);document.addEventListener('visibilitychange',()=>{if(document.hidden)interrupt();else{sharedAudio.visibility(portrait.matches);last=null;}});portrait.addEventListener('change',rotation);
// No page zoom anywhere (owner 2026-11-16: "when I do tap on the screen it zoom in"). Two thumbs on Jump + Slide read as a pinch
// and a quick double tap off the buttons as zoom-in. Safari ignores user-scalable=no, so stop the gestures themselves.
// Taps on buttons are untouched (they already use touch-action: manipulation; gameplay buttons use pointer events).
document.addEventListener('dblclick',e=>e.preventDefault(),{passive:false});
for(const type of ['gesturestart','gesturechange','gestureend'])document.addEventListener(type,e=>e.preventDefault(),{passive:false});
document.addEventListener('touchmove',e=>{if(e.touches.length>1)e.preventDefault();},{passive:false});
let lastTouchEnd=0;document.addEventListener('touchend',e=>{const now=e.timeStamp;if(now-lastTouchEnd<350&&!e.target.closest?.('button,a,input,select,textarea,[role=tab],[role=switch]'))e.preventDefault();lastTouchEnd=now;},{passive:false});
// Gesture unlock is repeatable after OS audio interruptions. No extra Ready dialog.
document.addEventListener('pointerdown',()=>{if(!portrait.matches)ui?.audio.unlock();},{capture:true});
// Hold decoded map/UI artwork through the session so navigation cannot reveal partial art.
const screenArtwork=[];
let screenManifest=null,worldAssets=null;
async function prepareScreens(world=false){
 if(worldAssets&&world)return worldAssets;
 if(!screenManifest){const response=await fetch('../assets/global-ui/manifest.json');
 if(!response.ok)throw Error('Map artwork could not load. Check your connection and retry.');
 screenManifest=await response.json();}
 const work=Promise.all(Object.entries(screenManifest).filter(([name])=>/\.png$/.test(name)&&(world?/^MAP_|^UI_CONTINENT/.test(name):/^(UI_|BRAND_GAME_LOGO|G1B_)/.test(name)&&!name.startsWith('UI_CONTINENT'))).map(async([name,record])=>{
  const img=new Image();
  await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(Error('Map artwork could not load. Check your connection and retry.'));img.src='../assets/global-ui/'+record.file+'?v='+record.sha256.slice(0,12);});
  if(img.decode)await img.decode();screenArtwork.push(img);
 }));
 if(world)worldAssets=work.catch(e=>{worldAssets=null;throw e;});
 await (world?worldAssets:work);await document.fonts?.ready;
}
async function boot(){
 const release=fetch('./release.json');for(const f of ['global-ui/stages.json','global-ui/map_layout.json','secret-level/asset_manifest.json','secret-level/encounter_config.json'])fetch('../assets/'+f).catch(()=>{});// start together with the title art
 await prepareScreens();
 const response=await release;if(!response.ok)throw Error('The game could not load. Check your connection and retry.');const data=await response.json();
 const {config,draft,items,catalog}=data;
 const playerStorage={getItem:key=>localStorage.getItem('candc.mobile-test.'+key),setItem:(key,value)=>localStorage.setItem('candc.mobile-test.'+key,value)};
 ui=await setupGlobalGame({panel,surface,playerStorage,prepareWorld:()=>prepareScreens(true),isVisible:()=>!document.hidden&&!portrait.matches,guideData:{items,catalog,draft},getRun:()=>run,pause,cancelDemo:()=>{generation++;if(auto){run=null;images={};auto=null;}},launch:async(selection,progress=()=>{})=>{
  const token=++generation;pause();run=null;images={};auto=null;
  const options={config,draft,items,catalog,...selection},stage=selection.stage;let loaded;
  if(stage==='secret01')loaded=await loadLevel(options,loader,{unlimitedLives:selection.unlimited});
  else{
   const response=await fetch(`./plans/${stage}-${selection.difficulty}.json`);if(!response.ok)throw Error('Stage could not load. Check your connection and try again.');const sequence=await response.json();
   if(!sequence.verified||sequence.stage!==stage||sequence.profile!==selection.difficulty)throw Error('Stage plan is incompatible with this release.');
   const snapshot=runtimeSnapshot({...options,sequence}),keys=runtimeAssetKeys(snapshot);let done=0;progress(0,keys.length);const pairs=await Promise.all(keys.map(async key=>{const img=await loader.load(catalog.assets[key]);progress(++done,keys.length);const size=catalog.dimensions[key];if(size&&(img.naturalWidth!==size.width||img.naturalHeight!==size.height))throw Error('Stage artwork is incompatible with this release.');return [key,img];}));loaded={run:new PlayRuntime(snapshot,{unlimitedLives:selection.unlimited}),images:Object.fromEntries(pairs)};
  }
  if(token!==generation)return;run=loaded.run;if(qaImmortal)run.unlimitedLives=true;images=loaded.images;auto=selection.demo?new AttractPlayback(run):null;
  $('run-hud').style.setProperty('--heart-sprite',`url("${images.hudHearts.src}")`);$('run-hud').style.setProperty('--character-sprite',`url("${images.hudCharacters.src}")`);$('run-path').src=images.hudPath.src;
  run.start();if(document.hidden||portrait.matches)pause();last=null;canvas.focus();
 }});
 $('boot').hidden=true;ui.open();rotation();request=requestAnimationFrame(tick);
 // 5. Stage art + music for the stage you are most likely to play next start loading early, so Play rarely waits
 // (owner test 4: "the loading stage and levels"; test 6: "fix the 12 s delay"). On the title: the next stage's pictures
 // first (stage 1 for a new player), then the title song. On the map/results: pictures, then that stage's song.
 // Same loader as launch, so Play reuses whatever has arrived.
 const warmed=new Map();
 async function warm(title=false){const j=ui.store.state.journey,pick=ui.choice();
  const order=['NA','SA','EU','AF','AS','OC','AN'].flatMap(c=>[1,2,3].map(n=>c+'0'+n)),stage=(j?j.visited.reduce((a,s)=>order.indexOf(s)>order.indexOf(a)?s:a,j.stage):'NA01').toLowerCase(),
   character=j?j.character:pick.character,difficulty=j?j.difficulty:pick.difficulty,key=stage+'-'+difficulty+'-'+character;
  if(!warmed.has(key))warmed.set(key,(async()=>{const r=await fetch(`./plans/${stage}-${difficulty}.json`);if(!r.ok)throw Error();const sequence=await r.json();
   const snapshot=runtimeSnapshot({config,draft,items,catalog,stage,character,difficulty,sequence});
   await Promise.all(runtimeAssetKeys(snapshot).map(k=>loader.load(catalog.assets[k])));})().catch(()=>{warmed.delete(key);}));
  await warmed.get(key);
  if(!title&&ui.store.state.settings.music)void sharedAudio.prefetch(stage.toUpperCase()+'_THEME');}
 warm(true).finally(()=>void sharedAudio.prefetch('C_AND_C_TITLE'));
 new MutationObserver(()=>{if(['map','result'].includes(surface.dataset.globalScreen))setTimeout(warm,300);}).observe(surface,{attributes:true,attributeFilter:['data-global-screen']});
}
$('retry').onclick=()=>location.reload();export const started=boot().catch(e=>{$('boot-text').textContent=e.message;$('retry').hidden=false;});rotation();
