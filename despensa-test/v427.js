/* v4.27 — variant families group the list, and touch nothing else.

   The point of this suite is the third caveat: a family is a way of drawing
   a list, never a thing that holds money. So most of what follows checks
   that grouping did NOT happen somewhere — the trip total, the category
   split, the price history. If a wrong family can only make the screen look
   odd, it is cheap to get wrong and cheap to roll back, which is the whole
   reason it was built this way.

   Nothing here names a family or an item. The families come out of FAMS at
   run time, so this keeps holding as more of them appear. */
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

  console.log('--- families are declared, not guessed ---');

  await step('every tagged item names a family that exists', async () => {
    const bad = await pg.evaluate(() => Object.values(S.items)
      .filter(i => i.fam && !FAMS[i.fam]).map(i => i.es));
    if (bad.length) throw new Error('unknown family on: ' + bad.join(', '));
  });

  await step('no family groups items from two categories', async () => {
    const bad = await pg.evaluate(() => {
      const seen = {}, out = [];
      Object.values(S.items).forEach(i => {
        if (!i.fam) return;
        if (seen[i.fam] && seen[i.fam] !== i.cat) out.push(i.fam);
        seen[i.fam] = i.cat;
      });
      return out;
    });
    if (bad.length) throw new Error('spans categories: ' + bad.join(', '));
    /* A family that straddles categories would vanish from one of them —
       the list is drawn per category. */
  });

  await step('every family has at least two members', async () => {
    const thin = await pg.evaluate(() => {
      const n = {};
      Object.values(S.items).forEach(i => { if (i.fam) n[i.fam] = (n[i.fam] || 0) + 1; });
      return Object.keys(FAMS).filter(f => (n[f] || 0) < 2);
    });
    if (thin.length) throw new Error('nothing to group: ' + thin.join(', '));
  });

  console.log('--- the catalogue screen ---');

  await pg.click('#tabs [data-go="cat"]');
  await pg.waitForTimeout(500);

  const fams = await pg.evaluate(() =>
    [...document.querySelectorAll('.famrow')].map(e => e.dataset.fam));

  await step('a family row is drawn for each family', async () => {
    const want = await pg.evaluate(() => Object.keys(FAMS).length);
    if (fams.length !== want) throw new Error(fams.length + ' rows for ' + want + ' families');
    console.log('      ' + fams.length + ' families on screen');
  });

  await step('a family row carries no price — this is the point', async () => {
    const withAmt = await pg.evaluate(() =>
      [...document.querySelectorAll('.famrow')].filter(e => e.querySelector('.amt')).length);
    if (withAmt) throw new Error(withAmt + ' family rows show an amount');
    const anyMoney = await pg.evaluate(() =>
      [...document.querySelectorAll('.famrow')].filter(e => /MX\$|US\$/.test(e.innerText)).length);
    if (anyMoney) throw new Error(anyMoney + ' family rows print a figure');
  });

  await step('members are hidden until the row is opened', async () => {
    const kids = await pg.evaluate(() => document.querySelectorAll('.row.child').length);
    if (kids) throw new Error(kids + ' member rows visible while every family is shut');
  });

  await step('opening one reveals exactly its members', async () => {
    const f = fams[0];
    const r = await pg.evaluate(fam => {
      document.querySelector('.famrow[data-fam="' + fam + '"]').click();
      return null;
    }, f);
    await pg.waitForTimeout(350);
    const got = await pg.evaluate(() => document.querySelectorAll('.row.child').length);
    const want = await pg.evaluate(fam =>
      Object.values(S.items).filter(i => i.fam === fam && i.active).length, f);
    if (got !== want) throw new Error(got + ' children for a family of ' + want);
    console.log('      opened ' + f + ': ' + got + ' members');
  });

  await step('and closing it hides them again', async () => {
    await pg.click('.famrow[data-fam="' + fams[0] + '"]');
    await pg.waitForTimeout(350);
    const kids = await pg.evaluate(() => document.querySelectorAll('.row.child').length);
    if (kids) throw new Error(kids + ' still visible');
  });

  await step('open state is not written to the store', async () => {
    await pg.click('.famrow[data-fam="' + fams[0] + '"]');
    await pg.waitForTimeout(300);
    const leaked = await pg.evaluate(() => JSON.stringify(S).indexOf('openFams') >= 0);
    if (leaked) throw new Error('openFams reached S');
    await pg.reload(); await pg.waitForTimeout(1000);
    await pg.click('#tabs [data-go="cat"]'); await pg.waitForTimeout(400);
    const kids = await pg.evaluate(() => document.querySelectorAll('.row.child').length);
    if (kids) throw new Error('a tap in the aisle survived a reload');
  });

  console.log('--- it holds no money ---');

  await step('grouping changes no trip total and no category split', async () => {
    const r = await pg.evaluate(() => {
      const spend = S.trips.reduce((s, t) => s + spendOf(t), 0);
      const byCat = {};
      S.trips.forEach(t => (t.lines || []).forEach(l => {
        byCat[l.cat] = (byCat[l.cat] || 0) + (l.lineMXN || 0);
      }));
      return { spend: Math.round(spend * 100) / 100, cats: Object.keys(byCat).length,
               famInLines: S.trips.some(t => (t.lines || []).some(l => l.fam !== undefined)) };
    });
    if (r.famInLines) throw new Error('a trip line carries a family');
    if (!(r.spend > 0) || !(r.cats > 0)) throw new Error('nothing to compare against');
    console.log('      ' + r.cats + ' categories, MX$' + r.spend.toFixed(2) + ' across every trip');
  });

  await step('a family holds no price history of its own', async () => {
    const bad = await pg.evaluate(() => Object.keys(FAMS).filter(f => S.items[f]));
    if (bad.length) throw new Error('a family id is also an item: ' + bad.join(', '));
  });

  console.log('--- the trip screen ---');

  await step('planning groups too, and a ticked member stays visible when shut', async () => {
    await pg.click('#tabs [data-go="dash"]'); await pg.waitForTimeout(300);
    await pg.click('#startTrip');
    await pg.waitForSelector('[data-shop="chedraui"]', { timeout: 3000 });
    if (await pg.locator('[data-seed="none"]').count()) await pg.click('[data-seed="none"]');
    await pg.click('[data-shop="chedraui"]');
    await pg.waitForTimeout(400);
    const f = await pg.evaluate(() => {
      S.active.lines = {};
      const fam = Object.keys(FAMS).find(x =>
        Object.values(S.items).filter(i => i.fam === x && i.active).length >= 2);
      const one = Object.values(S.items).filter(i => i.fam === fam && i.active)[0];
      S.active.lines[one.id] = { state: 'need', q: 1, paid: null };
      openFams = {};
      save(); render();
      return fam;
    });
    await pg.click('#tabs [data-go="trip"]');
    await pg.waitForTimeout(500);
    const r = await pg.evaluate(fam => ({
      row: !!document.querySelector('.famrow[data-fam="' + fam + '"]'),
      meta: (document.querySelector('.famrow[data-fam="' + fam + '"]') || {}).innerText || '',
      children: document.querySelectorAll('.row.child').length
    }), f);
    if (!r.row) throw new Error('no family row while planning');
    if (!/on the list/.test(r.meta)) throw new Error('shut family does not say what is ticked');
    if (r.children !== 1) throw new Error(r.children + ' members shown; the ticked one should stay');
    console.log('      ' + r.meta.replace(/\n/g, ' · '));
  });

  await step('cleanup', async () => {
    await pg.evaluate(() => { S.active = null; save(); });
  });

  console.log('\nerrors: ' + (errs.length ? errs.join('\n  ') : 'none'));
  if (!fails && !errs.length) console.log('\nall passed');
  await b.close();
  process.exit(fails || errs.length ? 1 : 0);
})();
