/* v4.3 — USD default, dashboard as home, trip-local settings,
   and honest rendering of a receipt with no itemised lines. */
const { chromium } = require('playwright');

(async () => {
  const b = await chromium.launch({});
  const pg = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  pg.setDefaultTimeout(4000);
  const errs = [];
  pg.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  pg.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });

  await pg.goto('file:///home/claude/despensa/index.html');
  await pg.waitForTimeout(700);

  let fails = 0;
  const step = async (l, fn) => {
    try { await fn(); console.log('  ok  ' + l); }
    catch (e) { fails++; console.log('FAIL  ' + l + ' — ' + e.message); }
  };

  console.log('--- currency default ---');
  await step('a fresh install opens in USD', async () => {
    const on = await pg.locator('.ccy button.on').textContent();
    if (on !== 'USD') throw new Error('opened in ' + on);
    const t = await pg.textContent('#main');
    if (/MX\$/.test(t)) throw new Error('pesos on screen in USD mode');
  });
  await step('the hero reads in dollars', async () => {
    const h = await pg.textContent('.bignum');
    if (!h.startsWith('$')) throw new Error(h);
    console.log('      ' + h);
  });

  console.log('--- the dashboard is home ---');
  await step('it opens on the dashboard', async () => {
    const s = await pg.evaluate(() => screen);
    if (s !== 'dash') throw new Error('opened on ' + s);
  });
  await step('no back chevron on the dashboard itself', async () => {
    const vis = await pg.locator('#homeBtn').isVisible();
    if (vis) throw new Error('back button shown on home');
  });
  await step('header and cards still line up on home', async () => {
    const d = await pg.evaluate(() => Math.abs(
      document.getElementById('hTitle').getBoundingClientRect().left -
      document.querySelector('.dcard').getBoundingClientRect().left));
    if (d > 2) throw new Error('out by ' + d + 'px');
  });
  for (const [go, name] of [['cat', 'Catalogue'], ['hist', 'Trips'], ['set', 'Settings']]) {
    await step(`${name} offers a way back, and it goes home`, async () => {
      await pg.click('#navBtn'); await pg.click(`[data-go="${go}"]`);
      await pg.waitForTimeout(250);
      if (!await pg.locator('#homeBtn').isVisible()) throw new Error('no back button on ' + name);
      await pg.click('#homeBtn'); await pg.waitForTimeout(250);
      const s = await pg.evaluate(() => screen);
      if (s !== 'dash') throw new Error('landed on ' + s);
    });
  }

  console.log('--- trip-local settings ---');
  await step('starting a trip stores the rate on the trip', async () => {
    await pg.click('#startTrip');
    await pg.waitForSelector('#ntFx');
    await pg.fill('#ntFx', '18.40');
    await pg.click('[data-shop="chedraui"]');
    await pg.waitForTimeout(300);
    const r = await pg.evaluate(() => ({ trip: S.active.fx, app: S.fx }));
    if (r.trip !== 18.4) throw new Error('trip rate is ' + r.trip);
    if (r.app === 18.4) throw new Error('it overwrote the app default too');
    console.log('      trip ' + r.trip + ', app default still ' + r.app);
  });
  await step('the trip screen offers trip settings', async () => {
    if (!await pg.locator('#tripSet').isVisible()) throw new Error('no trip settings button');
  });
  await step('settings are reachable while planning, before shopping', async () => {
    const mode = await pg.evaluate(() => S.active.mode);
    if (mode !== 'plan') throw new Error('not in planning mode: ' + mode);
    await pg.click('#tripSet');
    await pg.waitForSelector('#tsFx');
    const v = await pg.inputValue('#tsFx');
    if (parseFloat(v) !== 18.4) throw new Error('rate field shows ' + v);
  });
  await step('rate, shop, date, budget and note all save to the trip', async () => {
    await pg.fill('#tsFx', '17.25');
    await pg.fill('#tsBud', '250');
    await pg.fill('#tsNote', 'Party run');
    await pg.fill('#tsDate', '2026-10-09');
    await pg.selectOption('#tsShop', 'dac');
    await pg.click('#tsSave');
    await pg.waitForTimeout(350);
    const r = await pg.evaluate(() => ({
      fx: S.active.fx, bud: S.active.budgetUSD, note: S.active.note,
      date: S.active.date, shop: S.active.shop, appFx: S.fx }));
    if (r.fx !== 17.25) throw new Error('fx ' + r.fx);
    if (r.bud !== 250) throw new Error('budget ' + r.bud);
    if (r.note !== 'Party run') throw new Error('note ' + r.note);
    if (r.date !== '2026-10-09') throw new Error('date ' + r.date);
    if (r.shop !== 'dac') throw new Error('shop ' + r.shop);
    if (r.appFx === 17.25) throw new Error('leaked into the app default');
    console.log('      ' + JSON.stringify(r));
  });
  await step('the header follows the shop change', async () => {
    const t = await pg.textContent('#hTitle');
    if (!/DAC/i.test(t)) throw new Error('header still says ' + t);
  });
  await step('the trip rate drives the USD shown on rows', async () => {
    await pg.evaluate(() => { S.ccy = 'mxn'; render(); });
    await pg.waitForTimeout(200);
    const r = await pg.evaluate(() => {
      const row = document.querySelector('.row .amt');
      const mxText = row.querySelector('.mx').textContent.replace(/[^0-9.]/g, '');
      const usText = row.querySelector('.us').textContent.replace(/[^0-9.]/g, '');
      return { mx: +mxText, us: +usText, fx: S.active.fx, appFx: S.fx };
    });
    const atTrip = +(r.mx / r.fx).toFixed(2), atApp = +(r.mx / r.appFx).toFixed(2);
    if (Math.abs(r.us - atTrip) > 0.02)
      throw new Error(`row shows ${r.us}; trip rate gives ${atTrip}, app rate ${atApp}`);
    console.log('      MX$' + r.mx + ' → US$' + r.us + ' at ' + r.fx);
  });
  await step('cancelling the trip returns to the dashboard', async () => {
    await pg.click('#cancelTrip');
    await pg.waitForSelector('#cancelYes');
    await pg.click('#cancelYes');
    await pg.waitForTimeout(350);
    const s = await pg.evaluate(() => screen);
    if (s !== 'dash') throw new Error('landed on ' + s);
    const open = await pg.locator('.sheet.open').count();
    if (open) throw new Error('sheet stayed open');
  });
  await step('trip settings hide again once no trip is open', async () => {
    if (await pg.locator('#tripSet').isVisible()) throw new Error('still showing');
  });

  console.log('--- receipts with no itemised lines ---');
  await step('a totals-only trip is not called "0 bought · off-list"', async () => {
    await pg.evaluate(() => { S.ccy = 'mxn'; save(); });
    await pg.click('#navBtn'); await pg.click('[data-go="hist"]');
    await pg.waitForTimeout(300);
    const t = await pg.textContent('#main');
    if (/0 bought/.test(t)) throw new Error('still says "0 bought"');
    const rows = await pg.locator('.trow .meta.flag').count();
    const seeded = await pg.evaluate(() =>
      S.trips.filter(t => !(t.lines || []).some(l => l.state === 'bought')).length);
    if (rows !== seeded) throw new Error(rows + ' flagged for ' + seeded + ' unitemised trips');
    console.log('      ' + rows + ' trip(s) marked "Receipt total only"');
  });
  await step('13 Sep and 30 Sep now carry their lines', async () => {
    const r = await pg.evaluate(() => {
      const out = {};
      ['2026-09-13', '2026-09-30'].forEach(d => {
        const t = S.trips.find(t => (t.date || '').slice(0, 10) === d);
        if (!t) { out[d] = 'missing'; return; }
        const ls = (t.lines || []).filter(l => l.state === 'bought');
        const sum = Math.round(ls.reduce((s, l) => s + (l.lineMXN || 0), 0) * 100) / 100;
        out[d] = { lines: ls.length, sum, total: t.receiptTotal, ties: Math.abs(sum - t.receiptTotal) < 0.02 };
      });
      return out;
    });
    for (const d of Object.keys(r)) {
      if (r[d] === 'missing') throw new Error(d + ' not in the trips');
      if (!r[d].lines) throw new Error(d + ' still has no lines');
      if (!r[d].ties) throw new Error(`${d}: lines sum to ${r[d].sum}, receipt says ${r[d].total}`);
      console.log(`      ${d}: ${r[d].lines} lines, MX$${r[d].sum} = printed total`);
    }
  });
  await step('only 15 and 20 Sep are still un-itemised', async () => {
    const left = await pg.evaluate(() => S.trips
      .filter(t => !(t.lines || []).some(l => l.state === 'bought'))
      .map(t => (t.date || '').slice(0, 10)).sort());
    const want = ['2026-09-15', '2026-09-20'];
    if (JSON.stringify(left) !== JSON.stringify(want))
      throw new Error('un-itemised: ' + left.join(', '));
    console.log('      ' + left.join(', '));
  });
  await step('months read as names, not raw keys', async () => {
    const t = await pg.textContent('#main');
    if (/\b2026-\d\d\b(?!-)/.test(t.split('Trips')[0]))
      throw new Error('raw month key in the roll-up');
  });

  console.log('--- regressions ---');
  await step('no NaN, undefined or null anywhere', async () => {
    for (const go of ['dash', 'cat', 'hist', 'set']) {
      await pg.click('#navBtn'); await pg.click(`[data-go="${go}"]`);
      await pg.waitForTimeout(220);
      const t = await pg.textContent('#main');
      for (const bad of ['NaN', 'undefined', 'null'])
        if (t.includes(bad)) throw new Error(bad + ' on ' + go);
    }
  });
  await step('every screen still fits the viewport', async () => {
    for (const go of ['dash', 'cat', 'hist', 'set']) {
      await pg.click('#navBtn'); await pg.click(`[data-go="${go}"]`);
      await pg.waitForTimeout(220);
      const over = await pg.evaluate(() =>
        [...document.querySelectorAll('#main *')]
          .filter(e => e.getBoundingClientRect().right > 391)
          .map(e => e.className || e.tagName).slice(0, 3));
      if (over.length) throw new Error(go + ': ' + over.join(', '));
    }
  });

  console.log('\nerrors: ' + (errs.length ? '\n' + errs.join('\n') : 'none'));
  console.log(fails ? '\n' + fails + ' FAILED' : '\nall passed');
  await b.close();
  process.exit(fails ? 1 : 0);
})();
