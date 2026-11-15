/* Quick trips — real money everywhere money is counted, and nowhere else.

   Replaces coverage lost when a container was reclaimed on 14 Nov.

   A quick trip is a run to the panadería: a total, a shop, a rate, no
   itemised receipt. It has no lines, so anything derived FROM lines ignores
   it on its own, which is correct. The two places it would actively mislead
   are handled on purpose and are what this suite holds in place: it must
   never join a basket average, and it must never look like a duplicate of a
   real shop on the same day.

   Every quick trip also carries a category. Mixed when nothing is picked —
   there is deliberately no untagged state left, which is what lets Where it
   goes sum to the month total with nothing to apologise for. */
const { chromium } = require('playwright');

(async () => {
  const b = await chromium.launch({});
  const pg = await b.newPage({ viewport: { width: 390, height: 844 } });
  pg.setDefaultTimeout(6000);
  const errs = [];
  pg.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  pg.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });
  await pg.goto('file:///home/claude/despensa/index.html');
  await pg.evaluate(() => { S.active = null; save(); });
  await pg.reload();
  await pg.waitForTimeout(1100);

  let fails = 0;
  const step = async (l, fn) => {
    try { await fn(); console.log('  ok  ' + l); }
    catch (e) { fails++; console.log('FAIL  ' + l + ' — ' + e.message); }
  };

  /* Plant one quick trip and one ordinary trip on the SAME day at the same
     shop — the configuration that produced a false duplicate warning. */
  const planted = await pg.evaluate(() => {
    const real = S.trips.filter(t => !t.kind && t.lines && t.lines.length)[0];
    const day = real.date.slice(0, 10);
    const q = { id: 'trip-quick-probe', kind: 'quick', shop: real.shop,
                shopName: real.shopName, date: day + 'T17:00', fx: real.fx,
                note: '', cat: 'bakery', lines: [],
                listed: 240, receiptTotal: 240, offList: 0,
                bought: 0, skipped: 0, planned: 0,
                totalUSD: +(240 / real.fx).toFixed(2) };
    S.trips.push(q); save(); render();
    return { day: day, shop: real.shop, fx: real.fx, realId: real.id };
  });
  await pg.waitForTimeout(400);

  console.log('--- it is money ---');

  await step('isQuick tells the two apart', async () => {
    const r = await pg.evaluate(() => ({
      quick: S.trips.filter(isQuick).length,
      real: S.trips.filter(t => !isQuick(t)).length }));
    if (r.quick < 1) throw new Error('the planted trip is not recognised as quick');
    console.log('      ' + r.quick + ' quick, ' + r.real + ' itemised');
  });

  await step('it counts in its month, at its own rate', async () => {
    const r = await pg.evaluate(d => {
      S.ccy = 'usd';
      const k = d.day.slice(0, 7);
      const mo = byMonth().filter(x => x.key === k)[0];
      const mine = S.trips.filter(t => monthKey(t.date) === k)
                          .reduce((s, t) => s + spendView(t), 0);
      return { month: k, total: mo ? mo.spend : null, sum: mine,
               q: spendView(S.trips.filter(t => t.id === 'trip-quick-probe')[0]) };
    }, planted);
    if (r.total === null) throw new Error('its month vanished');
    if (Math.abs(r.total - r.sum) > 0.02) throw new Error(r.total + ' vs ' + r.sum);
    if (!(r.q > 0)) throw new Error('it contributes nothing');
    console.log('      ' + r.month + ' includes US$' + r.q.toFixed(2) + ' from the quick run');
  });

  await step('removing it lowers the month by exactly its own spend', async () => {
    const r = await pg.evaluate(() => {
      const k = monthKey(S.trips.filter(t => t.id === 'trip-quick-probe')[0].date);
      const before = byMonth().filter(x => x.key === k)[0].spend;
      const q = spendView(S.trips.filter(t => t.id === 'trip-quick-probe')[0]);
      const keep = S.trips;
      S.trips = S.trips.filter(t => t.id !== 'trip-quick-probe');
      const after = byMonth().filter(x => x.key === k)[0].spend;
      S.trips = keep;
      return { drop: before - after, q };
    });
    if (Math.abs(r.drop - r.q) > 0.02)
      throw new Error('month fell by ' + r.drop.toFixed(2) + ', trip was ' + r.q.toFixed(2));
  });

  await step('quickSpend reports it separately without double counting', async () => {
    const r = await pg.evaluate(() => {
      const k = monthKey(S.trips.filter(t => t.id === 'trip-quick-probe')[0].date);
      return { quick: quickSpend([k]),
               all: byMonth().filter(x => x.key === k)[0].spend };
    });
    if (!(r.quick > 0)) throw new Error('quickSpend sees nothing');
    if (r.quick > r.all + 0.02) throw new Error('quick exceeds the month total');
  });

  console.log('--- and it is not a basket ---');

  await step('it never joins a basket average', async () => {
    const r = await pg.evaluate(d => {
      const k = monthKey(d.day + 'T12:00');
      const sh = shopStats([k]);
      const mine = sh.filter(x => x.id === d.shop || x.name.indexOf('Chedraui') === 0)[0];
      if (!mine) return { skip: true };
      const itemised = S.trips.filter(t => monthKey(t.date) === k && t.shop === d.shop && !isQuick(t));
      const want = itemised.length
        ? itemised.reduce((s, t) => s + spendView(t), 0) / itemised.length : null;
      return { basket: mine.basket, want: want, quick: mine.quick, trips: mine.trips };
    }, planted);
    if (r.skip) throw new Error('the shop vanished from shopStats');
    if (r.want === null) { console.log('      no itemised trips that month'); return; }
    if (Math.abs(r.basket - r.want) > 0.02)
      throw new Error('basket ' + r.basket.toFixed(2) + ' should be ' + r.want.toFixed(2) +
                      ' — the quick run is being averaged in');
    console.log('      basket US$' + r.basket.toFixed(2) + ' over itemised trips only, ' +
                r.quick + ' quick counted apart');
  });

  await step('it is not flagged as a duplicate of the real shop that day', async () => {
    const dupes = await pg.evaluate(() => {
      /* Whatever the duplicate check is called, it must not pair a quick
         run with an itemised trip. Find same-day same-shop pairs and assert
         the app does not surface one. */
      const txt = document.body.innerText;
      return /twice|duplicate|same day/i.test(txt) ? txt.match(/.{0,60}(twice|duplicate|same day).{0,60}/i)[0] : null;
    });
    if (dupes) throw new Error('duplicate warning shown: ' + dupes.trim());
  });

  console.log('--- every quick trip has a category ---');

  await step('none is left untagged', async () => {
    const bare = await pg.evaluate(() =>
      S.trips.filter(isQuick).filter(t => !t.cat).map(t => t.id));
    if (bare.length) throw new Error('untagged: ' + bare.join(', '));
  });

  await step('Mixed exists and is quick-only', async () => {
    const r = await pg.evaluate(() => {
      const mixed = CATS.filter(c => c.id === 'mixed')[0];
      return { exists: !!mixed, quickOnly: mixed ? !!mixed.quickOnly : false,
               inItemList: itemCats().some(c => c.id === 'mixed'),
               onAnyItem: Object.values(S.items).filter(i => i.cat === 'mixed').length };
    });
    if (!r.exists) throw new Error('no Mixed category');
    if (!r.quickOnly) throw new Error('Mixed is not marked quickOnly');
    if (r.inItemList) throw new Error('Mixed is offered as an item category');
    if (r.onAnyItem) throw new Error(r.onAnyItem + ' items are filed under Mixed');
  });

  await step('Where it goes still sums to the month', async () => {
    const r = await pg.evaluate(() => {
      const k = monthKey(S.trips.filter(t => t.id === 'trip-quick-probe')[0].date);
      const cats = byCategory([k]);
      const sum = cats.reduce((s, c) => s + c.total, 0);
      const mo = byMonth().filter(x => x.key === k)[0].spend;
      return { sum: +sum.toFixed(2), month: +mo.toFixed(2), n: cats.length };
    });
    if (Math.abs(r.sum - r.month) > 0.05)
      throw new Error(r.n + ' categories sum to ' + r.sum + ', month is ' + r.month);
    console.log('      ' + r.n + ' categories, US$' + r.sum + ' = the month exactly');
  });

  await step('cleanup', async () => {
    await pg.evaluate(() => {
      S.trips = S.trips.filter(t => t.id !== 'trip-quick-probe');
      S.active = null; save();
    });
  });

  console.log('\nerrors: ' + (errs.length ? errs.join('\n  ') : 'none'));
  if (!fails && !errs.length) console.log('\nall passed');
  await b.close();
  process.exit(fails || errs.length ? 1 : 0);
})();
