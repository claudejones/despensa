const{chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']});try{for(const width of [320,375,430]){
const page=await browser.newPage({viewport:{width,height:780}}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',async d=>{errors.push('Native dialog: '+d.message());await d.dismiss()});
await page.goto(process.env.FOOTBALL_URL||'http://127.0.0.1:8765/football/');await page.waitForFunction(()=>data?.games?.length);
const original=await page.evaluate(()=>JSON.stringify({tickets,pool,funding,learning}));await page.locator('[data-action=settings]').click();
assert.doesNotMatch(await page.locator('#view').innerText(),/Team presentation|Choose NFL week|Open Performance/);
await page.locator('#prefStart').selectOption('picks');await page.locator('#prefResearch').selectOption('all');await page.locator('#prefPulse').uncheck();await page.locator('#prefTime').selectOption('24');
assert.match(await page.locator('#timePreview').innerText(),/19:20/);assert.equal(await page.locator('[data-preference]').count(),5);
await page.screenshot({path:`football/test-artifacts/${width}-settings-preferences.png`,fullPage:true});
await page.locator('nav [data-tab=games]').click();assert.doesNotMatch(await page.locator('#status').innerText(),/AM|PM/);
await page.reload();await page.waitForFunction(()=>data?.games?.length);assert.equal(await page.locator('nav .active').getAttribute('data-tab'),'picks');assert.equal(await page.locator('.pick-card [data-open-detail]').count(),13);
await page.locator('nav [data-tab=games]').click();await page.locator('.research-detail-link').first().click();assert.equal(await page.locator('[data-research][open]').count(),5);await page.locator('[data-research=form]>summary').first().click();await page.evaluate(()=>icons());assert.equal(await page.locator('[data-research=form]').first().getAttribute('open'),null,'Manual collapse respected');
assert.equal(await page.evaluate(()=>preferences.updateAnimation),false);assert.equal(await page.evaluate(()=>(()=>{const h=document.createElement('div');h.className='update-pulse';h.innerHTML='<span class="update-dot"></span>';document.body.append(h);const name=getComputedStyle(h.firstChild).animationName;h.remove();return name})()),'none');
await page.locator('[data-review-close]').click();
// The actual duplicate-game guard opens an app modal, preserving selections.
await page.evaluate(()=>{const g=data.games[0];tickets=[{id:'test-a',week:6,status:'draft',legs:[{gameId:g.id,team:g.away.name,side:'YES'}]},{id:'test-b',week:6,status:'draft',legs:[{gameId:g.id,team:g.home.name,side:'YES'}]}];comboSelection.add('test-a');comboSelection.add('test-b');combineDrafts()});
await page.locator('#appMessage').waitFor();assert.match(await page.locator('#appMessageText').innerText(),/one selection per game/);assert.equal(await page.evaluate(()=>tickets.length),2);
await page.screenshot({path:`football/test-artifacts/${width}-custom-error.png`});await page.keyboard.press('Escape');await page.locator('#appMessage').waitFor({state:'detached'});
// A validation error leaves the underlying ticket sheet and typed name intact.
await page.evaluate(()=>{openReviewSheet('Edit draft ticket','<label>Name<input id="retainedName" value="My combo"></label>');appAlert('Enter a valid stake.')});await page.locator('#appMessage').waitFor();await page.locator('[data-message-ok]').click();assert.equal(await page.locator('#retainedName').inputValue(),'My combo');assert.equal(await page.locator('#ticketSheet').evaluate(d=>d.open),true);await page.locator('[data-review-close]').click();
await page.evaluate(()=>{window.confirmResult=null;appConfirm('Replace local ticket records?').then(r=>window.confirmResult=r)});await page.locator('[data-message-cancel]').click();await page.waitForFunction(()=>window.confirmResult===false);
// Reset test-only ticket objects; preferences must never touch personal data.
await page.evaluate(original=>{const x=JSON.parse(original);tickets=x.tickets;pool=x.pool;funding=x.funding;learning=x.learning},original);
assert.equal(await page.evaluate(()=>JSON.stringify({tickets,pool,funding,learning})),original);
await page.locator('[data-action=settings]').click();await page.locator('#prefResearch').selectOption('collapsed');await page.locator('#prefTime').selectOption('12');await page.locator('nav [data-tab=games]').click();assert.equal(await page.locator('[data-research][open]').count(),0);assert.match(await page.locator('.kickoff-row').first().innerText(),/AM/);
assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);assert.deepEqual(errors,[]);await page.close();console.log('PASS preferences and app modals '+width);
}}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
