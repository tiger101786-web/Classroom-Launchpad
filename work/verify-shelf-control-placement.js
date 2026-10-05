const fs = require('node:fs');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent('<body data-theme="night"><main style="padding:24px"></main></body>');
    for (const file of ['styles.css', 'collectible-shelf.css']) await page.addStyleTag({ content: fs.readFileSync(file, 'utf8') });
    await page.addScriptTag({ content: fs.readFileSync('collectible-shelf.js', 'utf8') });
    for (const width of [1280, 760, 390]) {
      await page.setViewportSize({ width, height: 1200 });
      for (const enabled of [false, true]) {
        await page.evaluate(enabled => {
          const session = { authenticated: true, homeShelf: { enabled, theme: 'crimson', slots: [] }, homeShelfRight: { enabled, theme: 'crimson', slots: [] } };
          document.querySelector('main').innerHTML = '<div class="home-display-row">'
            + '<div class="home-shelf-position">' + CollectibleShelf.render(session, 'left') + '</div>'
            + '<div class="home-scene-feature" style="height:310px"></div>'
            + '<div class="home-shelf-position">' + CollectibleShelf.render(session, 'right') + '</div></div><div id="nextCard">Next card</div>';
        }, enabled);
        const layout = await page.locator('.shelf-visibility-zone').evaluateAll(zones => zones.map(zone => {
          const shelf = zone.parentElement.getBoundingClientRect();
          const button = zone.querySelector('button').getBoundingClientRect();
          return { side: zone.parentElement.dataset.shelfSide, left: button.left, right: button.right, top: button.top, bottom: button.bottom, shelfLeft: shelf.left, shelfRight: shelf.right, shelfBottom: shelf.bottom };
        }));
        for (const box of layout) {
          assert(Math.abs(box[box.side] - box[box.side === 'left' ? 'shelfLeft' : 'shelfRight']) < 1, 'Button is not on the outer edge');
          assert(box.top >= box.shelfBottom + 11, 'Button overlaps shelf');
          assert(box.bottom < (await page.locator('#nextCard').boundingBox()).y, 'Button overlaps next card');
        }
        if (width > 480) assert(Math.abs(layout[0].top - layout[1].top) < 1, 'Buttons are not on the same baseline');
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Horizontal overflow');
      }
    }
    await page.setViewportSize({ width: 1280, height: 1200 });
    await page.waitForTimeout(3500);
    const control = page.locator('.shelf-visibility-controls').first();
    const shelf = await page.locator('.home-collectible-shelf').first().boundingBox();
    await page.mouse.move(shelf.x + shelf.width / 2, shelf.y + shelf.height / 2);
    assert.equal(await control.evaluate(e => getComputedStyle(e).opacity), '0');
    const button = await control.locator('button').boundingBox();
    await page.mouse.move(button.x + button.width / 2, button.y - 20);
    assert.equal(await control.evaluate(e => getComputedStyle(e).opacity), '0', 'Reveal area is too large');
    await page.mouse.move(button.x + button.width / 2, button.y - 4);
    assert.equal(await control.evaluate(e => getComputedStyle(e).opacity), '1', 'Nearby pointer did not reveal hidden control');
    await page.waitForTimeout(3100);
    assert.equal(await control.evaluate(e => getComputedStyle(e).opacity), '0');
    console.log('PASS: outer-edge alignment, equal baselines, shelf/card clearance, mobile layout and 8px reveal area.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
