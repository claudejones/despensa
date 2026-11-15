/* v4.24 — a weighed item's quantity stops multiplying its money.

   The defect: `p` for an item sold by weight is the LAST BAG'S TOTAL, not
   a price each. Apples sat at 74.87 — 1.25 kg at 59.90/kg — and ticking
   six of them produced 6 × 74.87 = 449.22 against the 65.59 that 1.095 kg
   actually cost. On 25 Oct that put the estimate at MX$2,089.62 against a
   MX$1,593.51 receipt, 31% over, on five produce lines alone.

   The invariant this test locks, and the reason it is written as an
   invariant rather than against a total: nothing here hardcodes a price,
   a count or a receipt figure. It asserts the SHAPE — changing q moves a
   counted item's money and must not move a weighed one's — so it keeps
   holding when every price in the catalogue has moved on.

   The second half matters as much as the first: this must not quietly
   break the 73 items that are sold by the piece, where q × p is simply
   correct arithmetic. */
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

  /* Both populations come out of the catalogue itself — never a name or a
     count typed in here, which is how a test starts passing on luck. */
  const pop = await pg.evaluate(() => {
    const ids = Object.keys(S.items).filter(id => S.items[id].active && S.items[id].p > 0);
    return {
      weighed: ids.filter(id => byWeight(S.items[id])),
      counted: ids.filter(id => !byWeight(S.items[id]))
    };
  });

  console.log('--- the unit mismatch ---');

  await step('the catalogue really does hold both kinds', async () => {
    if (pop.weighed.length < 5) throw new Error('only ' + pop.weighed.length + ' weighed items');
    if (pop.counted.length < 5) throw new Error('only ' + pop.counted.length + ' counted items');
    console.log('      ' + pop.weighed.length + ' sold by weight, ' + pop.counted.length + ' by the piece');
  });

  await step('a weighed line costs the same at any quantity', async () => {
    const bad = await pg.evaluate(ids => ids.map(id => {
      const it = S.items[id];
      const one = lineTotal(it, { q: 1, paid: null });
      const six = lineTotal(it, { q: 6, paid: null });
      return (one === six) ? null : { id, one, six };
    }).filter(Boolean), pop.weighed);
    if (bad.length) throw new Error(bad.length + ' still multiply, e.g. ' + JSON.stringify(bad[0]));
  });

  await step('and it equals the price on file, not a multiple of it', async () => {
    const bad = await pg.evaluate(ids => ids.map(id => {
      const it = S.items[id];
      const v = lineTotal(it, { q: 4, paid: null });
      return (Math.abs(v - it.p) < 0.005) ? null : { id, v, p: it.p };
    }).filter(Boolean), pop.weighed);
    if (bad.length) throw new Error(JSON.stringify(bad[0]));
  });

  await step('a counted line still multiplies — this did not break jars', async () => {
    const bad = await pg.evaluate(ids => ids.map(id => {
      const it = S.items[id];
      const v = lineTotal(it, { q: 3, paid: null });
      return (Math.abs(v - it.p * 3) < 0.005) ? null : { id, v, want: it.p * 3 };
    }).filter(Boolean), pop.counted);
    if (bad.length) throw new Error(bad.length + ' stopped multiplying, e.g. ' + JSON.stringify(bad[0]));
  });

  await step('a price typed at the till wins, and is not multiplied either', async () => {
    const bad = await pg.evaluate(ids => ids.slice(0, 8).map(id => {
      const v = lineTotal(S.items[id], { q: 5, paid: 41.25 });
      return (Math.abs(v - 41.25) < 0.005) ? null : { id, v };
    }).filter(Boolean), pop.weighed);
    if (bad.length) throw new Error(JSON.stringify(bad[0]));
  });

  console.log('--- what the shopper sees ---');

  /* Build a real trip out of weighed items so the rows render through the
     same path the phone uses, not a stubbed one. */
  await pg.evaluate(() => go('dash'));
  await pg.waitForTimeout(300);
  await pg.click('#startTrip');
  await pg.waitForSelector('[data-shop="chedraui"]', { timeout: 2000 });
  if (await pg.locator('[data-seed="none"]').count()) await pg.click('[data-seed="none"]');
  await pg.click('[data-shop="chedraui"]');
  await pg.waitForTimeout(400);
  const picked = await pg.evaluate(ids => {
    S.active.lines = {};
    ids.slice(0, 5).forEach(id => { S.active.lines[id] = { state: 'need', q: 6, paid: null }; });
    save(); render();
    return ids.slice(0, 5);
  }, pop.weighed);
  await pg.evaluate(() => go('trip'));
  await pg.waitForTimeout(500);

  await step('a weighed row prints the shelf rate, not a count times a price', async () => {
    const metas = await pg.evaluate(ids => ids.map(id => {
      const el = document.querySelector('.row[data-id="' + id + '"] .meta');
      return { id, text: el ? el.textContent : '' };
    }), picked);
    const mult = metas.filter(m => /Qty\s*\d+\s*×/.test(m.text));
    if (mult.length) throw new Error('still shows a multiplication: ' + JSON.stringify(mult[0]));
    const noRate = metas.filter(m => !/\/\s*(kg|g|l|ml)\b/.test(m.text));
    if (noRate.length) throw new Error('no shelf rate on ' + JSON.stringify(noRate[0]));
    console.log('      e.g. ' + metas[0].text);
  });

  await step('the amount is marked approximate until a price is typed', async () => {
    const amts = await pg.evaluate(ids => ids.map(id => {
      const el = document.querySelector('.row[data-id="' + id + '"] .amt .mx');
      return { id, text: el ? el.textContent : '' };
    }), picked);
    const bare = amts.filter(a => a.text.indexOf('≈') !== 0);
    if (bare.length) throw new Error('unmarked estimate: ' + JSON.stringify(bare[0]));
  });

  await step('typing a price removes the mark', async () => {
    const id = picked[0];
    await pg.evaluate(i => { S.active.lines[i].paid = 55.5; save(); render(); }, id);
    await pg.waitForTimeout(300);
    const t = await pg.evaluate(i =>
      document.querySelector('.row[data-id="' + i + '"] .amt .mx').textContent, id);
    if (t.indexOf('≈') === 0) throw new Error('still marked approximate after a real price: ' + t);
    await pg.evaluate(i => { S.active.lines[i].paid = null; save(); render(); }, id);
  });

  await step('the price sheet asks for the bag, not a price each', async () => {
    await pg.evaluate(i => priceSheet(i), picked[1]);
    await pg.waitForTimeout(350);
    const txt = await pg.evaluate(() => document.querySelector('.sheet').textContent);
    if (/Price each/.test(txt)) throw new Error('still asks for a price each');
    if (!/bag/i.test(txt)) throw new Error('does not say the figure is the whole bag');
    await pg.evaluate(() => closeSheet());
    await pg.waitForTimeout(250);
  });

  console.log('--- the estimate as a whole ---');

  await step('the trip estimate no longer scales with the tick count', async () => {
    const r = await pg.evaluate(() => {
      const before = tripTotals().listed;
      Object.keys(S.active.lines).forEach(id => { S.active.lines[id].q = 12; });
      const after = tripTotals().listed;
      Object.keys(S.active.lines).forEach(id => { S.active.lines[id].q = 6; });
      return { before, after };
    });
    if (Math.abs(r.before - r.after) > 0.005)
      throw new Error('doubling every count moved it ' + r.before + ' -> ' + r.after);
    console.log('      MX$' + r.before.toFixed(2) + ' at q=6 and at q=12');
  });

  console.log('--- regressions ---');

  await step('no NaN, undefined or null on any tab', async () => {
    for (const s of ['dash', 'list', 'trip', 'hist', 'set']) {
      await pg.evaluate(x => go(x), s);
      await pg.waitForTimeout(350);
      const t = await pg.evaluate(() => document.body.innerText);
      const m = t.match(/NaN|undefined|\bnull\b/);
      if (m) throw new Error(s + ' shows ' + m[0]);
    }
  });

  await step('nothing overflows the viewport', async () => {
    const w = await pg.evaluate(() => document.documentElement.scrollWidth);
    if (w > 390) throw new Error('scrollWidth ' + w);
  });

  await step('cleanup leaves the store as it was', async () => {
    await pg.evaluate(() => { S.active = null; save(); });
  });

  console.log('\nerrors: ' + (errs.length ? errs.join('\n  ') : 'none'));
  if (!fails && !errs.length) console.log('\nall passed');
  await b.close();
  process.exit(fails || errs.length ? 1 : 0);
})();
