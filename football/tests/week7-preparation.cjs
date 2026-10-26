const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});try{
 for(const width of [320,375,430]){
 const p=await b.newPage({viewport:{width,height:844}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await require('./select-week-fixture.cjs')(p);
 await p.goto(process.env.FOOTBALL_URL||'http://127.0.0.1:8765/football/');await p.waitForFunction(()=>data?.week===6);
 assert.equal(await p.evaluate(()=>data.games.find(g=>g.home.name==='San Francisco 49ers').home.record),'6-0-0');
 await p.evaluate(()=>localStorage.setItem('week7-preservation-sentinel','keep'));
 await p.locator('[data-action=calendar]').first().click();await p.locator('[data-week="07"]').click();await p.waitForFunction(()=>data?.week===7);
 assert.match(await p.locator('#view').innerText(),/Combo quotes not yet available/);assert.equal(await p.evaluate(()=>data.games.length),14);assert.equal(await p.evaluate(()=>data.predictions.length),14);assert.equal(await p.evaluate(()=>data.marketSnapshots.length),28);
 await p.locator('nav [data-tab=games]').click();assert.ok(await p.locator('.team img').count()>=28);
 const current=await p.evaluate(()=>data),tnf=current.games.find(g=>g.id==='ne-chi'),lean=current.predictions.find(x=>x.gameId==='ne-chi');
 assert.equal(tnf.status,'final');assert.equal(tnf.away.score,24);assert.equal(tnf.home.score,30);assert.equal(tnf.result.verified,true);assert.equal(current.coverage.upcomingGames,1);assert.equal(current.coverage.completedGames,13);assert.equal(current.marketSettlements.length,26);for(const q of current.marketSettlements){const g=current.games.find(g=>g.id===q.gameId),winner=g.away.score>g.home.score?g.away.name:g.home.name;assert.equal(g.status,'final');assert.equal(g.result.verified,true);assert.equal(q.status,'finalized');assert.equal(q.result,q.team===winner?'yes':'no');assert.equal(q.settlementValue,q.team===winner?1:0);}const snf=current.games.find(g=>g.id==='kc-sea');assert.equal(snf.status,'final');assert.equal(snf.away.score,3);assert.equal(snf.home.score,20);assert.equal(snf.result.verified,true);assert.equal(snf.away.record,'5-1-0');assert.equal(snf.home.record,'4-3-0');assert.equal(current.games.find(g=>g.id==='dal-phi').status,'scheduled');assert.notEqual(current.status,'closed');assert.equal(lean.winner,'Chicago Bears');assert.equal(lean.probability,null);
 for(const name of ['Ben Brown','Alijah Vera-Tucker','Carlton Davis III','Kyle Monangai','Jack Sanborn'])assert.equal(tnf.availability.find(x=>x.name===name).status,'Out');
 assert.equal(tnf.availability.find(x=>x.name==='T.J. Edwards').status,'Doubtful');assert.match(tnf.researchLimitations.join(' '),/inactive/i);
 assert.ok(new Date(lean.frozenAt)<new Date(tnf.kickoff));assert.equal(current.marketSnapshots.length,28);assert.ok(current.marketSnapshotHistory.length>=28);
 const revision=current.researchRevisions.find(r=>r.previousSnapshotPath==='2026/history/week-07-before-20261022-thursday.json');assert.ok(revision.previousSnapshotPath);
 const baseline=await p.evaluate(async path=>(await fetch('./data/'+path)).json(),revision.previousSnapshotPath);
 assert.equal(baseline.predictions.find(x=>x.gameId==='ne-chi').frozenAt,'2026-10-19T06:05:00-05:00');
 assert.deepEqual(current.comboCandidates.map(({id,legs,quoteSnapshot,generatedAt})=>({id,legs,quoteSnapshot,generatedAt})),baseline.comboCandidates.map(({id,legs,quoteSnapshot,generatedAt})=>({id,legs,quoteSnapshot,generatedAt})));for(const g of current.games.filter(g=>g.status==='scheduled')){assert.ok(g.researchReviewedAt);assert.ok(g.sourceIds.includes('weekend-injuries'));assert.ok(current.predictions.find(p=>p.gameId===g.id).opposingEvidence.length);}
 const ledger=await p.evaluate(async()=>(await fetch('./data/2026/ai-paper.json')).json());
 const archived=ledger.entries.find(x=>x.id==='2026:7:single:ne-chi');assert.equal(archived.publishedAt,'2026-10-19T06:05:00-05:00');assert.equal(archived.quote.price,0.61);

 assert.equal(await p.evaluate(()=>data.games.find(g=>g.id==='sf-atl').away.record),'6-1-0');
 await p.locator('.research-detail-link').first().click();assert.match(await p.locator('#ticketSheet').innerText(),/Week 7|designations pending|Early availability/);await p.keyboard.press('Escape');
 await p.locator('nav [data-tab=combos]').click();
 for(const key of ['A','B','C','D','E']){await p.locator(`[data-plan=${key}]`).click();assert.match(await p.locator('#view').innerText(),/Ticket quote unavailable/);assert.doesNotMatch(await p.locator('#view').innerText(),/Infinity|NaN/);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await p.locator('[data-plan-tab=outcomes]').click();assert.match(await p.locator('#view').innerText(),/not available yet/);await p.locator('[data-plan-back]').click();}
 await p.locator('nav [data-tab=games]').click();fs.mkdirSync('football/test-artifacts',{recursive:true});await p.screenshot({path:`football/test-artifacts/week7-games-${width}.png`});
 assert.equal(await p.evaluate(()=>localStorage.getItem('week7-preservation-sentinel')),'keep');assert.deepEqual(errors,[]);await p.close();}
 console.log('PASS Week 7: full slate, quotes, preliminary research, five unpriced strategies, mobile layout and storage preservation');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
