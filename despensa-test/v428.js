/* v4.28 — fixed chrome keeps off the content.

   The toast sat at a hardcoded 76px from the top. That cleared the app
   header by three pixels and then landed on the first sticky section
   header — a 20px overlap on every screen that has sections. The number was
   a guess where --hdr was available, so it would have drifted again the
   first time the header changed height.

   This suite asserts the property rather than the fix: whatever the toast's
   position is computed from, it must not land on a section header, and it
   must be measured from the chrome actually on screen rather than from a
   constant. The trip bar comes and goes, so a constant is wrong half the
   time by construction. */
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

  /* Show the toast, measure what it covers, hide it again. */
  const probe = () => pg.evaluate(() => {
    const t = document.getElementById('toast');
    const had = t.textContent;
    t.textContent = 'Trip open — mark what you need';
    t.classList.add('show');
    const r = t.getBoundingClientRect();
    const hit = sel => [...document.querySelectorAll(sel)].filter(e => {
      const b = e.getBoundingClientRect();
      return b.top < r.bottom && b.bottom > r.top && b.left < r.right && b.right > r.left;
    });
    const out = {
      top: Math.round(r.top), bottom: Math.round(r.bottom),
      width: Math.round(r.width), viewport: window.innerHeight,
      gap: getComputedStyle(document.documentElement).getPropertyValue('--toastgap').trim(),
      onSectionHeader: hit('.sechead').length,
      onFamilyRow: hit('.famrow').length,
      offScreen: r.top < 0 || r.bottom > window.innerHeight
    };
    t.classList.remove('show'); t.textContent = had;
    return out;
  });

  console.log('--- the toast stays off the list ---');

  const screens = ['dash', 'cat', 'hist', 'set'];
  for (const s of screens) {
    await pg.click('#tabs [data-go="' + s + '"]');
    await pg.waitForTimeout(350);
    await step(s + ': clear of every section header', async () => {
      const r = await probe();
      if (r.onSectionHeader) throw new Error('covers ' + r.onSectionHeader + ' section header(s)');
      if (r.offScreen) throw new Error('off screen at ' + r.top + '..' + r.bottom);
      if (r.width > 390 - 32) throw new Error('wider than the gutter allows: ' + r.width);
    });
  }

  console.log('--- and follows the chrome, not a constant ---');

  await pg.click('#tabs [data-go="dash"]'); await pg.waitForTimeout(300);
  await pg.click('#startTrip');
  await pg.waitForSelector('[data-shop="chedraui"]', { timeout: 3000 });
  if (await pg.locator('[data-seed="none"]').count()) await pg.click('[data-seed="none"]');
  await pg.click('[data-shop="chedraui"]');
  await pg.waitForTimeout(600);
  await pg.click('#tabs [data-go="trip"]'); await pg.waitForTimeout(500);

  const onTrip = await probe();
  await step('a trip screen with its extra bar pushes the toast higher', async () => {
    if (!onTrip.gap) throw new Error('--toastgap is not set at all');
    if (onTrip.onSectionHeader) throw new Error('covers a section header on the trip screen');
    if (onTrip.offScreen) throw new Error('off screen');
    console.log('      trip gap ' + onTrip.gap + ', toast at ' + onTrip.top + '..' + onTrip.bottom);
  });

  await step('the gap is larger here than on a screen with only the tab bar', async () => {
    await pg.click('#tabs [data-go="hist"]'); await pg.waitForTimeout(400);
    const plain = await probe();
    await pg.click('#tabs [data-go="trip"]'); await pg.waitForTimeout(400);
    const a = parseInt(plain.gap, 10), bGap = parseInt(onTrip.gap, 10);
    if (!(bGap > a))
      throw new Error('trip gap ' + bGap + ' is not above the plain ' + a +
                      ' — the toast is not measuring the chrome');
    console.log('      ' + a + 'px with the tab bar alone, ' + bGap + 'px with the trip bar');
  });

  await step('it never blocks a tap, whatever it covers', async () => {
    const pe = await pg.evaluate(() =>
      getComputedStyle(document.getElementById('toast')).pointerEvents);
    if (pe !== 'none') throw new Error('pointer-events is ' + pe);
  });

  await step('cleanup', async () => {
    await pg.evaluate(() => { S.active = null; save(); });
  });

  console.log('\nerrors: ' + (errs.length ? errs.join('\n  ') : 'none'));
  if (!fails && !errs.length) console.log('\nall passed');
  await b.close();
  process.exit(fails || errs.length ? 1 : 0);
})();
