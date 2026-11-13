// Render thumbnail assets from the actual player so every atlas layout uses its real crop.
const fs = require('node:fs'), path = require('node:path');
const { chromium } = require('playwright');
const definitions = require('../radio-skin-definitions.js');
const root = path.resolve(__dirname, '..');
const output = process.env.RADIO_THUMBNAIL_OUTPUT || path.join(root, 'assets/radio-gallery-thumbnails');
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ args: ['--disable-gpu'], executablePath: process.env.RADIO_BROWSER_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
  try {
    const context = await browser.newContext({ viewport: { width: 1200, height: 1100 }, deviceScaleFactor: 2 });
    await context.addInitScript(() => {
      localStorage.setItem('coltRadioIllustratedSkin', 'original');
      HTMLMediaElement.prototype.load = function () {};
      HTMLMediaElement.prototype.play = function () { return Promise.resolve(); };
      HTMLMediaElement.prototype.pause = function () {};
    });
    await context.route('**/*', route => {
      const url = new URL(route.request().url());
      if (url.hostname !== 'radio.test') return route.abort();
      if (url.pathname === '/') return route.fulfill({ contentType: 'text/html', body: '<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/styles.css"><body data-theme="night"><div id="coltRadioRoot" class="colt-radio-root"></div><script src="/colt-radio.js"></script></body>' });
      const file = path.join(root, decodeURIComponent(url.pathname));
      if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return route.fulfill({ status: 404, body: '' });
      return route.fulfill({ body: fs.readFileSync(file), contentType: file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : file.endsWith('.png') ? 'image/png' : 'application/octet-stream' });
    });
    const page = await context.newPage();
    await page.goto('http://radio.test/');
    await page.getByRole('button', { name: 'Open Colt Radio', exact: true }).click();
    await page.getByRole('button', { name: 'Change Colt Radio skin', exact: true }).waitFor();
    await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}' });
    const selectedIds = process.env.RADIO_THUMBNAIL_SKINS?.split(',');
    for (const skin of definitions.filter(skin => !selectedIds || selectedIds.includes(skin.id))) {
      // Applying a hidden choice reuses the real skin code without opening/loading the gallery.
      await page.evaluate(id => document.querySelector('[data-radio-skin-choice="' + id + '"]').click(), skin.id);
      await page.evaluate(async assets => {
        await Promise.all(assets.map(src => new Promise((resolve, reject) => { const image = new Image(); image.onload = resolve; image.onerror = () => reject(new Error(src)); image.src = src; })));
        await Promise.all([...document.querySelectorAll('.colt-radio-heading-mark img,.colt-radio-stream-artwork img')].map(image => image.decode()));
        await document.fonts.ready;
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      }, skin.assets);
      await page.locator('.colt-radio-heading-mark').screenshot({ path: path.join(output, skin.id + '-colt.png'), animations: 'disabled' });
      await page.evaluate(() => {
        document.querySelector('.colt-radio-heading').style.visibility = 'hidden';
        document.querySelector('.colt-radio-header-actions').style.visibility = 'hidden';
      });
      await page.locator('.colt-radio-header').screenshot({ path: path.join(output, skin.id + '-scene.png'), animations: 'disabled' });
      await page.evaluate(() => {
        document.querySelector('.colt-radio-heading').style.visibility = '';
        document.querySelector('.colt-radio-header-actions').style.visibility = '';
      });
      console.log('Rendered ' + skin.label);
    }
    console.log('Saved ' + definitions.filter(skin => !selectedIds || selectedIds.includes(skin.id)).length * 2 + ' scene/portrait PNGs to ' + output);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
