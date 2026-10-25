const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});try{
for(const width of [320,375,430]){
 const p=await b.newPage({viewport:{width,height:844},isMobile:true,hasTouch:true}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await require('./select-week-fixture.cjs')(p);await p.goto(process.env.FOOTBALL_URL||'http://127.0.0.1:8765/football/');await p.waitForFunction(()=>data?.week===6);
 for(const status of ['draft','purchased','lost'])for(const count of [1,2]){
  await p.evaluate(({status,count})=>{const games=data.games.slice(0,count);tickets=[{id:'research-test',title:'Research test ticket',season:data.season,week:data.week,type:count===1?'Single Game Bet':'Combo',status,stake:2,payout:8,fee:0,proceeds:status==='lost'?0:null,legs:games.map(g=>({gameId:g.id,team:g.home.name,side:'YES',kickoff:g.kickoff})),events:[]}];save();tab='kalshi';kalshiStage=status==='draft'?'build':status==='purchased'?'monitor':'close';render();icons();},{status,count});
  await p.locator('[data-ticket-details="research-test"]').click();assert.equal(await p.locator('[data-ticket-research]').count(),count);
  if(status==='draft'){await p.getByText('Ticket pricing',{exact:true}).click();await p.locator('[data-field=payout]').fill('9.25');await p.locator('[data-leg-quote]').first().fill('48.5');await p.locator('[data-field=payout]').click();}
  for(let leg=0;leg<count;leg++){
   const button=p.locator('[data-ticket-research]').nth(leg);await button.scrollIntoViewIfNeeded();const y=await p.locator('.sheet-content').evaluate(e=>e.scrollTop);
   await button.click();const before=await p.evaluate(()=>JSON.stringify(tickets));
   assert.equal(await p.locator('dialog[open]').count(),1);assert.equal(await p.locator('#ticketSheetTitle').innerText(),'Game research');assert.equal(await p.locator('.sheet-content').evaluate(e=>e.scrollTop),0);
   const expected=await p.evaluate(i=>data.games[i].home.name,leg);assert.match(await p.locator('.sheet-content').innerText(),new RegExp(expected));assert.match(await p.locator('.sheet-content').innerText(),/Research updated|Research timestamp unavailable/);
   await p.locator('[data-research=form]>summary').click();await p.locator('.sheet-content').evaluate(e=>e.scrollTop=e.scrollHeight);
   assert.equal(await p.locator('[data-back-to-ticket]').isVisible(),true);assert.ok(await p.locator('[data-back-to-ticket]').evaluate(e=>e.getBoundingClientRect().height>=44));
   assert.equal(await p.evaluate(()=>document.querySelector('#ticketSheet').scrollWidth<=document.querySelector('#ticketSheet').clientWidth),true);
   if(status==='purchased'&&count===2&&leg===0){await p.locator('.sheet-content').evaluate(e=>e.scrollTop=0);fs.mkdirSync('football/test-artifacts',{recursive:true});await p.screenshot({path:`football/test-artifacts/ticket-research-${width}.png`});}
   await p.locator('[data-back-to-ticket]').click();assert.equal(await p.locator('#ticketSheetTitle').innerText(),'Research test ticket');assert.ok(Math.abs(await p.locator('.sheet-content').evaluate(e=>e.scrollTop)-y)<2);assert.equal(await button.evaluate(e=>document.activeElement===e),true);assert.equal(await p.evaluate(()=>JSON.stringify(tickets)),before);
  }
  if(status==='draft'){assert.equal(await p.locator('[data-field=payout]').inputValue(),'9.25');assert.equal(await p.locator('[data-leg-quote]').first().inputValue(),'48.5');assert.equal(await p.locator('[data-field=payout]').isVisible(),true);}
  await p.locator('[data-ticket-research]').first().click();await p.keyboard.press('Escape');await p.waitForFunction(()=>!document.querySelector('#ticketSheet').open);await p.locator('[data-ticket-details="research-test"]').click();assert.equal(await p.locator('[data-back-to-ticket]').count(),0);await p.locator('[data-review-close]').click();
 }
 await p.evaluate(()=>{tickets[0].legs[0].gameId='missing-game';render();icons()});await p.locator('[data-ticket-details]').click();assert.match(await p.locator('.sheet-content').innerText(),/Game research unavailable/);assert.equal(await p.locator('[data-research-leg="0"]').count(),0);await p.locator('[data-review-close]').click();
 assert.deepEqual(errors,[]);await p.close();console.log('PASS ticket research navigation, state preservation and missing game '+width);
}
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
