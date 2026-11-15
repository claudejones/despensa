/* v4.12 — the reconciliation sync.

   A patch at sync/latest.json comes back from a reconciliation and corrects
   the trip in place, keyed by the id that came out in the export. The whole
   point is that nothing has to be deleted by hand afterwards and no day is
   ever counted twice.

   The risks worth testing are not the happy path. They are: a patch applying
   twice, a patch clobbering something it never named, a stale service worker
   handing the app index.html where JSON was expected, and a malformed file
   taking the app down on launch. Every one of those must leave the store
   exactly as it was.

   Served over real HTTP, because fetch() of a relative path is the thing
   under test and file:// cannot exercise it. */
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = '/home/claude/despensa';
const SYNC = path.join(ROOT, 'sync', 'latest.json');

/* what the server should answer for sync/latest.json — swapped per case */
let syncMode = { kind: 'none' };

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript',
                '.json': 'application/json' };

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  if (url === '/sync/latest.json') {
    const m = syncMode;
    if (m.kind === 'none')   { res.writeHead(404); return res.end('not found'); }
    if (m.kind === 'html')   { /* what a pre-4.12 service worker would do */
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      return res.end('<!doctype html><html><body>app</body></html>');
    }
    if (m.kind === 'garbage') {
      res.writeHead(200, { 'content-type': 'application/json' });
      return res.end('{ this is not json');
    }
    res.writeHead(200, { 'content-type': 'application/json' });
    return res.end(JSON.stringify(m.body));
  }
  const file = path.join(ROOT, url === '/' ? 'index.html' : url.slice(1));
  if (!file.startsWith(ROOT) || !fs.existsSync(file)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'text/plain' });
  res.end(fs.readFileSync(file));
});

