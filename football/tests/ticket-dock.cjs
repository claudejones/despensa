const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});try{for(const width of [320,375,430]){
 const page=await browser.newPage({viewport:{width,height:700}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.FOOTBALL_URL||'http://127.0.0.1:8765/football/');await page.waitForFunction(()=>data?.games?.length);
 const click=async s=>page.locator(s).first().click();
 await click('nav [data-tab=games]');await click('[data-kalshi-choose]');await click('[data-review-game]');await click('[data-review-new=combo]');await click('[data-review-toast-close]');await click('nav [data-tab=weeks]');
 const saved=await page.evaluate(()=>JSON.stringify(tickets));
 for(const height of [700,844,760,650,844]){
  await page.setViewportSize({width,height});
  for(const y of [0,300,10000,100,0]){
   await page.evaluate(y=>window.scrollTo(0,y),y);await page.waitForTimeout(60);
   const r=await page.evaluate(()=>{const b=document.querySelector('#activeTicketBar'),n=document.querySelector('nav'),br=b.getBoundingClientRect(),nr=n.getBoundingClientRect(),button=b.querySelector('[data-review-edit]'),r=button.getBoundingClientRect();return {gap:nr.top-br.bottom,top:br.top,navBottom:nr.bottom,viewport:innerHeight,sameParent:b.parentElement===n.parentElement,hit:button.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))}});
   assert.ok(r.sameParent);assert.ok(Math.abs(r.gap)<1);assert.ok(r.top>=0);assert.ok(Math.abs(r.navBottom-r.viewport)<1);assert.ok(r.hit,'View ticket remains unobscured');
  }
 }
 // Simulate a changing safe-area/tab height, including text wrapping after rotation.
 await page.locator('nav').evaluate(n=>n.style.paddingBottom='41px');await page.waitForTimeout(100);
 assert.ok(await page.evaluate(()=>Math.abs(document.querySelector('#activeTicketBar').getBoundingClientRect().bottom-document.querySelector('nav').getBoundingClientRect().top)<1));
 fs.mkdirSync('football/test-artifacts',{recursive:true});await page.screenshot({path:`football/test-artifacts/${width}-ticket-dock.png`});
 await click('[data-review-edit]');assert.equal(await page.locator('#ticketSheet').evaluate(d=>d.open),true);await click('[data-review-close]');
 assert.equal(await page.evaluate(()=>JSON.stringify(tickets)),saved);assert.deepEqual(errors,[]);await page.close();console.log('PASS fixed ticket dock scroll/resize '+width);
}}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
