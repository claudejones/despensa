const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});try{
 for(const width of [320,375,430]){
 const p=await b.newPage({viewport:{width,height:844}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto(process.env.FOOTBALL_URL||'http://127.0.0.1:8765/football/');await p.waitForFunction(()=>data?.week===6);
 assert.equal(await p.evaluate(()=>data.games.find(g=>g.home.name==='San Francisco 49ers').home.record),'6-0-0');
 await p.evaluate(()=>localStorage.setItem('week7-preservation-sentinel','keep'));
 await p.locator('[data-action=calendar]').first().click();await p.locator('[data-week="07"]').click();await p.waitForFunction(()=>data?.week===7);
 assert.match(await p.locator('#view').innerText(),/Combo quotes not yet available/);assert.equal(await p.evaluate(()=>data.games.length),14);assert.equal(await p.evaluate(()=>data.predictions.length),14);assert.equal(await p.evaluate(()=>data.marketSnapshots.length),28);
 await p.locator('nav [data-tab=games]').click();assert.ok(await p.locator('.team img').count()>=28);
 assert.equal(await p.evaluate(()=>data.games.find(g=>g.id==='sf-atl').away.record),'6-0-0');
 await p.locator('.research-detail-link').first().click();assert.match(await p.locator('#ticketSheet').innerText(),/Week 7|designations pending|Early availability/);await p.keyboard.press('Escape');
 await p.locator('nav [data-tab=combos]').click();
 for(const key of ['A','B','C','D','E']){await p.locator(`[data-plan=${key}]`).click();assert.match(await p.locator('#view').innerText(),/Ticket quote unavailable/);assert.doesNotMatch(await p.locator('#view').innerText(),/Infinity|NaN/);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await p.locator('[data-plan-tab=outcomes]').click();assert.match(await p.locator('#view').innerText(),/not available yet/);await p.locator('[data-plan-back]').click();}
 await p.locator('nav [data-tab=games]').click();fs.mkdirSync('football/test-artifacts',{recursive:true});await p.screenshot({path:`football/test-artifacts/week7-games-${width}.png`});
 assert.equal(await p.evaluate(()=>localStorage.getItem('week7-preservation-sentinel')),'keep');assert.deepEqual(errors,[]);await p.close();}
 console.log('PASS Week 7: full slate, quotes, preliminary research, five unpriced strategies, mobile layout and storage preservation');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
