/* Currency — every figure converted exactly once, at its own trip's rate.

   Replaces coverage lost when a container was reclaimed on 14 Nov. Named for
   what it tests rather than for the version it shipped in, because a version
   number stops meaning anything the moment the file it described is gone.

   The defect this guards against was real and shipped twice. Each trip
   carries the rate its card was actually charged at, so a monthly total is a
   sum of per-trip conversions, not one month of pesos run through today's
   setting. Two functions exist for that: conv() converts, mv() formats a
   figure that is ALREADY converted. Hand a converted figure to m() and it
   divides by the rate a second time, which is how the month chart once read
   32/33/24 and the rhythm card read US$27,952.

   The last check is the one that matters most: it is structural. A sweep for
   "m(" missed a hand-written division, and the eye missed it twice after
   that. */
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

  console.log('--- a trip converts at its own rate ---');

  await step('trips really do carry different rates', async () => {
    const r = await pg.evaluate(() => {
      const fx = S.trips.map(t => t.fx).filter(x => x > 0);
      return { n: fx.length, distinct: [...new Set(fx)].length,
               lo: Math.min.apply(null, fx), hi: Math.max.apply(null, fx) };
    });
    if (r.distinct < 2)
      throw new Error('every trip shares one rate — this suite would prove nothing');
    console.log('      ' + r.n + ' trips, ' + r.distinct + ' distinct rates, ' +
                r.lo.toFixed(2) + '–' + r.hi.toFixed(2));
  });

  await step("conv() uses the trip's rate, not the setting", async () => {
    const bad = await pg.evaluate(() => {
      S.ccy = 'usd';
      return S.trips.filter(t => t.fx > 0).map(t => {
        const want = spendOf(t) / t.fx;
        const got = spendView(t);
        return Math.abs(want - got) < 0.005 ? null : { id: t.id, want, got, fx: t.fx };
      }).filter(Boolean);
    });
    if (bad.length) throw new Error(bad.length + ' wrong, e.g. ' + JSON.stringify(bad[0]));
  });

  await step('pesos pass through untouched', async () => {
    const bad = await pg.evaluate(() => {
      S.ccy = 'mxn';
      const out = S.trips.filter(t => Math.abs(spendView(t) - spendOf(t)) > 0.005);
      S.ccy = 'usd';
      return out.length;
    });
    if (bad) throw new Error(bad + ' trips altered in the peso view');
  });

  await step('a month total is the sum of its trips, each at its own rate', async () => {
    const r = await pg.evaluate(() => {
      S.ccy = 'usd';
      const ms = byMonth();
      return ms.map(mo => {
        const want = S.trips.filter(t => monthKey(t.date) === mo.key)
                            .reduce((s, t) => s + spendView(t), 0);
        return Math.abs(want - mo.spend) < 0.02 ? null
             : { month: mo.key, want: +want.toFixed(2), got: +mo.spend.toFixed(2) };
      }).filter(Boolean);
    });
    if (r.length) throw new Error(JSON.stringify(r[0]));
  });

  await step('one rate for every trip would reproduce the naive figure', async () => {
    /* If this fails, per-trip rates are not actually being used anywhere:
       the whole month collapses to pesos-over-one-rate and the defect is
       back without any individual assertion noticing. */
    const r = await pg.evaluate(() => {
      S.ccy = 'usd';
      const ms = byMonth();
      const real = ms.reduce((s, mo) => s + mo.spend, 0);
      const naive = S.trips.reduce((s, t) => s + spendOf(t), 0) / S.fx;
      return { real: +real.toFixed(2), naive: +naive.toFixed(2) };
    });
    if (Math.abs(r.real - r.naive) < 0.5)
      throw new Error('per-trip conversion is indistinguishable from one flat rate (' +
                      r.real + ' vs ' + r.naive + ')');
    console.log('      per-trip US$' + r.real + ' against a flat rate US$' + r.naive);
  });

  console.log('--- nothing is converted twice ---');

  await step('mv() formats without converting', async () => {
    const r = await pg.evaluate(() => {
      S.ccy = 'usd';
      return { mv: mv(100), m: m(100) };
    });
    const mvNum = parseFloat(String(r.mv).replace(/[^0-9.]/g, ''));
    const mNum  = parseFloat(String(r.m).replace(/[^0-9.]/g, ''));
    if (Math.abs(mvNum - 100) > 0.5)
      throw new Error('mv(100) printed ' + r.mv + ' — it converted');
    if (Math.abs(mNum - 100) < 0.5)
      throw new Error('m(100) printed ' + r.m + ' — it did NOT convert, so the pair is pointless');
    console.log('      mv(100)=' + r.mv + '  m(100)=' + r.m);
  });

  await step('no dollar figure on screen is off by a factor of the rate', async () => {
    /* US$27,952 was pesos wearing a dollar sign. Any figure above a sane
       ceiling for a monthly grocery budget is that bug returning. */
    await pg.evaluate(() => { S.ccy = 'usd'; render(); });
    await pg.waitForTimeout(400);
    for (const s of ['dash', 'hist']) {
      await pg.click('#tabs [data-go="' + s + '"]');
      await pg.waitForTimeout(400);
      const huge = await pg.evaluate(() => {
        const out = [];
        (document.body.innerText.match(/US\$[\d,]+(\.\d+)?/g) || []).forEach(x => {
          const n = parseFloat(x.replace(/[^0-9.]/g, ''));
          if (n > 5000) out.push(x);
        });
        return out;
      });
      if (huge.length) throw new Error(s + ' shows ' + huge.join(', '));
    }
  });

  console.log('--- the structural guard ---');

  /* Both sweeps below resolve the ENCLOSING function of each match, because
     the first version of this suite flagged m(), usd() and the price chart —
     the three places allowed to divide — and reported the app broken. A
     structural guard that cannot tell a definition from a call site is just
     a grep with a bad temper. */
  const enclosing = (src, idx) => {
    const before = src.slice(0, idx);
    const m = [...before.matchAll(/^function\s+([A-Za-z0-9_$]+)\s*\(/gm)];
    return m.length ? m[m.length - 1][1] : '(top level)';
  };

  await step('only the formatters divide by S.fx', async () => {
    /* conv() and m() convert; budgetInView() scales the budget to match;
       rateBars() converts a per-kilo PRICE and carries a comment saying why
       one flat rate belongs there: converting each reading at its own trip's
       rate would fold currency movement into the line, and a dearer avocado
       would be indistinguishable from a weaker peso. Anywhere else, a hand-rolled division
       is the bug that made the month chart read 32/33/24. */
    const ALLOWED = ['m', 'conv', 'usd', 'budgetInView', 'sparkSVG', 'rateBars'];
    const src = require('fs').readFileSync(
      '/home/claude/despensa/despensa-src/app.js', 'utf8');
    const bad = [];
    for (const mt of src.matchAll(/\/\s*S\.fx/g)) {
      const fn = enclosing(src, mt.index);
      if (ALLOWED.indexOf(fn) < 0)
        bad.push(fn + '() at char ' + mt.index);
    }
    if (bad.length) throw new Error('hand-rolled conversion in ' + bad.join(', '));
    console.log('      every division lives in one of: ' + ALLOWED.join(', '));
  });

  await step('no view pastes a currency sign onto a raw number', async () => {
    const ALLOWED = ['m', 'mv', 'mx', 'usd', 'm2'];
    const src = require('fs').readFileSync(
      '/home/claude/despensa/despensa-src/app.js', 'utf8');
    const bad = [];
    for (const mt of src.matchAll(/["']US\$["']\s*\+|["']MX\$["']\s*\+/g)) {
      const fn = enclosing(src, mt.index);
      if (ALLOWED.indexOf(fn) < 0) bad.push(fn + '()');
    }
    if (bad.length)
      throw new Error('a currency sign built by hand in ' + [...new Set(bad)].join(', '));
  });

  await step('cleanup', async () => {
    await pg.evaluate(() => { S.ccy = 'usd'; S.active = null; save(); });
  });

  console.log('\nerrors: ' + (errs.length ? errs.join('\n  ') : 'none'));
  if (!fails && !errs.length) console.log('\nall passed');
  await b.close();
  process.exit(fails || errs.length ? 1 : 0);
})();
