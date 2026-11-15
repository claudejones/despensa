const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({});
  const pg = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await pg.goto('file:///home/claude/despensa/index.html');
  await pg.waitForTimeout(300);

  await pg.screenshot({ path: '/home/claude/test/1-empty.png' });

  await pg.click('#startTrip');
  await pg.waitForSelector('[data-shop="chedraui"]');
  await pg.click('[data-shop="chedraui"]');
  await pg.waitForTimeout(250);
  await pg.screenshot({ path: '/home/claude/test/2-planning.png' });

  const picks = await pg.locator('[data-pick]').all();
  for (let i = 0; i < 6; i++) await picks[i].click();
  await pg.waitForTimeout(150);
  await pg.click('#goShop');
  await pg.waitForTimeout(250);
  const g = await pg.locator('[data-got]').all();
  await g[0].click(); await g[1].click();
  await pg.locator('[data-open]').nth(4).click();
  await pg.waitForSelector('#skYes'); await pg.click('#skYes');
  await pg.waitForTimeout(250);
  await pg.screenshot({ path: '/home/claude/test/3-shopping.png' });

  await pg.click('#navBtn'); await pg.click('[data-go="cat"]');
  await pg.waitForTimeout(250);
  await pg.locator('[data-hist]').first().click();
  await pg.waitForSelector('.bigchart');
  await pg.waitForTimeout(250);
  await pg.screenshot({ path: '/home/claude/test/4-history-drawer.png' });

  await b.close();
  console.log('shots done');
})();
