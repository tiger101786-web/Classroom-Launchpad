const fs = require('node:fs');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: true });
  try {
    const page = await browser.newPage();
    await page.route('**/*', route => route.request().isNavigationRequest()
      ? route.fulfill({ contentType: 'text/html', body: '<html><body data-theme="night"><div id="coltRadioRoot"></div></body></html>' })
      : route.abort());
    await page.goto('https://test.local/');
    await page.evaluate(() => { HTMLMediaElement.prototype.play = async function () {}; });
    await page.addStyleTag({ content: fs.readFileSync('styles.css', 'utf8') });
    await page.addScriptTag({ content: fs.readFileSync('colt-radio.js', 'utf8') });
    await page.getByRole('button', { name: 'Open Colt Radio', exact: true }).click();
    for (const width of [1280, 390]) {
      await page.setViewportSize({ width, height: 850 });
      await page.locator('.colt-radio-search-input').fill('Hip-Hop');
      assert.equal(await page.locator('[data-station="urban-heat"]').count(), 0);
      const boost = page.getByRole('button', { name: 'Hip-Hop • Positive', exact: true });
      assert.equal(await boost.count(), 1);
      assert(await boost.isVisible());
      await boost.click();
      assert.equal(await page.locator('audio').getAttribute('src'), 'https://gateway.cdnstream1.com/boost-live');
      assert.match(await page.locator('.colt-radio-note').innerText(), /commercial-free by BOOST Radio/);
    }
    await page.getByRole('button', { name: 'Stop Colt Radio', exact: true }).click();
    assert(!await page.locator('audio').getAttribute('src'));
    console.log('PASS: BOOST appears once as Hip-Hop • Positive, Urban Heat is absent, selection and stop work on desktop/mobile. Provider playback is mocked.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
