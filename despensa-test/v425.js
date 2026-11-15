/* v4.25 — price history records only what was observed.

   saveTrip used to fall back to the catalogue price when no price was typed,
   and then write THAT into history dated today. A line ticked off in the
   aisle without entering anything produced a price point nobody ever saw —
   and afterwards indistinguishable from one read off a receipt.

   It does not wash out. A catalogue rebuild overwrites p, ref, cat and hint
   unconditionally, but takes the shipped history only when it is at least as
   long as the phone's. A phone carrying invented points keeps them, and they
   go on feeding the sparkline and the "more than usual" card.

   Three properties, and the third is the one that proves it is a real
   distinction rather than history being switched off:

     1. ticking a line and typing nothing writes no price point
     2. typing a price writes exactly one, at that price
     3. the trip itself still carries a figure for the untyped line — the
        line record falls back, only the history does not */
const { chromium } = require('playwright');

(async () => {
  const b = await chromium.launch({});
  const pg = await b.newPage({ viewport: { width: 390, height: 844 } });
  pg.setDefaultTimeout(5000);
  const errs = [];
  pg.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  pg.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });
  await pg.goto('file:///home/claude/despensa/index.html');
  await pg.evaluate(() => { S.active = null; save(); });
  await pg.reload();
  await pg.waitForTimeout(900);

  let fails = 0;
  const step = async (l, fn) => {
    try { await fn(); console.log('  ok  ' + l); }
    catch (e) { fails++; console.log('FAIL  ' + l + ' — ' + e.message); }
  };

  /* Two counted items out of the catalogue itself — no name typed in here.
     Counted, so the assertion is about history and not about weight. */
  const pick = await pg.evaluate(() => Object.keys(S.items)
    .filter(id => S.items[id].active && S.items[id].p > 0 && !byWeight(S.items[id]))
    .slice(0, 2));

  const before = await pg.evaluate(ids => ids.map(id => (S.items[id].hist || []).length), pick);

  console.log('--- only an observed price is a price point ---');

  const r = await pg.evaluate(ids => {
    const t = { id: 'trip-test-' + Date.now(), shop: 'chedraui', note: '', budgetUSD: null, lines: {} };
    /* one ticked with nothing typed, one with a real figure off a receipt */
    t.lines[ids[0]] = { state: 'bought', q: 1, paid: null };
    t.lines[ids[1]] = { state: 'bought', q: 1, paid: 61.11 };
    S.active = t;
    saveTrip('2026-10-26T12:00', 18.5, null);
    const saved = S.trips[S.trips.length - 1];
    return {
      tripId: saved.id,
      hist: ids.map(id => (S.items[id].hist || []).slice()),
      lines: ids.map(id => saved.lines.filter(l => l.id === id)[0])
    };
  }, pick);

  await step('ticking a line and typing nothing writes no price point', async () => {
    if (r.hist[0].length !== before[0])
      throw new Error('history grew ' + before[0] + ' -> ' + r.hist[0].length +
        ', last = ' + JSON.stringify(r.hist[0][r.hist[0].length - 1]));
  });

  await step('typing a price writes exactly one, at that price', async () => {
    if (r.hist[1].length !== before[1] + 1)
      throw new Error('history went ' + before[1] + ' -> ' + r.hist[1].length);
    const last = r.hist[1][r.hist[1].length - 1];
    if (Math.abs(last.p - 61.11) > 0.005) throw new Error('recorded ' + last.p);
    if (last.d !== '2026-10-26') throw new Error('dated ' + last.d);
  });

  await step('the untyped line still carries a figure on the trip', async () => {
    const l = r.lines[0];
    if (l.lineMXN === null || l.lineMXN === undefined || isNaN(l.lineMXN))
      throw new Error('line lost its amount: ' + JSON.stringify(l));
    console.log('      no history point, but the trip records MX$' + l.lineMXN.toFixed(2));
  });

  await step('no invented point anywhere in the catalogue from that save', async () => {
    const bad = await pg.evaluate(d => Object.keys(S.items).map(id => {
      const h = S.items[id].hist || [];
      const today = h.filter(x => x.d === d);
      return today.length ? { id, n: today.length, p: today.map(x => x.p) } : null;
    }).filter(Boolean), '2026-10-26');
    if (bad.length !== 1) throw new Error(bad.length + ' items got a point: ' + JSON.stringify(bad));
  });

  console.log('--- regressions ---');

  await step('a receipt-total trip still saves and ties', async () => {
    const ok = await pg.evaluate(id => {
      const t = S.trips.filter(x => x.id === id)[0];
      return t && t.lines.length === 2 && t.listed > 0;
    }, r.tripId);
    if (!ok) throw new Error('the trip did not save cleanly');
  });

  await step('no NaN, undefined or null on any tab', async () => {
    /* saveTrip() opens its own confirmation sheet; calling it directly
       leaves that sheet over the tab bar. */
    await pg.evaluate(() => { try { closeSheet(); } catch (e) {} });
    await pg.waitForTimeout(400);
    for (const s of ['dash', 'cat', 'hist', 'set']) {
      await pg.click('#tabs [data-go="' + s + '"]');
      await pg.waitForTimeout(350);
      const t = await pg.evaluate(() => document.body.innerText);
      const m = t.match(/NaN|undefined|\bnull\b/);
      if (m) throw new Error(s + ' shows ' + m[0]);
    }
  });

  await step('cleanup leaves the store as it was', async () => {
    await pg.evaluate(id => {
      S.trips = S.trips.filter(t => t.id !== id);
      S.active = null; save();
    }, r.tripId);
  });

  console.log('\nerrors: ' + (errs.length ? errs.join('\n  ') : 'none'));
  if (!fails && !errs.length) console.log('\nall passed');
  await b.close();
  process.exit(fails || errs.length ? 1 : 0);
})();
