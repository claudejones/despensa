/* v4.9 — restock removed, trips seeded from the regulars, cart badge.
   The restock card claimed to predict running out; it was measuring trip
   frequency. These tests guard the replacement and the badge's behaviour. */
const { chromium } = require('playwright');

(async () => {
  const b = await chromium.launch({});
  const pg = await b.newPage({ viewport: { width: 390, height: 844 } });
  pg.setDefaultTimeout(4000);
  const errs = [];
  pg.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  pg.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });

  const fresh = async () => {
    await pg.goto('file:///home/claude/despensa/index.html');
    await pg.evaluate(() => { if (S && S.active) { S.active = null; save(); } });
    await pg.reload();
    await pg.waitForTimeout(800);
  };
  await fresh();

  let fails = 0;
  const step = async (l, fn) => {
    try { await fn(); console.log('  ok  ' + l); }
    catch (e) { fails++; console.log('FAIL  ' + l + ' — ' + e.message); }
  };

  console.log('--- restock is gone ---');
  await step('the card no longer renders', async () => {
    const t = await pg.textContent('#main');
    if (/Due a restock/i.test(t)) throw new Error('still on the dashboard');
  });
  await step('and the function with it', async () => {
    const left = await pg.evaluate(() => typeof restock);
    if (left !== 'undefined') throw new Error('restock() still defined');
  });
  await step('the honest half survives', async () => {
    const t = await pg.textContent('#main');
    if (!/On almost every trip/.test(t)) throw new Error('staples card went too');
  });

  console.log('--- starting from the regulars ---');
  await step('the sheet offers recommended or empty', async () => {
    await pg.click('#startTrip');
    await pg.waitForSelector('#ntSeed');
    const r = await pg.evaluate(() => [...document.querySelectorAll('#ntSeed button')]
      .map(x => ({ seed: x.dataset.seed, on: x.classList.contains('on') })));
    if (r.length !== 2) throw new Error(r.length + ' options');
    if (!r[0].on || r[1].on) throw new Error('recommended should be preselected');
  });
  await step('the count is computed, not hardcoded', async () => {
    const r = await pg.evaluate(() => ({
      shown: document.querySelector('[data-seed="rec"] small').textContent,
      n: recommended().length }));
    if (!r.shown.startsWith(String(r.n)))
      throw new Error(`sheet says "${r.shown}" but recommended() returns ${r.n}`);
    console.log('      ' + r.n + ' recommended');
  });
  await step('picking a shop seeds the list', async () => {
    await pg.click('[data-shop="chedraui"]');
    await pg.waitForTimeout(600);
    const r = await pg.evaluate(() => ({
      n: Object.keys(S.active.lines).length,
      rec: recommended().length,
      states: [...new Set(Object.values(S.active.lines).map(l => l.state))],
      mode: S.active.mode }));
    if (r.n !== r.rec) throw new Error(`${r.n} on the list, ${r.rec} recommended`);
    if (r.mode !== 'plan') throw new Error('not in planning mode');
    if (r.states.length !== 1 || r.states[0] !== 'need')
      throw new Error('seeded lines are not "need": ' + r.states.join(','));
    console.log('      ' + r.n + ' items, all marked "need", still editable');
  });
  await step('every seeded item is a live catalogue entry', async () => {
    const bad = await pg.evaluate(() => Object.keys(S.active.lines)
      .filter(id => !S.items[id] || S.items[id].active === false));
    if (bad.length) throw new Error('seeded a dead item: ' + bad.join(', '));
  });
  await step('they can be unticked like anything else', async () => {
    const before = await pg.evaluate(() => Object.keys(S.active.lines).length);
    await pg.locator('.row [data-pick]').first().click();
    await pg.waitForTimeout(300);
    const after = await pg.evaluate(() => Object.keys(S.active.lines).length);
    if (after !== before - 1) throw new Error(`${before} -> ${after}`);
  });
  await step('"empty list" starts with nothing', async () => {
    await pg.evaluate(() => { S.active = null; save(); render(); });
    await pg.click('#tabs [data-go="dash"]'); await pg.waitForTimeout(300);
    await pg.click('#startTrip'); await pg.waitForSelector('#ntSeed');
    await pg.click('[data-seed="none"]');
    await pg.click('[data-shop="chedraui"]');
    await pg.waitForTimeout(500);
    const n = await pg.evaluate(() => Object.keys(S.active.lines).length);
    if (n) throw new Error(n + ' items on a supposedly empty list');
  });

  console.log('--- the cart badge ---');
  await step('an empty open trip shows a dot, not a zero', async () => {
    const r = await pg.evaluate(() => ({
      badge: document.querySelectorAll('#tabs .cbadge').length,
      dot: document.querySelectorAll('#tabs .dot').length }));
    if (r.badge) throw new Error('a badge is showing with nothing on the list');
    if (!r.dot) throw new Error('no dot for the open trip');
  });
  await step('it counts up as items go on', async () => {
    for (let i = 0; i < 3; i++) {
      await pg.locator('.row [data-pick]').nth(i).click();
      await pg.waitForTimeout(220);
    }
    const r = await pg.evaluate(() => ({
      badge: document.querySelector('#tabs .cbadge').textContent,
      lines: Object.keys(S.active.lines).length }));
    if (+r.badge !== r.lines) throw new Error(`badge ${r.badge}, list ${r.lines}`);
    console.log('      badge reads ' + r.badge);
  });
  await step('it is on the Trip tab and nowhere else', async () => {
    const r = await pg.evaluate(() => [...document.querySelectorAll('#tabs button')]
      .filter(b => b.querySelector('.cbadge')).map(b => b.dataset.go));
    if (r.length !== 1 || r[0] !== 'trip') throw new Error('badges on: ' + r.join(', '));
  });
  await step('it is visible from the other tabs', async () => {
    await pg.click('#tabs [data-go="cat"]'); await pg.waitForTimeout(300);
    const v = await pg.locator('#tabs .cbadge').isVisible();
    if (!v) throw new Error('badge hidden on the Catalogue tab');
    await pg.click('#tabs [data-go="trip"]'); await pg.waitForTimeout(300);
  });
  await step('adding fires one bump, and only on change', async () => {
    const cls = async () => pg.evaluate(() => {
      const e = document.querySelector('#tabs .cbadge');
      return e ? [...e.classList].filter(c => c === 'bump' || c === 'drop') : [];
    });
    await pg.locator('.row [data-pick]').nth(5).click();
    await pg.waitForTimeout(120);
    const added = await cls();
    if (!added.includes('bump')) throw new Error('no bump on add: ' + added.join(','));
    // a re-render with no change must not re-trigger it
    await pg.evaluate(() => render());
    await pg.waitForTimeout(120);
    const idle = await cls();
    if (idle.includes('bump') && idle.includes('drop'))
      throw new Error('both classes present');
    console.log('      bump on add');
  });
  await step('removing fires the shrink instead', async () => {
    await pg.locator('.row [data-pick]').nth(5).click();
    await pg.waitForTimeout(120);
    const c = await pg.evaluate(() => {
      const e = document.querySelector('#tabs .cbadge');
      return e ? [...e.classList] : [];
    });
    if (!c.includes('drop')) throw new Error('no shrink on remove: ' + c.join(','));
  });
  await step('nothing animates when it is just sitting there', async () => {
    await pg.waitForTimeout(600);
    const running = await pg.evaluate(() => {
      const e = document.querySelector('#tabs .cbadge');
      if (!e) return null;
      return e.getAnimations ? e.getAnimations().filter(a => a.playState === 'running').length : 0;
    });
    if (running) throw new Error(running + ' animation(s) still running at rest');
  });
  await step('reduced motion turns the animation off', async () => {
    await pg.emulateMedia({ reducedMotion: 'reduce' });
    await pg.waitForTimeout(200);
    const name = await pg.evaluate(() => {
      const e = document.querySelector('#tabs .cbadge');
      e.classList.add('bump');
      return getComputedStyle(e).animationName;
    });
    if (name && name !== 'none') throw new Error('animation still set to ' + name);
    await pg.emulateMedia({ reducedMotion: 'no-preference' });
  });
  await step('while shopping it counts what is still to get', async () => {
    await pg.click('#goShop');
    await pg.waitForTimeout(500);
    const before = await pg.evaluate(() => ({
      badge: +document.querySelector('#tabs .cbadge').textContent,
      todo: Object.values(S.active.lines)
        .filter(l => l.state !== 'bought' && l.state !== 'skipped').length }));
    if (before.badge !== before.todo) throw new Error(`badge ${before.badge}, to get ${before.todo}`);
    await pg.locator('.row [data-got]').first().click();
    await pg.waitForTimeout(300);
    const after = await pg.evaluate(() => +document.querySelector('#tabs .cbadge').textContent);
    if (after !== before.badge - 1)
      throw new Error(`ticking one off took ${before.badge} -> ${after}`);
    console.log('      ' + before.badge + ' to get, ' + after + ' after ticking one off');
  });
  await step('it clears when the trip is discarded', async () => {
    await pg.click('#tripSet'); await pg.waitForSelector('#tsDrop');
    await pg.click('#tsDrop'); await pg.waitForSelector('#ccYes');
    await pg.click('#ccYes'); await pg.waitForTimeout(450);
    const r = await pg.evaluate(() => ({
      badge: document.querySelectorAll('#tabs .cbadge').length,
      dot: document.querySelectorAll('#tabs .dot').length }));
    if (r.badge || r.dot) throw new Error('badge or dot left behind');
  });

  console.log('--- regressions ---');
  await step('no NaN, undefined or null on any tab', async () => {
    for (const go of ['dash', 'trip', 'cat', 'hist', 'set']) {
      await pg.click(`#tabs [data-go="${go}"]`);
      await pg.waitForTimeout(250);
      const t = await pg.textContent('#main');
      for (const bad of ['NaN', 'undefined', 'null'])
        if (t.includes(bad)) throw new Error(bad + ' on ' + go);
    }
  });
  await step('the tab bar still fits with a badge on it', async () => {
    await pg.click('#tabs [data-go="dash"]'); await pg.waitForTimeout(250);
    await pg.click('#startTrip'); await pg.waitForSelector('[data-shop="chedraui"]');
    await pg.click('[data-shop="chedraui"]'); await pg.waitForTimeout(500);
    const over = await pg.evaluate(() =>
      [...document.querySelectorAll('#tabs *')]
        .filter(e => e.getBoundingClientRect().right > 391).length);
    if (over) throw new Error(over + ' tab element(s) past the viewport');
    const clipped = await pg.evaluate(() =>
      [...document.querySelectorAll('#tabs .tlab')]
        .filter(e => e.scrollWidth > e.clientWidth + 1).map(e => e.textContent));
    if (clipped.length) throw new Error('labels clipped: ' + clipped.join(', '));
  });
  await step('a three-digit count does not blow the badge out', async () => {
    const w = await pg.evaluate(() => {
      const e = document.querySelector('#tabs .cbadge');
      const was = e.textContent;
      e.textContent = '99+';
      const r = e.getBoundingClientRect();
      e.textContent = was;
      return Math.round(r.width);
    });
    if (w > 40) throw new Error('badge is ' + w + 'px wide at 99+');
    console.log('      ' + w + 'px at 99+');
  });

  console.log('\nerrors: ' + (errs.length ? '\n' + errs.join('\n') : 'none'));
  console.log(fails ? '\n' + fails + ' FAILED' : '\nall passed');
  await b.close();
  process.exit(fails ? 1 : 0);
})();
