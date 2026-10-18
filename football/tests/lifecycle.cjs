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
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      permissions: ["clipboard-read", "clipboard-write"],
    });
    const page = await context.newPage();
    page.on("dialog", async d => { throw Error("Unexpected browser dialog: "+d.message()); });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(
      process.env.FOOTBALL_URL || "http://127.0.0.1:8765/football/",
    );
    await page.waitForFunction(
      () => typeof data !== "undefined" && data?.games?.length,
    );
    await page.locator("[data-tab=picks]").first().click();
    await page.locator("[data-picks-view=pool]").click();
    assert.equal(
      await page.locator("[data-action=copyPool]").isDisabled(),
      true,
    );
    await page.locator("[data-pool]").first().click();
    await page.locator("[data-action=copyPool]").click();
    await page.locator("[data-message-ok]").click();
    await page.locator("#appMessageTitle").filter({hasText:"Done"}).waitFor();
    await page.locator("[data-message-ok]").click();
    let clip = await page.evaluate(() => navigator.clipboard.readText());
    assert.ok(clip.includes("\n\nMY PICKS TO WIN:"));
    assert.ok(!clip.includes("\\n"));
    assert.match(clip, /WINNER:.*\(\d+-\d+-\d+\)/);
    await page.reload();
    await page.waitForFunction(() => data?.games?.length);
    await page.locator("[data-tab=picks]").first().click();
    await page.locator("[data-picks-view=pool]").click();
    assert.equal(await page.locator("[data-pool].selected").count(), 1);
    await page.locator("[data-tab=combos]").first().click();
    await page.locator("[data-plan=A]").click();
    await page.locator("[data-add]").first().click();
    await page.locator("[data-open-review]").first().click();
    assert.equal(
      await page.locator("[data-kalshi-stage=build].active").count(),
      1,
    );
    await page.locator("[data-purchase]").click();
    assert.equal(
      await page.locator("[data-kalshi-stage=monitor].active").count(),
      1,
    );
    let id = await page.evaluate(() => tickets[0].id);
    await page.locator("[data-observe-ticket]").click();
    await page.locator(`[id="offer-${id}"]`).fill("3");
    await page.locator(`[data-observe="${id}"]`).click();
    assert.equal(await page.evaluate(() => realizedNet(tickets[0])), 0);
    await page.locator("[data-close-ticket]").click();
    await page.locator(`[id="qty-${id}"]`).fill("50");
    await page.locator(`[id="sale-${id}"]`).fill("1.7");
    await page.locator(`[data-sale="${id}"]`).click();
    await page.locator("[data-message-cancel]").click();
    await page.waitForFunction(()=>!document.querySelector("#appMessage"));
    assert.equal(await page.evaluate(()=>tickets[0].events.filter(e=>e.kind==="sale").length),0);
    await page.locator(`[data-sale="${id}"]`).click();
    await page.locator("[data-message-ok]").click();
    await page.waitForFunction(()=>tickets[0].events.some(e=>e.kind==="sale"));
    assert.ok(
      Math.abs((await page.evaluate(() => realizedNet(tickets[0]))) - 0.7) <
        1e-8,
    );
    await page.locator("[data-close-ticket]").click();
    await page.locator(`[data-close-choice="${id}"]`).selectOption("final");
    await page.locator(`[id="settle-${id}"]`).fill("1");
    await page.locator(`[data-settle="${id}"]`).click();
    await page.locator("[data-message-ok]").click();
    await page.waitForFunction(()=>tickets[0].status==="won");
    await page.locator("[data-kalshi-stage=close]").click();
    assert.match(await page.locator("#view").innerText(), /\$0.70/);
    assert.equal(await page.locator("[data-del]").count(), 0);
    await page.locator("[data-action=calendar]").first().click();
    await page.locator('[data-week="07"]').click();
    await page.waitForFunction(() => !data);
    await page.locator("[data-tab=kalshi]").first().click();
    assert.equal(await page.locator(".ticket").count(), 0);
    assert.match(await page.locator("#view").innerText(), /Week 7/);
    await page.locator("[data-action=calendar]").first().click();
    await page.locator("[data-season-mode=summary]").click();
    await page.locator("[data-action=results]").click();
    assert.match(await page.locator("#view").innerText(), /\$0.70/);
    await page.locator("[data-action=calendar]").first().click();
    await page.locator('[data-week="06"]').click();
    await page.waitForFunction(() => data?.games?.length);
    await page.locator("[data-tab=kalshi]").first().click();
    await page.locator("[data-kalshi-stage=build]").click();
    await page.locator("#custom").click();
    await page.locator("#buildName").fill("Test prop");
    await page.locator("#buildType").selectOption("Player Prop Combo");
    await page.locator(".legSide").selectOption("prop");
    await page.locator(".legProp").fill("Player over 50 receiving yards");
    await page.locator("#buildPayout").fill("5");
    await page.locator("[data-builder=save]").click();
    assert.match(
      await page.locator("#view").innerText(),
      /Player over 50 receiving yards/,
    );
    await page.locator("[data-kalshi-stage=evaluate]").click();
    assert.match(
      await page.locator("#view").innerText(),
      /Player props require/,
    );
    // Backup round trip through the actual Settings file input.
    await page.locator("[data-action=settings]").click();
    const downloadPromise = page.waitForEvent("download");
    await page.locator("[data-action=settingsExport]").click();
    const download = await downloadPromise;
    const path = await download.path();
    const backup = JSON.parse(fs.readFileSync(path));
    assert.equal(backup.tickets.length, 2);
    assert.deepEqual(backup.preferences,await page.evaluate(()=>preferences));
    await page
      .locator("#settingsImport")
      .setInputFiles({
        name: "backup.json",
        mimeType: "application/json",
        buffer: Buffer.from(JSON.stringify(backup)),
      });
    await page.locator("[data-message-ok]").click();
    await page.waitForTimeout(300);
    assert.equal(await page.evaluate(() => tickets.length), 2);
    assert.equal(
      await page.evaluate(() => Object.values(pool).filter(Boolean).length),
      1,
    );
    assert.deepEqual(errors, []);
    console.log(
      "PASS clipboard, persistence, purchase, observation, partial sale, settlement, week isolation, player props, backup round trip",
    );
    // Capture each detail and workspace stage for visual review.
    fs.mkdirSync("football/test-artifacts", { recursive: true });
    await page.locator("[data-tab=combos]").first().click();
    await page.locator("[data-plan=A]").click();
    for (const stage of ["tickets", "outcomes", "timing"]) {
      await page.locator(`[data-plan-tab=${stage}]`).click();
      await page.screenshot({
        path: `football/test-artifacts/390-plan-${stage}.png`,
        fullPage: true,
      });
    }
    await page.locator("[data-tab=kalshi]").first().click();
    for (const stage of ["build", "evaluate", "monitor", "close"]) {
      await page.locator(`[data-kalshi-stage=${stage}]`).click();
      await page.screenshot({
        path: `football/test-artifacts/390-kalshi-${stage}.png`,
        fullPage: true,
      });
    }
    await page.locator("[data-action=calendar]").first().click();
    await page.locator("[data-season-mode=summary]").click();
    await page.locator("[data-action=results]").click();
    await page.screenshot({
      path: "football/test-artifacts/390-performance.png",
      fullPage: true,
    });
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
