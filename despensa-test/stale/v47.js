/* v4.7 — the two flag cards, against the user's real export.
   Their device holds both a transcribed receipt and an app record for the
   same shop on the same day, five times over, and both are counted. */
const { chromium } = require('playwright');

(async () => {
  const b = await chromium.launch({});
  const pg = await b.newPage({ viewport: { width: 390, height: 844 } });
  pg.setDefaultTimeout(4000);
  const errs = [];
  pg.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  pg.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });

  const raw = require('fs').readFileSync('/tmp/live.json', 'utf8');
  const seedDevice = async () => {
    await pg.goto('file:///home/claude/despensa/index.html');
    await pg.evaluate((j) => {
      const d = JSON.parse(j);
      const map = { 'Fruit & Veg':'produce','Protein':'protein','Dairy & Chilled':'chilled',
        'Bakery & Tortillas':'bakery','Pantry':'pantry','Snacks':'snacks','Drinks':'drinks',
        'Household':'home','Personal Care':'care' };
      const st = { v:6, cat:12, appVersion:d.appVersion, fx:d.currentRate, budgetUSD:700,
                   ccy:'mxn', seeded:true, shops:d.shops, items:{},
                   trips:JSON.parse(JSON.stringify(d.trips)), active:null };
      d.catalogue.forEach(c => {
        st.items[c.id] = { id:c.id, cat:map[c.category]||'pantry', es:c.es, en:c.en,
          q:c.qty, p:c.refPriceMXN, ref:c.shelfRef, hint:c.usualShop,
          active:c.active !== false, hist:c.priceHistory || [] };
      });
      localStorage.setItem('despensa_v2', JSON.stringify(st));
    }, raw);
    await pg.reload();
    await pg.waitForTimeout(900);
  };
  await seedDevice();

  let fails = 0;
  const step = async (l, fn) => {
    try { await fn(); console.log('  ok  ' + l); }
    catch (e) { fails++; console.log('FAIL  ' + l + ' — ' + e.message); }
  };

  console.log('--- the double-count card ---');
  await step('it finds every colliding day, not just the strongest', async () => {
    const r = await pg.evaluate(() => sameDayPairs().map(d => ({
      date: d.date, receipt: !!d.receipt, session: !!d.session,
      drop: Math.round(d.dup * 100) / 100 })));
    if (r.length !== 4) throw new Error(r.length + ' days found, expected 4');
    for (const d of r) {
      if (!d.receipt) throw new Error(d.date + ' has no transcribed receipt side');
      if (!d.session) throw new Error(d.date + ' has no app-record side');
    }
    console.log('      ' + r.map(d => `${d.date} -MX$${d.drop}`).join(' · '));
  });
  await step('it never proposes dropping a receipt', async () => {
    const bad = await pg.evaluate(() => sameDayPairs()
      .filter(d => d.session && String(d.session.id).indexOf('seed-') === 0)
      .map(d => d.date));
    if (bad.length) throw new Error('would drop a receipt on ' + bad.join(', '));
  });
  await step('the overstatement figure is right', async () => {
    const r = await pg.evaluate(() => {
      const total = sameDayPairs().reduce((s, d) => s + d.dup, 0);
      const sessions = S.trips.filter(t => String(t.id).indexOf('seed-') !== 0);
      const onSeedDay = sessions.filter(t => S.trips.some(o =>
        String(o.id).indexOf('seed-') === 0 &&
        (o.date || '').slice(0, 10) === (t.date || '').slice(0, 10)));
      return { total: Math.round(total * 100) / 100,
               direct: Math.round(onSeedDay.reduce((s, t) => s + (t.receiptTotal || 0), 0) * 100) / 100 };
    });
    if (Math.abs(r.total - r.direct) > 0.02)
      throw new Error(`card says ${r.total}, app records on receipt days total ${r.direct}`);
    console.log('      MX$' + r.total + ' counted twice');
  });
  await step('the card explains both sides on screen', async () => {
    const t = await pg.textContent('#main');
    if (!/counted twice/.test(t)) throw new Error('no headline');
    if (!/receipt/.test(t) || !/app record/.test(t))
      throw new Error('does not distinguish receipt from app record');
    if (/logged twice/.test(t)) throw new Error('old "logged twice" wording survives');
  });

  console.log('--- the unpriced card tells the truth now ---');
  await step('it no longer claims the totals are short', async () => {
    const t = await pg.textContent('#main');
    if (/Every figure here is short/.test(t)) throw new Error('old claim survives');
    if (!/month totals are unaffected/i.test(t)) throw new Error('does not say what is safe');
    if (!/Where it goes/.test(t)) throw new Error('does not name what is actually short');
  });
  await step('and that claim is actually true', async () => {
    const r = await pg.evaluate(() => {
      const ms = byMonth(), k = ms[ms.length - 1].key;
      const fromReceipts = S.trips.filter(t => monthKey(t.date) === k)
        .reduce((s, t) => s + spendOf(t), 0);
      const fromCats = byCategory([k]).reduce((s, c) => s + c.total, 0);
      return { month: k, fromReceipts: Math.round(fromReceipts * 100) / 100,
               fromCats: Math.round(fromCats * 100) / 100 };
    });
    if (Math.abs(r.fromReceipts - r.fromCats) < 0.02)
      throw new Error('categories already tie — the card should not be showing');
    if (r.fromCats > r.fromReceipts)
      throw new Error('categories exceed the receipts, which is the opposite problem');
    console.log(`      ${r.month}: receipts MX$${r.fromReceipts}, categories MX$${r.fromCats}`);
  });

  console.log('--- resolving ---');
  await step('the resolve sheet opens and offers one row per day', async () => {
    await pg.click('#fixDupes');
    await pg.waitForSelector('[data-dropsession]');
    const n = await pg.locator('[data-dropsession]').count();
    if (n !== 4) throw new Error(n + ' drop buttons, expected 4');
    const all = await pg.locator('#dropAllSessions').count();
    if (!all) throw new Error('no drop-all option');
  });
  await step('dropping one day removes only that record', async () => {
    const before = await pg.evaluate(() => S.trips.length);
    await pg.locator('[data-dropsession]').first().click();
    await pg.waitForTimeout(400);
    const r = await pg.evaluate(() => ({
      n: S.trips.length,
      seeds: S.trips.filter(t => String(t.id).indexOf('seed-') === 0).length }));
    if (r.n !== before - 1) throw new Error(`${before} -> ${r.n}`);
    if (r.seeds !== 10) throw new Error('receipts went to ' + r.seeds);
  });
  await step('drop-all clears the rest and keeps every receipt', async () => {
    await pg.click('#fixDupes');
    await pg.waitForSelector('#dropAllSessions');
    await pg.click('#dropAllSessions');
    await pg.waitForTimeout(450);
    const r = await pg.evaluate(() => ({
      seeds: S.trips.filter(t => String(t.id).indexOf('seed-') === 0).length,
      mine: S.trips.filter(t => String(t.id).indexOf('seed-') !== 0)
                   .map(t => (t.date || '').slice(0, 10)),
      dupes: sameDayPairs().length }));
    if (r.seeds !== 10) throw new Error('receipts went to ' + r.seeds);
    if (r.dupes) throw new Error(r.dupes + ' collisions left');
    if (r.mine.length !== 1 || r.mine[0] !== '2026-09-06')
      throw new Error('kept the wrong trips: ' + r.mine.join(', '));
    console.log('      10 receipts kept, 06 Sep kept (it has no receipt)');
  });
  await step('both flag cards disappear once resolved', async () => {
    const t = await pg.textContent('#main');
    if (/counted twice/.test(t)) throw new Error('double-count card still showing');
    if (/ticked off with no price/.test(t)) throw new Error('unpriced card still showing');
  });
  await step('the months now read the receipts', async () => {
    const r = await pg.evaluate(() => byMonth().map(m => ({
      k: m.key, mx: Math.round(m.spend * 100) / 100,
      usd: Math.round(m.spend / S.fx) })));
    console.log('      ' + r.map(m => `${m.k} MX$${m.mx} ($${m.usd})`).join(' · '));
    const aug = r.find(m => m.k === '2026-08'), sep = r.find(m => m.k === '2026-09');
    if (aug.usd > 700 || sep.usd > 700)
      throw new Error('still over budget after resolving: ' + JSON.stringify(r));
  });
  await step('categories now tie to the receipts', async () => {
    const r = await pg.evaluate(() => {
      const k = '2026-09';
      return { rec: Math.round(S.trips.filter(t => monthKey(t.date) === k)
                 .reduce((s, t) => s + spendOf(t), 0) * 100) / 100,
               cat: Math.round(byCategory([k]).reduce((s, c) => s + c.total, 0) * 100) / 100 };
    });
    if (Math.abs(r.rec - r.cat) > 0.02)
      throw new Error(`receipts MX$${r.rec}, categories MX$${r.cat}`);
    console.log('      September: both MX$' + r.rec);
  });
  await step('it persists across a reload', async () => {
    await pg.reload();
    await pg.waitForTimeout(800);
    const n = await pg.evaluate(() => S.trips.length);
    if (n !== 11) throw new Error(n + ' trips after reload, expected 11');
  });

  console.log('--- regressions ---');
  await step('no NaN, undefined or null on any tab', async () => {
    for (const go of ['dash', 'cat', 'hist', 'set']) {
      await pg.click(`#tabs [data-go="${go}"]`);
      await pg.waitForTimeout(220);
      const t = await pg.textContent('#main');
      for (const bad of ['NaN', 'undefined', 'null'])
        if (t.includes(bad)) throw new Error(bad + ' on ' + go);
    }
  });
  await step('a clean install shows neither flag card', async () => {
    await pg.evaluate(() => localStorage.clear());
    await pg.reload();
    await pg.waitForTimeout(800);
    const t = await pg.textContent('#main');
    if (/counted twice|ticked off with no price/.test(t))
      throw new Error('a flag card shows on a clean install');
  });

  console.log('\nerrors: ' + (errs.length ? '\n' + errs.join('\n') : 'none'));
  console.log(fails ? '\n' + fails + ' FAILED' : '\nall passed');
  await b.close();
  process.exit(fails ? 1 : 0);
})();
