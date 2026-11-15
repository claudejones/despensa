/* Sheets — the overlay contract, asserted on computed style.

   Replaces coverage lost when a container was reclaimed on 14 Nov.

   Every assertion about whether something is visible reads getComputedStyle,
   never the `hidden` property. That distinction is not pedantry: two pickers
   once opened at the same time because `.movebox{display:flex}` beats the
   `hidden` attribute's user-agent style. The DOM property said hidden, the
   tests agreed with it and passed, and the screenshot showed both boxes
   open. The same trap had already caught .hbtn earlier in the same project.
   So: computed display, every time. */
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
  const shown = sel => pg.evaluate(s => {
    const els = [...document.querySelectorAll(s)];
    return els.filter(e => {
      const c = getComputedStyle(e);
      const r = e.getBoundingClientRect();
      return c.display !== 'none' && c.visibility !== 'hidden' &&
             c.opacity !== '0' && r.width > 0 && r.height > 0;
    }).length;
  }, sel);

  console.log('--- a sheet opens and closes ---');

  /* Open the one sheet reachable from a cold start without a trip. */
  await pg.click('#tabs [data-go="cat"]');
  await pg.waitForTimeout(400);

  await step('tapping an item opens a sheet', async () => {
    await pg.click('.row:not(.famrow) .namewrap');
    await pg.waitForTimeout(450);
    if (!(await shown('.sheet'))) throw new Error('no sheet');
  });

  await step('its title is a real heading, and it is sticky', async () => {
    const r = await pg.evaluate(() => {
      const bar = document.querySelector('.sheetbar');
      if (!bar) return { bar: false };
      const h2 = bar.querySelector('h2');
      return { bar: true, hasTitle: !!h2,
               text: h2 ? h2.textContent.trim() : '',
               position: getComputedStyle(bar).position,
               hasIcon: !!bar.querySelector('svg') };
    });
    if (!r.bar) throw new Error('no sticky bar');
    if (!r.hasTitle) throw new Error('the title did not move into the bar');
    if (r.position !== 'sticky') throw new Error('bar position is ' + r.position);
    console.log('      "' + r.text + '" sticky, icon ' + (r.hasIcon ? 'present' : 'absent'));
  });

  await step('the bar covers the content behind it', async () => {
    /* It used to be transparent and the table scrolled visibly through it. */
    const bg = await pg.evaluate(() => {
      const c = getComputedStyle(document.querySelector('.sheetbar'));
      return { bg: c.backgroundColor, z: c.zIndex };
    });
    if (/rgba\(0,\s*0,\s*0,\s*0\)|transparent/.test(bg.bg))
      throw new Error('sheet bar is transparent');
    if (!(parseInt(bg.z, 10) > 0)) throw new Error('sheet bar has no stacking context');
  });

  await step('the close control is inside the bar, not jammed in a corner', async () => {
    const r = await pg.evaluate(() => {
      const bar = document.querySelector('.sheetbar');
      const x = bar.querySelector('#xClose');
      if (!x) return null;
      const b = bar.getBoundingClientRect(), r = x.getBoundingClientRect();
      return { right: Math.round(b.right - r.right), top: Math.round(r.top - b.top),
               w: Math.round(r.width), h: Math.round(r.height) };
    });
    if (!r) throw new Error('no control in the bar');
    if (r.right < 4) throw new Error('only ' + r.right + 'px from the sheet edge');
    if (r.w < 28 || r.h < 28) throw new Error('tap target ' + r.w + 'x' + r.h);
    console.log('      ' + r.w + 'x' + r.h + ' target, ' + r.right + 'px in from the edge');
  });

  await step('it scrolls rather than overflowing the viewport', async () => {
    const r = await pg.evaluate(() => {
      const s = document.querySelector('.sheet');
      return { h: Math.round(s.getBoundingClientRect().height), vp: window.innerHeight,
               wide: document.documentElement.scrollWidth };
    });
    if (r.h > r.vp) throw new Error('sheet is ' + r.h + 'px in a ' + r.vp + 'px viewport');
    if (r.wide > 390) throw new Error('page scrolls sideways: ' + r.wide);
  });

  await step('closing it leaves nothing behind', async () => {
    await pg.evaluate(() => closeSheet());
    await pg.waitForTimeout(400);
    if (await shown('.sheet')) throw new Error('still visible');
    const scroll = await pg.evaluate(() => getComputedStyle(document.body).overflow);
    if (scroll === 'hidden') throw new Error('body scroll left locked');
  });

  console.log('--- only one picker at a time ---');

  /* The pickers live on the category drill-down, reached by tapping a row
     in Where it goes. Opening the wrong sheet and reporting "nothing to
     prove" is how this assertion would quietly stop testing anything. */
  await step('the category drill-down opens, and it has pickers', async () => {
    await pg.click('#tabs [data-go="dash"]');
    await pg.waitForTimeout(500);
    const n = await pg.evaluate(() => document.querySelectorAll('[data-catdrill]').length);
    if (!n) throw new Error('no category rows to drill into');
    await pg.click('[data-catdrill]');
    await pg.waitForTimeout(500);
    const boxes = await pg.evaluate(() => document.querySelectorAll('.sheet .movebox').length);
    if (!boxes) throw new Error('drill-down has no recategorise pickers');
    console.log('      ' + n + ' category rows, ' + boxes + ' pickers on the sheet');
  });

  await step('every picker starts hidden — by computed style, not by property', async () => {
    /* The original bug: .movebox{display:flex} beats [hidden], so the DOM
       property said hidden, the tests agreed, and the screenshot showed two
       boxes open at once. */
    const open = await shown('.sheet .movebox');
    if (open) throw new Error(open + ' pickers revealed before any row was tapped');
  });

  await step('tapping a row reveals exactly one picker', async () => {
    await pg.click('.sheet [data-recat]');
    await pg.waitForTimeout(350);
    const open = await shown('.sheet .movebox');
    if (open !== 1) throw new Error(open + ' pickers revealed');
  });

  await step('tapping a second row leaves only the second open', async () => {
    const rows = await pg.evaluate(() => document.querySelectorAll('.sheet [data-recat]').length);
    if (rows < 2) { console.log('      only one row in this category'); return; }
    await pg.evaluate(() => document.querySelectorAll('.sheet [data-recat]')[1].click());
    await pg.waitForTimeout(350);
    const open = await shown('.sheet .movebox');
    if (open !== 1) throw new Error(open + ' pickers showing at once');
    console.log('      ' + rows + ' rows, 1 picker open at a time');
  });

  await step('anything marked hidden is hidden by computed style too', async () => {
    const liars = await pg.evaluate(() =>
      [...document.querySelectorAll('.sheet [hidden]')]
        .filter(e => getComputedStyle(e).display !== 'none')
        .map(e => e.className || e.tagName));
    if (liars.length)
      throw new Error('[hidden] but still displayed: ' + [...new Set(liars)].join(', '));
  });

  await step('cleanup', async () => {
    await pg.evaluate(() => { closeSheet(); S.active = null; save(); });
  });

  console.log('\nerrors: ' + (errs.length ? errs.join('\n  ') : 'none'));
  if (!fails && !errs.length) console.log('\nall passed');
  await b.close();
  process.exit(fails || errs.length ? 1 : 0);
})();
