/* v4.2 — month navigation, ranked category bars, budget pace tick.
   Seeded from the user's real export: 3 months, 16 trips. */
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
    const st = { v:5, cat:11, appVersion:'4.1.0', fx:17.9, shops:d.shops,
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
  const label = () => pg.locator('#mJump').textContent();

  console.log('--- the filter row ---');
  await step('one filter row, above every card', async () => {
    const r = await pg.evaluate(() => {
      const f = document.querySelector('.filters');
      if (!f) return null;
      const ft = f.getBoundingClientRect().top;
      const cards = [...document.querySelectorAll('.dcard')];
      return { above: cards.every(c => c.getBoundingClientRect().top > ft),
               inCard: !!document.querySelector('.dcard .filters'),
               ccyInCard: !!document.querySelector('.dcard .ccy'),
               n: cards.length };
    });
    if (!r) throw new Error('no filter row');
    if (r.inCard || r.ccyInCard) throw new Error('a filter is still inside a card');
    if (!r.above) throw new Error('a card sits above the filter row');
    console.log('      scopes ' + r.n + ' cards; currency moved out of the card');
  });
  await step('filter row sticks under the header', async () => {
    const r = await pg.evaluate(() => {
      const cs = getComputedStyle(document.querySelector('.filters'));
      return { pos: cs.position, top: cs.top };
    });
    if (r.pos !== 'sticky') throw new Error('position: ' + r.pos);
    if (!parseFloat(r.top)) throw new Error('top: ' + r.top);
    console.log('      sticky at ' + r.top);
  });

  console.log('--- stepping through months ---');
  await step('opens on the latest month', async () => {
    const t = await label();
    if (!t.includes('October 2026')) throw new Error(t);
    console.log('      ' + t.replace(/\s+/g, ' '));
  });
  await step('next arrow is disabled at the newest month', async () => {
    const d = await pg.locator('[data-mstep="1"]').isDisabled();
    if (!d) throw new Error('next is live on the newest month');
  });
  await step('back goes to September, then August', async () => {
    await pg.click('[data-mstep="-1"]'); await pg.waitForTimeout(250);
    let t = await label();
    if (!t.includes('September')) throw new Error('after one step: ' + t);
    await pg.click('[data-mstep="-1"]'); await pg.waitForTimeout(250);
    t = await label();
    if (!t.includes('August')) throw new Error('after two steps: ' + t);
    console.log('      ' + t.replace(/\s+/g, ' '));
  });
  await step('prev arrow is disabled at the oldest month', async () => {
    const d = await pg.locator('[data-mstep="-1"]').isDisabled();
    if (!d) throw new Error('prev is live on the oldest month');
  });
  await step('it never wraps past either end', async () => {
    await pg.evaluate(() => {
      document.querySelector('[data-mstep="-1"]').disabled = false;
      document.querySelector('[data-mstep="-1"]').click();
    });
    await pg.waitForTimeout(250);
    const t = await label();
    if (!t.includes('August')) throw new Error('wrapped to ' + t);
  });

  console.log('--- every card follows the month ---');
  await step('the headline number changes with the month', async () => {
    const aug = await pg.textContent('.bignum');
    await pg.click('[data-mstep="1"]'); await pg.waitForTimeout(250);
    const sep = await pg.textContent('.bignum');
    await pg.click('[data-mstep="1"]'); await pg.waitForTimeout(250);
    const oct = await pg.textContent('.bignum');
    if (aug === sep || sep === oct) throw new Error(`${aug} / ${sep} / ${oct}`);
    console.log('      Aug ' + aug + ' · Sep ' + sep + ' · Oct ' + oct);
  });
  await step('headline matches that month in the trips roll-up', async () => {
    const r = await pg.evaluate(() => {
      const ms = byMonth(), i = dashIndex(ms);
      return { shown: document.querySelector('.bignum').textContent,
               computed: m(ms[i].spend, 0), key: ms[i].key };
    });
    if (r.shown !== r.computed) throw new Error(r.key + ': shows ' + r.shown + ', should be ' + r.computed);
  });
  await step('categories and shop card re-scope too', async () => {
    const octCats = await pg.locator('#main .dcard .lrow .lname').allTextContents();
    await pg.click('[data-mstep="-1"]'); await pg.waitForTimeout(250);
    const sepCats = await pg.locator('#main .dcard .lrow .lname').allTextContents();
    if (JSON.stringify(octCats) === JSON.stringify(sepCats))
      throw new Error('category rows identical across two months');
    const n = await pg.evaluate(() => {
      const ms = byMonth(), i = dashIndex(ms);
      return byCategory([ms[i].key]).filter(c => c.total > 0).length;
    });
    console.log('      September has ' + n + ' categories with spend');
    await pg.click('[data-mstep="1"]'); await pg.waitForTimeout(250);
  });
  await step('month chart highlights the selected month, not the last', async () => {
    await pg.click('[data-mstep="-1"]'); await pg.waitForTimeout(250);
    const r = await pg.evaluate(() => {
      const bars = [...document.querySelectorAll('.mchart .mbar')];
      return { cur: bars.map((b, i) => b.classList.contains('cur') ? i : -1).filter(i => i >= 0),
               n: bars.length };
    });
    if (r.cur.length !== 1) throw new Error(r.cur.length + ' bars highlighted');
    if (r.cur[0] !== r.n - 2) throw new Error('highlighted bar ' + r.cur[0] + ' of ' + r.n);
    await pg.click('[data-mstep="1"]'); await pg.waitForTimeout(250);
  });

  console.log('--- the jump list ---');
  await step('tapping the label lists every month with trips', async () => {
    await pg.click('#mJump');
    await pg.waitForSelector('[data-mgo]');
    const n = await pg.locator('[data-mgo]').count();
    const months = await pg.evaluate(() => byMonth().length);
    if (n !== months) throw new Error(n + ' entries for ' + months + ' months');
    console.log('      ' + n + ' months listed');
  });
  await step('picking one jumps straight there and closes', async () => {
    await pg.click('[data-mgo="2026-08"]');
    await pg.waitForTimeout(300);
    const open = await pg.locator('.sheet.open').count();
    if (open) throw new Error('sheet stayed open');
    const t = await label();
    if (!t.includes('August')) throw new Error(t);
  });
  await step('returning to the newest month resets to follow-latest', async () => {
    await pg.click('#mJump'); await pg.waitForSelector('[data-mgo]');
    await pg.click('[data-mgo="2026-10"]'); await pg.waitForTimeout(300);
    const pinned = await pg.evaluate(() => dashMonth);
    if (pinned !== null) throw new Error('still pinned to ' + pinned);
  });

  console.log('--- ranked bars, not a donut ---');
  await step('the donut is gone', async () => {
    const d = await pg.locator('.donut').count();
    if (d) throw new Error('donut still rendering');
    const fn = await pg.evaluate(() => typeof donut);
    if (fn !== 'undefined') throw new Error('donut() still defined');
  });
  await step('categories are ranked biggest first', async () => {
    const r = await pg.evaluate(() => {
      const ms = byMonth(), i = dashIndex(ms);
      return byCategory([ms[i].key]).filter(c => c.total > 0).map(c => c.total);
    });
    for (let i = 1; i < r.length; i++)
      if (r[i] > r[i - 1]) throw new Error('out of order at ' + i);
    console.log('      ' + r.length + ' categories, descending');
  });
  await step('one colour for every bar — no value-ramp', async () => {
    const cols = await pg.evaluate(() =>
      [...document.querySelectorAll('#main .catbar > div')]
        .map(d => getComputedStyle(d).backgroundColor));
    const uniq = [...new Set(cols)];
    if (uniq.length > 2) throw new Error(uniq.length + ' bar colours: ' + uniq.join(' '));
    console.log('      ' + cols.length + ' bars, ' + uniq.length + ' colour(s)');
  });
  await step('shares add up to about 100', async () => {
    const pcs = await pg.locator('#main .lpc').allTextContents();
    const sum = pcs.reduce((s, x) => s + parseInt(x, 10), 0);
    if (!pcs.length) throw new Error('no share figures');
    if (Math.abs(sum - 100) > pcs.length) throw new Error('sums to ' + sum + '%');
    console.log('      ' + pcs.length + ' rows, ' + sum + '%');
  });

  console.log('--- the pace tick ---');
  await step('open month shows a tick at how far through it is', async () => {
    const r = await pg.evaluate(() => {
      const t = document.querySelector('.bbtick');
      if (!t) return null;
      const ms = byMonth(), i = dashIndex(ms), p = monthProgress(ms[i].key);
      return { left: t.style.left, want: (p.day / p.days * 100).toFixed(1) + '%' };
    });
    if (!r) throw new Error('no tick on the current month');
    if (r.left !== r.want) throw new Error('tick at ' + r.left + ', month is ' + r.want + ' gone');
    console.log('      tick at ' + r.left);
  });
  await step('a closed month has no tick — it has no pace', async () => {
    await pg.click('[data-mstep="-1"]'); await pg.waitForTimeout(250);
    const t = await pg.locator('.bbtick').count();
    if (t) throw new Error('closed month still shows a pace tick');
    await pg.click('[data-mstep="1"]'); await pg.waitForTimeout(250);
  });

  console.log('--- regressions ---');
  await step('one currency at a time, and it survives a month change', async () => {
    await pg.click('[data-ccy="usd"]'); await pg.waitForTimeout(300);
    await pg.click('[data-mstep="-1"]'); await pg.waitForTimeout(300);
    const t = await pg.textContent('#main');
    if (/MX\$/.test(t)) throw new Error('MXN leaked through after a month step');
    const on = await pg.locator('.ccy button.on').textContent();
    if (on !== 'USD') throw new Error('currency reset to ' + on);
    await pg.click('[data-ccy="mxn"]'); await pg.waitForTimeout(250);
    await pg.click('[data-mstep="1"]'); await pg.waitForTimeout(250);
  });
  await step('no NaN, undefined or null on any month', async () => {
    for (let i = 0; i < 3; i++) {
      const t = await pg.textContent('#main');
      for (const bad of ['NaN', 'undefined', 'null'])
        if (t.includes(bad)) throw new Error(bad + ' on ' + (await label()).trim());
      if (i < 2) { await pg.click('[data-mstep="-1"]'); await pg.waitForTimeout(250); }
    }
  });
  await step('nothing overflows the viewport on any month', async () => {
    for (let i = 0; i < 3; i++) {
      const over = await pg.evaluate(() =>
        [...document.querySelectorAll('#main *')]
          .filter(e => e.getBoundingClientRect().right > 391)
          .map(e => e.className || e.tagName).slice(0, 4));
      if (over.length) throw new Error('wider than the screen: ' + over.join(', '));
      if (i < 2) { await pg.click('[data-mstep="1"]'); await pg.waitForTimeout(250); }
    }
  });
  await step('arrows meet a 34px hit target', async () => {
    const r = await pg.evaluate(() => {
      const b = document.querySelector('[data-mstep="-1"]').getBoundingClientRect();
      return { w: Math.round(b.width), h: Math.round(b.height) };
    });
    if (r.w < 34 || r.h < 34) throw new Error(r.w + '×' + r.h);
    console.log('      ' + r.w + '×' + r.h);
  });

  console.log('\nerrors: ' + (errs.length ? '\n' + errs.join('\n') : 'none'));
  console.log(fails ? '\n' + fails + ' FAILED' : '\nall passed');
  await b.close();
  process.exit(fails ? 1 : 0);
})();
