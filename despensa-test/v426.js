/* v4.26 — the catalogue and the sync patch, checked against the live build.

   Written on 14 Nov after a container reset took the working suite with it.
   What came back was an archive of 4.9-era copies that test functions the app
   no longer has, so this file is not a restoration — it is current coverage
   for the thing that actually changed: catalogue data and a sync patch.

   Everything here is derived. No item count, no price, no receipt total is
   typed in: the figures come from catalogue.js and sync/latest.json at run
   time, so this keeps holding after the next shop. The one literal is the
   14 Nov receipt total, and it is here precisely so that a patch which stops
   tying cannot reach a phone quietly. */
const { chromium } = require('playwright');
const fs = require('fs');

const PATCH = JSON.parse(fs.readFileSync('/home/claude/despensa/sync/latest.json', 'utf8'));
const CAT   = fs.readFileSync('/home/claude/despensa-src/catalogue.js', 'utf8');

(async () => {
  const b = await chromium.launch({});
  const pg = await b.newPage({ viewport: { width: 390, height: 844 } });
  pg.setDefaultTimeout(6000);
  const errs = [];
  pg.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  pg.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });
  await pg.goto('file:///home/claude/despensa/index.html');
  await pg.waitForTimeout(1200);

  let fails = 0;
  const step = async (l, fn) => {
    try { await fn(); console.log('  ok  ' + l); }
    catch (e) { fails++; console.log('FAIL  ' + l + ' — ' + e.message); }
  };

  console.log('--- the build reaches the phone ---');

  await step('the app boots with no error and seeds itself', async () => {
    const r = await pg.evaluate(() => ({
      items: Object.keys(S.items).length, trips: S.trips.length,
      catFP: S.catFP, liveFP: CAT_FP, ver: APP_VERSION }));
    if (r.items < 100) throw new Error('only ' + r.items + ' items seeded');
    if (r.catFP !== r.liveFP) throw new Error('catalogue fingerprint did not take');
    console.log('      ' + r.ver + ' · ' + r.items + ' items · ' + r.trips + ' trips · fp ' + r.catFP);
  });

  await step('every catalogue entry the source declares is live', async () => {
    const want = [...CAT.matchAll(/\bes:"((?:[^"\\]|\\.)*)"/g)].map(m => m[1])
      .filter(n => n !== 'chedraui' && n !== 'dac');
    const got = await pg.evaluate(() => Object.values(S.items).map(i => i.es));
    const missing = want.filter(n => !got.includes(n));
    if (missing.length) throw new Error(missing.length + ' never arrived, e.g. ' + missing[0]);
    console.log('      ' + want.length + ' declared, ' + want.length + ' live');
  });

  await step('no entry carries a price of zero or nothing', async () => {
    const bad = await pg.evaluate(() => Object.values(S.items)
      .filter(i => i.active && !(i.p > 0)).map(i => i.es));
    if (bad.length) throw new Error(bad.join(', '));
  });

  console.log('--- the sync patch ---');

  await step('the patch names a trip id, never a seeded one', async () => {
    const ids = Object.keys(PATCH.trips).concat(PATCH.removeTrips || []);
    const seeded = ids.filter(i => i.indexOf('seed-') === 0);
    if (seeded.length) throw new Error('names seeded data: ' + seeded.join(', '));
    if (!ids.length) throw new Error('patch carries no trip');
  });

  await step('its lines tie to the receipt total, to the centavo', async () => {
    const t = PATCH.trips[Object.keys(PATCH.trips)[0]];
    const sum = Math.round(t.lines.reduce((s, l) => s + l.lineMXN, 0) * 100) / 100;
    if (Math.abs(sum - t.receiptTotal) > 0.005)
      throw new Error('lines ' + sum.toFixed(2) + ' vs receipt ' + t.receiptTotal.toFixed(2));
    if (Math.abs(t.receiptTotal - 4754.00) > 0.005)
      throw new Error('receipt total is ' + t.receiptTotal + ', the 14 Nov paper says 4754.00');
    if (t.offList !== 0) throw new Error('offList is ' + t.offList + ', a reconciled trip owes nothing');
    if (Math.abs(t.listed - t.receiptTotal) > 0.005) throw new Error('listed != receiptTotal');
    console.log('      ' + t.lines.length + ' lines · MX$' + sum.toFixed(2) + ' · US$' + t.totalUSD);
  });

  await step('a discount is its own line, never netted into an item', async () => {
    const t = PATCH.trips[Object.keys(PATCH.trips)[0]];
    const neg = t.lines.filter(l => l.lineMXN < 0);
    if (!neg.length) throw new Error('no discount lines at all');
    const sum = Math.round(-neg.reduce((s, l) => s + l.lineMXN, 0) * 100) / 100;
    if (Math.abs(sum - 209.85) > 0.005)
      throw new Error('discounts total ' + sum.toFixed(2) + ', the paper says 209.85');
    console.log('      ' + neg.length + ' discount lines, MX$' + sum.toFixed(2));
  });

  await step('every priced line resolves to a real catalogue item', async () => {
    const t = PATCH.trips[Object.keys(PATCH.trips)[0]];
    const ids = t.lines.filter(l => l.lineMXN >= 0).map(l => l.id);
    const orphans = await pg.evaluate(xs => xs.filter(i => !S.items[i]), ids);
    if (orphans.length) throw new Error('orphan lines: ' + orphans.join(', '));
  });

  await step('a weighed line carries its weight and its rate', async () => {
    const t = PATCH.trips[Object.keys(PATCH.trips)[0]];
    const w = t.lines.filter(l => l.kg);
    if (!w.length) throw new Error('no weighed lines');
    const bad = w.filter(l => !(l.rate > 0) || Math.abs(l.kg * l.rate - l.lineMXN) > 0.02);
    if (bad.length) throw new Error(JSON.stringify(bad[0]));
    console.log('      ' + w.length + ' weighed lines, each reproducing its own line total');
  });

  await step('the patch applies, and the trip lands once', async () => {
    const r = await pg.evaluate(p => {
      const before = S.trips.length;
      syncApply(p, syncPlan(p));
      const id = Object.keys(p.trips)[0];
      return { before, after: S.trips.length,
               hits: S.trips.filter(t => t.id === id).length,
               spend: spendOf(S.trips.filter(t => t.id === id)[0]) };
    }, PATCH);
    if (r.hits !== 1) throw new Error('the trip appears ' + r.hits + ' times');
    if (Math.abs(r.spend - 4754.00) > 0.005) throw new Error('spend reads ' + r.spend);
    console.log('      ' + r.before + ' trips -> ' + r.after + ', counted once at MX$' + r.spend.toFixed(2));
  });

  await step('applying it twice changes nothing', async () => {
    const r = await pg.evaluate(p => {
      const before = S.trips.length;
      syncApply(p, syncPlan(p));
      return { before, after: S.trips.length };
    }, PATCH);
    if (r.before !== r.after) throw new Error(r.before + ' -> ' + r.after + ' on a replay');
  });

  console.log('--- nothing broken on the way through ---');

  await step('no NaN, undefined or null on any tab', async () => {
    for (const s of ['dash', 'cat', 'hist', 'set']) {
      await pg.click('#tabs [data-go="' + s + '"]');
      await pg.waitForTimeout(400);
      const t = await pg.evaluate(() => document.body.innerText);
      const m = t.match(/NaN|undefined|\bnull\b/);
      if (m) throw new Error(s + ' shows ' + m[0]);
    }
  });

  await step('nothing overflows the viewport', async () => {
    const w = await pg.evaluate(() => document.documentElement.scrollWidth);
    if (w > 390) throw new Error('scrollWidth ' + w);
  });

  await step('a weighed item still does not multiply its money', async () => {
    const bad = await pg.evaluate(() => Object.keys(S.items)
      .filter(id => S.items[id].active && S.items[id].p > 0 && byWeight(S.items[id]))
      .filter(id => lineTotal(S.items[id], { q: 1, paid: null })
                 !== lineTotal(S.items[id], { q: 6, paid: null })));
    if (bad.length) throw new Error(bad.length + ' multiply again, e.g. ' + bad[0]);
  });

  console.log('\nerrors: ' + (errs.length ? errs.join('\n  ') : 'none'));
  if (!fails && !errs.length) console.log('\nall passed');
  await b.close();
  process.exit(fails || errs.length ? 1 : 0);
})();
