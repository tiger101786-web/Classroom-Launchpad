const fs = require('node:fs'), path = require('node:path'), os = require('node:os'), assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const root = path.resolve(__dirname, '..');
const output = process.env.PREVIEW_OUTPUT || fs.mkdtempSync(path.join(os.tmpdir(), 'approved-radio-'));
const reference = process.env.RADIO_REFERENCE_DIR;
const skins = ['inferno', 'frostfang', 'temple', 'nebula', 'bayou', 'hiphop'];
(async () => {
 const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
 try {
  const context = await browser.newContext({ viewport: { width: 1000, height: 1000 }, deviceScaleFactor: 2 });
  await context.addInitScript(() => {
   window.mediaCalls = [];
   HTMLMediaElement.prototype.play = function () { mediaCalls.push('play'); this.dispatchEvent(new Event('playing')); return Promise.resolve(); };
   HTMLMediaElement.prototype.pause = function () { mediaCalls.push('pause'); this.dispatchEvent(new Event('pause')); };
   HTMLMediaElement.prototype.load = function () { mediaCalls.push('load'); };
  });
  await context.route('**/*', route => {
   const u = new URL(route.request().url());
   if (u.hostname !== 'radio.test') return route.abort();
   if (u.pathname === '/') return route.fulfill({ contentType: 'text/html', body: '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/styles.css"><div id="coltRadioRoot" class="colt-radio-root"></div><script src="/colt-radio.js"></script>' });
   const file = path.join(root, decodeURIComponent(u.pathname));
   if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return route.fulfill({ status: 404, body: '' });
   return route.fulfill({ body: fs.readFileSync(file), contentType: file.endsWith('.html') ? 'text/html' : file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : file.endsWith('.png') ? 'image/png' : file.endsWith('.jpg') ? 'image/jpeg' : 'application/octet-stream' });
  });
  const page = await context.newPage(), errors = [], artRequests = [];
  context.on('page', p => p.on('pageerror', e => errors.push(e.message)));
  page.on('pageerror', e => errors.push(e.message));
  page.on('request', r => { if (r.url().includes('/illustrated/')) artRequests.push(r.url()); });
  await page.goto('http://radio.test/');
  assert.equal(artRequests.length, 0);
  assert.equal(await page.locator('script[src^="radio-skins.js"]').count(), 0);
  await page.getByRole('button', { name: 'Open Colt Radio', exact: true }).click();
  const panel = page.locator('.colt-radio-panel'), gear = page.getByRole('button', { name: 'Change Colt Radio skin', exact: true });
  await gear.waitFor();
  assert.equal(await panel.locator('[data-radio-skin-choice]').count(), 7, 'Six approved skins and Original');
  assert.equal(artRequests.length, 0, 'Original loads no themed artwork');
  const choose = async (skin, target = page) => {
   await target.getByRole('button', { name: 'Change Colt Radio skin', exact: true }).click();
   await target.locator('[data-radio-skin-choice=' + skin + ']').click();
   if (skin !== 'original') await target.evaluate(async id => {
    await Promise.race([Promise.all(['atlas', ['bayou','hiphop'].includes(id) ? 'header' : 'header-v2'].map(suffix => new Promise((resolve, reject) => { const img = new Image(); img.onload = () => img.naturalWidth > 0 ? resolve() : reject(new Error('Empty artwork')); img.onerror = () => reject(new Error('Failed artwork: ' + img.src)); img.src = new URL('assets/radio-skins/illustrated/' + id + '-' + suffix + '.png', document.baseURI).href; }))), new Promise((_, reject) => setTimeout(() => reject(new Error('Artwork timeout: ' + id + ' at ' + document.baseURI)), 10000))]);
   }, skin);
  };
  await panel.locator('[data-station="chill-house"]').click();
  await panel.locator('[data-favorite-station="chill-house"]').click();
  await page.evaluate(async () => { await Promise.all([...document.querySelectorAll('.colt-radio-panel img')].map(i => i.decode().catch(() => {}))); });
  const geometry = () => panel.evaluate(p => [p, ...p.querySelectorAll('.colt-radio-header,.colt-radio-filters,.colt-radio-search,.colt-radio-stations,.colt-radio-player,.colt-radio-station')].map(e => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; }));
  const originalGeometry = await geometry();
  for (const skin of skins) {
   await choose(skin);
   if (skin === 'hiphop') {
    const art = await panel.evaluate(panel => {
     const sides = panel.querySelector('.colt-radio-skin-backdrop');
     return {
      visible:getComputedStyle(sides).display,
      left:getComputedStyle(sides,'::before').backgroundImage,
      right:getComputedStyle(sides,'::after').backgroundImage,
      tile:getComputedStyle(panel.querySelector('.colt-radio-station')).backgroundImage
     };
    });
    assert.notEqual(art.visible,'none','Illustrated DJ sides are displayed');
    assert.match(art.left,/hiphop-atlas/);
    assert.match(art.right,/hiphop-atlas/);
    assert.match(art.tile,/hiphop-crate/);
   }
   if (['bayou','hiphop'].includes(skin)) {
    const current = await geometry();
    for (let i = 2; i < current.length; i++) assert.deepEqual(current[i].slice(2), originalGeometry[i].slice(2), 'Bayou preserves control dimensions');
    assert(Math.abs(current[1][2] / current[1][3] - 3) < .03, 'Full 3:1 Bayou header');
   } else assert.deepEqual(await geometry(), originalGeometry, skin + ': control geometry');
   await page.locator('body').click({ position: { x: 950, y: 10 } });
   const capture = await panel.screenshot({ path: path.join(output, skin + '.png') });
   if (reference) {
    const old = await loadImage(path.join(reference, (skin === 'inferno' ? 'inferno-forge' : ['bayou','hiphop'].includes(skin) ? 'bayou-nights' : skin) + '.png'));
    const current = await loadImage(capture);
    assert.equal(current.width, old.width); assert.equal(current.height, old.height);
    const canvas = createCanvas(old.width, old.height), ctx = canvas.getContext('2d');
    ctx.drawImage(old, 0, 0); const a = ctx.getImageData(0, 0, old.width, old.height).data;
    ctx.clearRect(0, 0, old.width, old.height); ctx.drawImage(current, 0, 0); const b = ctx.getImageData(0, 0, old.width, old.height).data;
    const filters = await panel.locator('.colt-radio-filters').boundingBox();
    const panelBounds = await panel.boundingBox();
    const filterTop = Math.floor((filters.y - panelBounds.y) * 2), filterBottom = Math.ceil((filters.y + filters.height - panelBounds.y) * 2);
    let changed = 0, compared = 0;
    for (let y = 0; y < old.height; y++) for (let x = 0; x < old.width; x++) {
     // The user requested the new gear beside Favorites; that row intentionally changes.
     if (y >= filterTop && y <= filterBottom) continue;
     const i = (y * old.width + x) * 4;
     if (Math.max(Math.abs(a[i] - b[i]), Math.abs(a[i+1] - b[i+1]), Math.abs(a[i+2] - b[i+2])) > 8) changed++;
     compared++;
    }
    console.log(skin + ' reference difference: ' + (100 * changed / compared).toFixed(4) + '%');
    assert(changed / compared < .002, skin + ': matches approved preview except gear');
   }
   await gear.click(); await gear.click();
   assert.equal(await page.locator('.colt-radio-skin-menu').evaluate(m => m.matches(':popover-open')), false, 'Second gear click closes menu');
   assert(await panel.isVisible(), 'Second click keeps player open');
  }
  console.log('Checking audio continuity');
  await panel.locator('.colt-radio-play').click();
  await panel.locator('.colt-radio-volume-slider').evaluate(e => { e.value = '43'; e.dispatchEvent(new Event('input', { bubbles: true })); });
  const audioState = await page.evaluate(() => { window.originalAudio = document.querySelector('audio'); return { src: originalAudio.src, calls: mediaCalls.length, volume: originalAudio.volume }; });
  for (const skin of ['original', ...skins]) await choose(skin);
  const after = await page.evaluate(() => ({ src: originalAudio.src, calls: mediaCalls.length, volume: originalAudio.volume, same: originalAudio === document.querySelector('audio') }));
  assert(after.same); delete after.same; assert.deepEqual(after, audioState, 'Skins do not restart or replace audio');
  assert.equal(await panel.locator('[data-favorite-station="chill-house"]').getAttribute('aria-pressed'), 'true');
  for (const [width, height] of [[390, 844], [320, 700], [390, 300]]) {
   console.log('Checking viewport ' + width + 'x' + height);
   await page.setViewportSize({ width, height });
   for (const skin of skins) {
    await choose(skin); await gear.click();
    await page.waitForFunction(() => document.querySelector('.colt-radio-skin-menu').style.opacity === '1');
    const r = await page.locator('.colt-radio-skin-menu').boundingBox();
    assert(r.x >= 0 && r.y >= 0 && r.x + r.width <= width + 1 && r.y + r.height <= height + 1);
    await page.keyboard.press('Escape');
    assert(await panel.isVisible());
    if (['bayou','hiphop'].includes(skin)) {
     const header = await panel.locator('.colt-radio-header').boundingBox();
     const backdrop = await panel.locator('.colt-radio-skin-backdrop').boundingBox();
     assert(Math.abs(header.width / header.height - 3) < .03, 'Uncropped mobile header');
     if (skin === 'bayou') assert(Math.abs(backdrop.y - header.y - header.height) < 1, 'No gap below header');
     if (height > 500) await panel.screenshot({path:path.join(output,skin+'-'+width+'.png')});
    }
   }
  }
  console.log('Checking persistence and keyboard');
  await page.setViewportSize({ width: 1000, height: 1000 });
  await page.reload(); await page.getByRole('button', { name: 'Open Colt Radio', exact: true }).click(); await gear.waitFor();
  assert.equal(await panel.getAttribute('data-radio-skin'), 'hiphop', 'Saved skin restored');
  await gear.click(); await page.keyboard.press('Home'); await page.keyboard.press('Enter');
  assert.equal(await panel.getAttribute('data-radio-skin'), null, 'Keyboard can return to Original');
  await page.evaluate(() => Object.defineProperty(window, 'documentPictureInPicture', { value: undefined, configurable: true }));
  console.log('Checking pop-out');
  const popup = context.waitForEvent('page');
  await panel.getByRole('button', { name: 'Pop out Colt Radio', exact: true }).click();
  const floating = await popup;
  await floating.bringToFront();
  await choose('bayou', floating);
  await floating.screenshot({path:path.join(output,'floating-bayou.png')});
  await floating.getByRole('button', { name: 'Return Colt Radio to Launchpad', exact: true }).click();
  assert.equal(await panel.getAttribute('data-radio-skin'), 'bayou');
  await gear.click(); await gear.click();
  assert.deepEqual(errors, []);
  console.log('PASS: approved appearance, full Bayou and DJ headers, lazy loading, original reset, seven choices, keyboard, gear toggle, viewport fit, persistence, audio continuity, favorites and pop-out. Screenshots: ' + output);
 } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
