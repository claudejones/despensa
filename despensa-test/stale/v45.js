/* v4.5 — bottom tab navigation. The risk here is geometry: the trip's
   action bar and the tab bar are both fixed to the bottom. */
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

  console.log('--- the tab bar ---');
  await step('five tabs, icon and label each', async () => {
    const r = await pg.evaluate(() => [...document.querySelectorAll('#tabs button')].map(b => ({
      go: b.dataset.go,
      label: b.querySelector('.tlab') ? b.querySelector('.tlab').textContent : null,
      icon: !!b.querySelector('svg')
    })));
    if (r.length !== 5) throw new Error(r.length + ' tabs');
    for (const t of r) {
      if (!t.label) throw new Error(t.go + ' has no label');
      if (!t.icon) throw new Error(t.go + ' has no icon');
    }
    console.log('      ' + r.map(t => t.label).join(' · '));
  });
  await step('the hamburger is gone', async () => {
    if (await pg.evaluate(() => !!document.getElementById('navBtn')))
      throw new Error('still present');
  });
  await step('no label is truncated at 390px', async () => {
    const bad = await pg.evaluate(() =>
      [...document.querySelectorAll('#tabs .tlab')]
        .filter(e => e.scrollWidth > e.clientWidth + 1)
        .map(e => e.textContent));
    if (bad.length) throw new Error('clipped: ' + bad.join(', '));
  });
  await step('tabs meet a 44px touch target', async () => {
    const r = await pg.evaluate(() => {
      const bs = [...document.querySelectorAll('#tabs button')].map(b => b.getBoundingClientRect());
      return { w: Math.round(Math.min(...bs.map(b => b.width))), h: Math.round(bs[0].height) };
    });
    if (r.h < 44) throw new Error('height ' + r.h + 'px');
    if (r.w < 44) throw new Error('width ' + r.w + 'px');
    console.log('      ' + r.w + '×' + r.h + ' each');
  });
  await step('the current tab is marked, and only one', async () => {
    const r = await pg.evaluate(() => ({
      on: [...document.querySelectorAll('#tabs button.on')].map(b => b.dataset.go),
      aria: document.querySelectorAll('#tabs [aria-current="page"]').length,
      screen
    }));
    if (r.on.length !== 1) throw new Error(r.on.length + ' tabs marked');
    if (r.on[0] !== r.screen) throw new Error('marked ' + r.on[0] + ' on screen ' + r.screen);
    if (r.aria !== 1) throw new Error('aria-current on ' + r.aria);
  });
  await step('colour is not the only cue for the active tab', async () => {
    const r = await pg.evaluate(() => {
      const on = document.querySelector('#tabs button.on');
      const off = document.querySelector('#tabs button:not(.on)');
      return { onW: getComputedStyle(on.querySelector('svg')).strokeWidth,
               offW: getComputedStyle(off.querySelector('svg')).strokeWidth,
               aria: on.getAttribute('aria-current') };
    });
    if (r.onW === r.offW && !r.aria) throw new Error('only colour distinguishes it');
  });

  console.log('--- every tab works ---');
  for (const go of ['trip', 'cat', 'hist', 'set', 'dash']) {
    await step(`tapping ${go} goes there`, async () => {
      await pg.click(`#tabs [data-go="${go}"]`);
      await pg.waitForTimeout(250);
      const s = await pg.evaluate(() => screen);
      if (s !== go) throw new Error('landed on ' + s);
      const on = await pg.evaluate(() => document.querySelector('#tabs button.on').dataset.go);
      if (on !== go) throw new Error('highlight says ' + on);
    });
  }
  await step('tapping the current tab scrolls to the top', async () => {
    await pg.click('#tabs [data-go="cat"]'); await pg.waitForTimeout(250);
    await pg.evaluate(() => window.scrollTo(0, 900)); await pg.waitForTimeout(200);
    await pg.click('#tabs [data-go="cat"]'); await pg.waitForTimeout(600);
    const y = await pg.evaluate(() => window.scrollY);
    if (y > 20) throw new Error('still at ' + y);
  });

  console.log('--- stacking with the trip bar ---');
  await step('with no trip open, nothing hides behind the tabs', async () => {
    await pg.click('#tabs [data-go="dash"]'); await pg.waitForTimeout(300);
    const r = await pg.evaluate(() => {
      const tabs = document.getElementById('tabs').getBoundingClientRect();
      window.scrollTo(0, document.body.scrollHeight);
      const last = [...document.querySelectorAll('.dcard')].pop().getBoundingClientRect();
      return { tabTop: tabs.top, lastBottom: last.bottom };
    });
    if (r.lastBottom > r.tabTop) throw new Error('last card runs under the tabs');
  });
  await step('opening a trip stacks its bar above the tabs', async () => {
    await pg.click('#tabs [data-go="dash"]'); await pg.waitForTimeout(250);
    await pg.click('#startTrip'); await pg.waitForSelector('[data-shop="chedraui"]');
    await pg.click('[data-shop="chedraui"]'); await pg.waitForTimeout(450);
    const r = await pg.evaluate(() => {
      const tabs = document.getElementById('tabs').getBoundingClientRect();
      const bar = document.getElementById('bar').getBoundingClientRect();
      return { tabTop: tabs.top, barBottom: bar.bottom, barTop: bar.top,
               vh: window.innerHeight };
    });
    if (Math.abs(r.barBottom - r.tabTop) > 1)
      throw new Error(`bar bottom ${r.barBottom.toFixed(0)}, tabs top ${r.tabTop.toFixed(0)} — they overlap or gap`);
    if (r.barTop < 0) throw new Error('the trip bar is taller than the screen');
    console.log(`      trip bar ${r.barTop.toFixed(0)}–${r.barBottom.toFixed(0)}, tabs from ${r.tabTop.toFixed(0)}`);
  });
  await step('the Trip tab shows a dot while one is open', async () => {
    const d = await pg.locator('#tabs [data-go="trip"] .dot').count();
    if (!d) throw new Error('no dot');
    const others = await pg.locator('#tabs button:not([data-go="trip"]) .dot').count();
    if (others) throw new Error('dot on another tab');
  });
  await step('the list clears both bars when scrolled to the end', async () => {
    await pg.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await pg.waitForTimeout(350);
    const r = await pg.evaluate(() => {
      const rows = [...document.querySelectorAll('.row')];
      const last = rows[rows.length - 1].getBoundingClientRect();
      return { lastBottom: last.bottom,
               barTop: document.getElementById('bar').getBoundingClientRect().top };
    });
    if (r.lastBottom > r.barTop)
      throw new Error(`last row ends at ${r.lastBottom.toFixed(0)}, trip bar starts at ${r.barTop.toFixed(0)}`);
  });
  await step('you can leave a half-planned trip and come back to it', async () => {
    await pg.locator('[data-pick]').first().click();
    await pg.waitForTimeout(200);
    const before = await pg.evaluate(() => Object.keys(S.active.lines).length);
    await pg.click('#tabs [data-go="cat"]'); await pg.waitForTimeout(250);
    await pg.click('#tabs [data-go="trip"]'); await pg.waitForTimeout(350);
    const after = await pg.evaluate(() => Object.keys(S.active.lines).length);
    if (after !== before) throw new Error(`${before} marked, ${after} after a round trip`);
    const mode = await pg.evaluate(() => S.active.mode);
    if (mode !== 'plan') throw new Error('mode changed to ' + mode);
    console.log('      ' + after + ' item(s) still marked');
  });
  await step('tabs stay reachable while shopping', async () => {
    await pg.click('#goShop'); await pg.waitForTimeout(350);
    const r = await pg.evaluate(() => {
      const t = document.getElementById('tabs').getBoundingClientRect();
      const bar = document.getElementById('bar').getBoundingClientRect();
      return { visible: t.top < window.innerHeight && t.bottom > 0,
               overlap: bar.bottom > t.top + 1 };
    });
    if (!r.visible) throw new Error('tab bar off screen while shopping');
    if (r.overlap) throw new Error('the trip bar covers the tabs');
  });
  await step('the dot clears when the trip is discarded', async () => {
    await pg.click('#cancelTrip'); await pg.waitForSelector('#ccYes');
    await pg.click('#ccYes'); await pg.waitForTimeout(400);
    const d = await pg.locator('#tabs .dot').count();
    if (d) throw new Error('dot still showing');
    const r = await pg.evaluate(() => ({
      screen, barHidden: document.getElementById('bar').style.display === 'none' }));
    if (r.screen !== 'dash') throw new Error('landed on ' + r.screen);
    if (!r.barHidden) throw new Error('the trip bar is still on screen');
  });

  console.log('--- the sheet still works over the tabs ---');
  await step('a sheet covers the tab bar, not the other way round', async () => {
    await pg.click('#tabs [data-go="cat"]'); await pg.waitForTimeout(250);
    await pg.locator('[data-hist]').first().click();
    await pg.waitForSelector('.sheet.open');
    const r = await pg.evaluate(() => ({
      sheet: +getComputedStyle(document.getElementById('sheet')).zIndex,
      scrim: +getComputedStyle(document.getElementById('scrim')).zIndex,
      tabs: +getComputedStyle(document.getElementById('tabs')).zIndex }));
    if (r.sheet <= r.tabs) throw new Error(`sheet z=${r.sheet}, tabs z=${r.tabs}`);
    if (r.scrim <= r.tabs) throw new Error(`scrim z=${r.scrim}, tabs z=${r.tabs}`);
    await pg.click('#xClose'); await pg.waitForTimeout(250);
  });

  console.log('--- regressions ---');
  await step('no NaN, undefined or null on any tab', async () => {
    for (const go of ['dash', 'trip', 'cat', 'hist', 'set']) {
      await pg.click(`#tabs [data-go="${go}"]`); await pg.waitForTimeout(250);
      const t = await pg.textContent('#main');
      for (const bad of ['NaN', 'undefined', 'null'])
        if (t.includes(bad)) throw new Error(bad + ' on ' + go);
    }
  });
  await step('nothing overflows sideways on any tab', async () => {
    for (const go of ['dash', 'trip', 'cat', 'hist', 'set']) {
      await pg.click(`#tabs [data-go="${go}"]`); await pg.waitForTimeout(250);
      const over = await pg.evaluate(() =>
        [...document.querySelectorAll('#main *, #tabs *')]
          .filter(e => e.getBoundingClientRect().right > 391)
          .map(e => e.className || e.tagName).slice(0, 3));
      if (over.length) throw new Error(go + ': ' + over.join(', '));
    }
  });
  await step('it survives a narrow phone (320px)', async () => {
    await pg.setViewportSize({ width: 320, height: 568 });
    await pg.waitForTimeout(350);
    const bad = await pg.evaluate(() => {
      const clipped = [...document.querySelectorAll('#tabs .tlab')]
        .filter(e => e.scrollWidth > e.clientWidth + 1).map(e => e.textContent);
      const wide = [...document.querySelectorAll('#tabs *')]
        .filter(e => e.getBoundingClientRect().right > 321).length;
      return { clipped, wide };
    });
    if (bad.wide) throw new Error(bad.wide + ' element(s) past 320px');
    if (bad.clipped.length) console.log('      note: labels shorten at 320px — ' + bad.clipped.join(', '));
    await pg.setViewportSize({ width: 390, height: 844 });
  });

  console.log('\nerrors: ' + (errs.length ? '\n' + errs.join('\n') : 'none'));
  console.log(fails ? '\n' + fails + ' FAILED' : '\nall passed');
  await b.close();
  process.exit(fails ? 1 : 0);
})();
