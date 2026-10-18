const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});try{
const page=await browser.newPage({viewport:{width:375,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(process.env.FOOTBALL_URL||'http://127.0.0.1:8765/football/');await page.waitForFunction(()=>data?.games?.length);
const d=await page.evaluate(()=>data),ids=new Set(d.sources.map(s=>s.id));
assert.equal(d.games.length,13);assert.equal(d.completedGames.length,1);assert.equal(d.marketSnapshots.length,26);
for(const g of d.games){assert.equal(g.insights.length,5);for(const i of g.insights)for(const id of i.sourceIds)assert.ok(ids.has(id));}
for(const p of d.predictions){assert.equal(p.validated,false);assert.equal(p.probability,null);assert.ok(new Date(p.frozenAt)<new Date(d.games.find(g=>g.id===p.gameId).kickoff));}
for(const q of d.marketSnapshots){assert.ok(q.yesBid<=q.yesAsk);assert.equal(q.executableNow,false);assert.equal(q.feesIncluded,false);}
assert.match(await page.locator('#status').innerText(),/refreshed/);
await page.locator('nav [data-tab=picks]').click();assert.equal(await page.locator('.pick-card').count(),13);
assert.equal(await page.getByText('AI RESEARCH LEAN',{exact:true}).count(),13);assert.equal(await page.getByText('Not published',{exact:true}).count(),13);
assert.equal(await page.evaluate(()=>data.games.filter(forecast).length),0);
await page.locator('.pick-card details summary').first().click();assert.ok(await page.locator('.pick-card').first().locator('a[href^="https:"]').count());
fs.mkdirSync('football/test-artifacts',{recursive:true});await page.screenshot({path:'football/test-artifacts/research-ai-375.png'});
await page.locator('nav [data-tab=games]').click();await page.getByText('Market & Probability',{exact:true}).first().click();await page.screenshot({path:'football/test-artifacts/research-market-375.png'});
await page.locator('nav [data-tab=combos]').click();await page.locator('[data-plan=A]').click();assert.ok(await page.getByText('Research review',{exact:true}).count());
assert.deepEqual(errors,[]);console.log('PASS refreshed research: source references, provenance, qualitative-only forecasts, market snapshots, combo review');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
