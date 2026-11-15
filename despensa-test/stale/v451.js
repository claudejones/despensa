/* v4.5.1 — the seed-latch bug, reproduced from the user's REAL export.
   Their device runs app code 4.5.0 but its seeded trips are frozen at
   4.0.0: four of them still carry 0 lines and the note string that was
   deleted in 4.3.0. "if(!S.seeded)" was a one-way gate, so corrected
   transcriptions could never arrive. */
const { chromium } = require('playwright');

(async () => {
  const b = await chromium.launch({});
  const pg = await b.newPage({ viewport: { width: 390, height: 844 } });
  pg.setDefaultTimeout(4000);
  const errs = [];
  pg.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  pg.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });

  const raw = require('fs').readFileSync('/tmp/live.json', 'utf8');
  await pg.goto('file:///home/claude/despensa/index.html');

  // Rebuild their device from the export: trips exactly as exported,
  // seeded:true and NO seedV — which is what the latch leaves behind.
  await pg.evaluate((j) => {
    const d = JSON.parse(j);
    const map = { 'Fruit & Veg':'produce','Protein':'protein','Dairy & Chilled':'chilled',
      'Bakery & Tortillas':'bakery','Pantry':'pantry','Snacks':'snacks','Drinks':'drinks',
      'Household':'home','Personal Care':'care' };
    const st = { v:6, cat:12, appVersion:d.appVersion, fx:d.currentRate, budgetUSD:700,
                 ccy:'usd', seeded:true, shops:d.shops, items:{},
                 trips:JSON.parse(JSON.stringify(d.trips)), active:null };
    d.catalogue.forEach(c => {
      st.items[c.id] = { id:c.id, cat:map[c.category]||'pantry', es:c.es, en:c.en,
        q:c.qty, p:c.refPriceMXN, ref:c.shelfRef, hint:c.usualShop,
        active:c.active !== false, hist:c.priceHistory || [] };
    });
    localStorage.setItem('despensa_v2', JSON.stringify(st));
  }, raw);

  const before = await pg.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('despensa_v2'));
    const seeds = s.trips.filter(t => String(t.id).indexOf('seed-') === 0);
    return { total: s.trips.length, seeds: seeds.length,
             mine: s.trips.length - seeds.length,
             empty: seeds.filter(t => !(t.lines || []).length).map(t => t.date),
             appVersion: s.appVersion };
  });
  console.log(`  device: app ${before.appVersion}, ${before.total} trips ` +
              `(${before.seeds} seeded, ${before.mine} yours)`);
  console.log(`  frozen seeds with no lines: ${before.empty.join(', ')}`);
  if (before.empty.length !== 4) {
    console.log('  ! expected the export to have 4 empty seeds — fixture drifted');
  }

  await pg.reload();
  await pg.waitForTimeout(900);

  let fails = 0;
  const step = async (l, fn) => {
    try { await fn(); console.log('  ok  ' + l); }
    catch (e) { fails++; console.log('FAIL  ' + l + ' — ' + e.message); }
  };

  console.log('\n--- the latch is broken ---');
  await step('seedV is now set, so the rebuild ran', async () => {
    const v = await pg.evaluate(() => S.seedV);
    if (!v) throw new Error('seedV still unset — the latch holds');
    console.log('      seedV ' + v);
  });
  await step('the 4.0.0 note strings are gone', async () => {
    const stale = await pg.evaluate(() => S.trips
      .filter(t => /not transcribed|Totals only/i.test(t.note || ''))
      .map(t => (t.date || '').slice(0, 10)));
    if (stale.length) throw new Error('survived on ' + stale.join(', '));
  });
  await step('all four frozen receipts now carry lines', async () => {
    const empty = await pg.evaluate(() => S.trips
      .filter(t => String(t.id).indexOf('seed-') === 0 && !(t.lines || []).length)
      .map(t => (t.date || '').slice(0, 10)));
    if (empty.length) throw new Error('still empty: ' + empty.join(', '));
    const r = await pg.evaluate(() => S.trips
      .filter(t => String(t.id).indexOf('seed-') === 0)
      .map(t => `${(t.date || '').slice(5, 10)}:${(t.lines || []).length}`));
    console.log('      ' + r.join(' '));
  });
  await step('each seeded receipt ties to its printed total', async () => {
    const bad = await pg.evaluate(() => S.trips
      .filter(t => String(t.id).indexOf('seed-') === 0)
      .map(t => {
        const sum = Math.round((t.lines || []).filter(l => l.state === 'bought')
          .reduce((s, l) => s + (l.lineMXN || 0), 0) * 100) / 100;
        return { d: (t.date || '').slice(0, 10), sum, tot: t.receiptTotal };
      }).filter(r => Math.abs(r.sum - r.tot) > 0.02));
    if (bad.length) throw new Error(bad.map(r => `${r.d}: ${r.sum} vs ${r.tot}`).join('; '));
  });
  await step('"items not recorded" no longer appears', async () => {
    await pg.click('#tabs [data-go="hist"]');
    await pg.waitForTimeout(350);
    const t = await pg.textContent('#main');
    if (/items not recorded/.test(t)) throw new Error('still on screen');
    const flags = await pg.locator('.trow .meta.flag').count();
    if (flags) throw new Error(flags + ' trips still flagged');
  });

  console.log('\n--- your own trips are untouched ---');
  await step('all six survive with their totals and lines', async () => {
    const want = JSON.parse(raw).trips
      .filter(t => String(t.id).indexOf('seed-') !== 0)
      .map(t => ({ id: t.id, tot: t.receiptTotal, lines: (t.lines || []).length }));
    const got = await pg.evaluate(() => S.trips
      .filter(t => String(t.id).indexOf('seed-') !== 0)
      .map(t => ({ id: t.id, tot: t.receiptTotal, lines: (t.lines || []).length })));
    if (got.length !== want.length)
      throw new Error(`${got.length} of your ${want.length} trips survived`);
    for (const w of want) {
      const g = got.find(x => x.id === w.id);
      if (!g) throw new Error('lost ' + w.id);
      if (Math.abs((g.tot || 0) - (w.tot || 0)) > 0.01)
        throw new Error(`${w.id}: ${g.tot} was ${w.tot}`);
      if (g.lines !== w.lines)
        throw new Error(`${w.id}: ${g.lines} lines, had ${w.lines}`);
    }
    console.log('      ' + got.length + ' intact');
  });
  await step('no duplicates, still in date order', async () => {
    const r = await pg.evaluate(() => ({
      ids: S.trips.map(t => t.id), ds: S.trips.map(t => t.date || '') }));
    const dupes = r.ids.filter((id, i) => r.ids.indexOf(id) !== i);
    if (dupes.length) throw new Error('duplicates: ' + [...new Set(dupes)].join(', '));
    for (let i = 1; i < r.ds.length; i++)
      if (r.ds[i] < r.ds[i - 1]) throw new Error('out of order at ' + r.ds[i]);
    console.log('      ' + r.ids.length + ' trips, unique and ordered');
  });
  await step('their saved rate of 17.90 is kept', async () => {
    const fx = await pg.evaluate(() => S.fx);
    if (Math.abs(fx - 17.9) > 0.001) throw new Error('fx is ' + fx);
  });

  console.log('\n--- it persists, and future corrections will land ---');
  await step('the repair is written to storage, not redone each launch', async () => {
    await pg.reload();
    await pg.waitForTimeout(700);
    const r = await pg.evaluate(() => {
      const s = JSON.parse(localStorage.getItem('despensa_v2'));
      return { seedV: s.seedV, trips: s.trips.length,
               empty: s.trips.filter(t => !(t.lines || []).length).length };
    });
    if (!r.seedV) throw new Error('seedV not persisted');
    if (r.empty) throw new Error(r.empty + ' empty trips after reload');
    console.log('      ' + r.trips + ' trips at seedV ' + r.seedV);
  });
  await step('a later seed bump rebuilds again, still sparing your trips', async () => {
    await pg.evaluate(() => {
      const s = JSON.parse(localStorage.getItem('despensa_v2'));
      s.seedV = 1;
      s.trips = s.trips.map(t => String(t.id).indexOf('seed-') === 0
        ? Object.assign({}, t, { lines: [], note: 'tampered' }) : t);
      localStorage.setItem('despensa_v2', JSON.stringify(s));
    });
    await pg.reload();
    await pg.waitForTimeout(700);
    const r = await pg.evaluate(() => ({
      tampered: S.trips.filter(t => t.note === 'tampered').length,
      empty: S.trips.filter(t => String(t.id).indexOf('seed-') === 0 && !(t.lines || []).length).length,
      mine: S.trips.filter(t => String(t.id).indexOf('seed-') !== 0).length }));
    if (r.tampered) throw new Error(r.tampered + ' tampered trips survived');
    if (r.empty) throw new Error(r.empty + ' left empty');
    if (r.mine !== 6) throw new Error('your trips went 6 → ' + r.mine);
    console.log('      rebuilt; your 6 trips untouched');
  });

  console.log('\n--- what the numbers become ---');
  await step('September counts the full receipts', async () => {
    const r = await pg.evaluate(() => byMonth()
      .map(m => ({ k: m.key, spend: Math.round(m.spend * 100) / 100, n: m.trips })));
    console.log('      ' + r.map(m => `${m.k}: ${m.n} trips MX$${m.spend}`).join(' · '));
    const sep = r.find(m => m.k === '2026-09');
    if (!sep || sep.spend < 10000) throw new Error('September looks short');
  });
  await step('no NaN, undefined or null on any tab', async () => {
    for (const go of ['dash', 'cat', 'hist', 'set']) {
      await pg.click(`#tabs [data-go="${go}"]`);
      await pg.waitForTimeout(220);
      const t = await pg.textContent('#main');
      for (const bad of ['NaN', 'undefined', 'null'])
        if (t.includes(bad)) throw new Error(bad + ' on ' + go);
    }
  });

  console.log('\nerrors: ' + (errs.length ? '\n' + errs.join('\n') : 'none'));
  console.log(fails ? '\n' + fails + ' FAILED' : '\nall passed');
  await b.close();
  process.exit(fails ? 1 : 0);
})();
