const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});try{for(const width of [320,375,430]){
const page=await browser.newPage({viewport:{width,height:740},isMobile:true,hasTouch:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(process.env.FOOTBALL_URL||'http://127.0.0.1:8765/football/');await page.waitForFunction(()=>data?.games?.length);
const saved=await page.evaluate(()=>JSON.stringify({tickets,pool}));
for(const kind of ['games','picks','combos','games']){
 await page.locator('[data-briefing='+kind+']').click();
 assert.equal(await page.locator('.sheet-content').evaluate(e=>e.scrollTop),0);
 for(const height of [740,560,844]){
  await page.setViewportSize({width,height});await page.locator('.sheet-content').evaluate(e=>e.scrollTop=10000);
  const r=await page.evaluate(()=>{const rect=s=>document.querySelector(s).getBoundingClientRect(),d=rect('#ticketSheet'),h=rect('.sheet-heading'),c=rect('.sheet-content'),f=rect('.briefing-footer'),x=rect('[data-review-close]'),svg=rect('[data-review-close] svg');return {top:d.top,bottom:d.bottom,vh:innerHeight,gap:c.top-h.bottom,footerGap:f.top-c.bottom,xw:x.width,xh:x.height,icon:svg.width,overflow:document.querySelector('#ticketSheet').scrollWidth-document.querySelector('#ticketSheet').clientWidth}});
  assert.ok(r.top>=0&&r.bottom<=r.vh+1);assert.ok(Math.abs(r.gap)<1&&Math.abs(r.footerGap)<1);assert.equal(r.xw,44);assert.equal(r.xh,44);assert.equal(r.icon,20);assert.ok(r.overflow<=1);
 }
 await page.locator('.sheet-content').evaluate(e=>e.scrollTop=0);
 await page.screenshot({path:`football/test-artifacts/${width}-sheet-${kind}.png`});
 await page.locator('[data-review-close]').click();
}
const timings=[];
for(const tab of ['games','picks','combos','kalshi','weeks','games']){
 await page.evaluate(()=>window.scrollTo(0,10000));
 const elapsed=await page.evaluate(tab=>{const start=performance.now();document.querySelector('nav [data-tab='+tab+']').click();return performance.now()-start},tab);
 timings.push([tab,Math.round(elapsed)]);assert.ok(elapsed<500,'Tab handler should not block for half a second');
 assert.equal(await page.evaluate(()=>scrollY),0);assert.equal(await page.locator('nav .active').getAttribute('data-tab'),tab);
}
// A second tap on the current tab also returns to the top.
await page.evaluate(()=>window.scrollTo(0,10000));await page.locator('nav [data-tab=games]').tap();assert.equal(await page.evaluate(()=>scrollY),0);
// Existing icons are kept intact when refreshing ticket state.
assert.ok(await page.evaluate(()=>{const svg=document.querySelector('nav svg');icons();return svg===document.querySelector('nav svg')}));
assert.equal(await page.evaluate(()=>JSON.stringify({tickets,pool})),saved);
await page.evaluate(()=>window.scrollTo(0,10000));await page.reload();await page.waitForFunction(()=>data?.games?.length);assert.equal(await page.evaluate(()=>scrollY),0);
assert.deepEqual(errors,[]);console.log('PASS sheets/navigation '+width,JSON.stringify(timings));await page.close();
}}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
