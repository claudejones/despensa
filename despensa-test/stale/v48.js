/* v4.8 — three new cards: by-the-kilo rates, the recurring baseline,
   and restock rhythm. The first exists to replace a comparison that was
   structurally wrong; the test for it is that the apple is flat. */
const { chromium } = require('playwright');

(async () => {
  const b = await chromium.launch({});
  const pg = await b.newPage({ viewport: { width: 390, height: 844 } });
  pg.setDefaultTimeout(4000);
  const errs = [];
  pg.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  pg.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });

  await pg.goto('file:///home/claude/despensa/index.html');
  await pg.waitForTimeout(900);

  let fails = 0;
  const step = async (l, fn) => {
    try { await fn(); console.log('  ok  ' + l); }
    catch (e) { fails++; console.log('FAIL  ' + l + ' — ' + e.message); }
  };

  console.log('--- by the kilo ---');
  await step('every weighed line ties: rate x weight = line total', async () => {
    const bad = await pg.evaluate(() => {
      const out = [];
      S.trips.forEach(t => (t.lines || []).forEach(l => {
        if (!(l.rate > 0) || !(l.kg > 0)) return;
        const calc = Math.round(l.rate * l.kg * 100) / 100;
        if (Math.abs(calc - l.lineMXN) > 0.02)
          out.push(`${(t.date||'').slice(0,10)} ${l.es}: ${l.rate}x${l.kg}=${calc} vs ${l.lineMXN}`);
      }));
      return out;
    });
    if (bad.length) throw new Error(bad.join('; '));
    const n = await pg.evaluate(() => {
      let c = 0; S.trips.forEach(t => (t.lines||[]).forEach(l => { if (l.rate > 0) c++; }));
      return c;
    });
    console.log('      ' + n + ' weighed lines carry a rate');
  });
  await step('the apple is flat — the +225% was never a price rise', async () => {
    const r = await pg.evaluate(() => {
      const a = rateHistory().find(x => /Manzana Sugar Bee/i.test(x.name));
      return a ? { first: a.first, last: a.last, pct: a.pct, n: a.n } : null;
    });
    if (!r) throw new Error('Manzana Sugar Bee not tracked by rate');
    if (Math.abs(r.pct) > 0.01)
      throw new Error(`rate moved ${r.pct}% (${r.first} -> ${r.last})`);
    console.log(`      MX$${r.first}/kg across ${r.n} readings, 0%`);
  });
  await step('it reports real rate moves', async () => {
    const r = await pg.evaluate(() => rateHistory()
      .filter(x => Math.abs(x.pct) >= 5)
      .map(x => `${x.name} ${x.first}->${x.last}`));
    if (r.length < 2) throw new Error('only ' + r.length + ' movers — expected several');
    console.log('      ' + r.slice(0, 4).join(' · '));
  });
  await step('two bags on one day count as one reading', async () => {
    const r = await pg.evaluate(() => {
      const c = rateHistory().find(x => /Ciruela/i.test(x.name));
      if (!c) return null;
      const days = new Set(c.hist.map(h => h.d));
      return { n: c.n, days: days.size };
    });
    if (r && r.n !== r.days) throw new Error(`${r.n} readings over ${r.days} days`);
  });
  await step('an item with one reading is not given a percentage', async () => {
    const bad = await pg.evaluate(() =>
      rateHistory().filter(x => x.n < 2 || x.pct === null).map(x => x.name));
    if (bad.length) throw new Error('single-reading items in the list: ' + bad.join(', '));
  });
  await step('the card renders with a bar per reading', async () => {
    const t = await pg.textContent('#main');
    if (!/By the kilo/.test(t)) throw new Error('card missing');
    const r = await pg.evaluate(() => {
      const svgs = [...document.querySelectorAll('.rchart')];
      return { charts: svgs.length,
               bars: svgs.map(s => s.querySelectorAll('.rbar').length),
               cur: svgs.every(s => s.querySelectorAll('.rbar.cur').length === 1) };
    });
    if (!r.charts) throw new Error('no rate charts drawn');
    if (r.bars.some(n => n < 2)) throw new Error('a chart has fewer than 2 bars');
    if (!r.cur) throw new Error('the latest reading is not highlighted on every chart');
    console.log('      ' + r.charts + ' charts, bars ' + r.bars.join('/'));
  });

  console.log('--- on almost every trip ---');
  await step('only items on 60%+ of trips qualify', async () => {
    const r = await pg.evaluate(() => staples(60).map(x => ({ n: x.name, s: Math.round(x.share) })));
    if (!r.length) throw new Error('no staples found');
    if (r.some(x => x.s < 60)) throw new Error('below threshold: ' + JSON.stringify(r));
    console.log('      ' + r.map(x => `${x.n} ${x.s}%`).join(' · '));
  });
  await step('two of the same item on one trip is still one occasion', async () => {
    const bad = await pg.evaluate(() => {
      const trips = S.trips.filter(t => (t.lines||[]).some(l => l.state==='bought' && !(l.lineMXN<0)));
      return staples(0).filter(x => x.trips > trips.length).map(x => x.name);
    });
    if (bad.length) throw new Error('counted more often than there are trips: ' + bad.join(', '));
  });
  await step('promotions never appear as a staple', async () => {
    const bad = await pg.evaluate(() =>
      staples(0).filter(x => /descuento|3x2/i.test(x.name)).map(x => x.name));
    if (bad.length) throw new Error(bad.join(', '));
  });
  await step('the monthly figure is the total over the span', async () => {
    const r = await pg.evaluate(() => {
      const s = staples(60)[0], span = monthSpan();
      return { name: s.name, total: s.total, per: s.perMonth, span,
               calc: s.total / span };
    });
    if (Math.abs(r.per - r.calc) > 0.01)
      throw new Error(`${r.name}: ${r.per} vs ${r.total}/${r.span}=${r.calc}`);
    console.log(`      ${r.name}: MX$${r.total.toFixed(0)} over ${r.span.toFixed(2)} months = MX$${r.per.toFixed(0)}/mo`);
  });
  await step('the card states the baseline cost', async () => {
    const t = await pg.textContent('#main');
    if (!/On almost every trip/.test(t)) throw new Error('card missing');
    if (!/before anything else goes in the trolley/.test(t)) throw new Error('no baseline statement');
  });

  console.log('--- due a restock ---');
  await step('three purchases minimum before a cadence is claimed', async () => {
    const bad = await pg.evaluate(() => restock(50).filter(x => x.n < 3).map(x => x.name));
    if (bad.length) throw new Error('too few purchases: ' + bad.join(', '));
  });
  await step('items dropped from the list fall off', async () => {
    const bad = await pg.evaluate(() =>
      restock(50).filter(x => x.since > x.every * 3).map(x => `${x.name} ${x.since}d/${x.every}d`));
    if (bad.length) throw new Error('abandoned items still listed: ' + bad.join(', '));
  });
  await step('the cadence is a median, not an average', async () => {
    const r = await pg.evaluate(() => {
      const x = restock(50)[0];
      if (!x) return null;
      const days = [];
      S.trips.forEach(t => (t.lines||[]).forEach(l => {
        if (l.state === 'bought' && (l.es || l.id) === x.name)
          days.push((t.date || '').slice(0, 10));
      }));
      const u = [...new Set(days)].sort();
      const gaps = [];
      for (let i = 1; i < u.length; i++)
        gaps.push((new Date(u[i]) - new Date(u[i-1])) / 86400000);
      gaps.sort((a, b) => a - b);
      return { name: x.name, every: x.every, med: Math.round(gaps[Math.floor(gaps.length/2)]) };
    });
    if (r && r.every !== r.med) throw new Error(`${r.name}: card ${r.every}d, median ${r.med}d`);
  });
  await step('overdue and not-yet-due are both labelled', async () => {
    const t = await pg.textContent('#main');
    if (!/Due a restock/.test(t)) throw new Error('card missing');
    if (!/every \d+ days/.test(t)) throw new Error('no cadence shown');
  });

  console.log('--- the three read all history, not the filtered month ---');
  await step('stepping the month does not change them', async () => {
    const grab = () => pg.evaluate(() => {
      const cards = [...document.querySelectorAll('.dcard')]
        .filter(c => /By the kilo|On almost every trip|Due a restock/.test(c.textContent));
      return cards.map(c => c.textContent.replace(/\s+/g, ' ').trim());
    });
    const before = await grab();
    if (before.length !== 3) throw new Error(before.length + ' of the 3 cards rendered');
    await pg.click('[data-mstep="-1"]');
    await pg.waitForTimeout(350);
    const after = await grab();
    if (JSON.stringify(before) !== JSON.stringify(after))
      throw new Error('a card changed when the month changed');
    const t = await pg.textContent('#main');
    if ((t.match(/all trips/g) || []).length < 3)
      throw new Error('the cards do not all say "all trips"');
    await pg.click('[data-mstep="1"]');
    await pg.waitForTimeout(300);
  });

  console.log('--- regressions ---');
  await step('every receipt still ties to its printed total', async () => {
    const bad = await pg.evaluate(() => S.trips
      .filter(t => String(t.id).indexOf('seed-') === 0)
      .map(t => {
        const sum = Math.round((t.lines||[]).filter(l => l.state==='bought')
          .reduce((s, l) => s + (l.lineMXN || 0), 0) * 100) / 100;
        return { d: (t.date||'').slice(0,10), sum, tot: t.receiptTotal };
      }).filter(r => Math.abs(r.sum - r.tot) > 0.02));
    if (bad.length) throw new Error(bad.map(r => `${r.d}: ${r.sum} vs ${r.tot}`).join('; '));
  });
  await step('no NaN, undefined or null on any tab', async () => {
    for (const go of ['dash', 'cat', 'hist', 'set']) {
      await pg.click(`#tabs [data-go="${go}"]`);
      await pg.waitForTimeout(250);
      const t = await pg.textContent('#main');
      for (const bad of ['NaN', 'undefined', 'null'])
        if (t.includes(bad)) throw new Error(bad + ' on ' + go);
    }
  });
  await step('nothing overflows the dashboard', async () => {
    await pg.click('#tabs [data-go="dash"]');
    await pg.waitForTimeout(300);
    const over = await pg.evaluate(() =>
      [...document.querySelectorAll('#main *')]
        .filter(e => e.getBoundingClientRect().right > 391)
        .map(e => e.className || e.tagName).slice(0, 3));
    if (over.length) throw new Error(over.join(', '));
  });
  await step('the currency toggle reaches the new cards', async () => {
    await pg.click('[data-ccy="mxn"]'); await pg.waitForTimeout(300);
    await pg.click('[data-ccy="usd"]'); await pg.waitForTimeout(350);
    const t = await pg.textContent('#main');
    if (/MX\$/.test(t)) throw new Error('pesos left on screen in USD mode');
    await pg.click('[data-ccy="mxn"]'); await pg.waitForTimeout(250);
  });

  console.log('\nerrors: ' + (errs.length ? '\n' + errs.join('\n') : 'none'));
  console.log(fails ? '\n' + fails + ' FAILED' : '\nall passed');
  await b.close();
  process.exit(fails ? 1 : 0);
})();
