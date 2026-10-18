const{chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});try{for(const width of [320,375,430]){
const page=await browser.newPage({viewport:{width,height:780}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(process.env.FOOTBALL_URL||'http://127.0.0.1:8765/football/');await page.waitForFunction(()=>data?.games?.length);
const original=await page.evaluate(()=>JSON.stringify({tickets,pool}));
assert.equal(await page.locator('.update-pill').count(),0,'First visit establishes baseline');
await page.evaluate(()=>{const copy=structuredClone(data);copy.researchedAt=new Date().toISOString();copy.researchVersion='test';copy.games[0].verifiedAt='test';copy.games[0].insights.forEach(i=>i.asOf='test');copy.predictions[0].frozenAt='test';copy.marketSnapshots.forEach(q=>{q.retrievedAt='test';q.apiUpdatedTime='test'});trackResearchChanges(copy);render();icons()});
assert.equal(await page.locator('.update-pill').count(),0,'Timestamp-only refresh has no badges');
await page.evaluate(()=>{data.games[0].availability[0].status='Questionable';data.marketSnapshots[0].yesAsk+=.01;data.predictions[0].summary+=' Additional verified evidence.';data.comboCandidates[0].legs[0].marketPercent+=1;trackResearchChanges(data);render();icons()});
assert.equal(await page.locator('.update-pill').count(),3);assert.equal(await page.locator('button button').count(),0);
await page.screenshot({path:`football/test-artifacts/${width}-update-home.png`});
await page.locator('[data-research-updates=games]').click();assert.match(await page.locator('#ticketSheet').innerText(),/Player availability changed/);assert.match(await page.locator('#ticketSheet').innerText(),/YES ask:/);
await page.screenshot({path:`football/test-artifacts/${width}-update-summary.png`});await page.locator('[data-review-close]').click();assert.equal(await page.locator('.update-pill').count(),3,'Closing without marking keeps unread');
await page.locator('nav [data-tab=games]').click();assert.equal(await page.locator('[data-update-host="games:hou-jax"]>.update-pill').count(),1);
await page.locator('[data-update-host="games:hou-jax"]>.update-pill').click();await page.locator('[data-updates-reviewed]').click();assert.equal(await page.locator('.update-pill').count(),0);
await page.locator('nav [data-tab=picks]').click();assert.equal(await page.locator('.pick-card>.update-pill').count(),1);
await page.locator('nav [data-tab=combos]').click();assert.equal(await page.locator('[data-plan=A]+.update-pill').count(),1);await page.locator('[data-plan=A]').click();assert.equal(await page.locator('[data-update-host="combos:A1"]>.update-pill').count(),1);
// Reload identical changed content: unread persists, reviewed stays read.
const changed=await page.evaluate(()=>data);await page.route('**/data/2026/week-06.json*',route=>route.fulfill({json:changed}));await page.reload();await page.waitForFunction(()=>data?.games?.length);
assert.equal(await page.locator('[data-research-updates=games]').count(),0);assert.equal(await page.locator('[data-research-updates=picks]').count(),1);
await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('.update-dot').first().evaluate(e=>getComputedStyle(e).animationName),'none');
await page.locator('[data-action=calendar]').first().click();assert.equal(await page.getByText('Open selected week',{exact:false}).count(),0);await page.locator('[data-week="06"]').click();await page.waitForFunction(()=>data?.week===6);assert.equal(await page.locator('.season-weeks').count(),0);
assert.equal(await page.evaluate(()=>JSON.stringify({tickets,pool})),original);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);assert.deepEqual(errors,[]);await page.close();console.log('PASS research update indicators '+width);
}}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
