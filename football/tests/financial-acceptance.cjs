const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:390,height:844}});
 try{
 await require('./select-week-fixture.cjs')(page);
 await page.goto((process.env.FOOTBALL_URL||'http://127.0.0.1:8765/football/'),{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>typeof analyzePlan==='function'&&typeof realizedNet==='function'&&typeof data!=='undefined'&&data?.comboCandidates?.length>0);
 const results=await page.evaluate(()=>{
 const test=(name,actual,expected)=>({name,actual,expected,pass:Math.abs(actual-expected)<0.00001});
 const base={stake:6,status:'purchased',remainingFraction:0.5,events:[{kind:'sale',portion:0.5,proceeds:7.32,fee:0.2}]};
 const one={stake:2,status:'won',proceeds:3.95,events:[]};
 const loss={stake:2,status:'lost',proceeds:0,events:[]};
 const done={...base,status:'won',remainingFraction:0,settlementProceeds:1,settlementFee:0.1};
 const closedSale={...base,status:'sold',remainingFraction:0,events:[...base.events,{kind:'sale',portion:0.5,proceeds:1,fee:0}]};
 const a=analyzePlan(data.comboCandidates.filter(t=>['A1','A2'].includes(t.id)));
 return [test('legacy executed full sale',realizedNet({stake:2,status:'sold',proceeds:3,fee:.1}),.9),test('entry fee allocation',realizedNet({...base,fee:.4}),3.92),test('win',realizedNet(one),1.95),test('loss',realizedNet(loss),-2),test('partial sale realized',realizedNet(base),4.12),test('partial sale open basis',base.stake*remaining(base),3),test('final settlement with partial sale',realizedNet(done),2.02),test('two executed sales',realizedNet(closedSale),2.12),test('shared Giants scenario best',a.best,4.95),test('shared Giants scenario worst',a.worst,-4)];
 });
 for(const r of results){console.log((r.pass?'PASS':'FAIL')+' '+r.name+' actual='+r.actual+' expected='+r.expected);assert.ok(r.pass,r.name)}
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
