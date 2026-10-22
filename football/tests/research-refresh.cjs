const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});try{
const page=await browser.newPage({viewport:{width:375,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
await require('./select-week-fixture.cjs')(page);
 await page.goto(process.env.FOOTBALL_URL||'http://127.0.0.1:8765/football/');await page.waitForFunction(()=>data?.games?.length);
const d=await page.evaluate(()=>data),ids=new Set(d.sources.map(s=>s.id));
assert.equal(d.games.length,13);assert.equal(d.completedGames.length,1);assert.equal(d.marketSnapshots.length,26);
for(const g of d.games){assert.equal(g.insights.length,5);for(const i of g.insights)for(const id of i.sourceIds)assert.ok(ids.has(id));}
for(const p of d.predictions){assert.equal(p.validated,false);assert.equal(p.probability,null);assert.ok(new Date(p.frozenAt)<new Date(d.games.find(g=>g.id===p.gameId).kickoff));}
for(const q of d.marketSnapshots){assert.ok(q.yesBid<=q.yesAsk);assert.equal(q.executableNow,false);assert.equal(q.feesIncluded,false);}
// A closed publication must satisfy the entire slate and exact settlement gate.
const assertClosedWeek=w=>{
 assert.equal(w.status,'closed');assert.ok(Number.isFinite(Date.parse(w.closedAt)));
 const games=[...w.games,...w.completedGames],settlements=[...w.marketSettlements,...w.completedGames.flatMap(g=>g.marketSettlements||[])];
 assert.equal(games.length,w.coverage.totalWeekGames);assert.equal(new Set(games.map(g=>g.id)).size,games.length);
 assert.equal(w.coverage.completedGames,games.length);assert.equal(w.coverage.upcomingGames,0);assert.equal(w.coverage.liveGames,0);
 assert.equal(settlements.length,2*games.length);assert.equal(new Set(settlements.map(s=>s.ticker)).size,settlements.length);
 assert.equal(w.researchQuality.finalizedMarketsVerified,settlements.length);
 for(const g of games){
  assert.equal(g.status,'final');assert.equal(g.result.verified,true);assert.equal(g.result.marketScope,'full-game-winner');assert.ok(g.result.sources.length>=3);
  for(const team of [g.away,g.home])assert.ok(Number.isInteger(team.score)&&team.score>=0);
  assert.notEqual(g.away.score,g.home.score);assert.ok(Date.parse(g.kickoff)<Date.parse(g.result.verifiedAt)&&Date.parse(g.result.verifiedAt)<=Date.parse(w.closedAt));
  const ss=settlements.filter(s=>s.gameId===g.id),winner=g.away.score>g.home.score?g.away.name:g.home.name;
  assert.equal(ss.length,2);assert.deepEqual(new Set(ss.map(s=>s.team)),new Set([g.away.name,g.home.name]));
  for(const q of ss){assert.equal(q.status,'finalized');assert.equal(q.result,q.team===winner?'yes':'no');assert.equal(q.settlementValue,q.team===winner?1:0);assert.ok(q.sourceUrl.endsWith('/'+q.ticker));assert.ok(g.result.sources.includes(q.sourceUrl));assert.ok(Date.parse(q.verifiedAt)<=Date.parse(g.result.verifiedAt));}
 }
 for(const q of w.marketSnapshots)assert.equal(q.marketStatus,'finalized');
};
if(d.status==='closed'){
 assert.match(await page.locator('#status').innerText(),/Week 6 · closed ·/);assertClosedWeek(d);
 const unfinished=structuredClone(d);unfinished.games[0].status='live';assert.throws(()=>assertClosedWeek(unfinished));
 const wrongSettlement=structuredClone(d);wrongSettlement.marketSettlements[0].result=wrongSettlement.marketSettlements[0].result==='yes'?'no':'yes';assert.throws(()=>assertClosedWeek(wrongSettlement));
 const missingContract=structuredClone(d);missingContract.marketSettlements.pop();assert.throws(()=>assertClosedWeek(missingContract));
}else{assert.equal(d.status,'refreshed');assert.match(await page.locator('#status').innerText(),/refreshed/);}
await page.locator('nav [data-tab=picks]').click();assert.equal(await page.locator('.pick-card').count(),13);
assert.equal(await page.getByText('AI RESEARCH LEAN',{exact:true}).count(),13);assert.equal(await page.getByText('Not published',{exact:true}).count(),13);
assert.equal(await page.evaluate(()=>data.games.filter(forecast).length),0);
await page.locator('.pick-card [data-open-detail]').first().click();assert.ok(await page.locator('#ticketSheet').locator('a[href^="https:"]').count());
fs.mkdirSync('football/test-artifacts',{recursive:true});await page.screenshot({path:'football/test-artifacts/research-ai-375.png'});
await page.locator('[data-review-close]').click();await page.locator('nav [data-tab=games]').click();await page.locator('.research-detail-link').first().click();await page.getByText('Market & Probability',{exact:true}).first().click();await page.screenshot({path:'football/test-artifacts/research-market-375.png'});
await page.locator('[data-review-close]').click();await page.locator('nav [data-tab=combos]').click();await page.locator('[data-plan=A]').click();assert.ok(await page.getByText('Research review',{exact:true}).count());
assert.deepEqual(errors,[]);console.log('PASS refreshed research: source references, provenance, qualitative-only forecasts, market snapshots, combo review');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
