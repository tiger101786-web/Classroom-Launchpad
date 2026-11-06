const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const { chromium } = require('playwright');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const root = path.resolve(__dirname, '..');
const report = require('./radio-artwork-lossless.json');
const skins = require('../radio-skin-definitions.js');
const output = process.env.PREVIEW_OUTPUT || fs.mkdtempSync(path.join(os.tmpdir(), 'radio-lossless-'));
const hash = data => crypto.createHash('sha256').update(data).digest('hex');

async function compareScreenshots(original, optimized, label) {
  const a = await loadImage(original), b = await loadImage(optimized);
  assert.equal(a.width, b.width, label + ' width');
  assert.equal(a.height, b.height, label + ' height');
  const canvas = createCanvas(a.width, a.height), context = canvas.getContext('2d');
  context.drawImage(a, 0, 0);
  const before = context.getImageData(0, 0, a.width, a.height).data;
  context.clearRect(0, 0, a.width, a.height);
  context.drawImage(b, 0, 0);
  const after = context.getImageData(0, 0, b.width, b.height).data;
  let changed = 0;
  for (let i = 0; i < before.length; i += 4) {
    if (before[i] !== after[i] || before[i + 1] !== after[i + 1] || before[i + 2] !== after[i + 2] || before[i + 3] !== after[i + 3]) changed++;
  }
  assert.equal(changed, 0, label + ': exact screenshot pixels');
}

