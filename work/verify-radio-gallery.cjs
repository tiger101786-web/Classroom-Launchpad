const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { chromium } = require('playwright');
const definitions = require('../radio-skin-definitions.js');
const root = path.resolve(__dirname, '..');
const output = process.env.PREVIEW_OUTPUT || fs.mkdtempSync(path.join(os.tmpdir(), 'radio-gallery-'));
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.RADIO_BROWSER_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
  try {
    const context = await browser.newContext({ viewport: { width: 1000, height: 1000 } });
    await context.addInitScript(() => {
      localStorage.setItem('coltRadioIllustratedSkin', 'rockabilly');
      window.mediaCalls = [];
      HTMLMediaElement.prototype.load = function () { mediaCalls.push('load'); };
      HTMLMediaElement.prototype.play = function () { mediaCalls.push('play'); return Promise.resolve(); };
      HTMLMediaElement.prototype.pause = function () { mediaCalls.push('pause'); };
    });
    const requests = [], errors = [];
    await context.route('**/*', route => {
      const url = new URL(route.request().url());
      if (url.hostname !== 'radio.test') return route.abort();
      requests.push(url.pathname);
      if (url.pathname === '/') return route.fulfill({ contentType: 'text/html', body: '<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/styles.css"><div id="coltRadioRoot" class="colt-radio-root"></div><script src="/colt-radio.js"></script>' });
      const file = path.join(root, decodeURIComponent(url.pathname));
      if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return route.fulfill({ status: 404, body: '' });
      return route.fulfill({ body: fs.readFileSync(file), contentType: file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : file.endsWith('.png') ? 'image/png' : 'application/octet-stream' });
    });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    for (const theme of ['night', 'day']) {
      await page.setViewportSize({ width: 1000, height: 1000 });
      await page.goto('http://radio.test/');
      await page.evaluate(theme => { document.body.dataset.theme = theme; }, theme);
      assert(!requests.some(url => url.includes('/radio-gallery-thumbnails/')), 'Gallery images stay lazy before opening');
      await page.getByRole('button', { name: 'Open Colt Radio', exact: true }).click();
      const panel = page.locator('.colt-radio-panel');
      const gear = page.getByRole('button', { name: 'Change Colt Radio skin', exact: true });
      const menu = page.getByRole('dialog', { name: 'Choose a radio skin', exact: true });
      await gear.waitFor();
      const checkAlphabetical = async () => {
        assert.equal(await menu.locator('[data-radio-skin-choice]').first().getAttribute('data-radio-skin-choice'), 'original', 'Original stays first, including after filtering and reopening');
        const labels = await menu.locator('[data-radio-skin-choice]:not([hidden]):not([data-radio-skin-choice=original]) .radio-gallery-label').allTextContents();
        for (let i = 1; i < labels.length; i++) assert(labels[i - 1].localeCompare(labels[i], 'en', { sensitivity: 'base' }) <= 0, 'Visible cards stay alphabetical: ' + labels[i - 1] + ' / ' + labels[i]);
      };
      const before = await page.evaluate(() => {
        window.savedAudio = document.querySelector('audio');
        return { src: savedAudio.src, volume: savedAudio.volume, calls: mediaCalls.length };
      });
      await gear.click();
      await page.waitForFunction(() => document.querySelector('.radio-gallery').style.opacity === '1');
      assert.equal(await menu.locator('[data-radio-skin-choice]').count(), definitions.length);
      await checkAlphabetical();
      const thumbnails = await menu.locator('.radio-gallery-choice').evaluateAll(async cards => Promise.all(cards.map(async card => {
        const images = [...card.querySelectorAll('img')];
        await Promise.all(images.map(image => { image.loading = 'eager'; return image.decode(); }));
        return { id: card.dataset.radioSkinChoice, sources: images.map(image => image.getAttribute('src')), loaded: images.every(image => image.naturalWidth > 0), height: card.querySelector('.radio-gallery-thumbnail').getBoundingClientRect().height };
      })));
      for (const item of thumbnails) {
        assert(item.loaded && item.sources.length === 2, item.id + ': both thumbnail images load');
        assert(item.sources.some(src => src.endsWith(item.id + '-scene.png')));
        assert(item.sources.some(src => src.endsWith(item.id + '-colt.png')));
        assert.equal(item.height, 82, 'Consistent thumbnail height');
      }
      const colors = await menu.evaluate(element => {
        const sample = document.createElement('div'); sample.style.background = 'var(--white)'; element.append(sample);
        const expected = getComputedStyle(sample).backgroundColor; sample.remove();
        return { actual: getComputedStyle(element).backgroundColor, expected };
      });
      assert.equal(colors.actual, colors.expected, 'Gallery uses the site surface color');
      await menu.locator('[data-skin-category=fantasy]').click();
      assert.equal(await menu.locator('[data-radio-skin-choice]:not([hidden])').count(), 5);
      await checkAlphabetical();
      await menu.locator('[data-skin-category=music]').click();
      assert.equal(await menu.locator('[data-radio-skin-choice]:not([hidden])').count(), 28);
      await checkAlphabetical();
      await menu.locator('[data-skin-category=all]').click();
      await menu.locator('[data-radio-skin-choice=mariachi]').click();
      assert.equal(await panel.getAttribute('data-radio-skin'), 'mariachi');
      assert(!(await menu.isVisible()));
      await gear.click();
      await checkAlphabetical();
      const order = await menu.locator('[data-radio-skin-choice]:not([hidden])').evaluateAll(cards => cards.map(card => card.dataset.radioSkinChoice));
      await menu.locator('[data-radio-skin-choice=' + order[0] + ']').focus();
      await page.keyboard.press('ArrowRight');
      assert.equal(await page.evaluate(() => document.activeElement.dataset.radioSkinChoice), order[1]);
      await page.keyboard.press('ArrowDown');
      assert.equal(await page.evaluate(() => document.activeElement.dataset.radioSkinChoice), order[3]);
      await page.keyboard.press('End'); await page.keyboard.press('Enter');
      assert.equal(await panel.getAttribute('data-radio-skin'), order.at(-1) === 'original' ? null : order.at(-1), 'End selects the last alphabetical card');
      await gear.click(); await menu.locator('.radio-gallery-reset').click();
      assert.equal(await panel.getAttribute('data-radio-skin'), null, 'Reset still returns to Original');
      await gear.click(); await menu.locator('[data-radio-skin-choice=rockabilly]').click();
      const after = await page.evaluate(() => ({ src: savedAudio.src, volume: savedAudio.volume, calls: mediaCalls.length, same: savedAudio === document.querySelector('audio') }));
      assert(after.same); delete after.same; assert.deepEqual(after, before, 'Gallery does not restart audio');
      await gear.click();
      await page.waitForFunction(() => document.querySelector('.radio-gallery').style.opacity === '1');
      await menu.screenshot({ path: path.join(output, 'gallery-' + theme + '.png'), animations: 'disabled' });
      await menu.getByRole('button', { name: 'Close skin selector', exact: true }).click();
      assert(await panel.isVisible()); assert(!(await menu.isVisible()));
      for (const [width, height] of [[390, 900], [320, 700], [390, 300]]) {
        await page.setViewportSize({ width, height }); await gear.click();
        await page.waitForFunction(() => document.querySelector('.radio-gallery').style.opacity === '1');
        const bounds = await menu.boundingBox(), anchor = await gear.boundingBox();
        assert(bounds.x >= 0 && bounds.y >= 0 && bounds.x + bounds.width <= width + 1 && bounds.y + bounds.height <= height + 1, 'Gallery fits viewport');
        assert(bounds.y + bounds.height <= anchor.y || bounds.y >= anchor.y + anchor.height, 'Gear stays exposed');
        await page.keyboard.press('Escape'); assert(await panel.isVisible()); assert(!(await menu.isVisible()));
      }
      requests.length = 0;
      console.log('PASS ' + theme + ': all 34 corrected thumbnails; site palette; Original first; other skins alphabetical in all categories; filters; keyboard; selection/reset; preserved audio; mobile/short viewports.');
    }
    assert.deepEqual(errors, []);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
