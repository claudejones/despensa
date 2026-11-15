/* v4.10 — quick trips.

   A quick trip is a one-off run with a total, a shop and a rate, and no
   itemised receipt. The whole risk of the feature is that it quietly
   corrupts figures built for baskets: an average basket that includes a
   baguette run, an off-list figure that claims every peso went on
   something unplanned, a duplicate-day flag that mistakes an errand for a
   receipt entered twice, a shopping cadence halved by bakery stops.

   So these tests are mostly about what a quick trip must NOT do. The
   money has to count everywhere; everything that describes a basket has
   to leave it out and say so. */
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
    await pg.evaluate(() => {
      if (S) {
        S.active = null;
        S.trips = S.trips.filter(t => t.kind !== 'quick');  /* no leftovers */
        save();
      }
    });
    await pg.reload();
    await pg.waitForTimeout(800);
  };
  await fresh();

  let fails = 0;
  const step = async (l, fn) => {
    try { await fn(); console.log('  ok  ' + l); }
    catch (e) { fails++; console.log('FAIL  ' + l + ' — ' + e.message); }
  };

  /* log one straight through the sheet, the way a person would */
  const logQuick = async ({ total, fx, cat, note, date }) => {
    await pg.click('#quickTrip');
    await pg.waitForSelector('#qkSave');
    if (date) await pg.fill('#qkDate', date);
    await pg.fill('#qkTot', String(total));
    await pg.fill('#qkFx', String(fx));
    if (cat !== undefined) await pg.selectOption('#qkCat', cat);
    if (note) await pg.fill('#qkNote', note);
    await pg.click('#qkSave');
    await pg.waitForTimeout(400);
  };

  console.log('--- getting to it ---');
  await step('the dashboard offers it under starting a trip', async () => {
    const t = await pg.textContent('#main');
    if (!/Log a quick trip/.test(t)) throw new Error('no button on the dashboard');
    if (!/no itemised receipt/i.test(t)) throw new Error('button does not say what it is');
  });
  await step('the sheet asks for the three things and nothing else required', async () => {
    await pg.click('#quickTrip');
    await pg.waitForSelector('#qkSave');
    for (const id of ['#qkShop', '#qkDate', '#qkTot', '#qkFx', '#qkCat', '#qkNote']) {
      if (!await pg.$(id)) throw new Error('missing field ' + id);
    }
    if (await pg.$('#qkDel')) throw new Error('a new trip offers a delete button');
  });
  await step('it refuses to save with no total', async () => {
    await pg.click('#qkSave');
    await pg.waitForTimeout(250);
    if (!await pg.$('#qkSave')) throw new Error('saved without a total');
    const t = await pg.textContent('body');
    if (!/Enter the total/.test(t)) throw new Error('no complaint shown');
  });
  await step('and with a nonsense rate', async () => {
    await pg.fill('#qkTot', '240');
    await pg.fill('#qkFx', '0');
    await pg.click('#qkSave');
    await pg.waitForTimeout(250);
    if (!await pg.$('#qkSave')) throw new Error('saved with rate 0');
    await pg.click('#qkCancel');
    await pg.waitForTimeout(250);
  });

  console.log('--- the record it writes ---');
  await step('shop, total, rate and USD all land', async () => {
    await logQuick({ total: 240, fx: 20, cat: 'bakery', note: 'Baguettes', date: todayStr() });
    const q = await pg.evaluate(() => S.trips.filter(t => t.kind === 'quick')[0]);
    if (!q) throw new Error('no quick trip saved');
    if (q.receiptTotal !== 240) throw new Error('total: ' + q.receiptTotal);
    if (q.fx !== 20) throw new Error('fx: ' + q.fx);
    if (q.totalUSD !== 12) throw new Error('USD: ' + q.totalUSD);
    if (!q.shopName) throw new Error('no shop name');
  });
  await step('no lines, and no off-list claim', async () => {
    const q = await pg.evaluate(() => S.trips.filter(t => t.kind === 'quick')[0]);
    if (!Array.isArray(q.lines) || q.lines.length) throw new Error('it has lines');
    if (q.offList !== null) throw new Error('offList is ' + q.offList + ', should be null');
    if (q.bought !== 0 || q.planned !== 0) throw new Error('claims a basket');
  });
  await step('the trip rate does not become the app default', async () => {
    const dflt = await pg.evaluate(() => S.fx);
    if (dflt === 20) throw new Error('S.fx was overwritten by the trip rate');
  });

  console.log('--- the money counts ---');
  await step('it is in the month total', async () => {
    const r = await pg.evaluate(() => {
      const k = monthKey(todayISO());
      const row = byMonth().filter(m => m.key === k)[0];
      return { spend: row.spend, trips: row.trips, quick: row.quick };
    });
    if (r.quick !== 1) throw new Error('month quick count: ' + r.quick);
    if (r.spend < 240) throw new Error('month spend does not include it: ' + r.spend);
  });
  await step('and in the shop total', async () => {
    const r = await pg.evaluate(() => {
      const s = shopStats([monthKey(todayISO())]);
      return s.map(x => ({ n: x.name, total: x.total, trips: x.trips, shops: x.shops, quick: x.quick, basket: x.basket }));
    });
    const withQuick = r.filter(x => x.quick > 0)[0];
    if (!withQuick) throw new Error('no shop row carries it');
    if (withQuick.total < 240) throw new Error('shop total excludes it');
  });
  await step('a tagged one joins its category whole', async () => {
    const r = await pg.evaluate(() => {
      const c = byCategory([monthKey(todayISO())]).filter(x => x.cat === 'bakery')[0];
      return c ? c.total : null;
    });
    if (r === null || r < 240) throw new Error('bakery total: ' + r);
  });

  console.log('--- what it must stay out of ---');
  /* These two work in an empty month on purpose. The current month already
     holds seeded Chedraui receipts, so an average computed over it is a
     real average of real shops and proves nothing either way. ISO is a
     month nothing has ever been logged in. */
  const ISO = '2026-01';
  await step('the basket average is built from full shops only', async () => {
    const r = await pg.evaluate((mk) => {
      S.trips.push({ id: 'tst-shop', shop: 'chedraui', shopName: 'Chedraui',
        date: mk + '-14', fx: 20, lines: [
          { id: 'x', es: 'Prueba', cat: 'pantry', q: 1, unitMXN: 1000, lineMXN: 1000, state: 'bought' }],
        listed: 1000, receiptTotal: 1000, offList: 0, bought: 1, skipped: 0, planned: 1, totalUSD: 50 });
      S.trips.push({ id: 'tst-quick', kind: 'quick', shop: 'chedraui',
        shopName: 'Chedraui', date: mk + '-20', fx: 20, cat: null, note: '',
        lines: [], receiptTotal: 240, listed: 0, offList: null,
        bought: 0, skipped: 0, planned: 0, totalUSD: 12 });
      save();
      const row = shopStats([mk]).filter(x => x.shop === 'chedraui')[0];
      return { basket: row.basket, shops: row.shops, quick: row.quick,
               trips: row.trips, total: row.total };
    }, ISO);
    /* a blended average would be 620, which describes neither run */
    if (r.basket !== 1000) throw new Error('basket is ' + r.basket + ', should be 1000');
    if (r.total !== 1240) throw new Error('total is ' + r.total + ', should be 1240');
    if (r.shops !== 1 || r.quick !== 1 || r.trips !== 2)
      throw new Error('split is ' + r.shops + '/' + r.quick + ' of ' + r.trips);
  });
  await step('a shop with only quick trips reports no basket at all', async () => {
    const r = await pg.evaluate((mk) => {
      S.trips = S.trips.filter(t => t.id !== 'tst-shop');
      save();
      const row = shopStats([mk]).filter(x => x.shop === 'chedraui')[0];
      const out = { basket: row.basket, total: row.total };
      S.trips = S.trips.filter(t => t.id !== 'tst-quick');
      save();
      return out;
    }, ISO);
    if (r.basket !== null) throw new Error('invented a basket of ' + r.basket);
    if (r.total !== 240) throw new Error('but the money still counts: ' + r.total);
  });
  await step('it is never flagged as a duplicate of the same day', async () => {
    const n = await pg.evaluate(() => {
      const k = monthKey(todayISO());
      S.trips.push({ id: 'tst-shop2', shop: 'chedraui', shopName: 'Chedraui',
        date: todayISO(), fx: 20, lines: [
          { id: 'x', es: 'Prueba', cat: 'pantry', q: 1, unitMXN: 1000, lineMXN: 1000, state: 'bought' }],
        listed: 1000, receiptTotal: 1000, offList: 0, bought: 1, skipped: 0, planned: 1, totalUSD: 50 });
      save();
      /* the quick trip above is at the same shop on the same day */
      const pairs = sameDayPairs().filter(p => p.date === todayISO().slice(0, 10));
      const quickInPairs = pairs.reduce((s, p) =>
        s + p.trips.filter(t => t.kind === 'quick').length, 0);
      S.trips = S.trips.filter(t => t.id !== 'tst-shop2');
      save();
      return quickInPairs;
    });
    if (n !== 0) throw new Error(n + ' quick trips were treated as duplicates');
  });
  await step('it does not shorten the gap between shops', async () => {
    const r = await pg.evaluate(() => {
      const before = tripCadence();
      /* a quick trip the day after the last shop would halve a real gap */
      const last = S.trips.filter(t => t.kind !== 'quick')
        .map(t => String(t.date || '').slice(0, 10)).sort().pop();
      const d = new Date(last); d.setDate(d.getDate() + 1);
      S.trips.push({ id: 'tst-q2', kind: 'quick', shop: 'chedraui', shopName: 'Chedraui',
        date: d.toISOString().slice(0, 10), fx: 20, cat: null, note: '', lines: [],
        receiptTotal: 80, listed: 0, offList: null, bought: 0, skipped: 0, planned: 0, totalUSD: 4 });
      save();
      const after = tripCadence();
      S.trips = S.trips.filter(t => t.id !== 'tst-q2');
      save();
      return { before, after };
    });
    if (r.before !== r.after)
      throw new Error('cadence moved ' + r.before + ' -> ' + r.after);
  });
  await step('the Rhythm card says the average excludes them', async () => {
    await pg.reload();
    await pg.waitForTimeout(700);
    const t = await pg.textContent('#main');
    if (!/basket average is from the/.test(t))
      throw new Error('no footnote explaining the split');
  });
  await step('the month subline splits shops from quick trips', async () => {
    const t = await pg.textContent('#main');
    if (!/\d+ quick/.test(t)) throw new Error('the split is hidden: ' + t.slice(0, 200));
  });

  /* 4.11: there is no untagged state. A quick trip is Mixed unless you say
     otherwise, so the breakdown is whole instead of apologising for a gap. */
  console.log('--- Mixed, so nothing falls out of the breakdown ---');
  await step('the sheet opens on Mixed, with no blank option', async () => {
    await pg.click('#quickTrip');
    await pg.waitForSelector('#qkCat');
    const r = await pg.evaluate(() => {
      const s = document.getElementById('qkCat');
      return { value: s.value,
               blanks: [...s.options].filter(o => o.value === '').length,
               n: s.options.length };
    });
    if (r.value !== 'mixed') throw new Error('defaults to ' + r.value);
    if (r.blanks) throw new Error('a blank option is still offered');
    if (r.n !== 10) throw new Error('expected 10 categories, got ' + r.n);
    await pg.click('#qkCancel');
    await pg.waitForTimeout(250);
  });
  await step('Mixed is never offered for an individual item', async () => {
    const r = await pg.evaluate(() => {
      itemSheet(null, 'pantry');
      const s = document.getElementById('iCat');
      const out = { has: [...s.options].some(o => o.value === 'mixed'),
                    n: s.options.length };
      closeSheet();
      return out;
    });
    if (r.has) throw new Error('Mixed is in the item picker');
    if (r.n !== 9) throw new Error('item picker has ' + r.n + ' categories, expected 9');
  });
  await step('and no catalogue item can already be filed under it', async () => {
    const n = await pg.evaluate(() =>
      Object.keys(S.items).filter(id => S.items[id].cat === 'mixed').length);
    if (n) throw new Error(n + ' items are filed as Mixed');
  });
  await step('an untagged one saved by 4.10 becomes Mixed on load', async () => {
    await pg.evaluate(() => {
      S.trips.forEach(t => { if (t.kind === 'quick') t.cat = null; });
      save();
    });
    await pg.reload();
    await pg.waitForTimeout(800);
    const r = await pg.evaluate(() => S.trips.filter(t => t.kind === 'quick')[0].cat);
    if (r !== 'mixed') throw new Error('migrated to ' + r);
  });
  await step('Where it goes shows it as a category, ranked by size', async () => {
    const r = await pg.evaluate(() => {
      const c = byCategory([monthKey(todayISO())]).filter(x => x.cat === 'mixed')[0];
      return c ? { total: c.total, name: c.name } : null;
    });
    if (!r) throw new Error('Mixed is absent from the breakdown');
    if (r.total < 240) throw new Error('Mixed total: ' + r.total);
    if (r.name !== 'Mixed') throw new Error('named ' + r.name);
    const t = await pg.textContent('#main');
    if (!/Mixed/.test(t)) throw new Error('not rendered on the dashboard');
  });
  await step('and the card no longer apologises for a gap', async () => {
    const t = await pg.textContent('#main');
    if (/not broken down here|untagged/i.test(t))
      throw new Error('the footnote survived');
    const gone = await pg.evaluate(() => typeof quickUntagged);
    if (gone !== 'undefined') throw new Error('quickUntagged() still defined');
  });
  await step('the breakdown now sums to the month total', async () => {
    const r = await pg.evaluate(() => {
      const k = monthKey(todayISO());
      const cats = byCategory([k]).reduce((s, c) => s + c.total, 0);
      const month = byMonth().filter(m => m.key === k)[0].spend;
      return { cats, month };
    });
    /* off-list on an unreconciled normal trip is a separate gap and is
       allowed to remain; what must not remain is a quick trip missing
       from the split entirely */
    if (r.cats + 0.01 < r.month - offListThisMonth)
      throw new Error('breakdown ' + r.cats.toFixed(2) + ' vs month ' + r.month.toFixed(2));
  });

  console.log('--- reading and editing it ---');
  await step('the trips list labels it a quick trip', async () => {
    await pg.click('#tabs [data-go="hist"]');
    await pg.waitForTimeout(400);
    const t = await pg.textContent('#main');
    if (!/Quick trip/.test(t)) throw new Error('not labelled in the list');
  });
  await step('and never as a receipt with nothing recorded', async () => {
    const t = await pg.textContent('#main');
    const rows = await pg.evaluate(() => {
      const q = S.trips.filter(t => t.kind === 'quick')[0];
      return document.querySelector('[data-trip="' + q.id + '"]').textContent;
    });
    if (/items not recorded/i.test(rows))
      throw new Error('shown as an unrecorded receipt: ' + rows);
    if (/0 item/.test(rows)) throw new Error('claims zero items: ' + rows);
  });
  await step('tapping it opens the fields, not a receipt', async () => {
    const id = await pg.evaluate(() => S.trips.filter(t => t.kind === 'quick')[0].id);
    await pg.click('[data-trip="' + id + '"]');
    await pg.waitForTimeout(400);
    if (!await pg.$('#qkTot')) throw new Error('did not open the quick-trip sheet');
    const t = await pg.textContent('#sheetBody');
    if (!/Edit quick trip/.test(t)) throw new Error('not in edit mode');
    if (/RECEIPT TOTAL/.test(t)) throw new Error('rendered a receipt view');
  });
  await step('the fields come back filled with what was entered', async () => {
    const v = await pg.evaluate(() => ({
      tot: document.getElementById('qkTot').value,
      fx: document.getElementById('qkFx').value }));
    if (Number(v.tot) !== 240) throw new Error('total: ' + v.tot);
    if (Number(v.fx) !== 20) throw new Error('fx: ' + v.fx);
  });
  await step('an edit replaces it rather than adding another', async () => {
    const before = await pg.evaluate(() => S.trips.filter(t => t.kind === 'quick').length);
    await pg.fill('#qkTot', '300');
    await pg.click('#qkSave');
    await pg.waitForTimeout(400);
    const r = await pg.evaluate(() => {
      const qs = S.trips.filter(t => t.kind === 'quick');
      return { n: qs.length, tot: qs[0].receiptTotal, usd: qs[0].totalUSD };
    });
    if (r.n !== before) throw new Error('count went ' + before + ' -> ' + r.n);
    if (r.tot !== 300) throw new Error('total not updated: ' + r.tot);
    if (r.usd !== 15) throw new Error('USD not recomputed: ' + r.usd);
  });
  await step('the receipt text, if anyone asks for it, is honest', async () => {
    const s = await pg.evaluate(() =>
      receiptText(S.trips.filter(t => t.kind === 'quick')[0]));
    if (!/QUICK TRIP/.test(s)) throw new Error('not marked as one');
    if (/OFF-LIST/.test(s)) throw new Error('claims an off-list figure');
    if (/0 ITEMS/.test(s)) throw new Error('claims zero items');
    if (!/TOTAL\s+300\.00/.test(s)) throw new Error('no total:\n' + s);
  });
  await step('it exports like any other trip', async () => {
    const o = await pg.evaluate(() => {
      const q = S.trips.filter(t => t.kind === 'quick')[0];
      return JSON.parse(JSON.stringify(tripPayload(q)));
    });
    if (o.trip.kind !== 'quick') throw new Error('kind lost in export');
    if (o.trip.receiptTotal !== 300) throw new Error('total lost in export');
  });
  await step('deleting it removes exactly one trip', async () => {
    const id = await pg.evaluate(() => S.trips.filter(t => t.kind === 'quick')[0].id);
    const before = await pg.evaluate(() => S.trips.length);
    await pg.click('[data-trip="' + id + '"]');
    await pg.waitForSelector('#qkDel');
    await pg.click('#qkDel');
    await pg.waitForTimeout(400);
    const after = await pg.evaluate(() => S.trips.length);
    if (after !== before - 1) throw new Error(before + ' -> ' + after);
    const left = await pg.evaluate(() => S.trips.filter(t => t.kind === 'quick').length);
    if (left) throw new Error('still ' + left + ' quick trips');
  });

  console.log('--- it survives the rest of the app ---');
  await step('a rebuild of the seeded receipts leaves it alone', async () => {
    const r = await pg.evaluate(() => {
      S.trips.push({ id: 'quick-keepme', kind: 'quick', shop: 'chedraui',
        shopName: 'Chedraui', date: todayISO(), fx: 20, cat: null, note: '',
        lines: [], receiptTotal: 99, listed: 0, offList: null,
        bought: 0, skipped: 0, planned: 0, totalUSD: 4.95 });
      S.seedFP = 'deadbeef';          /* force the fingerprint gate open */
      save();
      return true;
    });
    await pg.reload();
    await pg.waitForTimeout(800);
    const kept = await pg.evaluate(() => {
      const q = S.trips.filter(t => t.id === 'quick-keepme')[0];
      return q ? { tot: q.receiptTotal, off: q.offList, lines: q.lines.length } : null;
    });
    if (!kept) throw new Error('the rebuild deleted it');
    if (kept.off !== null) throw new Error('repairTrips invented offList ' + kept.off);
    if (kept.tot !== 99) throw new Error('total changed to ' + kept.tot);
  });
  await step('no errors on any tab with one in the data', async () => {
    for (const tab of ['dash', 'trip', 'hist', 'cat', 'set']) {
      await pg.click('#tabs [data-go="' + tab + '"]');
      await pg.waitForTimeout(350);
      const t = await pg.textContent('#main');
      if (/NaN|undefined|\[object/.test(t))
        throw new Error(tab + ': ' + t.match(/.{0,40}(NaN|undefined|\[object).{0,40}/)[0]);
    }
  });
  await step('cleanup leaves the store as it was', async () => {
    await pg.evaluate(() => {
      S.trips = S.trips.filter(t => t.kind !== 'quick');
      save();
    });
    const n = await pg.evaluate(() => S.trips.filter(t => t.kind === 'quick').length);
    if (n) throw new Error('cleanup failed');
  });

  console.log('\nerrors: ' + (errs.length ? '\n  ' + errs.join('\n  ') : 'none'));
  console.log(fails ? '\n' + fails + ' FAILED' : '\nall passed');
  await b.close();
  process.exit(fails || errs.length ? 1 : 0);
})();

function todayStr() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0')
    + '-' + String(d.getDate()).padStart(2, '0');
}
