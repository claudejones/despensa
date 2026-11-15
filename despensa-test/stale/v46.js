/* v4.6 — content fingerprints instead of typed version numbers.
   The failure this prevents: a data file changes, its hand-typed version
   does not, and installed phones keep stale data behind a gate that never
   reopens. The decisive test is the last block: edit a data file, touch NO
   version number, rebuild, and confirm the phone still rebuilds. */
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');

const BUILD = '/tmp/claude-0/-home-claude/45d417e8-2d29-52e9-9261-99901c0a2cab/scratchpad/build.py';
const SEEDFILE = '/home/claude/despensa/seed-trips.js';
const rebuild = () => execFileSync('python3', ['-I', BUILD], { encoding: 'utf8' });

(async () => {
  const b = await chromium.launch({});
  const pg = await b.newPage({ viewport: { width: 390, height: 844 } });
  pg.setDefaultTimeout(4000);
  const errs = [];
  pg.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  pg.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });

  let fails = 0;
  const step = async (l, fn) => {
    try { await fn(); console.log('  ok  ' + l); }
    catch (e) { fails++; console.log('FAIL  ' + l + ' — ' + e.message); }
  };

  const load = async () => {
    await pg.goto('file:///home/claude/despensa/index.html');
    await pg.waitForTimeout(700);
  };

  await load();

  console.log('--- fingerprints exist and are consulted ---');
  await step('the build injects both fingerprints', async () => {
    const r = await pg.evaluate(() => ({
      cat: typeof CAT_FP !== 'undefined' ? CAT_FP : null,
      seed: typeof SEED_FP !== 'undefined' ? SEED_FP : null }));
    if (!r.cat || !r.seed) throw new Error('missing: ' + JSON.stringify(r));
    if (!/^[0-9a-f]{8}$/.test(r.cat) || !/^[0-9a-f]{8}$/.test(r.seed))
      throw new Error('not hashes: ' + JSON.stringify(r));
    console.log('      catalogue ' + r.cat + ' · receipts ' + r.seed);
  });
  await step('a fresh install records both', async () => {
    const r = await pg.evaluate(() => ({ cat: S.catFP, seed: S.seedFP, CAT: CAT_FP, SEED: SEED_FP }));
    if (r.cat !== r.CAT) throw new Error('catFP ' + r.cat + ' vs ' + r.CAT);
    if (r.seed !== r.SEED) throw new Error('seedFP ' + r.seed + ' vs ' + r.SEED);
  });
  await step('the fingerprint actually tracks the file', async () => {
    const onDisk = require('crypto').createHash('sha256')
      .update(fs.readFileSync(SEEDFILE, 'utf8')).digest('hex').slice(0, 8);
    const inApp = await pg.evaluate(() => SEED_FP);
    if (onDisk !== inApp) throw new Error(`file hashes to ${onDisk}, app carries ${inApp}`);
  });

  console.log('--- Settings shows all three ---');
  await step('app, catalogue and receipt data are each listed', async () => {
    await pg.click('#tabs [data-go="set"]');
    await pg.waitForTimeout(300);
    const t = await pg.textContent('#main');
    for (const want of ['Version', 'Catalogue', 'Receipt data', 'Trips logged'])
      if (!t.includes(want)) throw new Error('missing row: ' + want);
    const r = await pg.evaluate(() => ({
      app: APP_VERSION, cat: CAT_FP, seed: SEED_FP }));
    if (!t.includes(r.app)) throw new Error('app version not shown');
    if (!t.includes(r.cat)) throw new Error('catalogue fingerprint not shown');
    if (!t.includes(r.seed)) throw new Error('receipt fingerprint not shown');
    console.log('      all three on screen');
  });
  await step('in sync, nothing is flagged', async () => {
    const stale = await pg.locator('.vfp.stale').count();
    if (stale) throw new Error(stale + ' row(s) flagged stale on a fresh install');
  });
  await step('out of sync, the row is flagged', async () => {
    await pg.evaluate(() => { S.seedFP = 'deadbeef'; render(); });
    await pg.waitForTimeout(250);
    const r = await pg.evaluate(() => ({
      stale: document.querySelectorAll('.vfp.stale').length,
      text: document.getElementById('main').textContent }));
    if (r.stale !== 1) throw new Error(r.stale + ' rows flagged, expected 1');
    if (!/was deadbeef/.test(r.text)) throw new Error('does not show what the phone holds');
    if (!/older data than the build/.test(r.text)) throw new Error('no plain-language warning');
  });

  console.log('--- the decisive test: edit data, bump NOTHING ---');
  const original = fs.readFileSync(SEEDFILE, 'utf8');
  try {
    await step('a data edit with no version bump still reaches the phone', async () => {
      // Settle a known-good device first.
      await load();
      const was = await pg.evaluate(() => ({
        seedFP: S.seedFP,
        note: (S.trips.find(t => t.id === 'seed-2026-08-08') || {}).note || '' }));

      // Edit a receipt. Touch no version number anywhere.
      const edited = original.replace('{d:"2026-08-08", t:2484.46, note:""',
                                      '{d:"2026-08-08", t:2484.46, note:"EDITED-NO-BUMP"');
      if (edited === original) throw new Error('could not find the line to edit');
      fs.writeFileSync(SEEDFILE, edited);

      const out = rebuild();
      const appV = out.match(/app\s+(\S+)/)[1];
      const seedRev = out.match(/seed\s+rev (\d+)/)[1];
      const newFP = out.match(/seed\s+rev \d+\s+fp (\w+)/)[1];
      if (newFP === was.seedFP) throw new Error('fingerprint did not change');

      await pg.reload();
      await pg.waitForTimeout(800);
      const now = await pg.evaluate(() => ({
        seedFP: S.seedFP,
        note: (S.trips.find(t => t.id === 'seed-2026-08-08') || {}).note || '',
        mine: S.trips.filter(t => String(t.id).indexOf('seed-') !== 0).length }));
      if (now.note !== 'EDITED-NO-BUMP')
        throw new Error('the edit never arrived (note is "' + now.note + '")');
      if (now.seedFP !== newFP) throw new Error('stored fingerprint not updated');
      console.log(`      app still ${appV}, seed rev still ${seedRev}, ` +
                  `fp ${was.seedFP} -> ${newFP}, edit arrived`);
    });

    await step('the service worker cache changed too', async () => {
      const sw = fs.readFileSync('/home/claude/despensa/sw.js', 'utf8');
      const cache = sw.match(/var CACHE = "([^"]+)"/)[1];
      if (!/^despensa-[\d.]+-[0-9a-f]{8}$/.test(cache))
        throw new Error('cache name is not build-stamped: ' + cache);
      console.log('      ' + cache);
    });
  } finally {
    fs.writeFileSync(SEEDFILE, original);
    rebuild();
  }

  await step('reverting the edit reverts the phone', async () => {
    await load();
    const r = await pg.evaluate(() => ({
      note: (S.trips.find(t => t.id === 'seed-2026-08-08') || {}).note || '',
      seedFP: S.seedFP, SEED: SEED_FP }));
    if (/EDITED/.test(r.note)) throw new Error('the edit is still there');
    if (r.seedFP !== r.SEED) throw new Error('fingerprints disagree after revert');
  });

  console.log('--- the build refuses to ship a dead gate ---');
  await step('build fails if app.js stops reading the fingerprints', async () => {
    const appFile = '/home/claude/despensa/app.js';
    const keep = fs.readFileSync(appFile, 'utf8');
    try {
      fs.writeFileSync(appFile, keep.replace(/SEED_FP/g, 'SEED_GONE'));
      let threw = false;
      try { rebuild(); } catch (e) { threw = true; }
      if (!threw) throw new Error('build succeeded with a dead gate');
    } finally {
      fs.writeFileSync(appFile, keep);
      rebuild();
    }
  });

  console.log('--- regressions ---');
  await step('your own trips are never rebuilt', async () => {
    await load();
    await pg.evaluate(() => {
      S.trips.push({ id: 'trip-test-1', shop: 'chedraui', shopName: 'Chedraui',
        date: '2026-10-11T09:00', fx: 17.9, lines: [], receiptTotal: 123.45,
        listed: 0, offList: 0, bought: 0, skipped: 0 });
      S.seedFP = 'forcebuild';
      save();
    });
    await pg.reload();
    await pg.waitForTimeout(800);
    const r = await pg.evaluate(() => {
      const t = S.trips.find(t => t.id === 'trip-test-1');
      return { kept: !!t, tot: t ? t.receiptTotal : null, seedFP: S.seedFP, SEED: SEED_FP };
    });
    if (!r.kept) throw new Error('the rebuild deleted a logged trip');
    if (r.tot !== 123.45) throw new Error('its total changed to ' + r.tot);
    if (r.seedFP !== r.SEED) throw new Error('rebuild did not run');
    console.log('      logged trip survived a forced rebuild');
  });
  await step('no NaN, undefined or null on any tab', async () => {
    for (const go of ['dash', 'cat', 'hist', 'set']) {
      await pg.click(`#tabs [data-go="${go}"]`);
      await pg.waitForTimeout(220);
      const t = await pg.textContent('#main');
      for (const bad of ['NaN', 'undefined', 'null'])
        if (t.includes(bad)) throw new Error(bad + ' on ' + go);
    }
  });
  await step('nothing overflows on the settings screen', async () => {
    await pg.click('#tabs [data-go="set"]');
    await pg.waitForTimeout(250);
    const over = await pg.evaluate(() =>
      [...document.querySelectorAll('#main *')]
        .filter(e => e.getBoundingClientRect().right > 391)
        .map(e => e.className || e.tagName).slice(0, 3));
    if (over.length) throw new Error(over.join(', '));
  });

  console.log('\nerrors: ' + (errs.length ? '\n' + errs.join('\n') : 'none'));
  console.log(fails ? '\n' + fails + ' FAILED' : '\nall passed');
  await b.close();
  process.exit(fails ? 1 : 0);
})();
