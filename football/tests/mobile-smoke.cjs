const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const errors=[];let passed=0;
 try{
 for(const width of [320,375,390,430]){
  const page=await browser.newPage({viewport:{width,height:844},deviceScaleFactor:1});
  page.on('pageerror',e=>errors.push(width+': '+e.message));
  await page.goto('http://127.0.0.1:8765/football/',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(700);
  assert.equal(await page.locator('nav [data-tab]').count(),5,'five bottom tabs');
  assert.equal(await page.locator('#week').inputValue(),'06','default week');
  assert.ok(await page.locator('#view').innerText(),'home rendered');
  await page.locator('[data-action=calendar]').first().click();
  assert.match(await page.locator('#view').innerText(),/Season Overview/);
  await page.locator('[data-action=calendar]').first().click();
  assert.doesNotMatch(await page.locator('#view').innerText(),/Season Summary/);
  await page.locator('[data-tab=games]').first().click();
  assert.ok((await page.locator('.research-acc').count())>0,'game accordions');
  await page.locator('[data-tab=picks]').first().click();
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
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
  assert.equal(overflow,false,'no horizontal overflow at '+width);
  passed++;await page.close();
 }
 assert.deepEqual(errors,[],'no browser page errors');
 console.log('PASS '+passed+' mobile viewports');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
