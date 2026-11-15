const { chromium } = require('playwright');
const path = '/home/claude/despensa/index.html';

(async () => {
  const b = await chromium.launch();
  const pg = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errs = [];
  pg.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  pg.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });

  await pg.goto('file://' + path);
  await pg.waitForTimeout(300);

  const step = async (label, fn) => {
    try { await fn(); console.log('  ok  ' + label); }
    catch (e) { console.log('FAIL  ' + label + ' — ' + e.message); }
  };

  console.log('--- boot ---');
  await step('empty state shows', async () => {
    const t = await pg.textContent('#main');
    if (!t.includes('No trip open')) throw new Error('got: ' + t.slice(0, 80));
  });

  console.log('--- start a trip ---');
  await step('start trip sheet opens', async () => {
    await pg.click('#startTrip');
    await pg.waitForSelector('[data-shop="chedraui"]', { timeout: 2000 });
  });
  await step('picking a shop opens planning', async () => {
    await pg.click('[data-shop="chedraui"]');
    await pg.waitForTimeout(200);
    const sub = await pg.textContent('#hSub');
    if (!sub.includes('Planning')) throw new Error('sub: ' + sub);
  });
  await step('catalogue renders by category', async () => {
    const n = await pg.locator('.row').count();
    if (n < 50) throw new Error('only ' + n + ' rows');
    console.log('      ' + n + ' catalogue rows');
  });

  console.log('--- planning ---');
  await step('marking items updates the bar', async () => {
    const picks = await pg.locator('[data-pick]').all();
    for (let i = 0; i < 5; i++) await picks[i].click();
    await pg.waitForTimeout(150);
    const bar = await pg.textContent('#bar');
    if (!bar.includes('5')) throw new Error('bar: ' + bar.replace(/\s+/g, ' ').slice(0, 120));
  });
  await step('unmark works', async () => {
    const picks = await pg.locator('[data-pick]').all();
    await picks[4].click();
    await pg.waitForTimeout(120);
    const bar = await pg.textContent('#bar');
    if (!bar.includes('4')) throw new Error('bar: ' + bar.replace(/\s+/g, ' ').slice(0, 120));
  });

  console.log('--- shopping ---');
  await step('start shopping filters to marked items', async () => {
    await pg.click('#goShop');
    await pg.waitForTimeout(200);
    const n = await pg.locator('.row').count();
    if (n !== 4) throw new Error('expected 4 rows, got ' + n);
  });
  await step('checking off updates basket', async () => {
    const g = await pg.locator('[data-got]').all();
    await g[0].click(); await g[1].click();
    await pg.waitForTimeout(150);
    const bar = await pg.textContent('#bar');
    if (!bar.includes('2 of 4')) throw new Error('bar: ' + bar.replace(/\s+/g, ' ').slice(0, 140));
  });
  await step('price edit saves and marks bought', async () => {
    await pg.locator('[data-price]').nth(2).click();
    await pg.waitForSelector('#pIn');
    await pg.fill('#pIn', '123.45');
    await pg.click('#pSave');
    await pg.waitForTimeout(200);
    const bar = await pg.textContent('#bar');
    if (!bar.includes('3 of 4')) throw new Error('bar: ' + bar.replace(/\s+/g, ' ').slice(0, 140));
  });
  await step('skip via the name sheet', async () => {
    await pg.locator('[data-open]').nth(3).click();
    await pg.waitForSelector('#skYes');
    await pg.click('#skYes');
    await pg.waitForTimeout(200);
    const bar = await pg.textContent('#bar');
    if (!bar.includes('Skipped')) throw new Error('bar: ' + bar.replace(/\s+/g, ' ').slice(0, 160));
  });
  await step('add from catalogue mid-trip', async () => {
    await pg.click('#addMore');
    await pg.waitForSelector('#addSearch');
    await pg.fill('#addSearch', 'salmon');
    await pg.waitForTimeout(150);
    const vis = await pg.locator('#addList [data-add]:visible').count();
    if (vis < 1) throw new Error('search found nothing');
    await pg.locator('#addList [data-add]:visible').first().click();
    await pg.waitForTimeout(200);
    const n = await pg.locator('.row').count();
    if (n !== 5) throw new Error('expected 5 rows, got ' + n);
  });

  console.log('--- closing ---');
  await step('close sheet computes off-list', async () => {
    await pg.click('#closeTrip');
    await pg.waitForSelector('#cTot');
    await pg.fill('#cTot', '2000');
    await pg.waitForTimeout(150);
    const c = await pg.textContent('#cCalc');
    if (!c.includes('off-list')) throw new Error('calc: ' + c);
    console.log('      ' + c);
  });
  await step('saving the trip lands in history', async () => {
    await pg.click('#cSave');
    await pg.waitForTimeout(300);
    await pg.click('#tDone');
    await pg.waitForTimeout(150);
    const t = await pg.textContent('#main');
    if (!t.includes('By month')) throw new Error('history: ' + t.slice(0, 100));
  });
  await step('month roll-up present', async () => {
    const n = await pg.locator('.mrow').count();
    if (n < 1) throw new Error('no month rows');
  });

  console.log('--- persistence ---');
  await step('state survives a reload', async () => {
    await pg.reload();
    await pg.waitForTimeout(300);
    const st = await pg.evaluate(() => JSON.parse(localStorage.getItem('despensa_v2')));
    if (!st.trips.length) throw new Error('no trips after reload');
    console.log('      trips: ' + st.trips.length + ', off-list: ' + st.trips[0].offList);
  });
  await step('price history recorded from the trip', async () => {
    const hit = await pg.evaluate(() => {
      const st = JSON.parse(localStorage.getItem('despensa_v2'));
      return Object.values(st.items).filter(i => (i.hist || []).some(h => h.p === 123.45)).length;
    });
    if (!hit) throw new Error('123.45 not written to history');
  });

  console.log('--- other screens ---');
  await step('catalogue screen', async () => {
    await pg.click('#navBtn');
    await pg.waitForSelector('[data-go="cat"]');
    await pg.click('[data-go="cat"]');
    await pg.waitForTimeout(200);
    const n = await pg.locator('.row').count();
    if (n < 50) throw new Error('only ' + n + ' rows');
  });
  await step('price history drawer opens with a chart', async () => {
    await pg.locator('[data-hist]').first().click();
    await pg.waitForSelector('.bigchart', { timeout: 2000 });
    const stats = await pg.locator('.stats > div').count();
    if (stats !== 4) throw new Error('stats tiles: ' + stats);
  });
  await step('set reference price from history', async () => {
    await pg.locator('[data-setref]').first().click();
    await pg.waitForTimeout(250);
    const open = await pg.locator('.sheet.open').count();
    if (open) throw new Error('sheet stayed open');
  });
  await step('settings screen', async () => {
    await pg.click('#navBtn');
    await pg.click('[data-go="set"]');
    await pg.waitForTimeout(200);
    const t = await pg.textContent('#main');
    if (!t.includes('2.0.0')) throw new Error('no version');
    if (!t.includes('Chedraui')) throw new Error('no shops');
  });
  await step('add a shop', async () => {
    await pg.fill('#newShop', 'Costco Playa');
    await pg.click('#addShop');
    await pg.waitForTimeout(200);
    const t = await pg.textContent('#main');
    if (!t.includes('Costco Playa')) throw new Error('shop not added');
  });
  await step('new shop is selectable on a trip', async () => {
    await pg.click('#navBtn'); await pg.click('[data-go="trip"]');
    await pg.waitForTimeout(150);
    await pg.click('#startTrip');
    await pg.waitForSelector('[data-shop="costco-playa"]', { timeout: 2000 });
  });

  console.log('--- export ---');
  await step('full export is valid JSON with the right shape', async () => {
    const p = await pg.evaluate(() => JSON.stringify(fullPayload()));
    const o = JSON.parse(p);
    if (!o.catalogue || !o.catalogue.length) throw new Error('no catalogue');
    if (!o.trips) throw new Error('no trips');
    if (o.appVersion !== '2.0.0') throw new Error('version: ' + o.appVersion);
    console.log('      ' + o.catalogue.length + ' items, ' + o.trips.length + ' trips');
  });

  console.log('\n--- errors ---');
  console.log(errs.length ? errs.join('\n') : '  none');
  await b.close();
})();
