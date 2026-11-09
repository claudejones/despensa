const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch();try{
 const p=await b.newPage({viewport:{width:375,height:812}});await require('./select-week-fixture.cjs')(p,'09');
 await p.goto(process.env.FOOTBALL_URL||'http://127.0.0.1:8765/football/');await p.waitForFunction(()=>data?.week===9);
 await p.locator('nav [data-tab=kalshi]').click();await p.locator('#custom').click();
 await p.locator('#buildName').fill('Two weeks');await p.locator('#buildType').selectOption('Combo');
 await p.locator('.legGame').selectOption('buf-min');await p.locator('[data-outcome-choice=home]').click();
 await p.locator('[data-builder=addLeg]').click();const row=p.locator('.build-leg').last();
 await row.locator('.legWeek').selectOption('10');await row.locator('.legGame').selectOption('wsh-nyg');
 await row.getByRole('button',{name:'New York Giants — To win',exact:true}).click();await p.locator('#buildPayout').fill('8');
 await p.locator('[data-builder=save]').click();await p.reload();await p.waitForFunction(()=>data?.week===9);
 const t=await p.evaluate(()=>tickets.find(t=>t.title==='Two weeks'));assert.deepEqual(t.legs.map(l=>[l.week,l.team]),[[9,'Minnesota Vikings'],[10,'New York Giants']]);assert.equal(t.week,9);assert.equal(t.payout,8);
 assert.equal(await p.evaluate(t=>{const g={id:'wsh-nyg',home:{name:'New York Giants',score:14},away:{name:'Washington Commanders',score:21},status:'final',result:{verified:true,marketScope:'full-game-winner',sources:['test']}};t.status='purchased';return !losingFinal(t,{season:2026,week:9,games:[g]})&&!!losingFinal(t,{season:2026,week:10,games:[g]})},t),true);
 console.log('PASS cross-week combo persistence and week-specific reconciliation');
 }finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
