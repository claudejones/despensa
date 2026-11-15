/* Categories — one denominator, a real summary row, and a drill-down that
   survives a rebuild.

   Replaces coverage lost when a container was reclaimed on 14 Nov.

   Where it goes is the month-to-month comparison axis, so three things have
   to stay true. The bar and the percentage on a row must share a
   denominator — they did not once, and Pantry read 29% beside a bar at full
   width. The total row owns the 100%, so the category rows sum to it rather
   than each being a share of something different. And a recategorisation has
   to outlive the next catalogue rebuild, because the rebuild overwrites cat
   unconditionally: S.catFix is reapplied after every seed, and if that ever
   stops happening the correction silently reverts and nobody is told. */
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

  await pg.click('#tabs [data-go="dash"]');
  await pg.waitForTimeout(600);

  console.log('--- one denominator per row ---');

  await step('the bar width and the percentage agree', async () => {
    const rows = await pg.evaluate(() => {
      const card = [...document.querySelectorAll('.dcard')]
        .filter(c => /Where it goes/i.test(c.textContent))[0];
      if (!card) return null;
      return [...card.querySelectorAll('.lrow')].map(r => {
        const pc = r.querySelector('.lpc');
        const bar = r.querySelector('.catbar > div');
        return { name: (r.querySelector('.lname') || {}).textContent || '',
                 pc: pc ? parseFloat(pc.textContent) : null,
                 w: bar ? parseFloat(bar.style.width) : null };
      }).filter(x => x.pc !== null && x.w !== null);
    });
    if (!rows) throw new Error('no Where it goes card');
    if (!rows.length) throw new Error('no rows carrying both a bar and a share');
    const off = rows.filter(r => Math.abs(r.pc - r.w) > 1.5);
    if (off.length)
      throw new Error(off[0].name + ': ' + off[0].pc + '% beside a bar at ' + off[0].w + '%');
    console.log('      ' + rows.length + ' rows, bar and share within 1.5 points');
  });

  await step('the shares sum to the whole, not to something larger', async () => {
    const pcs = await pg.evaluate(() => {
      const card = [...document.querySelectorAll('.dcard')]
        .filter(c => /Where it goes/i.test(c.textContent))[0];
      return [...card.querySelectorAll('.lrow')]
        .map(r => r.querySelector('.lpc'))
        .filter(Boolean).map(e => parseFloat(e.textContent))
        .filter(n => !isNaN(n));
    });
    const sum = pcs.reduce((s, x) => s + x, 0);
    if (Math.abs(sum - 100) > pcs.length)
      throw new Error(pcs.length + ' shares sum to ' + sum.toFixed(1) + '%');
    console.log('      ' + pcs.length + ' shares, ' + sum.toFixed(0) + '%');
  });

  await step('byCategory sums to the month it was asked for', async () => {
    const r = await pg.evaluate(() => {
      S.ccy = 'usd';
      const ms = byMonth();
      return ms.map(mo => {
        const sum = byCategory([mo.key]).reduce((s, c) => s + c.total, 0);
        return Math.abs(sum - mo.spend) < 0.05 ? null
             : { month: mo.key, cats: +sum.toFixed(2), month_total: +mo.spend.toFixed(2) };
      }).filter(Boolean);
    });
    if (r.length) throw new Error(JSON.stringify(r[0]));
  });

  console.log('--- One-offs ---');

  await step('One-offs exists, is an item category, and holds real spend', async () => {
    const r = await pg.evaluate(() => {
      const c = CATS.filter(x => x.id === 'oneoff')[0];
      const items = Object.values(S.items).filter(i => i.cat === 'oneoff').length;
      const spend = S.trips.reduce((s, t) =>
        s + (t.lines || []).filter(l => l.cat === 'oneoff')
                           .reduce((a, l) => a + (l.lineMXN || 0), 0), 0);
      return { exists: !!c, quickOnly: c ? !!c.quickOnly : false, items: items,
               spend: Math.round(spend * 100) / 100 };
    });
    if (!r.exists) throw new Error('no One-offs category');
    if (r.quickOnly) throw new Error('One-offs is marked quick-only');
    if (!r.items) throw new Error('nothing is filed under it');
    console.log('      ' + r.items + ' catalogue items, MX$' + r.spend + ' recorded');
  });

  await step('One-offs counts inside the budget, not beside it', async () => {
    const r = await pg.evaluate(() => {
      const k = byMonth().slice(-1)[0].key;
      const cats = byCategory([k]);
      const one = cats.filter(c => c.cat === 'oneoff' || c.id === 'oneoff')[0];
      const sum = cats.reduce((s, c) => s + c.total, 0);
      const mo = byMonth().filter(x => x.key === k)[0].spend;
      return { hasOne: !!one, sum: +sum.toFixed(2), month: +mo.toFixed(2) };
    });
    if (Math.abs(r.sum - r.month) > 0.05)
      throw new Error('categories ' + r.sum + ' vs month ' + r.month);
  });

  console.log('--- the drill-down ---');

  await step('a category row opens a sheet listing what is in it', async () => {
    await pg.click('[data-catdrill]');
    await pg.waitForTimeout(500);
    const r = await pg.evaluate(() => {
      const sb = document.getElementById('sheetBody');
      return { rows: sb.querySelectorAll('[data-recat]').length,
               title: (document.querySelector('.sheetbar h2') || {}).textContent || '' };
    });
    if (!r.rows) throw new Error('the sheet lists nothing');
    console.log('      "' + r.title.trim() + '" with ' + r.rows + ' entries');
  });

  await step('repeats are grouped, not listed once per trip', async () => {
    const r = await pg.evaluate(() => {
      const names = [...document.querySelectorAll('#sheetBody [data-recat]')]
        .map(e => e.dataset.recat);
      return { n: names.length, distinct: [...new Set(names)].length };
    });
    if (r.n !== r.distinct)
      throw new Error(r.n + ' rows for ' + r.distinct + ' distinct items — repeats not grouped');
  });

  await step('the sheet total matches the row it was opened from', async () => {
    const ok = await pg.evaluate(() => {
      const t = document.getElementById('sheetBody').innerText;
      return /MX\$|US\$|\$/.test(t);
    });
    if (!ok) throw new Error('no money shown in the drill-down');
    await pg.evaluate(() => closeSheet());
    await pg.waitForTimeout(350);
  });

  console.log('--- a recategorisation outlives a rebuild ---');

  await step('recategorise moves an item and records the override', async () => {
    const r = await pg.evaluate(() => {
      const it = Object.values(S.items).filter(i => i.active && i.cat === 'pantry')[0];
      const was = it.cat;
      recategorise(it.es, 'snacks');
      return { id: it.id, es: it.es, was: was, now: S.items[it.id].cat,
               fix: S.catFix ? S.catFix[catKey(it.es)] : undefined };
    });
    if (r.now !== 'snacks') throw new Error('item still in ' + r.now);
    if (r.fix !== 'snacks') throw new Error('no override recorded (got ' + r.fix + ')');
    console.log('      ' + r.es + ': ' + r.was + ' -> ' + r.now);
  });

  await step('it survives a catalogue rebuild', async () => {
    /* The rebuild overwrites cat unconditionally. applyCatFix has to run
       after it, or the correction reverts and nobody is told. */
    const r = await pg.evaluate(() => {
      const id = Object.keys(S.items).filter(i => S.items[i].cat === 'snacks' &&
                                                  S.catFix[catKey(S.items[i].es)])[0];
      S.catFP = 'force-a-rebuild';
      save();
      return id;
    });
    await pg.reload();
    await pg.waitForTimeout(1100);
    const after = await pg.evaluate(id => ({
      cat: S.items[id] ? S.items[id].cat : null,
      fix: S.catFix ? S.catFix[catKey(S.items[id].es)] : undefined,
      fp: S.catFP }), r);
    if (after.fp === 'force-a-rebuild') throw new Error('no rebuild happened');
    if (after.cat !== 'snacks')
      throw new Error('the override was lost in the rebuild: back to ' + after.cat);
    console.log('      rebuilt to fp ' + after.fp + ', override held');
  });

  await step('cleanup restores the item', async () => {
    await pg.evaluate(() => {
      Object.keys(S.catFix || {}).forEach(k => delete S.catFix[k]);
      S.catFP = null; save();
    });
    await pg.reload(); await pg.waitForTimeout(1000);
    const left = await pg.evaluate(() => Object.keys(S.catFix || {}).length);
    if (left) throw new Error(left + ' overrides left behind');
  });

  console.log('\nerrors: ' + (errs.length ? errs.join('\n  ') : 'none'));
  if (!fails && !errs.length) console.log('\nall passed');
  await b.close();
  process.exit(fails || errs.length ? 1 : 0);
})();