(async () => {
  await new Promise(r => server.listen(8771, r));
  const BASE = 'http://127.0.0.1:8771/';

  const b = await chromium.launch({});
  const pg = await b.newPage({ viewport: { width: 390, height: 844 } });
  pg.setDefaultTimeout(5000);
  const errs = [];
  pg.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  pg.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });

  let fails = 0;
  const step = async (l, fn) => {
    try { await fn(); console.log('  ok  ' + l); }
    catch (e) { fails++; console.log('FAIL  ' + l + ' — ' + e.message); }
  };

  /* load, then wait past the 1200ms boot delay before the sync fires */
  const load = async () => {
    await pg.goto(BASE);
    await pg.waitForTimeout(2200);
  };
  const sheetUp = () => pg.$('#syYes');

  /* a known trip to operate on, planted fresh each time */
  const plant = async () => {
    await pg.evaluate(() => {
      S.trips = S.trips.filter(t => t.id !== 'trip-test' && t.id !== 'trip-other');
      S.trips.push({ id: 'trip-test', shop: 'chedraui', shopName: 'Chedraui',
        date: '2026-10-05', fx: 20, note: 'before', lines: [
          { id: 'x', es: 'Prueba', cat: 'pantry', q: 1, unitMXN: 100, lineMXN: 100, state: 'bought' }],
        listed: 100, receiptTotal: 160, offList: 60, bought: 1, skipped: 0, planned: 1, totalUSD: 8 });
      S.trips.push({ id: 'trip-other', shop: 'chedraui', shopName: 'Chedraui',
        date: '2026-10-06', fx: 20, note: 'untouched', lines: [],
        listed: 0, receiptTotal: 500, offList: 500, bought: 0, skipped: 0, planned: 0, totalUSD: 25 });
      S.syncId = 0;
      save();
    });
  };

  /* the corrected trip: same id, the off-list gap closed by the real lines */
  const patch = (id) => ({
    syncId: id, producedAt: '2026-10-12T19:00:00Z',
    trips: {
      'trip-test': { shop: 'chedraui', shopName: 'Chedraui', date: '2026-10-05',
        fx: 20, note: 'reconciled', lines: [
          { id: 'x', es: 'Prueba', cat: 'pantry', q: 1, unitMXN: 100, lineMXN: 100, state: 'bought' },
          { id: 'y', es: 'Encontrado', cat: 'snacks', q: 1, unitMXN: 60, lineMXN: 60, state: 'bought' }],
        listed: 160, receiptTotal: 160, offList: 0, bought: 2, skipped: 0, planned: 2, totalUSD: 8 }
    },
    catalogue: {}
  });

  console.log('--- it arrives and asks first ---');
  await load();
  await plant();
  await step('nothing offered when there is no sync file', async () => {
    syncMode = { kind: 'none' };
    await load();
    if (await sheetUp()) throw new Error('a sheet appeared for a 404');
  });
  await step('a higher syncId offers a sheet rather than applying itself', async () => {
    await plant();
    syncMode = { kind: 'json', body: patch(1) };
    await load();
    if (!await sheetUp()) throw new Error('no sheet');
    const t = await pg.textContent('#sheetBody');
    if (!/1 trip corrected/.test(t)) throw new Error('did not say what it would do: ' + t.slice(0, 160));
    const note = await pg.evaluate(() =>
      S.trips.filter(t => t.id === 'trip-test')[0].note);
    if (note !== 'before') throw new Error('applied without asking');
  });
  await step('"Not now" changes nothing and does not burn the id', async () => {
    await pg.click('#syNo');
    await pg.waitForTimeout(300);
    const r = await pg.evaluate(() => ({
      note: S.trips.filter(t => t.id === 'trip-test')[0].note, sid: S.syncId || 0 }));
    if (r.note !== 'before') throw new Error('it applied anyway');
    if (r.sid !== 0) throw new Error('syncId stored on a decline: ' + r.sid);
  });
  await step('and it is offered again on the next load', async () => {
    await load();
    if (!await sheetUp()) throw new Error('a declined sync was forgotten');
  });

  console.log('--- applying it ---');
  await step('the trip is corrected in place, keeping its id', async () => {
    await pg.click('#syYes');
    await pg.waitForTimeout(600);
    const r = await pg.evaluate(() => {
      const hits = S.trips.filter(t => t.id === 'trip-test');
      return { n: hits.length, note: hits[0].note, lines: hits[0].lines.length,
               off: hits[0].offList, listed: hits[0].listed };
    });
    if (r.n !== 1) throw new Error('ended up with ' + r.n + ' copies');
    if (r.note !== 'reconciled') throw new Error('not replaced');
    if (r.lines !== 2) throw new Error('lines: ' + r.lines);
    if (r.off !== 0) throw new Error('off-list not closed: ' + r.off);
  });
  await step('a trip the patch never named is untouched', async () => {
    const r = await pg.evaluate(() =>
      S.trips.filter(t => t.id === 'trip-other')[0]);
    if (!r) throw new Error('it was deleted');
    if (r.note !== 'untouched') throw new Error('it was modified');
  });
  await step('the applied id is stored', async () => {
    const r = await pg.evaluate(() => S.syncId);
    if (r !== 1) throw new Error('syncId: ' + r);
  });

  console.log('--- it never applies twice ---');
  await step('replaying the same id does nothing', async () => {
    await load();
    if (await sheetUp()) throw new Error('offered the same patch again');
  });
  await step('an older id does nothing', async () => {
    syncMode = { kind: 'json', body: patch(0) };
    await load();
    if (await sheetUp()) throw new Error('offered an older patch');
  });
  await step('a higher one is offered again', async () => {
    syncMode = { kind: 'json', body: patch(2) };
    await load();
    if (!await sheetUp()) throw new Error('a genuinely newer patch was skipped');
    await pg.click('#syNo');
    await pg.waitForTimeout(250);
  });

  console.log('--- what it is not allowed to touch ---');
  await step('it cannot replace a seeded receipt', async () => {
    const before = await pg.evaluate(() =>
      (S.trips.filter(t => String(t.id).indexOf('seed-') === 0)[0] || {}).id);
    syncMode = { kind: 'json', body: {
      syncId: 10, trips: { [before]: { shop: 'x', shopName: 'HIJACKED', date: '2026-01-01',
        fx: 20, lines: [], listed: 0, receiptTotal: 1, offList: 0,
        bought: 0, skipped: 0, planned: 0, totalUSD: 1 } } } };
    await load();
    /* the only change it named was refused, so there is nothing to offer */
    if (await sheetUp()) {
      await pg.click('#syYes');
      await pg.waitForTimeout(500);
    }
    const after = await pg.evaluate((id) =>
      S.trips.filter(t => t.id === id)[0].shopName, before);
    if (after === 'HIJACKED') throw new Error('a seeded receipt was overwritten');
  });
  await step('nor delete one', async () => {
    const id = await pg.evaluate(() =>
      S.trips.filter(t => String(t.id).indexOf('seed-') === 0)[0].id);
    syncMode = { kind: 'json', body: { syncId: 11, removeTrips: [id] } };
    await load();
    if (await sheetUp()) { await pg.click('#syYes'); await pg.waitForTimeout(500); }
    const still = await pg.evaluate((x) => S.trips.some(t => t.id === x), id);
    if (!still) throw new Error('a seeded receipt was deleted');
  });

  console.log('--- adding, removing, repricing ---');
  await step('a trip it names but the phone has not got is added', async () => {
    syncMode = { kind: 'json', body: { syncId: 20, trips: {
      'trip-new': { shop: 'chedraui', shopName: 'Chedraui', date: '2026-10-07',
        fx: 20, note: 'added by sync', lines: [], listed: 0, receiptTotal: 300,
        offList: 0, bought: 0, skipped: 0, planned: 0, totalUSD: 15 } } } };
    await load();
    await pg.click('#syYes');
    await pg.waitForTimeout(600);
    const r = await pg.evaluate(() => S.trips.filter(t => t.id === 'trip-new').length);
    if (r !== 1) throw new Error('added ' + r + ' copies');
  });
  await step('removeTrips removes exactly what it names', async () => {
    syncMode = { kind: 'json', body: { syncId: 21, removeTrips: ['trip-new'] } };
    await load();
    await pg.click('#syYes');
    await pg.waitForTimeout(600);
    const r = await pg.evaluate(() => ({
      gone: !S.trips.some(t => t.id === 'trip-new'),
      other: S.trips.some(t => t.id === 'trip-other') }));
    if (!r.gone) throw new Error('not removed');
    if (!r.other) throw new Error('it took another trip with it');
  });
  await step('a price update lands on the catalogue item', async () => {
    const id = await pg.evaluate(() => Object.keys(S.items)[0]);
    syncMode = { kind: 'json', body: { syncId: 22, catalogue: { [id]: { p: 123.45 } } } };
    await load();
    const t = await pg.textContent('#sheetBody');
    if (!/1 price updated/.test(t)) throw new Error('not described: ' + t.slice(0, 160));
    await pg.click('#syYes');
    await pg.waitForTimeout(600);
    const p = await pg.evaluate((x) => S.items[x].p, id);
    if (p !== 123.45) throw new Error('price is ' + p);
  });
  await step('a patch that would change nothing is not offered', async () => {
    syncMode = { kind: 'json', body: { syncId: 23, trips: {}, catalogue: {} } };
    await load();
    if (await sheetUp()) throw new Error('offered an empty patch');
  });

  console.log('--- every failure is silent and total ---');
  const unchanged = async (label) => {
    const r = await pg.evaluate(() => ({ n: S.trips.length, sid: S.syncId || 0 }));
    return r;
  };
  await step('HTML where JSON was expected (a stale service worker)', async () => {
    const was = await unchanged();
    syncMode = { kind: 'html' };
    await load();
    if (await sheetUp()) throw new Error('treated a web page as a patch');
    const now = await unchanged();
    if (now.n !== was.n || now.sid !== was.sid) throw new Error('the store moved');
  });
  await step('malformed JSON', async () => {
    const was = await unchanged();
    syncMode = { kind: 'garbage' };
    await load();
    if (await sheetUp()) throw new Error('a sheet appeared');
    const now = await unchanged();
    if (now.n !== was.n || now.sid !== was.sid) throw new Error('the store moved');
  });
  await step('a 404', async () => {
    const was = await unchanged();
    syncMode = { kind: 'none' };
    await load();
    if (await sheetUp()) throw new Error('a sheet appeared');
    const now = await unchanged();
    if (now.n !== was.n || now.sid !== was.sid) throw new Error('the store moved');
  });
  await step('a patch with no syncId at all', async () => {
    syncMode = { kind: 'json', body: { trips: { 'trip-test': { shopName: 'nope' } } } };
    await load();
    if (await sheetUp()) throw new Error('applied a patch with no id');
  });
  await step('an absurdly large patch is refused outright', async () => {
    const trips = {};
    for (let i = 0; i < 250; i++) trips['bulk-' + i] = { shopName: 'bulk', date: '2026-10-01',
      fx: 20, lines: [], listed: 0, receiptTotal: 1, offList: 0,
      bought: 0, skipped: 0, planned: 0, totalUSD: 1 };
    const was = await pg.evaluate(() => S.trips.length);
    syncMode = { kind: 'json', body: { syncId: 30, trips } };
    await load();
    if (await sheetUp()) { await pg.click('#syYes'); await pg.waitForTimeout(600); }
    const now = await pg.evaluate(() => S.trips.length);
    if (now !== was) throw new Error('applied ' + (now - was) + ' trips from a runaway patch');
  });

  console.log('--- the rest of the app ---');
  await step('Settings reports the last sync applied', async () => {
    syncMode = { kind: 'none' };
    await load();
    await pg.click('#tabs [data-go="set"]');
    await pg.waitForTimeout(400);
    const t = await pg.textContent('#main');
    if (!/Last sync applied/.test(t)) throw new Error('no sync row in Settings');
    if (!/#2[0-9]/.test(t)) throw new Error('does not show the applied id: ' + t.slice(0, 200));
  });
  await step('checking on demand says so when there is nothing', async () => {
    await pg.click('#syncNow');
    await pg.waitForTimeout(900);
    const t = await pg.textContent('body');
    if (!/Nothing to sync|Could not reach/.test(t)) throw new Error('no feedback from the button');
  });
  await step('no errors on any tab after a sync', async () => {
    for (const tab of ['dash', 'trip', 'hist', 'cat', 'set']) {
      await pg.click('#tabs [data-go="' + tab + '"]');
      await pg.waitForTimeout(350);
      const t = await pg.textContent('#main');
      if (/NaN|undefined|\[object/.test(t))
        throw new Error(tab + ': ' + t.match(/.{0,40}(NaN|undefined|\[object).{0,40}/)[0]);
    }
  });
  await step('the service worker leaves sync/ alone', async () => {
    const sw = fs.readFileSync('/home/claude/despensa-src/sw.js', 'utf8');
    if (!/\/sync\//.test(sw)) throw new Error('no carve-out in sw.js');
    const i = sw.indexOf('/sync/'), j = sw.indexOf('e.respondWith');
    if (i < 0 || j < 0 || i > j) throw new Error('the carve-out is after respondWith — too late');
  });
  await step('cleanup', async () => {
    await pg.evaluate(() => {
      S.trips = S.trips.filter(t => String(t.id).indexOf('trip-') !== 0
                                 && String(t.id).indexOf('bulk-') !== 0);
      S.syncId = 0; delete S.syncedAt;
      save();
    });
  });

  console.log('\nerrors: ' + (errs.length ? '\n  ' + errs.join('\n  ') : 'none'));
  console.log(fails ? '\n' + fails + ' FAILED' : '\nall passed');
  await b.close();
  server.close();
  if (fs.existsSync(SYNC)) fs.unlinkSync(SYNC);
  process.exit(fails || errs.length ? 1 : 0);
})();
