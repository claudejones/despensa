const { chromium } = require("playwright"),
  assert = require("node:assert/strict"),
  fs = require("node:fs");
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROMIUM_PATH || undefined,
    args: ["--no-sandbox"],
  });
  try {
    for (const width of [320, 390, 430]) {
      const page = await browser.newPage({ viewport: { width, height: 844 } }),
        errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(
        process.env.FOOTBALL_URL || "http://127.0.0.1:8765/football/",
        { waitUntil: "domcontentloaded" },
      );
      await page.waitForFunction(
        () => typeof data !== "undefined" && data?.games?.length,
      );
      await page.locator("[data-tab=combos]").first().click();
      await page.locator("[data-plan=A]").click();
      await page.evaluate(() => scrollTo(0, 0));
      let gap = await page.evaluate(
        () =>
          document
            .querySelector(".plan-backbar")
            .nextElementSibling.getBoundingClientRect().top -
          document.querySelector("[data-plan-back]").getBoundingClientRect()
            .bottom,
      );
      assert.ok(gap >= 14, "space between back button and card");
      await page.evaluate(() => scrollTo(0, 900));
      await page.waitForTimeout(150);
      const pos = await page.evaluate(() => ({
        header: document.querySelector("header").getBoundingClientRect().bottom,
        back: document.querySelector(".plan-backbar").getBoundingClientRect()
          .top,
      }));
      assert.ok(
        Math.abs(pos.header - pos.back) < 2,
        "back stays below sticky header",
      );
      fs.mkdirSync("football/test-artifacts", { recursive: true });
      await page.screenshot({
        path: `football/test-artifacts/${width}-sticky-strategies.png`,
      });
      await page.locator("[data-plan-back]").click();
      assert.match(
        await page.locator("#view").innerText(),
        /Five portfolio strategies/,
      );
      await page.locator("[data-tab=games]").first().click();
      await page.locator(".context-review summary").first().click();
      await page.locator("[data-review-game]").first().click();
      assert.match(await page.locator("#title").innerText(), /Game Research/);
      assert.equal(
        await page.locator(".context-review").first().getAttribute("open"),
        "",
      );
      assert.equal(await page.evaluate(() => tickets.length), 1);
      assert.equal(await page.evaluate(() => tickets[0].payout), null);
      assert.equal(
        await page.evaluate(() => Object.values(pool).filter(Boolean).length),
        0,
      );
      await page.screenshot({
        path: `football/test-artifacts/${width}-context-games.png`,
      });
      await page.locator("[data-tab=picks]").first().click();
      await page.locator(".context-review summary").first().click();
      assert.equal(
        await page.locator("[data-review-game]").first().isDisabled(),
        true,
      );
      await page.locator(".context-review summary").nth(1).click();
      await page
        .locator(".context-review")
        .nth(1)
        .locator("[data-review-game]")
        .first()
        .click();
      assert.equal(await page.evaluate(() => tickets.length), 2);
      await page
        .locator(".context-review")
        .nth(1)
        .locator("[data-open-review]")
        .click();
      assert.equal(await page.locator(".ticket").count(), 2);
      await page.locator("[data-combo-select]").nth(0).check();
      await page.locator("[data-combo-select]").nth(1).check();
      await page.locator("[data-combine-drafts]").click();
      assert.equal(await page.locator(".ticket").count(), 1);
      assert.equal(await page.evaluate(() => tickets[0].legs.length), 2);
      assert.equal(await page.evaluate(() => tickets[0].payout), null);
      await page.reload();
      await page.waitForFunction(() => data?.games?.length);
      await page.locator("[data-tab=kalshi]").first().click();
      assert.equal(await page.locator(".ticket").count(), 1);
      await page.locator("[data-undo-combo]").click();
      assert.equal(await page.locator(".ticket").count(), 2);
      await page.screenshot({
        path: `football/test-artifacts/${width}-review-singles.png`,
      });
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth + 1,
        ),
        false,
      );
      await page.locator("[data-tab=combos]").first().click();
      await page.locator("[data-plan=A]").click();
      await page.locator("[data-add]").first().click();
      assert.match(await page.locator("#view").innerText(), /Plan A|PLAN A/);
      assert.equal(await page.locator("[data-add]").first().isDisabled(), true);
      assert.equal(await page.evaluate(() => tickets.length), 3);
      assert.deepEqual(errors, []);
      await page.close();
      console.log("PASS contextual review and sticky navigation " + width);
    }
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
