const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});try{for(const width of [320,375,430]){
 const page=await browser.newPage({viewport:{width,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.FOOTBALL_URL||'http://127.0.0.1:8765/football/');await page.waitForFunction(()=>data?.games?.length);
 const click=async s=>page.locator(s).first().click();
 assert.equal(await page.locator('[data-briefing]').count(),3);assert.match(await page.locator('[data-briefing=picks]').innerText(),/13/);
 const original=await page.evaluate(()=>JSON.stringify({tickets,pool}));
 fs.mkdirSync('football/test-artifacts',{recursive:true});await page.screenshot({path:`football/test-artifacts/${width}-briefing-home.png`});
 for(const kind of ['games','picks','combos']){
  await click('[data-briefing='+kind+']');assert.equal(await page.locator('#ticketSheet').evaluate(d=>d.open),true);
  assert.ok(await page.locator('#ticketSheet .briefing-item').count()>0);assert.equal(await page.locator('#ticketSheet').evaluate(d=>d.scrollWidth>d.clientWidth+1),false);
  await page.screenshot({path:`football/test-artifacts/${width}-briefing-${kind}.png`});
  await page.keyboard.press('Escape');assert.equal(await page.locator('#ticketSheet').evaluate(d=>d.open),false);assert.equal(await page.locator('[data-briefing='+kind+']').evaluate(b=>b===document.activeElement),true);
 }
 await click('[data-briefing=games]');await click('[data-briefing-go=games]');assert.equal(await page.locator('.game-research').count(),13);
 assert.equal(await page.locator('.game-research>.market-strip').count(),13);
 const card=page.locator('.game-research').first();await card.locator('[data-research-group]>summary').click();await card.locator('[data-research=injuries]>summary').click();
 assert.match(await card.locator('.player-row').first().innerText(),/David Montgomery[\s\S]*Running back \(RB\)[\s\S]*Out/);
 await card.locator('[data-research=injuries]').scrollIntoViewIfNeeded();await page.screenshot({path:`football/test-artifacts/${width}-player-availability.png`});
 await card.locator('[data-research=form]>summary').click();assert.ok(await card.locator('[data-research=injuries]').getAttribute('open')!==null);
 assert.doesNotMatch(await card.locator('[data-research=form] .details').innerText(),/Entering Week/);
 assert.equal(await card.locator('[data-research=form] .source-disclosure').getAttribute('open'),null);
 assert.equal(await card.locator('[data-research=form] .source-disclosure .chev').evaluate(e=>getComputedStyle(e).transform),'none');
 await card.locator('[data-research=market]>summary').click();assert.equal(await card.locator('.quote-table [role=row]').count(),3);
 await card.locator('[data-research=market]').scrollIntoViewIfNeeded();await page.screenshot({path:`football/test-artifacts/${width}-market-comparison.png`});
 assert.equal(await page.evaluate(()=>JSON.stringify({tickets,pool})),original);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
 await click('nav [data-tab=picks]');assert.equal(await page.locator('.pick-card>.market-strip').count(),13);assert.equal(await page.evaluate(()=>data.games.filter(forecast).length),0);
 assert.deepEqual(errors,[]);await page.close();console.log('PASS research briefings and player/market display '+width);
}}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