(async () => {
  // Hashes prove the reviewed originals and delivery copies have not changed.
  for (const asset of report.assets) {
    assert.equal(hash(fs.readFileSync(path.join(root, asset.source))), asset.sourceSha256, asset.source + ' preserved');
    assert.equal(hash(fs.readFileSync(path.join(root, asset.delivery))), asset.deliverySha256, asset.delivery + ' checked copy');
    assert(asset.deliveryBytes < asset.sourceBytes, 'Each delivery image is smaller');
  }
  // Software rendering avoids GPU clip-edge rounding noise present even in source-vs-source captures.
  const browser = await chromium.launch({ args: ['--disable-gpu'], executablePath: process.env.RADIO_BROWSER_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
  try {
    const context = await browser.newContext({ viewport: { width: 1000, height: 1000 }, deviceScaleFactor: 2 });
    let sourceMode = false;
    const requested = [], errors = [];
    context.on('page', page => page.on('pageerror', error => errors.push(error.message)));
    await context.addInitScript(() => {
      try { localStorage.removeItem('coltRadioIllustratedSkin'); } catch {}
      HTMLMediaElement.prototype.load = function () {};
      HTMLMediaElement.prototype.pause = function () {};
      HTMLMediaElement.prototype.play = function () { return Promise.resolve(); };
    });
    await context.route('**/*', route => {
      const url = new URL(route.request().url());
      if (url.hostname !== 'radio.test') return route.abort();
      requested.push(url.pathname);
      if (url.pathname === '/') return route.fulfill({ contentType: 'text/html', body: '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/styles.css"><body><div id="coltRadioRoot" class="colt-radio-root"></div><script src="/colt-radio.js"></script></body>' });
      const file = path.join(root, decodeURIComponent(url.pathname));
      if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return route.fulfill({ status: 404, body: '' });
      let body = fs.readFileSync(file);
      if (sourceMode && (url.pathname === '/radio-skins.css' || url.pathname === '/radio-skin-definitions.js')) {
        let text = body.toString('utf8');
        for (const asset of report.assets) text = text.replaceAll(asset.delivery, asset.source);
        body = Buffer.from(text);
      }
      const types = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.png': 'image/png', '.webp': 'image/webp', '.ttf': 'font/ttf' };
      return route.fulfill({ body, contentType: types[path.extname(file)] || 'application/octet-stream' });
    });
    const page = await context.newPage();
    await page.goto('http://radio.test/');
    // Browser color decoding must also be exact, not just Pillow's raw pixels.
    const pixelChecks = await page.evaluate(async assets => {
      const results = [];
      for (const asset of assets) {
        const images = await Promise.all([asset.source, asset.delivery].map(async src => {
          const image = new Image(); image.src = src; await image.decode(); return image;
        }));
        const canvas = document.createElement('canvas');
        canvas.width = images[0].naturalWidth; canvas.height = images[0].naturalHeight;
        const context = canvas.getContext('2d', { willReadFrequently: true });
        const pixels = images.map(image => { context.clearRect(0, 0, canvas.width, canvas.height); context.drawImage(image, 0, 0); return context.getImageData(0, 0, canvas.width, canvas.height).data; });
        let differences = 0;
        for (let i = 0; i < pixels[0].length; i++) if (pixels[0][i] !== pixels[1][i]) differences++;
        results.push({ name: asset.source, differences, width: canvas.width, height: canvas.height, deliveryWidth: images[1].naturalWidth, deliveryHeight: images[1].naturalHeight });
      }
      return results;
    }, report.assets);
    for (const item of pixelChecks) {
      assert.equal(item.differences, 0, item.name + ': browser decoded pixels');
      assert.equal(item.width, item.deliveryWidth); assert.equal(item.height, item.deliveryHeight);
    }
    console.log('PASS: all 24 source hashes, dimensions and browser-decoded images are pixel-identical.');
    const baselines = new Map();
    for (const [width, height] of [[1000, 1000], [320, 700]]) {
      await page.setViewportSize({ width, height });
      for (const original of [true, false]) {
        sourceMode = original;
        requested.length = 0;
        await page.goto('http://radio.test/');
        assert.equal(requested.filter(url => url.includes('/illustrated/')).length, 0, 'Artwork remains lazy');
        await page.getByRole('button', { name: 'Open Colt Radio', exact: true }).click();
        const gear = page.getByRole('button', { name: 'Change Colt Radio skin', exact: true });
        await gear.waitFor();
        await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}' });
        await page.evaluate(async () => { await document.fonts.load('800 24px ColtRadioCyber'); await document.fonts.load('1000 28px ColtRadioGroove'); });
        for (const skin of skins) {
          await gear.click();
          await page.locator('[data-radio-skin-choice="' + skin.id + '"]').click();
          await page.evaluate(async ({ skin, assets, original }) => {
            await Promise.all(assets.filter(asset => pathName(asset.source).startsWith(skin + '-')).map(async asset => {
              const image = new Image(); image.src = original ? asset.source : asset.delivery; await image.decode();
            }));
            function pathName(src) { return src.split('/').pop(); }
            await Promise.all([...document.querySelectorAll('.colt-radio-panel img')].filter(image => !image.closest('.radio-gallery')).map(image => image.decode()));
            await document.fonts.ready;
            document.activeElement?.blur();
            document.querySelector('.colt-radio-stations').scrollTop = 0;
            await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
          }, { skin: skin.id, assets: report.assets, original });
          await page.mouse.move(width - 1, 0);
          const key = skin.id + '-' + width;
          const filename = path.join(output, key + (original ? '-source.png' : '-lossless.png'));
          const screenshot = await page.locator('.colt-radio-panel').screenshot({ path: filename, animations: 'disabled' });
          if (original) baselines.set(key, screenshot);
          else await compareScreenshots(baselines.get(key), screenshot, key);
        }
        if (!original) assert(!requested.some(url => report.assets.some(asset => '/' + asset.source === url)), 'Skins request optimized delivery assets only');
      }
      console.log('PASS: all 16 skins at ' + width + 'px have zero changed screenshot pixels.');
    }
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(output, 'verification.json'), JSON.stringify({ exactBrowserImagePairs: pixelChecks.length, exactSkinScreenshots: 32, sourceBytes: report.sourceBytes, deliveryBytes: report.deliveryBytes, reductionPercent: report.reductionPercent }, null, 2));
    console.log('PASS: originals preserved; exact image decoding; exact desktop/mobile renders; lazy loading. Screenshots: ' + output);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
