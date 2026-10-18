const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});
 const errors=[];let passed=0;fs.mkdirSync('football/test-artifacts',{recursive:true});
 try{
 for(const width of [320,375,390,430]){
  const page=await browser.newPage({viewport:{width,height:844},deviceScaleFactor:1});
  page.on('pageerror',e=>errors.push(width+': '+e.message));
  await page.goto((process.env.FOOTBALL_URL||'http://127.0.0.1:8765/football/'),{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(700);
  assert.equal(await page.locator('nav [data-tab]').count(),5,'five bottom tabs');
  assert.equal(await page.locator('#week').inputValue(),'06','default week');
  assert.ok(await page.locator('#view').innerText(),'home rendered');assert.equal(await page.locator('header svg').count(),2,'bundled header icons');
  await page.locator('[data-action=calendar]').first().click();
  assert.match(await page.locator('#view').innerText(),/Season Overview/);
  await page.locator('[data-action=calendar]').first().click();
  assert.doesNotMatch(await page.locator('#view').innerText(),/Season Summary/);
  await page.locator('[data-tab=games]').first().click();
  assert.ok((await page.locator('.research-detail-link').count())>0,'game detail drawers');
  await page.locator('[data-tab=picks]').first().click();
  await page.locator('[data-picks-view=pool]').click();
  const picks=page.locator('[data-pool]');assert.ok((await picks.count())>=2);
  await picks.first().click();assert.equal(await page.locator('[data-pool].selected').count(),1);
  await picks.first().click();assert.equal(await page.locator('[data-pool].selected').count(),0);
  await page.locator('[data-tab=combos]').first().click();
  await page.locator('[data-plan=A]').first().click();
  assert.match(await page.locator('#view').innerText(),/Plan A/);
  await page.locator('[data-plan-tab=outcomes]').click();
  assert.match(await page.locator('#view').innerText(),/Shared exposure/);
  await page.locator('[data-tab=kalshi]').first().click();
  assert.equal(await page.locator('[data-kalshi-stage]').count(),4);
  await page.locator('[data-kalshi-stage=monitor]').click();
  await page.locator('[data-action=settings]').first().click();
  assert.match(await page.locator('#view').innerText(),/Personal data/);
  // Approved design contract: light-only Settings, compact matchup presentation,
  // independent research accordions, season summary and accessible Office Pool controls.
  await page.locator('[data-action=calendar]').first().click();
  await page.locator('[data-season-mode=summary]').click();
  assert.match(await page.locator('#view').innerText(),/Season Summary|Realized P&L|Performance Dashboard/);
  await page.locator('[data-action=calendar]').first().click();
  await page.locator('[data-tab=games]').first().click();
  assert.ok(await page.locator('.team img').count()>=2,'team logos rendered');
  assert.ok(await page.locator('.time-pill').count()>=1,'game time pill');
  await page.locator('.research-detail-link').first().click();
  const accordions=page.locator('#ticketSheet .research-acc');
  assert.ok(await accordions.count()>=2,'research categories independently expandable');
  await accordions.first().locator(':scope > summary').click();
  assert.ok(await accordions.first().getAttribute('open')!==null,'research accordion expands');
  await page.locator('[data-review-close]').click();
  await page.locator('[data-tab=picks]').first().click();
  await page.locator('[data-picks-view=pool]').click();
  const copyPosition=await page.locator('.copybar').evaluate(el=>getComputedStyle(el).position);assert.equal(copyPosition,'static','office pool summary must not overlay picks');
  const pair=page.locator('.pool-card').first().locator('[data-pool]');
  assert.equal(await pair.count(),2,'two equal-choice buttons');
  const sizes=await pair.evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().width));
  assert.ok(Math.abs(sizes[0]-sizes[1])<3,'equal width office pool controls');
  await page.locator('[data-action=settings]').first().click();
  const settingsText=await page.locator('#view').innerText();
  assert.doesNotMatch(settingsText,/Dark mode|Swipe between|Enable swipe/i,'no removed settings');
  assert.match(settingsText,/Export my data|Import backup/i,'backup controls visible');
  const layout=await page.evaluate(()=>{const nav=document.querySelector('nav'),buttons=[...nav.querySelectorAll('[data-tab]')],r=nav.getBoundingClientRect(),rects=buttons.map(b=>b.getBoundingClientRect());return {position:getComputedStyle(nav.parentElement).position,bottom:r.bottom,viewportHeight:innerHeight,columns:getComputedStyle(nav).gridTemplateColumns.split(' ').length,navWidth:r.width,viewport:innerWidth,minTouch:Math.min(...rects.map(x=>x.height)),overlap:rects.some((x,i)=>rects.some((y,j)=>j>i&&x.left<y.right-1&&x.right>y.left+1)),visible:rects.every(x=>x.left>=-1&&x.right<=innerWidth+1)}});assert.equal(layout.position,'fixed','bottom dock fixed');assert.ok(Math.abs(layout.bottom-layout.viewportHeight)<1,'tabs anchored at viewport bottom');assert.equal(layout.columns,5,'five equal nav columns');assert.ok(layout.minTouch>=43,'touch target at least 43px');assert.equal(layout.overlap,false,'no overlapping tab targets');assert.equal(layout.visible,true,'all tabs visible');
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
  assert.equal(overflow,false,'no horizontal overflow at '+width);
  for(const [screen,selector] of [['home','[data-tab=weeks]'],['games','[data-tab=games]'],['picks','[data-tab=picks]'],['combos','[data-tab=combos]'],['kalshi','[data-tab=kalshi]']]){await page.locator(selector).first().click();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'no overflow: '+screen+' '+width);await page.screenshot({path:'football/test-artifacts/'+width+'-'+screen+'.png',fullPage:true})}await page.locator('[data-action=calendar]').first().click();await page.screenshot({path:'football/test-artifacts/'+width+'-season.png',fullPage:true});await page.locator('[data-action=settings]').first().click();await page.screenshot({path:'football/test-artifacts/'+width+'-settings.png',fullPage:true});passed++;await page.close();
 }
 assert.deepEqual(errors,[],'no browser page errors');
 console.log('PASS '+passed+' mobile viewports');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
