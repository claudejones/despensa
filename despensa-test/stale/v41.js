/* v4.1 — palette revert, header spacing, donut, defensible metrics.
   Seeded from the user's real export so the numbers are the real ones. */
const { chromium } = require('playwright');

(async () => {
  const b = await chromium.launch({});
  const pg = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  pg.setDefaultTimeout(4000);
  const errs = [];
  pg.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  pg.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });

  const raw = require('fs').readFileSync('/tmp/d.json', 'utf8');
  await pg.goto('file:///home/claude/despensa/index.html');
  await pg.evaluate((j) => {
    const d = JSON.parse(j);
    const map = { 'Fruit & Veg':'produce','Protein':'protein','Dairy & Chilled':'chilled',
      'Bakery & Tortillas':'bakery','Pantry':'pantry','Snacks':'snacks','Drinks':'drinks',
      'Household':'home','Personal Care':'care' };
    const st = { v:5, cat:11, appVersion:'4.0.0', fx:17.9, shops:d.shops,
                 items:{}, trips:d.trips, active:null };
    d.catalogue.forEach(c => {
      st.items[c.id] = { id:c.id, cat:map[c.category]||'pantry', es:c.es, en:c.en,
        q:c.qty, p:c.refPriceMXN, ref:c.shelfRef, hint:c.usualShop,
        active:true, hist:c.priceHistory };
    });
    localStorage.setItem('despensa_v2', JSON.stringify(st));
  }, raw);
  await pg.reload();
  await pg.waitForTimeout(700);

  let fails = 0;
  const step = async (l, fn) => {
    try { await fn(); console.log('  ok  ' + l); }
    catch (e) { fails++; console.log('FAIL  ' + l + ' — ' + e.message); }
  };

  console.log('--- palette reverted ---');
  await step('page background is Despensa paper, not Ledger cream', async () => {
    const got = await pg.evaluate(() =>
      getComputedStyle(document.body).backgroundColor);
    if (got !== 'rgb(247, 247, 244)') throw new Error('body bg ' + got);
  });
  await step('accent is the Despensa red', async () => {
    const got = await pg.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--store').trim());
    if (got.toUpperCase() !== '#D6431F') throw new Error('--store ' + got);
  });
  await step('no Ledger Casa tokens survive', async () => {
    const dead = await pg.evaluate(() => {
      const cs = getComputedStyle(document.documentElement);
      return ['--primary','--accent','--surface','--line','--ink-soft','--bad']
        .filter(k => cs.getPropertyValue(k).trim() !== '');
    });
    if (dead.length) throw new Error('still defined: ' + dead.join(', '));
  });
  await step('no webfont request — this has to paint offline', async () => {
    const n = await pg.evaluate(() =>
      document.querySelectorAll('link[href*="fonts.g"], link[rel="preconnect"]').length);
    if (n) throw new Error(n + ' font/preconnect links left in the head');
  });

  console.log('--- header spacing ---');
  await step('header is not flush to the left edge', async () => {
    const box = await pg.evaluate(() => {
      const t = document.getElementById('hTitle').getBoundingClientRect();
      const bar = document.querySelector('.hbar');
      return { left: t.left, pad: getComputedStyle(bar).paddingLeft };
    });
    if (box.left < 15) throw new Error('title starts at ' + box.left + 'px (pad ' + box.pad + ')');
    console.log('      title at ' + box.left + 'px, .hbar pad ' + box.pad);
  });
  await step('the .hrow collision is gone', async () => {
    const n = await pg.evaluate(() => document.querySelectorAll('header .hrow').length);
    if (n) throw new Error('header still uses .hrow');
  });
  await step('main content lines up with the header', async () => {
    const d = await pg.evaluate(() => {
      const h = document.getElementById('hTitle').getBoundingClientRect().left;
      const c = document.querySelector('.dcard').getBoundingClientRect().left;
      return Math.abs(h - c);
    });
    if (d > 2) throw new Error('header and card left edges differ by ' + d + 'px');
  });

  console.log('--- metrics that hold up ---');
  await step('no month-over-month category percentages', async () => {
    const t = await pg.textContent('#main');
    if (/% of the month/.test(t)) throw new Error('old share line still there');
    const gone = await pg.evaluate(() => typeof catDelta);
    if (gone !== 'undefined') throw new Error('catDelta still defined');
  });
  await step('nothing on screen claims a change over 100%', async () => {
    const pills = await pg.locator('.pill').allTextContents();
    const bad = pills.filter(s => {
      const m = s.match(/([+−-]?)(\d+(?:\.\d+)?)%/);
      return m && parseFloat(m[2]) > 100 && m[1];
    });
    if (bad.length) throw new Error('absurd deltas: ' + bad.join(', '));
    console.log('      ' + pills.length + ' pills, none over 100%');
  });
  await step('pace is withheld early in a thin month', async () => {
    const t = await pg.textContent('#main');
    const prog = await pg.evaluate(() => {
      const ms = byMonth(); const cur = ms[ms.length - 1];
      return { key: cur.key, trips: cur.trips, prog: monthProgress(cur.key) };
    });
    const early = prog.prog && prog.prog.partial &&
      (prog.prog.day < Math.ceil(prog.prog.days / 3) || prog.trips < 2);
    if (early && !/too early/.test(t)) throw new Error('projected from day ' + prog.prog.day + ' with ' + prog.trips + ' trip(s)');
    if (!early && /too early/.test(t)) throw new Error('withheld when it had enough data');
    console.log('      ' + prog.key + ': day ' + (prog.prog ? prog.prog.day + '/' + prog.prog.days : 'closed') +
                ', ' + prog.trips + ' trips → ' + (early ? 'withheld' : 'projected'));
  });
  await step('budget shows as money left, not a percentage of a projection', async () => {
    const t = await pg.textContent('#main');
    if (!/Still to spend|Over by/.test(t)) throw new Error('no money-remaining metric');
  });
  await step('weighed items are kept out of the price card', async () => {
    const r = await pg.evaluate(() => {
      const pw = priceWatch(20);
      return { shown: pw.map(x => x.es),
               weighed: pw.filter(x => byWeight(S.items[x.id])).map(x => x.es),
               excluded: weighedCount() };
    });
    if (r.weighed.length) throw new Error('by-weight items shown: ' + r.weighed.join(', '));
    console.log('      ' + r.shown.length + ' comparable, ' + r.excluded + ' excluded by weight');
  });
  await step('Manzana specifically is not reported as a price rise', async () => {
    const t = await pg.textContent('#main');
    const bad = /Manzana[\s\S]{0,80}\+\d{2,}%/.test(t);
    if (bad) throw new Error('apples still shown as a percentage move');
  });

  console.log('--- the donut ---');
  await step('donut renders one slice per category', async () => {
    const r = await pg.evaluate(() => {
      const svg = document.querySelector('.donut');
      if (!svg) return null;
      return { slices: svg.querySelectorAll('circle').length - 1,
               legend: document.querySelectorAll('.lrow.leg').length };
    });
    if (!r) throw new Error('no donut on the page');
    if (r.slices !== r.legend) throw new Error(r.slices + ' slices vs ' + r.legend + ' legend rows');
    console.log('      ' + r.slices + ' slices, ' + r.legend + ' legend rows');
  });
  await step('slice lengths sum to the full circle', async () => {
    const r = await pg.evaluate(() => {
      const cs = [...document.querySelectorAll('.donut circle')].slice(1);
      const C = 2 * Math.PI * 68;
      const sum = cs.reduce((s, c) => {
        const d = c.getAttribute('stroke-dasharray').split(' ').map(Number);
        return s + d[0];
      }, 0);
      return { sum, C, gaps: cs.length };
    });
    const slack = r.gaps * 1.6;              // the hairline gaps, nothing more
    if (Math.abs(r.sum - r.C) > slack)
      throw new Error('slices sum to ' + r.sum.toFixed(1) + ' of ' + r.C.toFixed(1));
    console.log('      ' + r.sum.toFixed(1) + '/' + r.C.toFixed(1) + ' circumference');
  });
  await step('legend percentages add up to about 100', async () => {
    const pcs = await pg.locator('.lpc').allTextContents();
    const sum = pcs.reduce((s, x) => s + parseInt(x, 10), 0);
    if (Math.abs(sum - 100) > pcs.length) throw new Error('legend sums to ' + sum + '%');
    console.log('      ' + pcs.length + ' rows summing to ' + sum + '%');
  });
  await step('each slice has its own colour from the one ramp', async () => {
    const cols = await pg.evaluate(() =>
      [...document.querySelectorAll('.donut circle')].slice(1)
        .map(c => c.getAttribute('stroke')));
    if (new Set(cols).size !== cols.length) throw new Error('duplicate slice colours');
  });

  console.log('--- the budget line ---');
  await step('month bars carry a dashed budget reference', async () => {
    const r = await pg.evaluate(() => {
      const l = document.querySelector('.mchart .mbudget');
      if (!l) return null;
      const bars = [...document.querySelectorAll('.mchart .mbar')];
      return { y: +l.getAttribute('y1'),
               tops: bars.map(b => +b.getAttribute('y')) };
    });
    if (!r) throw new Error('no budget line');
    if (r.tops.some(t => t < r.y - 0.5)) {
      /* a bar above the line means that month beat the budget — legitimate,
         just check the scale did not clip it */
      const clipped = await pg.evaluate(() =>
        [...document.querySelectorAll('.mchart .mbar')].some(b => +b.getAttribute('y') < 0));
      if (clipped) throw new Error('a bar is clipped off the top of the chart');
    }
    console.log('      budget at y=' + r.y.toFixed(1) + ', bar tops ' +
                r.tops.map(t => t.toFixed(0)).join('/'));
  });

  console.log('--- regressions ---');
  await step('one currency on screen at a time', async () => {
    const t = await pg.textContent('#main');
    const mx = /MX\$/.test(t), us = /(^|[^X])\$\d/.test(t.replace(/MX\$/g, 'MXX'));
    if (mx && us) throw new Error('both currencies at once');
    console.log('      ' + (mx ? 'MXN' : 'USD') + ' only');
  });
  await step('toggle flips the donut and the chart too', async () => {
    await pg.click('[data-ccy="usd"]');
    await pg.waitForTimeout(350);
    const t = await pg.textContent('#main');
    if (/MX\$/.test(t)) throw new Error('MXN left after switching');
    const c = await pg.textContent('.dctot');
    if (!c.startsWith('$')) throw new Error('donut centre: ' + c);
    const bl = await pg.evaluate(() => +document.querySelector('.mchart .mbudget').getAttribute('y1'));
    if (!isFinite(bl)) throw new Error('budget line lost its position in USD');
    await pg.click('[data-ccy="mxn"]');
    await pg.waitForTimeout(300);
  });
  await step('no NaN, no undefined, no null', async () => {
    const t = await pg.textContent('#main');
    for (const bad of ['NaN', 'undefined', 'null'])
      if (t.includes(bad)) throw new Error(bad + ' on screen');
  });
  await step('price rows still open the history drawer', async () => {
    const n = await pg.locator('#main [data-hist]').count();
    if (n) {
      await pg.locator('#main [data-hist]').first().click();
      await pg.waitForSelector('.bigchart');
      await pg.click('#xClose');
      await pg.waitForTimeout(200);
    }
    console.log('      ' + n + ' tappable price rows');
  });
  await step('nothing overflows the viewport', async () => {
    const over = await pg.evaluate(() =>
      [...document.querySelectorAll('#main *')]
        .filter(e => e.getBoundingClientRect().right > 391)
        .map(e => e.className || e.tagName).slice(0, 5));
    if (over.length) throw new Error('wider than the screen: ' + over.join(', '));
  });

  console.log('\nerrors: ' + (errs.length ? '\n' + errs.join('\n') : 'none'));
  console.log(fails ? '\n' + fails + ' FAILED' : '\nall passed');
  await b.close();
  process.exit(fails ? 1 : 0);
})();
